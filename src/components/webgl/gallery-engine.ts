/**
 * Engine WebGL2 cho thư viện style: "phòng trưng bày bản vẽ".
 * Các thẻ (ảnh chụp toàn trang của từng mẫu) xếp trên một vòng cung trong xưởng tối: sàn có vòng sáng, lưới trần phối cảnh,
 * thẻ cong theo vòng, viền phát sáng, phản chiếu xuống sàn, cong/tách kênh màu theo tốc độ xoay.
 *
 * Engine chỉ VẼ và đo hình chiếu; mọi điều khiển (kéo, cuộn, phím, lọc, hover) nằm ở GalleryRing.tsx và truyền vào qua `render`.
 * Không cấp phát trong vòng render (mảng, ma trận dùng lại).
 */

export interface GalleryCardSource {
  /** Ảnh chụp toàn trang (webp) */
  src: string;
  /** Màu sân khấu của mẫu, dùng làm màu chờ trong lúc ảnh tải */
  color: string;
}

export interface GalleryCardState {
  /** 0..1: đang rê chuột vào thẻ */
  focus: number;
  /** 0..1: vị trí cuộn của ảnh trong thẻ (0 = đầu trang) */
  scroll: number;
  /** 0..1: 1 = hiện đủ, thấp hơn = bị lọc (lùi vào trong, mờ) */
  alpha: number;
}

export interface GalleryFrame {
  time: number;
  /** Vị trí liên tục trên vòng, tính theo chỉ số thẻ */
  pos: number;
  /** Tốc độ xoay (thẻ/giây, có dấu) */
  speed: number;
  cards: GalleryCardState[];
}

/** Khoảng cách góc giữa hai thẻ liền kề (radian) */
export const STEP = 0.36;
const R = 5.2;
const FRONT = 5.6;
const D = R + FRONT;
const HALF_W = 0.8;
const HALF_H = 1.08;
const PAD = 0.26;
const RADIUS = 0.1;
const FLOOR_Y = -1.3;
const CEIL_Y = 3.6;
const CAM_Y = 0.5;
const PITCH = 0.07; // camera cúi nhẹ xuống sàn
const FOV = (36 * Math.PI) / 180;
const TEX_WIDTH = 512;
const GRID_X = 24;
const GRID_Y = 30;
const ACCENT: [number, number, number] = [0.55, 0.56, 1.0];

const CARD_VS = /* glsl */ `#version 300 es
precision highp float;
in vec2 aUV;
uniform mat4 uVP;
uniform float uTheta;
uniform vec2 uHalf;
uniform float uPad;
uniform float uR;
uniform float uD;
uniform float uBend;
uniform float uLift;
uniform float uScale;
uniform float uBack;
uniform float uFloorY;
uniform float uReflect;
out vec2 vLocal;
out float vWorldY;
void main() {
  vec2 ext = uHalf + vec2(uPad);
  vec2 local = (aUV * 2.0 - 1.0) * ext;
  vLocal = local;
  float x = local.x * uScale;
  float y = local.y * uScale + uLift;
  float ring = uR - uBack;
  float ang = uTheta + x / uR;
  vec3 p = vec3(ring * sin(ang), y, -uD + ring * cos(ang));
  float u = clamp(local.x / uHalf.x, -1.4, 1.4);
  p.z += abs(uBend) * (1.0 - u * u) * 0.5;
  p.y += uBend * u * 0.16;
  if (uReflect > 0.5) p.y = 2.0 * uFloorY - p.y;
  vWorldY = p.y;
  gl_Position = uVP * vec4(p, 1.0);
}`;

