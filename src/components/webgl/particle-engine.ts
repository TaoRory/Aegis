import { FLOW_DECODE_GLSL, FlowField } from "@/components/webgl/flow-field";
import { BASE_ROTATION } from "@/components/webgl/shapes";

/**
 * Engine hạt WebGL2: các bản vẽ (nền móng, AI, phần mềm, web, marketing) được dựng từ "phân tử".
 * - Morph giữa các hình đích trên GPU: chỉ 2 buffer vị trí (aFrom, aTo) được ghi lại khi chuyển sang cặp hình mới.
 * - Phân tử "sống": trôi theo trường nhiễu xoáy nhẹ, nhấp nháy; hạt gần to và sáng, hạt xa nhỏ và mờ;
 *   khoảng 6% là "hạt nhân" màu accent có quầng sáng.
 * - Tương tác là một LUỒNG NĂNG LƯỢNG (FlowField): tay/chuột đi qua cuốn hạt theo hướng di chuyển, hạt sáng lên
 *   rồi trôi về chỗ cũ. Một lượt vẽ mờ cho thấy vệt năng lượng. Không có lực đẩy theo bán kính.
 * - Gió cuộn (wind): cuộn trang làm hạt lệch nhẹ theo vận tốc cuộn, mỗi hạt một mức (sống động cả trên điện thoại).
 * Không cấp phát trong vòng render.
 */

const VERTEX = /* glsl */ `#version 300 es
precision highp float;
in vec3 aFrom;
in vec3 aTo;
in float aSeed;
uniform float uMorph;
uniform float uTime;
uniform float uScatter;
uniform float uAspect;
uniform float uScale;
uniform vec2 uOffset;
uniform vec2 uRot;
uniform float uPointSize;
uniform vec2 uWind;
uniform sampler2D uFlow;
out float vAlpha;
out float vAccent;
out float vEnergy;
${FLOW_DECODE_GLSL}

vec3 hash3(float n) {
  return fract(sin(vec3(n, n + 1.7, n + 3.1) * vec3(43758.5453, 22578.1459, 19642.3490))) * 2.0 - 1.0;
}

void main() {
  // Mỗi hạt trễ theo seed → morph "chảy" thay vì đồng loạt
  float t = smoothstep(0.0, 1.0, clamp((uMorph - aSeed * 0.4) / 0.6, 0.0, 1.0));
  vec3 p = mix(aFrom, aTo, t);
  float mid = sin(t * 3.14159265);
  vec3 dir = normalize(hash3(aSeed * 91.7) + 1e-4);
  p += dir * mid * 0.22;

  // Phân tử "thở": trôi theo trường nhiễu xoáy chậm, mỗi hạt một pha
  float ts = uTime * 0.55;
  p += 0.013 * vec3(
    sin(p.y * 3.1 + ts + aSeed * 6.0) + sin(p.z * 5.3 - ts * 0.7),
    sin(p.z * 2.7 + ts * 0.9 + aSeed * 4.0) + sin(p.x * 4.1 + ts * 0.6),
    sin(p.x * 2.9 + ts * 1.1 + aSeed * 5.0) + sin(p.y * 4.7 - ts * 0.8)
  ) * 0.5;
  p += dir * uScatter * (1.2 + aSeed * 1.6);

  // Xoay: Y rồi X
  float cy = cos(uRot.x), sy = sin(uRot.x);
  p = vec3(p.x * cy + p.z * sy, p.y, -p.x * sy + p.z * cy);
  float cx = cos(uRot.y), sx = sin(uRot.y);
  p = vec3(p.x, p.y * cx - p.z * sx, p.y * sx + p.z * cx);

  // Phối cảnh
  float persp = 3.2 / (3.2 - p.z);
  vec2 q = p.xy * persp * uScale + uOffset;

  // Gió cuộn: lệch theo vận tốc cuộn, hạt gần lệch nhiều hơn
  q += uWind * (0.35 + aSeed * 0.9) * persp;

  // Luồng năng lượng: cuốn theo hướng di chuyển + xoáy nhẹ vuông góc; năng lượng làm hạt sáng lên
  vec2 uv = vec2(q.x / uAspect, q.y) * 0.5 + 0.5;
  vec3 flow = readFlow(uFlow, clamp(uv, 0.001, 0.999));
  vec2 v = flow.xy * vec2(2.0 * uAspect, 2.0);
  vec2 perp = vec2(-v.y, v.x) * sin(aSeed * 40.0 + uTime * 0.9) * 0.4;
  vec2 disp = (v * (3.2 + aSeed * 4.0) + perp * 2.2) * flow.z;
  // Giới hạn biên độ: luồng cuốn hạt đi một đoạn ngắn rồi trả về, không xé nát hình
  disp *= min(1.0, 0.11 / max(length(disp), 1e-5));
  q += disp;
  vEnergy = flow.z;

  gl_Position = vec4(q.x / uAspect, q.y, 0.0, 1.0);
  vAccent = step(0.94, fract(aSeed * 7.31));
  float depth = clamp(persp - 0.55, 0.15, 1.25);
  float twinkle = 0.82 + 0.18 * sin(uTime * (1.2 + aSeed * 2.0) + aSeed * 30.0);
  gl_PointSize = uPointSize * pow(persp, 1.6) * (0.5 + aSeed * 0.95) * (1.0 + vAccent * 1.6) * (1.0 + flow.z * 0.45);
  vAlpha = (0.38 + 0.72 * fract(aSeed * 3.17)) * depth * twinkle;
}`;

