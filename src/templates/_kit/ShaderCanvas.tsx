"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/cn";
import { MQ } from "@/lib/motion";

const VERTEX = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

/**
 * Canvas fragment shader toàn khung (WebGL2), dùng chung cho các mẫu.
 * Uniform có sẵn: uTime (giây), uRes (px), uMouse (0..1, lerp mượt), uScroll (0..1: tiến độ phần tử qua màn hình).
 * Shader viết `#version 300 es`, khai báo `out vec4 outColor;`.
 * Trang trí thuần túy: aria-hidden; dừng khi ra khỏi màn hình; giảm chuyển động → vẽ 1 khung tĩnh.
 */
export function ShaderCanvas({
  fragment,
  className,
  maxDpr = 1.5,
}: {
  fragment: string;
  className?: string;
  maxDpr?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    // Canvas mới cho mỗi lần mount: React Strict Mode (dev) mount 2 lần, context đã loseContext() không dùng lại được
    const canvas = document.createElement("canvas");
    canvas.className = "block h-full w-full";
    host.appendChild(canvas);
    const gl = canvas.getContext("webgl2", { antialias: false, premultipliedAlpha: true, alpha: true });
    if (!gl) return () => canvas.remove();

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn("[ShaderCanvas]", gl.getShaderInfoLog(sh));
        return null;
      }
      return sh;
    };
    const vs = compile(gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl.FRAGMENT_SHADER, fragment);
    if (!vs || !fs) return;
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = {
      time: gl.getUniformLocation(program, "uTime"),
      res: gl.getUniformLocation(program, "uRes"),
      mouse: gl.getUniformLocation(program, "uMouse"),
      scroll: gl.getUniformLocation(program, "uScroll"),
    };

    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const start = performance.now();
    let frame = 0;
    let running = false;

    const scrollProgress = () => {
      const r = canvas.getBoundingClientRect();
      const vh = window.innerHeight;
      return Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
    };

    const draw = (now: number) => {
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      gl.viewport(0, 0, w, h);
      gl.uniform1f(u.time, (now - start) / 1000);
      gl.uniform2f(u.res, w, h);
      gl.uniform2f(u.mouse, mouse.x, mouse.y);
      gl.uniform1f(u.scroll, scrollProgress());
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now: number) => {
      if (!running) return;
      draw(now);
      frame = requestAnimationFrame(loop);
    };

    const reduced = window.matchMedia(MQ.reduced).matches;
    if (reduced) {
      draw(start + 2000);
      return () => {
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        canvas.remove();
      };
    }

    const onMove = (event: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.tx = (event.clientX - r.left) / r.width;
      mouse.ty = 1 - (event.clientY - r.top) / r.height;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        frame = requestAnimationFrame(loop);
      } else if (!entry.isIntersecting) {
        running = false;
        cancelAnimationFrame(frame);
      }
    });
    observer.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [fragment, maxDpr]);

  return <div ref={ref} aria-hidden className={cn("pointer-events-none block h-full w-full", className)} />;
}
