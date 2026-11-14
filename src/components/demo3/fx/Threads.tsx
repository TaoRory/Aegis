"use client";

import { useEffect, useRef } from "react";

import { cx, gsap } from "@/lib/motion";

/**
 * Nền "bó sợi" WebGL2: một bó sợi mảnh chụm ở một đầu rồi tách dần ra, trôi rất chậm. Dùng làm nền trang trí cho MỘT khối (không có chữ bên trong).
 *
 * Phỏng theo component "Threads" của React Bits (reactbits.dev, DavidHDev/react-bits, giấy phép MIT + Commons Clause): giữ ý tưởng
 * dựng mỗi sợi bằng một dải tam giác instanced uốn theo nhiễu Perlin; viết lại cho /demo3:
 * - màu truyền vào qua props (lấy từ token của dự án), không có màu mặc định;
 * - bỏ phần theo con trỏ và lượt vẽ thứ hai qua framebuffer (nhẹ hơn: một lượt vẽ, một draw call);
 * - chạy trên gsap.ticker (một vòng lặp khung hình cho cả trang) và CHỈ đăng ký ticker khi đang chạy thật:
 *   `paused`, khuất màn hình hoặc tab ẩn thì gỡ khỏi ticker, canvas giữ nguyên khung hình cuối;
 * - không có WebGL2 / lỗi shader / mất context: gọi `onFail` để nơi dùng giữ nền tĩnh.
 *
 * Nơi dùng tự lo: tải lười (next/dynamic, ssr: false), chỉ gắn trên máy tính không giảm chuyển động, khung có kích thước cố định.
 */

const VERTEX = `#version 300 es
precision highp float;
in vec2 aPoint;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uFrame;
uniform vec2 uTurn;
uniform vec2 uShift;
uniform float uAmplitude;
uniform float uDistance;
uniform float uCount;
uniform float uThickness;
uniform float uSoftness;
uniform float uWaves;
uniform float uSplit;
uniform float uFray;
uniform float uTaper;
out float vEdge;
out float vBand;
out float vDraw;
out float vAlpha;
out float vIndex;

float perlin(vec2 P) {
  vec2 Pi = floor(P);
  vec4 Pf = P.xyxy - vec4(Pi, Pi + 1.0);
  vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
  Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
  Pt += vec2(26.0, 161.0).xyxy;
  Pt *= Pt;
  Pt = Pt.xzxz * Pt.yyww;
  vec4 hx = fract(Pt * (1.0 / 951.135664));
  vec4 hy = fract(Pt * (1.0 / 642.949883));
  vec4 gx = hx - 0.49999;
  vec4 gy = hy - 0.49999;
  vec4 g = inversesqrt(gx * gx + gy * gy) * (gx * Pf.xzxz + gy * Pf.yyww);
  g *= 1.4142135623730950;
  vec2 b = Pf.xy * Pf.xy * Pf.xy * (Pf.xy * (Pf.xy * 6.0 - 15.0) + 10.0);
  vec4 b2 = vec4(b, vec2(1.0 - b));
  return dot(g, b2.zxzx * b2.wwyy);
}

void main() {
  float perc = float(gl_InstanceID) / uCount;
  float x = aPoint.x;
  float pixel = 1.0 / max(uResolution.x, uResolution.y);
  // Điểm tách: sợi nằm ngoài cùng tách khỏi bó muộn hơn, nên bó xoè ra như một dải lụa bị tước sợi
  float splitPoint = uSplit + perc * uFray;
  float spread = smoothstep(splitPoint, max(0.7, splitPoint + 0.2), x);
  float t = uTime / 10.0;
  float blur = smoothstep(splitPoint, splitPoint + 0.05, x) * perc;
  float n = mix(
    perlin(vec2(t * 2.5, (x * uWaves + perc) * 2.5)),
    perlin(vec2(t * 3.5, (x * uWaves + t) * 3.5)) / 1.5,
    x * 0.3
  );
  float y = 0.5 + (perc - 0.5) * uDistance + n * 0.25 * uAmplitude * spread;
  vec2 local = vec2((x - 0.5) * uFrame.x, (y - 0.5) * uFrame.y);
  float width = 7.0 * uThickness * pixel * (1.0 - perc);
  float band = (width / 2.0 + 10.0 * uSoftness * pixel * blur) * uFrame.y;
  float draw = max(band, 1.0);
  local.y += aPoint.y * draw;
  vec2 turned = vec2(local.x * uTurn.x - local.y * uTurn.y, local.x * uTurn.y + local.y * uTurn.x);
  gl_Position = vec4(turned / (uResolution * 0.5) + uShift, 0.0, 1.0);
  vEdge = aPoint.y * draw;
  vBand = band;
  vDraw = draw;
  vAlpha = 1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3)) * uTaper;
  vIndex = perc;
}`;