const FRAGMENT = /* glsl */ `#version 300 es
precision mediump float;
in float vAlpha;
in float vAccent;
in float vEnergy;
uniform vec3 uColor;
uniform vec3 uAccent;
uniform float uOpacity;
out vec4 outColor;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  if (d > 1.0) discard;
  float core = smoothstep(0.55, 0.0, d);
  float halo = exp(-d * d * 3.5) * (0.28 + vAccent * 0.5);
  float a = clamp((core + halo) * vAlpha * uOpacity * (1.0 + vEnergy * 0.8), 0.0, 1.0);
  vec3 c = mix(uColor, uAccent, clamp(max(vAccent * 0.85, vEnergy * 0.75), 0.0, 1.0));
  c += uAccent * vEnergy * 0.55;
  outColor = vec4(c * a, a);
}`;

/** Lượt vẽ vệt năng lượng: một lớp phát sáng rất mờ theo cường độ trường */
const TRAIL_VS = /* glsl */ `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const TRAIL_FS = /* glsl */ `#version 300 es
precision mediump float;
in vec2 vUv;
uniform sampler2D uFlow;
uniform vec3 uAccent;
uniform float uOpacity;
out vec4 outColor;
${FLOW_DECODE_GLSL}
void main() {
  float e = readFlow(uFlow, vUv).z;
  float a = smoothstep(0.08, 0.95, e) * 0.2 * uOpacity;
  outColor = vec4(uAccent * a, a);
}`;

export interface ParticleState {
  /** 0..shapes-1: chỉ số hình (phần thập phân = tiến độ morph sang hình kế tiếp) */
  phase: number;
  scatter: number;
  offsetX: number;
  offsetY: number;
  scale: number;
  opacity: number;
  /** góc xoay cộng thêm (chuột/cuộn) */
  rotX: number;
  rotY: number;
  /** Gió do cuộn trang (đơn vị toạ độ màn hình đã chỉnh tỉ lệ) */
  windX: number;
  windY: number;
}

type RGB = [number, number, number];

export class ParticleEngine {
  readonly state: ParticleState = {
    phase: 0,
    scatter: 0,
    offsetX: 0,
    offsetY: 0,
    scale: 0.6,
    opacity: 1,
    rotX: 0,
    rotY: 0,
    windX: 0,
    windY: 0,
  };

  private gl: WebGL2RenderingContext;
  private program!: WebGLProgram;
  private trailProgram!: WebGLProgram;
  private vao!: WebGLVertexArrayObject;
  private quadVao!: WebGLVertexArrayObject;
  private fromBuffer!: WebGLBuffer;
  private toBuffer!: WebGLBuffer;
  private uniforms: Record<string, WebGLUniformLocation | null> = {};
  private trailUniforms: Record<string, WebGLUniformLocation | null> = {};
  private flow!: FlowField;
  private pair = -1;
  private frame = 0;
  private running = false;
  private lost = false;
  private startTime = performance.now();
  private color: RGB = [0.92, 0.91, 0.89];
  private accent: RGB = [0.55, 0.56, 1];

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly shapes: Float32Array[],
    private readonly options: { dpr: number; pointSize: number },
  ) {
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: "high-performance" });
    if (!gl) throw new Error("WebGL2 không khả dụng");
    this.gl = gl;
    this.init();
    canvas.addEventListener("webglcontextlost", this.onLost);
    canvas.addEventListener("webglcontextrestored", this.onRestored);
  }

  private compile(type: number, source: string) {
    const { gl } = this;
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(`Lỗi shader: ${gl.getShaderInfoLog(shader)}`);
    }
    return shader;
  }

  private link(vs: string, fs: string) {
    const { gl } = this;
    const program = gl.createProgram()!;
    gl.attachShader(program, this.compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(program, this.compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(`Lỗi link: ${gl.getProgramInfoLog(program)}`);
    return program;
  }

  private init() {
    const { gl } = this;
    const count = this.shapes[0].length / 3;
    this.program = this.link(VERTEX, FRAGMENT);
    this.trailProgram = this.link(TRAIL_VS, TRAIL_FS);
    const program = this.program;

    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);
    const attach = (name: string, data: Float32Array, size: number, usage: number) => {
      const buffer = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, usage);
      const loc = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
      return buffer;
    };
    this.fromBuffer = attach("aFrom", this.shapes[0], 3, gl.DYNAMIC_DRAW);
    this.toBuffer = attach("aTo", this.shapes[Math.min(1, this.shapes.length - 1)], 3, gl.DYNAMIC_DRAW);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) seeds[i] = (i * 0.61803398875) % 1;
    attach("aSeed", seeds, 1, gl.STATIC_DRAW);
    gl.bindVertexArray(null);

    this.quadVao = gl.createVertexArray()!;
    gl.bindVertexArray(this.quadVao);
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const ql = gl.getAttribLocation(this.trailProgram, "aPos");
    gl.enableVertexAttribArray(ql);
    gl.vertexAttribPointer(ql, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    for (const name of ["uMorph", "uTime", "uScatter", "uAspect", "uScale", "uOffset", "uRot", "uPointSize", "uColor", "uAccent", "uOpacity", "uWind", "uFlow"]) {
      this.uniforms[name] = gl.getUniformLocation(program, name);
    }
    for (const name of ["uFlow", "uAccent", "uOpacity"]) this.trailUniforms[name] = gl.getUniformLocation(this.trailProgram, name);

    this.flow = new FlowField(gl);
    this.pair = -1;
  }

  setColors(color: RGB, accent: RGB) {
    this.color = color;
    this.accent = accent;
  }

  /** Tay/chuột đi qua (toạ độ client trong canvas toàn màn hình) */
  pointer(clientX: number, clientY: number) {
    const w = this.canvas.clientWidth || 1;
    const h = this.canvas.clientHeight || 1;
    this.flow.move(clientX / w, 1 - clientY / h);
  }

  pointerLeave() {
    this.flow.release();
  }

  /** Kiểm thử (?debug-flow): đọc trạng thái trường năng lượng */
  probeFlow() {
    return this.flow.probe();
  }

  resize() {
    const { canvas } = this;
    const w = Math.round(canvas.clientWidth * this.options.dpr);
    const h = Math.round(canvas.clientHeight * this.options.dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    this.flow.resize(canvas.width, canvas.height);
  }

  private syncPair(phase: number) {
    const max = this.shapes.length - 2;
    const pair = Math.max(0, Math.min(max, Math.floor(phase)));
    if (pair === this.pair) return pair;
    const { gl } = this;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.fromBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.shapes[pair]);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.toBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.shapes[pair + 1]);
    this.pair = pair;
    return pair;
  }

  render = (now = performance.now()) => {
    if (this.lost) return;
    const { gl, state, uniforms: u } = this;
    this.resize();
    this.flow.step();

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (state.opacity <= 0.001) return;

    gl.enable(gl.BLEND);
    // Cộng màu (phát sáng khi chồng lên nhau), alpha vẫn hoà trộn bình thường
    gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.flow.texture);

    // Vệt năng lượng
    gl.useProgram(this.trailProgram);
    gl.uniform1i(this.trailUniforms.uFlow, 0);
    gl.uniform3f(this.trailUniforms.uAccent, ...this.accent);
    gl.uniform1f(this.trailUniforms.uOpacity, state.opacity);
    gl.bindVertexArray(this.quadVao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Phân tử
    const pair = this.syncPair(state.phase);
    const time = (now - this.startTime) / 1000;
    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);
    gl.uniform1i(u.uFlow, 0);
    gl.uniform1f(u.uMorph, Math.min(1, Math.max(0, state.phase - pair)));
    gl.uniform1f(u.uTime, time);
    gl.uniform1f(u.uScatter, state.scatter);
    gl.uniform1f(u.uAspect, this.canvas.width / Math.max(1, this.canvas.height));
    gl.uniform1f(u.uScale, state.scale);
    gl.uniform2f(u.uOffset, state.offsetX, state.offsetY);
    gl.uniform2f(u.uWind, state.windX, state.windY);
    gl.uniform2f(u.uRot, BASE_ROTATION.y + state.rotY + Math.sin(time * 0.15) * 0.06, BASE_ROTATION.x + state.rotX);
    gl.uniform1f(u.uPointSize, this.options.pointSize * this.options.dpr);
    gl.uniform3f(u.uColor, ...this.color);
    gl.uniform3f(u.uAccent, ...this.accent);
    gl.uniform1f(u.uOpacity, state.opacity);
    gl.drawArrays(gl.POINTS, 0, this.shapes[0].length / 3);
    gl.bindVertexArray(null);
  };

  private loop = (now: number) => {
    if (!this.running) return;
    this.render(now);
    this.frame = requestAnimationFrame(this.loop);
  };

  start() {
    if (this.running || this.lost) return;
    this.running = true;
    this.frame = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.frame);
  }

  private onLost = (event: Event) => {
    event.preventDefault();
    this.lost = true;
    this.stop();
  };

  private onRestored = () => {
    this.lost = false;
    this.init();
    this.start();
  };

  destroy() {
    this.stop();
    this.canvas.removeEventListener("webglcontextlost", this.onLost);
    this.canvas.removeEventListener("webglcontextrestored", this.onRestored);
    this.flow?.destroy();
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}
