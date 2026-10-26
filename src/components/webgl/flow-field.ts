/**
 * Trường "luồng năng lượng" trên GPU cho sân khấu hạt.
 * Mỗi khung hình: trường tự trôi theo chính nó, khuếch tán, tắt dần; tay/chuột đi qua thì bơm vào một vệt
 * mang theo VẬN TỐC của cử chỉ. Hạt đọc trường này để bị cuốn theo hướng di chuyển rồi trôi về chỗ cũ
 * (không còn lực đẩy kiểu "hố đen").
 *
 * Texture (ping-pong, ~1/3 độ phân giải canvas): RG = vận tốc (đơn vị uv / khung hình, mã hoá 0.5 + v * 4),
 * B = năng lượng 0..1. Dùng RGBA16F khi trình duyệt cho vẽ vào texture float, nếu không thì RGBA8.
 */

const QUAD_VS = /* glsl */ `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const STEP_FS = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uPrev;
uniform vec2 uTexel;
uniform vec2 uA;
uniform vec2 uB;
uniform vec2 uVel;
uniform float uRadius;
uniform float uStrength;
uniform float uAspect;

vec3 read(vec2 uv) {
  vec4 c = texture(uPrev, uv);
  return vec3((c.rg - 0.5) / 4.0, c.b);
}

float segDist(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-7), 0.0, 1.0);
  return length(pa - ba * h);
}

void main() {
  vec3 here = read(vUv);
  // Tự trôi theo vận tốc của chính nó (năng lượng chảy tiếp theo hướng tay vừa đi)
  vec2 back = vUv - here.xy * 1.6;
  vec3 c = read(back);
  vec3 n = read(back + vec2(uTexel.x, 0.0)) + read(back - vec2(uTexel.x, 0.0)) + read(back + vec2(0.0, uTexel.y)) + read(back - vec2(0.0, uTexel.y));
  vec3 f = (c * 4.0 + n) / 8.0;
  f.xy *= 0.95;
  f.z = max(f.z * 0.962 - 0.002, 0.0);

  vec2 asp = vec2(uAspect, 1.0);
  float d = segDist(vUv * asp, uA * asp, uB * asp);
  float w = exp(-(d * d) / (uRadius * uRadius)) * uStrength;
  f.xy = mix(f.xy, uVel, clamp(w * 0.6, 0.0, 1.0));
  f.z = min(1.0, f.z + w * 0.4);

  outColor = vec4(clamp(f.xy * 4.0 + 0.5, 0.0, 1.0), clamp(f.z, 0.0, 1.0), 1.0);
}`;

export const FLOW_DECODE_GLSL = /* glsl */ `
vec3 readFlow(sampler2D tex, vec2 uv) {
  vec4 c = texture(tex, uv);
  return vec3((c.rg - 0.5) / 4.0, c.b);
}`;

type Target = { tex: WebGLTexture; fb: WebGLFramebuffer };