const FRAGMENT = `#version 300 es
precision highp float;
in float vEdge;
in float vBand;
in float vDraw;
in float vAlpha;
in float vIndex;
uniform vec3 uColor;
uniform vec3 uAccent;
uniform float uOpacity;
out vec4 outColor;
void main() {
  float coverage = (1.0 - smoothstep(0.0, vDraw, abs(vEdge))) * (vBand / vDraw) * vAlpha * uOpacity;
  // Màu nhân sẵn alpha (canvas premultipliedAlpha)
  outColor = vec4(mix(uColor, uAccent, vIndex) * coverage, coverage);
}`;

const UNIFORMS = ["uTime", "uResolution", "uFrame", "uTurn", "uShift", "uAmplitude", "uDistance", "uCount", "uThickness", "uSoftness", "uWaves", "uSplit", "uFray", "uTaper", "uColor", "uAccent", "uOpacity"] as const;
type UniformName = (typeof UNIFORMS)[number];

/** Giới hạn điểm ảnh thật của canvas: nền mờ chậm không cần nét hơn, tiết kiệm GPU trên màn 4K */
const MAX_RENDER_DIM = 1600;
const MAX_DPR = 1.5;

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
}

function link(gl: WebGL2RenderingContext) {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  gl.deleteProgram(program);
  return null;
}

/** Đổi một màu CSS bất kỳ (#hex, rgb(), tên màu) sang bộ ba 0–1 bằng canvas 2D, để nhận thẳng giá trị token */
function toRgb(value: string): [number, number, number] {
  const probe = document.createElement("canvas");
  probe.width = probe.height = 1;
  const context = probe.getContext("2d");
  if (!context) return [1, 1, 1];
  context.fillStyle = value;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
}

export type ThreadsProps = {
  /** Màu sợi ở lõi bó và ở rìa bó (màu CSS, lấy từ token) */
  color: string;
  accent: string;
  className?: string;
  /** Dừng thời gian (vẫn giữ khung hình đang có) */
  paused?: boolean;
  lineCount?: number;
  /** Độ uốn của sợi sau khi tách khỏi bó */
  amplitude?: number;
  /** Bề rộng của bó, theo tỉ lệ chiều ngang khung (0–1) */
  distance?: number;
  /** Tốc độ trôi; 0.25 là rất chậm */
  speed?: number;
  /** Góc của bó (độ, ngược chiều kim đồng hồ): dương = đi lên về bên phải */
  angle?: number;
  /** Dời cả bó theo tỉ lệ kích thước khung: x dương = sang phải, y dương = xuống dưới (0.25 = một phần tư chiều cao) */
  shiftX?: number;
  shiftY?: number;
  thickness?: number;
  softness?: number;
  waves?: number;
  /** Vị trí bắt đầu tách (0–1 dọc theo sợi) và độ lệch giữa sợi đầu và sợi cuối */
  split?: number;
  fray?: number;
  /** Sợi ở rìa mờ dần (0–1) */
  taper?: number;
  opacity?: number;
  /** Gọi một lần khi khung hình đầu tiên đã vẽ xong */
  onReady?: () => void;
  /** Gọi khi không dựng được WebGL2 hoặc mất context */
  onFail?: () => void;
};

