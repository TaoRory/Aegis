"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/cn";
import { gsap, MQ } from "@/lib/motion";
import { onPointerMove } from "@/lib/pointer";

const VERT = `#version 300 es
in vec2 aPos; out vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

/** Bước mô phỏng: khuếch tán + trôi theo trường dòng chảy + suy giảm + vệt chuột (đoạn thẳng từ vị trí trước tới hiện tại) */
const STEP = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 outColor;
uniform sampler2D uPrev; uniform vec2 uTexel; uniform vec2 uA; uniform vec2 uB; uniform float uRadius; uniform float uStrength; uniform float uTime; uniform float uAspect;
float segDist(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0); return length(pa - ba * h); }
void main(){
  vec2 uv = vUv;
  vec2 flow = vec2(sin(uv.y * 7.0 + uTime * 0.7) + 0.6 * sin(uv.y * 15.0 - uTime), cos(uv.x * 6.0 - uTime * 0.6)) * 0.0012 + vec2(0.0, 0.0009);
  vec2 s = uv - flow;
  float c = texture(uPrev, s).r;
  float n = texture(uPrev, s + vec2(uTexel.x, 0.0)).r + texture(uPrev, s - vec2(uTexel.x, 0.0)).r + texture(uPrev, s + vec2(0.0, uTexel.y)).r + texture(uPrev, s - vec2(0.0, uTexel.y)).r;
  float v = (c * 4.0 + n) / 8.0;
  v = max(v * 0.972 - 0.0025, 0.0);
  vec2 asp = vec2(uAspect, 1.0);
  float d = segDist(uv * asp, uA * asp, uB * asp);
  v += exp(-(d * d) / (uRadius * uRadius)) * uStrength;
  outColor = vec4(min(v, 1.0), 0.0, 0.0, 1.0);
}`;

const SHOW = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 outColor;
uniform sampler2D uTex; uniform vec3 uColor; uniform float uOpacity;
void main(){
  float d = texture(uTex, vUv).r;
  float a = smoothstep(0.0, 0.85, d) * uOpacity;
  outColor = vec4(uColor * a, a);
}`;

function hexToRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/**
 * Sương/khói mờ đi theo con trỏ (Emotion pattern), WebGL2 ping-pong ở 1/3 độ phân giải.
 * Đặt trong khối có position: relative; canvas phủ kín khối đó, không bắt sự kiện chuột.
 * Không WebGL2 / không chuột / giảm chuyển động → không vẽ gì (trang vẫn nguyên vẹn).
 */
export function MistCursor({ color = "#ffffff", opacity = 0.85, className }: { color?: string; opacity?: number; className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || document.documentElement.dataset.quality === "low" || !window.matchMedia(`${MQ.fineHover} and ${MQ.anyMotion}`).matches) return;
    // Canvas mới cho mỗi lần mount (Strict Mode dev mount 2 lần; context đã mất không dùng lại được)
    const canvas = document.createElement("canvas");
    canvas.className = "block h-full w-full";
    host.appendChild(canvas);
    const gl = canvas.getContext("webgl2", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return () => canvas.remove();

    const compile = (fragSrc: string) => {
      const p = gl.createProgram()!;
      for (const [type, src] of [
        [gl.VERTEX_SHADER, VERT],
        [gl.FRAGMENT_SHADER, fragSrc],
      ] as const) {
        const sh = gl.createShader(type)!;
        gl.shaderSource(sh, src);
        gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.warn("[MistCursor]", gl.getShaderInfoLog(sh));
        gl.attachShader(p, sh);
      }
      gl.bindAttribLocation(p, 0, "aPos");
      gl.linkProgram(p);
      return p;
    };
    const step = compile(STEP);
    const show = compile(SHOW);
    const uni = (p: WebGLProgram, names: string[]) => Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(p, n)]));
    const us = uni(step, ["uPrev", "uTexel", "uA", "uB", "uRadius", "uStrength", "uTime", "uAspect"]);
    const ud = uni(show, ["uTex", "uColor", "uOpacity"]);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    let w = 0;
    let h = 0;
    let targets: { tex: WebGLTexture; fb: WebGLFramebuffer }[] = [];
    const makeTarget = () => {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fb = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return { tex, fb };
    };
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const nw = Math.max(2, Math.round(rect.width / 3));
      const nh = Math.max(2, Math.round(rect.height / 3));
      if (nw === w && nh === h) return;
      w = nw;
      h = nh;
      canvas.width = Math.round(rect.width * Math.min(window.devicePixelRatio || 1, 1.5));
      canvas.height = Math.round(rect.height * Math.min(window.devicePixelRatio || 1, 1.5));
      targets.forEach((t) => {
        gl.deleteTexture(t.tex);
        gl.deleteFramebuffer(t.fb);
      });
      targets = [makeTarget(), makeTarget()];
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const m = { ax: -1, ay: -1, bx: -1, by: -1, speed: 0, inside: false };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = 1 - (e.clientY - r.top) / r.height;
      m.inside = x > -0.05 && x < 1.05 && y > -0.05 && y < 1.05;
      if (m.bx < 0) {
        m.bx = x;
        m.by = y;
      }
      m.speed = Math.min(1, m.speed + Math.hypot(x - m.bx, y - m.by) * 6);
      m.bx = x;
      m.by = y;
    };
    const stopPointer = onPointerMove((e) => e && onMove(e));

    let visible = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(canvas);

    const rgb = hexToRgb(color);
    const start = performance.now();
    let read = 0;
    const tick = () => {
      if (!visible || targets.length < 2) return;
      const ax = m.ax < 0 ? m.bx : m.ax;
      const ay = m.ay < 0 ? m.by : m.ay;
      const active = m.inside && m.bx >= 0;
      // Bước mô phỏng vào target còn lại
      gl.useProgram(step);
      gl.bindFramebuffer(gl.FRAMEBUFFER, targets[1 - read].fb);
      gl.viewport(0, 0, w, h);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, targets[read].tex);
      gl.uniform1i(us.uPrev, 0);
      gl.uniform2f(us.uTexel, 1 / w, 1 / h);
      gl.uniform2f(us.uA, ax, ay);
      gl.uniform2f(us.uB, m.bx, m.by);
      gl.uniform1f(us.uRadius, 0.035 + m.speed * 0.05);
      gl.uniform1f(us.uStrength, active ? 0.045 + m.speed * 0.2 : 0);
      gl.uniform1f(us.uTime, (performance.now() - start) / 1000);
      gl.uniform1f(us.uAspect, w / h);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      read = 1 - read;
      m.ax = m.bx;
      m.ay = m.by;
      m.speed *= 0.9;
      // Hiển thị
      gl.useProgram(show);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindTexture(gl.TEXTURE_2D, targets[read].tex);
      gl.uniform1i(ud.uTex, 0);
      gl.uniform3f(ud.uColor, rgb[0], rgb[1], rgb[2]);
      gl.uniform1f(ud.uOpacity, opacity);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      io.disconnect();
      stopPointer();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [color, opacity]);

  return <div ref={hostRef} aria-hidden className={cn("pointer-events-none absolute inset-0 h-full w-full", className)} />;
}