const CARD_FS = /* glsl */ `#version 300 es
precision highp float;
in vec2 vLocal;
in float vWorldY;
uniform vec2 uHalf;
uniform float uRadius;
uniform sampler2D uTex;
uniform float uScrollV;
uniform float uWinH;
uniform float uCenter;
uniform float uFocus;
uniform float uAlpha;
uniform float uSpeed;
uniform float uReflect;
uniform float uFloorY;
uniform float uLoad;
uniform vec3 uTint;
uniform vec3 uGlow;
out vec4 outColor;

float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  float sd = sdRoundBox(vLocal, uHalf, uRadius);
  vec2 uv = clamp(vec2(vLocal.x / (uHalf.x * 2.0) + 0.5, 0.5 - vLocal.y / (uHalf.y * 2.0)), 0.0, 1.0);
  float split = uSpeed * 0.006;
  vec2 tuv = vec2(uv.x, uScrollV + uv.y * uWinH);
  vec3 tex = vec3(texture(uTex, tuv + vec2(split, 0.0)).r, texture(uTex, tuv).g, texture(uTex, tuv - vec2(split, 0.0)).b);
  vec3 col = mix(uTint, tex, uLoad);
  // Vạch dọc mảnh như màn hình bản vẽ
  col *= 0.95 + 0.05 * step(0.5, fract(gl_FragCoord.x * 0.33));
  float lit = mix(0.4, 1.0, uCenter) + uFocus * 0.14;
  col *= lit;

  float inside = 1.0 - smoothstep(-0.006, 0.004, sd);
  float glow = 0.2 + 0.8 * uCenter + uFocus * 0.7;
  float edge = 1.0 - smoothstep(0.0, 0.02, abs(sd + 0.012));
  float inner = exp(-max(-sd, 0.0) * 13.0) * inside;
  float outer = exp(-max(sd, 0.0) * 15.0) * (1.0 - inside);
  vec3 rgb = col * inside + uGlow * (edge * glow * 0.95 + inner * glow * 0.2 + outer * glow * 0.5);
  float a = clamp(inside + edge * glow * 0.8 + outer * glow * 0.55, 0.0, 1.0);

  float fade = uAlpha;
  if (uReflect > 0.5) {
    float depth = max(uFloorY - vWorldY, 0.0);
    fade *= 0.36 * exp(-depth * 1.1);
    rgb *= vec3(0.78, 0.8, 1.0);
  }
  outColor = vec4(rgb * fade, a * fade);
}`;

const BG_VS = /* glsl */ `#version 300 es
in vec2 aPos;
out vec2 vNdc;
void main() {
  vNdc = aPos;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const BG_FS = /* glsl */ `#version 300 es
precision highp float;
in vec2 vNdc;
uniform mat3 uCamRot;
uniform vec3 uCam;
uniform float uTan;
uniform float uAspect;
uniform float uTime;
uniform float uR;
uniform float uD;
uniform float uFloorY;
uniform float uCeilY;
uniform vec3 uAccent;
out vec4 outColor;

float gridLine(vec2 p, float scale) {
  vec2 q = p * scale;
  vec2 g = abs(fract(q - 0.5) - 0.5) / (fwidth(q) + 1e-4);
  return 1.0 - min(min(g.x, g.y), 1.0);
}