export class FlowField {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private vao: WebGLVertexArrayObject;
  private u: Record<string, WebGLUniformLocation | null> = {};
  private targets: Target[] = [];
  private read = 0;
  private w = 0;
  private h = 0;
  private float: boolean;
  /** Điểm trước / hiện tại của cử chỉ (uv, y hướng lên) */
  private ax = -1;
  private ay = -1;
  private bx = -1;
  private by = -1;
  private pending = false;
  /** Vị trí đã làm mượt (đuổi theo vị trí thật) để vận tốc bơm vào trường êm, không giật theo từng sự kiện chuột */
  private sx = -1;
  private sy = -1;
  private svx = 0;
  private svy = 0;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.float = !!gl.getExtension("EXT_color_buffer_float");
    const p = gl.createProgram()!;
    for (const [type, src] of [
      [gl.VERTEX_SHADER, QUAD_VS],
      [gl.FRAGMENT_SHADER, STEP_FS],
    ] as const) {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(`Lỗi shader trường năng lượng: ${gl.getShaderInfoLog(sh)}`);
      gl.attachShader(p, sh);
    }
    gl.bindAttribLocation(p, 0, "aPos");
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(`Lỗi link trường năng lượng: ${gl.getProgramInfoLog(p)}`);
    this.program = p;
    for (const name of ["uPrev", "uTexel", "uA", "uB", "uVel", "uRadius", "uStrength", "uAspect"]) this.u[name] = gl.getUniformLocation(p, name);

    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
  }

  /** Texture trường của khung hình hiện tại (để shader hạt đọc) */
  get texture() {
    return this.targets[this.read]?.tex ?? null;
  }

  resize(canvasW: number, canvasH: number) {
    const w = Math.max(8, Math.round(canvasW / 3));
    const h = Math.max(8, Math.round(canvasH / 3));
    if (w === this.w && h === this.h) return;
    this.w = w;
    this.h = h;
    const gl = this.gl;
    this.targets.forEach((t) => {
      gl.deleteTexture(t.tex);
      gl.deleteFramebuffer(t.fb);
    });
    this.targets = [this.makeTarget(), this.makeTarget()];
    this.read = 0;
  }

  private makeTarget(): Target {
    const gl = this.gl;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    if (this.float) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, this.w, this.h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, this.w, this.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fb = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    // Trạng thái nghỉ: vận tốc 0 (mã hoá 0.5), năng lượng 0
    gl.clearColor(0.5, 0.5, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { tex, fb };
  }

  /** Ghi nhận vị trí tay/chuột (uv 0..1, y hướng lên). Vệt được bơm ở bước kế tiếp. */
  move(x: number, y: number) {
    if (this.bx < 0) {
      this.ax = x;
      this.ay = y;
      this.sx = x;
      this.sy = y;
      this.svx = 0;
      this.svy = 0;
    }
    this.bx = x;
    this.by = y;
    this.pending = true;
  }

  /** Tay/chuột rời màn hình: lần chạm sau bắt đầu vệt mới, không nối từ chỗ cũ */
  release() {
    this.bx = -1;
    this.by = -1;
    this.sx = -1;
    this.sy = -1;
    this.svx = 0;
    this.svy = 0;
    this.pending = false;
  }

  step() {
    if (this.targets.length < 2) return;
    const gl = this.gl;
    const u = this.u;
    let strength = 0;
    let vx = 0;
    let vy = 0;
    if (this.bx >= 0) {
      // Đuổi theo vị trí thật bằng hệ số 0.28 mỗi bước, rồi lấy vận tốc đã lọc (lowpass) làm vận tốc bơm
      const px = this.sx;
      const py = this.sy;
      this.sx += (this.bx - this.sx) * 0.28;
      this.sy += (this.by - this.sy) * 0.28;
      this.svx += (this.sx - px - this.svx) * 0.35;
      this.svy += (this.sy - py - this.svy) * 0.35;
      vx = Math.max(-0.04, Math.min(0.04, this.svx));
      vy = Math.max(-0.04, Math.min(0.04, this.svy));
      const speed = Math.hypot(vx, vy);
      strength = Math.min(0.85, speed * 26);
      this.ax = px;
      this.ay = py;
    }
    gl.useProgram(this.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.targets[1 - this.read].fb);
    gl.viewport(0, 0, this.w, this.h);
    gl.disable(gl.BLEND);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.targets[this.read].tex);
    gl.uniform1i(u.uPrev, 0);
    gl.uniform2f(u.uTexel, 1 / this.w, 1 / this.h);
    gl.uniform2f(u.uA, this.ax < 0 ? this.sx : this.ax, this.ay < 0 ? this.sy : this.ay);
    gl.uniform2f(u.uB, this.sx, this.sy);
    gl.uniform2f(u.uVel, vx, vy);
    gl.uniform1f(u.uRadius, 0.07 + Math.min(0.04, Math.hypot(vx, vy) * 1.2));
    gl.uniform1f(u.uStrength, strength);
    gl.uniform1f(u.uAspect, this.w / this.h);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.read = 1 - this.read;
    this.pending = false;
  }

  /** Kiểm thử: năng lượng lớn nhất và vận tốc trung bình đang có trong trường (đọc ngược từ GPU, chậm — chỉ dùng khi debug) */
  probe() {
    const gl = this.gl;
    const t = this.targets[this.read];
    if (!t) return null;
    gl.bindFramebuffer(gl.FRAMEBUFFER, t.fb);
    const w = this.w;
    const h = this.h;
    let maxE = 0;
    let sumV = 0;
    if (this.float) {
      const buf = new Float32Array(w * h * 4);
      gl.readPixels(0, 0, w, h, gl.RGBA, gl.FLOAT, buf);
      for (let i = 0; i < buf.length; i += 4) {
        maxE = Math.max(maxE, buf[i + 2]);
        sumV += Math.hypot((buf[i] - 0.5) / 4, (buf[i + 1] - 0.5) / 4);
      }
    } else {
      const buf = new Uint8Array(w * h * 4);
      gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, buf);
      for (let i = 0; i < buf.length; i += 4) {
        maxE = Math.max(maxE, buf[i + 2] / 255);
        sumV += Math.hypot((buf[i] / 255 - 0.5) / 4, (buf[i + 1] / 255 - 0.5) / 4);
      }
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { maxEnergy: maxE, meanVelocity: sumV / (w * h), float: this.float, size: [w, h], status: gl.checkFramebufferStatus(gl.FRAMEBUFFER) };
  }

  destroy() {
    const gl = this.gl;
    this.targets.forEach((t) => {
      gl.deleteTexture(t.tex);
      gl.deleteFramebuffer(t.fb);
    });
    gl.deleteProgram(this.program);
  }
}
