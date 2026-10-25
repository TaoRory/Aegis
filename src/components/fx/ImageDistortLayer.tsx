"use client";

import { useEffect, useRef } from "react";

import { gsap, MQ } from "@/lib/motion";

const VERT = `#version 300 es
in vec2 aPos; out vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

/** Phồng quanh con trỏ + kéo theo vận tốc + tách kênh RGB; ảnh fit kiểu object-cover */
const FRAG = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 outColor;
uniform sampler2D uTex; uniform vec2 uRes; uniform vec2 uImg; uniform vec2 uMouse; uniform vec2 uVel; uniform float uHover; uniform float uTime;
vec2 cover(vec2 uv){
  float ra = uRes.x / uRes.y, ia = uImg.x / uImg.y;
  vec2 s = ra > ia ? vec2(1.0, ia / ra) : vec2(ra / ia, 1.0);
  return (uv - 0.5) * s + 0.5;
}
void main(){
  vec2 uv = vUv;
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);
  float d = distance(uv * asp, uMouse * asp);
  float f = smoothstep(0.45, 0.0, d) * uHover;
  uv -= normalize(uv - uMouse + 1e-4) * f * 0.035;
  uv -= uVel * f * 0.9;
  uv += vec2(sin(uv.y * 18.0 + uTime * 2.0), cos(uv.x * 14.0 + uTime * 1.6)) * 0.0025 * uHover;
  uv = (uv - 0.5) * (1.0 - 0.05 * uHover) + 0.5;
  float shift = (0.004 + length(uVel) * 0.35) * f;
  vec2 c = cover(uv);
  vec4 base = texture(uTex, c);
  float r = texture(uTex, cover(uv + vec2(shift, 0.0))).r;
  float b = texture(uTex, cover(uv - vec2(shift, 0.0))).b;
  outColor = vec4(r, base.g, b, 1.0);
}`;

/**
 * Lớp WebGL dùng chung cho cả trang: hiệu ứng ảnh "méo" theo chuột khi hover.
 * Cách dùng: đặt <ImageDistortLayer /> một lần trong trang, và gắn data-distort="/duong-dan-anh.webp"
 * lên khung chứa ảnh (khung nên có overflow-hidden). Chỉ chạy trên thiết bị có chuột + không giảm chuyển động.
 * Ảnh gốc vẫn hiển thị bên dưới (SEO, a11y, fallback) — canvas chỉ phủ lên khi đang hover.
 */
export function ImageDistortLayer() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !window.matchMedia(`${MQ.fineHover} and ${MQ.anyMotion}`).matches) return;
    // Canvas mới cho mỗi lần mount (Strict Mode dev mount 2 lần; context đã mất không dùng lại được)
    const canvas = document.createElement("canvas");
    canvas.className = "block h-full w-full";
    host.appendChild(canvas);
    const gl = canvas.getContext("webgl2", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return () => canvas.remove();

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn("[ImageDistort]", gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = Object.fromEntries(["uTex", "uRes", "uImg", "uMouse", "uVel", "uHover", "uTime"].map((n) => [n, gl.getUniformLocation(prog, n)]));

    const textures = new Map<string, { tex: WebGLTexture; w: number; h: number } | "loading">();
    const load = (src: string) => {
      if (textures.has(src)) return;
      textures.set(src, "loading");
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        const tex = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        textures.set(src, { tex, w: img.naturalWidth, h: img.naturalHeight });
      };
      img.src = src;
    };

    const s = { el: null as HTMLElement | null, src: "", hover: 0, mx: 0.5, my: 0.5, vx: 0, vy: 0, lastX: 0, lastY: 0 };
    const hoverTo = gsap.quickTo(s, "hover", { duration: 0.9, ease: "power3.out" });

    const onOver = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-distort]");
      if (el && el !== s.el) {
        s.el = el;
        s.src = el.dataset.distort ?? "";
        load(s.src);
        hoverTo(1);
      } else if (!el && s.el) {
        hoverTo(0);
      }
    };
    const onMove = (e: PointerEvent) => {
      s.vx = (e.clientX - s.lastX) * 0.0006;
      s.vy = (e.clientY - s.lastY) * 0.0006;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      if (!s.el) return;
      const r = s.el.getBoundingClientRect();
      s.mx = (e.clientX - r.left) / r.width;
      s.my = 1 - (e.clientY - r.top) / r.height;
    };
    document.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });

    const start = performance.now();
    const tick = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.round(window.innerWidth * dpr);
      const h = Math.round(window.innerHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      s.vx *= 0.9;
      s.vy *= 0.9;
      gl.clearColor(0, 0, 0, 0);
      gl.disable(gl.SCISSOR_TEST);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const entry = textures.get(s.src);
      if (!s.el || s.hover < 0.002 || !entry || entry === "loading") {
        if (s.hover < 0.002) s.el = null;
        return;
      }
      const r = s.el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const x = Math.round(r.left * dpr);
      const y = Math.round((window.innerHeight - r.bottom) * dpr);
      const rw = Math.round(r.width * dpr);
      const rh = Math.round(r.height * dpr);
      gl.viewport(x, y, rw, rh);
      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(x, y, rw, rh);
      gl.bindTexture(gl.TEXTURE_2D, entry.tex);
      gl.uniform1i(u.uTex, 0);
      gl.uniform2f(u.uRes, rw, rh);
      gl.uniform2f(u.uImg, entry.w, entry.h);
      gl.uniform2f(u.uMouse, s.mx, s.my);
      gl.uniform2f(u.uVel, s.vx, -s.vy);
      gl.uniform1f(u.uHover, s.hover);
      gl.uniform1f(u.uTime, (performance.now() - start) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      document.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointermove", onMove);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, []);

  return <div ref={hostRef} aria-hidden className="pointer-events-none fixed inset-0 z-30 h-full w-full" />;
}