export function Threads({
  color,
  accent,
  className,
  paused = false,
  lineCount = 56,
  amplitude = 1.5,
  distance = 0.4,
  speed = 0.25,
  angle = 16,
  shiftX = 0,
  shiftY = 0,
  thickness = 0.6,
  softness = 1.2,
  waves = 1.05,
  split = 0.04,
  fray = 0.5,
  taper = 0.85,
  opacity = 1,
  onReady,
  onFail,
}: ThreadsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Thông số đọc qua ref để đổi props không phải dựng lại context WebGL
  const settings = { color, accent, paused, lineCount: Math.max(1, Math.min(200, Math.round(lineCount))), amplitude, distance, speed, angle, shiftX, shiftY, thickness, softness, waves, split, fray, taper, opacity };
  const settingsRef = useRef(settings);
  const callbacksRef = useRef({ onReady, onFail });
  const syncRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    settingsRef.current = settings;
    callbacksRef.current = { onReady, onFail };
    syncRef.current?.();
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fail = () => callbacksRef.current.onFail?.();
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
    const program = gl && link(gl);
    if (!gl || !program) {
      fail();
      return;
    }

    const uniforms = {} as Record<UniformName, WebGLUniformLocation | null>;
    for (const name of UNIFORMS) uniforms[name] = gl.getUniformLocation(program, name);
    const vao = gl.createVertexArray();
    const buffer = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    const point = gl.getAttribLocation(program, "aPoint");
    gl.enableVertexAttribArray(point);
    gl.vertexAttribPointer(point, 2, gl.FLOAT, false, 0, 0);

    const state = { time: 0, width: 1, height: 1, segments: 0, colorKey: "", color: [1, 1, 1], accent: [1, 1, 1], ready: false };
    let visible = false;
    let ticking = false;
    let alive = true;

    const buildStrip = (segments: number) => {
      if (segments === state.segments) return;
      state.segments = segments;
      const points = new Float32Array((segments + 1) * 4);
      for (let i = 0; i <= segments; i++) points.set([i / segments, -1, i / segments, 1], i * 4);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
    };

    const render = () => {
      const s = settingsRef.current;
      const key = `${s.color}|${s.accent}`;
      if (key !== state.colorKey) {
        state.colorKey = key;
        state.color = toRgb(s.color);
        state.accent = toRgb(s.accent);
      }
      const w = canvas.width;
      const h = canvas.height;
      const radians = (s.angle * Math.PI) / 180;
      const cos = Math.cos(radians);
      const sin = Math.sin(radians);
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(program);
      gl.uniform1f(uniforms.uTime, state.time);
      gl.uniform2f(uniforms.uResolution, w, h);
      // Khung của bó sau khi xoay: đủ dài và đủ rộng để phủ kín canvas ở mọi góc
      gl.uniform2f(uniforms.uFrame, Math.abs(w * cos) + Math.abs(h * sin), Math.abs(w * sin) + Math.abs(h * cos));
      gl.uniform2f(uniforms.uTurn, cos, sin);
      // Toạ độ clip: -1…1 nên một lần kích thước khung = 2; trục y của WebGL hướng lên
      gl.uniform2f(uniforms.uShift, s.shiftX * 2, s.shiftY * -2);
      gl.uniform1f(uniforms.uAmplitude, s.amplitude);
      gl.uniform1f(uniforms.uDistance, s.distance);
      gl.uniform1f(uniforms.uCount, s.lineCount);
      gl.uniform1f(uniforms.uThickness, s.thickness);
      gl.uniform1f(uniforms.uSoftness, s.softness);
      gl.uniform1f(uniforms.uWaves, s.waves);
      gl.uniform1f(uniforms.uSplit, s.split);
      gl.uniform1f(uniforms.uFray, s.fray);
      gl.uniform1f(uniforms.uTaper, s.taper);
      gl.uniform3f(uniforms.uColor, state.color[0], state.color[1], state.color[2]);
      gl.uniform3f(uniforms.uAccent, state.accent[0], state.accent[1], state.accent[2]);
      gl.uniform1f(uniforms.uOpacity, s.opacity);
      gl.bindVertexArray(vao);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, (state.segments + 1) * 2, s.lineCount);
      if (!state.ready) {
        state.ready = true;
        callbacksRef.current.onReady?.();
      }
    };

    const resize = () => {
      const width = Math.max(1, canvas.clientWidth);
      const height = Math.max(1, canvas.clientHeight);
      const baseDpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const longest = Math.max(width, height) * baseDpr;
      const dpr = longest > MAX_RENDER_DIM ? (baseDpr * MAX_RENDER_DIM) / longest : baseDpr;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      state.width = width;
      state.height = height;
      buildStrip(Math.max(96, Math.min(320, Math.round(width / 5))));
      render();
    };

    // deltaTime của gsap.ticker tính bằng mili giây; chặn trên để quay lại tab không nhảy cóc
    const tick = (_time: number, deltaTime: number) => {
      state.time += Math.min(0.05, deltaTime / 1000) * settingsRef.current.speed;
      render();
    };

    /** Chỉ nằm trên ticker khi thật sự cần vẽ: trong màn hình, tab đang mở, không bị tạm dừng */
    const sync = () => {
      const run = alive && visible && !document.hidden && !settingsRef.current.paused;
      if (run === ticking) return;
      ticking = run;
      if (run) gsap.ticker.add(tick);
      else gsap.ticker.remove(tick);
    };
    syncRef.current = sync;

    const onLost = (event: Event) => {
      event.preventDefault();
      alive = false;
      sync();
      fail();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const intersection = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      sync();
    });
    intersection.observe(canvas);
    document.addEventListener("visibilitychange", sync);
    canvas.addEventListener("webglcontextlost", onLost);
    resize();

    return () => {
      alive = false;
      sync();
      syncRef.current = null;
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", sync);
      canvas.removeEventListener("webglcontextlost", onLost);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={cx("block h-full w-full", className)} />;
}