void main() {
  vec3 dir = normalize(uCamRot * vec3(vNdc.x * uTan * uAspect, vNdc.y * uTan, -1.0));
  vec3 col = vec3(0.026, 0.028, 0.04);
  if (dir.y < -0.0004) {
    float t = (uFloorY - uCam.y) / dir.y;
    vec3 P = uCam + dir * t;
    float dist = length(P.xz - vec2(0.0, -uD));
    float ring = abs(dist - uR);
    float fog = exp(-t * 0.05);
    col += uAccent * 0.045 * gridLine(P.xz, 0.5) * fog;
    float pulse = 0.92 + 0.08 * sin(uTime * 0.8);
    col += uAccent * (exp(-ring * 38.0) * 1.35 + exp(-ring * 6.0) * 0.38 + exp(-ring * 1.1) * 0.07) * pulse;
  } else if (dir.y > 0.0004) {
    float t = (uCeilY - uCam.y) / dir.y;
    vec3 P = uCam + dir * t;
    float fog = exp(-t * 0.07);
    col += vec3(0.55, 0.57, 0.85) * 0.09 * gridLine(P.xz, 0.35) * fog;
  }
  // Tia sáng dọc giữa xưởng
  col += uAccent * 0.2 * exp(-abs(vNdc.x) * 90.0) * smoothstep(-0.2, 0.9, vNdc.y) * 0.6;
  col *= 1.0 - 0.5 * dot(vNdc * 0.62, vNdc * 0.62);
  outColor = vec4(col, 1.0);
}`;

type Mat4 = Float32Array;

function perspective(out: Mat4, fovy: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  out.fill(0);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[14] = 2 * far * near * nf;
}

/** out = a * b (cột-ưu-tiên) */
function mul(out: Mat4, a: Mat4, b: Mat4) {
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      out[c * 4 + r] =
        a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
  }
}

/** Ma trận nhìn: xoay quanh X (pitch) sau khi tịnh tiến -cam */
function view(out: Mat4, cam: [number, number, number], pitch: number) {
  const c = Math.cos(pitch);
  const s = Math.sin(pitch);
  // Rx(pitch) * T(-cam)
  out.fill(0);
  out[0] = 1;
  out[5] = c;
  out[6] = s;
  out[9] = -s;
  out[10] = c;
  out[15] = 1;
  const tx = -cam[0];
  const ty = -cam[1];
  const tz = -cam[2];
  out[12] = tx;
  out[13] = c * ty - s * tz;
  out[14] = s * ty + c * tz;
}

export interface CardRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export class GalleryEngine {
  readonly canvas: HTMLCanvasElement;
  lost = false;
  onLost?: () => void;

  private gl: WebGL2RenderingContext;
  private cardProg!: WebGLProgram;
  private bgProg!: WebGLProgram;
  private cardU: Record<string, WebGLUniformLocation | null> = {};
  private bgU: Record<string, WebGLUniformLocation | null> = {};
  private cardVao!: WebGLVertexArrayObject;
  private bgVao!: WebGLVertexArrayObject;
  private indexCount = 0;
  private textures: WebGLTexture[] = [];
  private winH: number[] = [];
  private loadedAt: number[] = [];
  private tints: [number, number, number][] = [];
  private sources: GalleryCardSource[];
  private aniso: EXT_texture_filter_anisotropic | null = null;
  private proj: Mat4 = new Float32Array(16);
  private viewM: Mat4 = new Float32Array(16);
  private vp: Mat4 = new Float32Array(16);
  private order: number[] = [];
  private cssW = 1;
  private cssH = 1;
  private camZ = 0;
  private disposed = false;
  private quad = new Float32Array(8);

  constructor(canvas: HTMLCanvasElement, sources: GalleryCardSource[]) {
    this.canvas = canvas;
    this.sources = sources;
    const gl = canvas.getContext("webgl2", { antialias: true, alpha: false, powerPreference: "high-performance" });
    if (!gl) throw new Error("WebGL2 không khả dụng");
    this.gl = gl;
    try {
      this.init(gl, sources);
    } catch (error) {
      // Khởi tạo hỏng giữa chừng: giải phóng context ngay thay vì chờ GC
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      throw error;
    }
  }

  private init(gl: WebGL2RenderingContext, sources: GalleryCardSource[]) {
    const canvas = this.canvas;
    this.aniso = gl.getExtension("EXT_texture_filter_anisotropic");

    this.cardProg = this.program(CARD_VS, CARD_FS);
    this.bgProg = this.program(BG_VS, BG_FS);
    for (const name of [
      "uVP", "uTheta", "uHalf", "uPad", "uR", "uD", "uBend", "uLift", "uScale", "uBack", "uFloorY", "uReflect", "uRadius",
      "uTex", "uScrollV", "uWinH", "uCenter", "uFocus", "uAlpha", "uSpeed", "uLoad", "uTint", "uGlow",
    ])
      this.cardU[name] = gl.getUniformLocation(this.cardProg, name);
    for (const name of ["uCamRot", "uCam", "uTan", "uAspect", "uTime", "uR", "uD", "uFloorY", "uCeilY", "uAccent"])
      this.bgU[name] = gl.getUniformLocation(this.bgProg, name);

    // Lưới thẻ (dùng chung cho mọi thẻ)
    const uv = new Float32Array((GRID_X + 1) * (GRID_Y + 1) * 2);
    let k = 0;
    for (let j = 0; j <= GRID_Y; j++) for (let i = 0; i <= GRID_X; i++) {
      uv[k++] = i / GRID_X;
      uv[k++] = j / GRID_Y;
    }
    const idx = new Uint16Array(GRID_X * GRID_Y * 6);
    k = 0;
    for (let j = 0; j < GRID_Y; j++) for (let i = 0; i < GRID_X; i++) {
      const a = j * (GRID_X + 1) + i;
      const b = a + 1;
      const c = a + GRID_X + 1;
      const d = c + 1;
      idx.set([a, b, c, b, d, c], k);
      k += 6;
    }
    this.indexCount = idx.length;
    this.cardVao = gl.createVertexArray()!;
    gl.bindVertexArray(this.cardVao);
    const vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(this.cardProg, "aUV");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const ib = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);

    this.bgVao = gl.createVertexArray()!;
    gl.bindVertexArray(this.bgVao);
    const bb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const bl = gl.getAttribLocation(this.bgProg, "aPos");
    gl.enableVertexAttribArray(bl);
    gl.vertexAttribPointer(bl, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    // Texture chờ (màu sân khấu) cho tới khi ảnh tải xong
    sources.forEach((source, i) => {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([20, 20, 28, 255]));
      this.textures.push(tex);
      this.winH.push(0.24);
      this.loadedAt.push(0);
      const n = Number.parseInt(source.color.replace("#", ""), 16);
      this.tints.push([((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]);
      this.order.push(i);
    });

    canvas.addEventListener("webglcontextlost", this.handleLost);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  }

  private handleLost = (event: Event) => {
    event.preventDefault();
    this.lost = true;
    this.onLost?.();
  };

  private program(vs: string, fs: string) {
    const gl = this.gl;
    const p = gl.createProgram()!;
    for (const [type, src] of [
      [gl.VERTEX_SHADER, vs],
      [gl.FRAGMENT_SHADER, fs],
    ] as const) {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(sh);
        gl.deleteShader(sh);
        throw new Error(`Shader lỗi: ${log} (context lost: ${gl.isContextLost()}, lỗi GL: ${gl.getError()})`);
      }
      gl.attachShader(p, sh);
    }
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(`Link lỗi: ${gl.getProgramInfoLog(p)}`);
    return p;
  }

  /** Tải ảnh thẻ, thu về TEX_WIDTH rộng rồi đẩy lên GPU. Gọi lần lượt để không nghẽn giải mã. */
  async loadTextures(first = 0) {
    const order = this.sources.map((_, i) => i).sort((a, b) => Math.abs(a - first) - Math.abs(b - first));
    for (const i of order) {
      if (this.disposed) return;
      try {
        await this.loadTexture(i);
      } catch {
        // Ảnh lỗi: thẻ giữ màu chờ
      }
    }
  }

  private async loadTexture(i: number) {
    const img = new Image();
    img.decoding = "async";
    img.src = this.sources[i].src;
    await img.decode();
    if (this.disposed || this.lost) return;
    const w = TEX_WIDTH;
    const h = Math.min(4096, Math.round((img.naturalHeight / img.naturalWidth) * w));
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, w, h);
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (this.aniso) gl.texParameterf(gl.TEXTURE_2D, this.aniso.TEXTURE_MAX_ANISOTROPY_EXT, 4);
    // Cửa sổ nhìn thấy trên ảnh: bề rộng thẻ phủ hết bề rộng ảnh, chiều cao theo tỉ lệ thẻ
    this.winH[i] = Math.min(1, w / (HALF_W / HALF_H) / h);
    this.loadedAt[i] = performance.now();
  }

  /** Tỉ lệ thẻ dùng để tính tốc độ cuộn ảnh khi rê chuột (độ dài ảnh / độ dài cửa sổ) */
  scrollSpan(i: number) {
    return Math.max(0.0001, 1 - this.winH[i]) / this.winH[i];
  }

  resize(dprCap = 1.75) {
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    const rect = this.canvas.getBoundingClientRect();
    this.cssW = Math.max(1, rect.width);
    this.cssH = Math.max(1, rect.height);
    const w = Math.max(2, Math.round(this.cssW * dpr));
    const h = Math.max(2, Math.round(this.cssH * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    const aspect = this.cssW / this.cssH;
    // Màn hẹp (điện thoại dọc): lùi camera vừa đủ để thẻ giữa rộng khoảng 60% màn hình, hai thẻ bên ló ra hai mép
    this.camZ = Math.max(0, 4.2 / aspect - FRONT);
    perspective(this.proj, FOV, aspect, 0.1, 80);
    view(this.viewM, [0, CAM_Y, this.camZ], PITCH);
    mul(this.vp, this.proj, this.viewM);
  }

  private bindCard(i: number, theta: number, center: number, state: GalleryCardState, bend: number, speed: number, reflect: boolean) {
    const gl = this.gl;
    const u = this.cardU;
    const alpha = state.alpha;
    gl.uniform1f(u.uTheta, theta);
    gl.uniform1f(u.uBend, bend);
    gl.uniform1f(u.uLift, state.focus * 0.1);
    gl.uniform1f(u.uScale, 0.88 + 0.12 * alpha);
    gl.uniform1f(u.uBack, (1 - alpha) * 0.9);
    gl.uniform1f(u.uReflect, reflect ? 1 : 0);
    gl.uniform1f(u.uScrollV, state.scroll * (1 - this.winH[i]));
    gl.uniform1f(u.uWinH, this.winH[i]);
    gl.uniform1f(u.uCenter, center);
    gl.uniform1f(u.uFocus, state.focus);
    gl.uniform1f(u.uAlpha, 0.1 + 0.9 * alpha);
    gl.uniform1f(u.uSpeed, speed);
    const load = this.loadedAt[i] ? Math.min(1, (performance.now() - this.loadedAt[i]) / 700) : 0;
    gl.uniform1f(u.uLoad, load);
    gl.uniform3f(u.uTint, this.tints[i][0] * 0.5, this.tints[i][1] * 0.5, this.tints[i][2] * 0.5);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
  }

  render(frame: GalleryFrame) {
    if (this.disposed || this.lost) return;
    const gl = this.gl;
    const { pos, speed, time, cards } = frame;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.disable(gl.BLEND);

    // 1. Nền: sàn, vòng sáng, lưới trần
    gl.useProgram(this.bgProg);
    const aspect = this.cssW / this.cssH;
    const cp = Math.cos(PITCH);
    const sp = Math.sin(PITCH);
    // Ma trận xoay camera → thế giới = Rx(-pitch) (cột-ưu-tiên)
    gl.uniformMatrix3fv(this.bgU.uCamRot, false, [1, 0, 0, 0, cp, -sp, 0, sp, cp]);
    gl.uniform3f(this.bgU.uCam, 0, CAM_Y, this.camZ);
    gl.uniform1f(this.bgU.uTan, Math.tan(FOV / 2));
    gl.uniform1f(this.bgU.uAspect, aspect);
    gl.uniform1f(this.bgU.uTime, time);
    gl.uniform1f(this.bgU.uR, R);
    gl.uniform1f(this.bgU.uD, D);
    gl.uniform1f(this.bgU.uFloorY, FLOOR_Y);
    gl.uniform1f(this.bgU.uCeilY, CEIL_Y);
    gl.uniform3f(this.bgU.uAccent, ACCENT[0], ACCENT[1], ACCENT[2]);
    gl.bindVertexArray(this.bgVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // 2. Thẻ: xa trước, gần sau; phản chiếu trước thẻ
    gl.enable(gl.BLEND);
    gl.useProgram(this.cardProg);
    gl.bindVertexArray(this.cardVao);
    const u = this.cardU;
    gl.uniformMatrix4fv(u.uVP, false, this.vp);
    gl.uniform2f(u.uHalf, HALF_W, HALF_H);
    gl.uniform1f(u.uPad, PAD);
    gl.uniform1f(u.uR, R);
    gl.uniform1f(u.uD, D);
    gl.uniform1f(u.uFloorY, FLOOR_Y);
    gl.uniform1f(u.uRadius, RADIUS);
    gl.uniform1i(u.uTex, 0);
    gl.uniform3f(u.uGlow, ACCENT[0], ACCENT[1], ACCENT[2]);

    const order = this.order;
    order.sort((a, b) => Math.abs(b - pos) - Math.abs(a - pos));
    const bend = Math.max(-0.5, Math.min(0.5, speed * 0.07));
    const split = Math.max(-3, Math.min(3, speed));
    for (const reflect of [true, false]) {
      for (const i of order) {
        const theta = (i - pos) * STEP;
        if (Math.cos(theta) < -0.2) continue;
        const center = Math.exp(-(i - pos) * (i - pos) * 0.8);
        this.bindCard(i, theta, center, cards[i], bend, split, reflect);
        gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
      }
    }
  }

  /** Chiếu một điểm trên vòng (góc, độ cao) ra toạ độ CSS của canvas; trả false nếu nằm sau camera */
  private project(ang: number, y: number, ring: number, out: Float32Array, o: number) {
    const x = ring * Math.sin(ang);
    const z = -D + ring * Math.cos(ang);
    const m = this.vp;
    const cx = m[0] * x + m[4] * y + m[8] * z + m[12];
    const cy = m[1] * x + m[5] * y + m[9] * z + m[13];
    const cw = m[3] * x + m[7] * y + m[11] * z + m[15];
    if (cw <= 0.01) return false;
    out[o] = (cx / cw * 0.5 + 0.5) * this.cssW;
    out[o + 1] = (1 - (cy / cw * 0.5 + 0.5)) * this.cssH;
    return true;
  }

  /** Bốn góc của thẻ i (toạ độ CSS trong canvas): TL, TR, BR, BL; null nếu không nhìn thấy */
  private corners(i: number, pos: number, alpha: number, lift: number) {
    const theta = (i - pos) * STEP;
    if (Math.cos(theta) < 0.05) return null;
    const scale = 0.88 + 0.12 * alpha;
    const ring = R - (1 - alpha) * 0.9;
    const dA = (HALF_W * scale) / R;
    const hh = HALF_H * scale;
    const q = this.quad;
    const ok =
      this.project(theta - dA, hh + lift, ring, q, 0) &&
      this.project(theta + dA, hh + lift, ring, q, 2) &&
      this.project(theta + dA, -hh + lift, ring, q, 4) &&
      this.project(theta - dA, -hh + lift, ring, q, 6);
    return ok ? q : null;
  }

  /** Thẻ nằm dưới điểm (x, y) (toạ độ CSS trong canvas), ưu tiên thẻ gần camera; -1 nếu không có */
  hit(x: number, y: number, pos: number, cards: GalleryCardState[]) {
    let best = -1;
    let bestCos = -2;
    for (let i = 0; i < cards.length; i++) {
      if (cards[i].alpha < 0.5) continue;
      const q = this.corners(i, pos, cards[i].alpha, cards[i].focus * 0.1);
      if (!q) continue;
      // Điểm trong tứ giác lồi (cùng dấu tích có hướng)
      let sign = 0;
      let inside = true;
      for (let e = 0; e < 4; e++) {
        const ax = q[e * 2];
        const ay = q[e * 2 + 1];
        const bx = q[((e + 1) % 4) * 2];
        const by = q[((e + 1) % 4) * 2 + 1];
        const cross = (bx - ax) * (y - ay) - (by - ay) * (x - ax);
        if (cross !== 0) {
          const s = cross > 0 ? 1 : -1;
          if (sign === 0) sign = s;
          else if (s !== sign) {
            inside = false;
            break;
          }
        }
      }
      if (!inside) continue;
      const c = Math.cos((i - pos) * STEP);
      if (c > bestCos) {
        bestCos = c;
        best = i;
      }
    }
    return best;
  }

  /** Hình chữ nhật bao quanh thẻ i trong toạ độ CSS của canvas */
  rect(i: number, pos: number, cards: GalleryCardState[]): CardRect | null {
    const q = this.corners(i, pos, cards[i].alpha, cards[i].focus * 0.1);
    if (!q) return null;
    const xs = [q[0], q[2], q[4], q[6]];
    const ys = [q[1], q[3], q[5], q[7]];
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
  }

  destroy() {
    this.disposed = true;
    this.canvas.removeEventListener("webglcontextlost", this.handleLost);
    const gl = this.gl;
    this.textures.forEach((t) => gl.deleteTexture(t));
    gl.deleteProgram(this.cardProg);
    gl.deleteProgram(this.bgProg);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}
