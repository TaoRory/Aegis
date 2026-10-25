import { BASE_ROTATION } from "@/components/webgl/shapes";

/**
 * Engine hạt WebGL2 tối giản: morph giữa các hình đích trên GPU.
 * Chỉ 2 buffer vị trí (aFrom, aTo) được ghi lại khi chuyển sang cặp hình mới;
 * mỗi frame chỉ cập nhật uniform → không có cấp phát trong vòng render.
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
uniform vec2 uMouse;
uniform float uMouseForce;
uniform vec2 uRot;
uniform float uPointSize;
out float vAlpha;
out float vAccent;

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

  // Thở nhẹ + phân tán (intro / cuộn ra khỏi hero)
  p += 0.008 * vec3(sin(uTime * 0.9 + aSeed * 40.0), cos(uTime * 0.7 + aSeed * 27.0), sin(uTime * 0.5 + aSeed * 13.0));
  p += dir * uScatter * (1.2 + aSeed * 1.6);

  // Xoay: Y rồi X
  float cy = cos(uRot.x), sy = sin(uRot.x);
  p = vec3(p.x * cy + p.z * sy, p.y, -p.x * sy + p.z * cy);
  float cx = cos(uRot.y), sx = sin(uRot.y);
  p = vec3(p.x, p.y * cx - p.z * sx, p.y * sx + p.z * cx);

  // Phối cảnh nhẹ
  float persp = 3.2 / (3.2 - p.z);
  vec2 q = p.xy * persp * uScale + uOffset;

  // Đẩy hạt khỏi con trỏ (tính trong không gian đã chỉnh tỉ lệ khung hình)
  vec2 d = q - uMouse;
  float f = exp(-dot(d, d) * 9.0) * uMouseForce;
  q += normalize(d + 1e-5) * f * 0.16;

  gl_Position = vec4(q.x / uAspect, q.y, 0.0, 1.0);
  gl_PointSize = uPointSize * persp * (0.55 + aSeed * 0.9);
  vAccent = step(0.935, fract(aSeed * 7.31));
  vAlpha = (0.28 + 0.72 * fract(aSeed * 3.17)) * clamp(persp - 0.35, 0.35, 1.0);
}`;

const FRAGMENT = /* glsl */ `#version 300 es
precision mediump float;
in float vAlpha;
in float vAccent;
uniform vec3 uColor;
uniform vec3 uAccent;
uniform float uOpacity;
out vec4 outColor;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.1, d) * vAlpha * uOpacity;
  vec3 c = mix(uColor, uAccent, vAccent);
  outColor = vec4(c * a, a);
}`;

export interface ParticleState {
  /** 0..shapes-1: chỉ số hình (phần thập phân = tiến độ morph sang hình kế tiếp) */
  phase: number;
  scatter: number;
  offsetX: number;
  offsetY: number;
  scale: number;
  mouseX: number;
  mouseY: number;
  mouseForce: number;
  opacity: number;
  /** góc xoay cộng thêm (chuột/cuộn) */
  rotX: number;
  rotY: number;
}

type RGB = [number, number, number];

export class ParticleEngine {
  readonly state: ParticleState = {
    phase: 0,
    scatter: 0,
    offsetX: 0,
    offsetY: 0,
    scale: 0.6,
    mouseX: 9,
    mouseY: 9,
    mouseForce: 0,
    opacity: 1,
    rotX: 0,
    rotY: 0,
  };

  private gl: WebGL2RenderingContext;
  private program!: WebGLProgram;
  private vao!: WebGLVertexArrayObject;
  private fromBuffer!: WebGLBuffer;
  private toBuffer!: WebGLBuffer;
  private uniforms: Record<string, WebGLUniformLocation | null> = {};
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

  private init() {
    const { gl } = this;
    const count = this.shapes[0].length / 3;
    const program = gl.createProgram()!;
    gl.attachShader(program, this.compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, this.compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(`Lỗi link: ${gl.getProgramInfoLog(program)}`);
    this.program = program;

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

    for (const name of ["uMorph", "uTime", "uScatter", "uAspect", "uScale", "uOffset", "uMouse", "uMouseForce", "uRot", "uPointSize", "uColor", "uAccent", "uOpacity"]) {
      this.uniforms[name] = gl.getUniformLocation(program, name);
    }
    this.pair = -1;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  }

  setColors(color: RGB, accent: RGB) {
    this.color = color;
    this.accent = accent;
  }

  resize() {
    const { canvas } = this;
    const w = Math.round(canvas.clientWidth * this.options.dpr);
    const h = Math.round(canvas.clientHeight * this.options.dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
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
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (state.opacity <= 0.001) return;

    const pair = this.syncPair(state.phase);
    const time = (now - this.startTime) / 1000;
    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);
    gl.uniform1f(u.uMorph, Math.min(1, Math.max(0, state.phase - pair)));
    gl.uniform1f(u.uTime, time);
    gl.uniform1f(u.uScatter, state.scatter);
    gl.uniform1f(u.uAspect, this.canvas.width / Math.max(1, this.canvas.height));
    gl.uniform1f(u.uScale, state.scale);
    gl.uniform2f(u.uOffset, state.offsetX, state.offsetY);
    gl.uniform2f(u.uMouse, state.mouseX, state.mouseY);
    gl.uniform1f(u.uMouseForce, state.mouseForce);
    gl.uniform2f(u.uRot, BASE_ROTATION.y + state.rotY + Math.sin(time * 0.15) * 0.06, BASE_ROTATION.x + state.rotX);
    gl.uniform1f(u.uPointSize, this.options.pointSize * this.options.dpr);
    gl.uniform3f(u.uColor, ...this.color);
    gl.uniform3f(u.uAccent, ...this.accent);
    gl.uniform1f(u.uOpacity, state.opacity);
    gl.drawArrays(gl.POINTS, 0, this.shapes[0].length / 3);
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
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}
