"use client";

import { useEffect, useRef } from "react";

import { BASE_ROTATION, createShapes } from "@/components/webgl/shapes";
import { cn } from "@/lib/cn";

import type { DrawSource } from "./field";
import { useAscii } from "./useAscii";

/**
 * "Bản vẽ" của từng mảng dịch vụ bằng ký tự: dùng lại 5 hình điểm của sân khấu hạt ở trang chính
 * (0 nền móng · 1 mạng AI · 2 mô-đun phần mềm · 3 khung web · 4 sóng marketing), chiếu xuống 2D theo đúng góc nhìn cũ,
 * lắc nhẹ, và **morph** sang hình mới khi `index` đổi.
 */
export function AsciiShapes({ index, text, className }: { index: number; text: string; className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetRef = useRef(index);

  const { ready, kick } = useAscii(wrapRef, canvasRef, {
    text,
    fps: 30,
    flowMs: 170,
    dot: "rgba(132, 228, 214, 0.09)",
    threshold: 0.4,
    tone: (_l, a) => Math.min(1, 0.1 + a * 1.05),
    interactive: true,
    build: () => {
      const coarse = !window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      const shapes = createShapes(coarse ? 1500 : 2600);
      const current = Float32Array.from(shapes[targetRef.current]);
      const source: DrawSource = (ctx, W, H, t) => {
        const target = shapes[targetRef.current];
        if (t < 0) current.set(target);
        else for (let i = 0; i < current.length; i++) current[i] += (target[i] - current[i]) * 0.1;
        const yaw = BASE_ROTATION.y + (t < 0 ? 0 : Math.sin(t * 0.00035) * 0.32);
        const pitch = BASE_ROTATION.x;
        const cy = Math.cos(yaw);
        const sy = Math.sin(yaw);
        const cx = Math.cos(pitch);
        const sx = Math.sin(pitch);
        const scale = Math.min(W, H) * 0.42;
        // Mỗi điểm phủ gần một ô; chồng nhiều điểm thì ô sáng hơn
        const pw = W / 84;
        const ph = pw * 1.6;
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = "rgba(200, 245, 236, 0.34)";
        for (let i = 0; i < current.length; i += 3) {
          const x = current[i];
          const y = current[i + 1];
          const z = current[i + 2];
          const x1 = x * cy + z * sy;
          const z1 = -x * sy + z * cy;
          const y1 = y * cx - z1 * sx;
          ctx.fillRect(W / 2 + x1 * scale - pw / 2, H / 2 - y1 * scale - ph / 2, pw, ph);
        }
      };
      return { source, isDynamic: () => true, isAnimating: () => true };
    },
  });

  useEffect(() => {
    targetRef.current = index;
    kick();
    // kick đổi mỗi lần render; chỉ cần chạy khi đổi hình
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <div ref={wrapRef} className={cn("d1-mark", className)} data-ready={ready}>
      <canvas ref={canvasRef} aria-hidden />
    </div>
  );
}
