"use client";

import { useRef } from "react";

import { MARK_CENTER, MARK_SEGMENTS, MARK_VIEWBOX } from "@/components/brand/mark-data";
import { cn } from "@/lib/cn";

import { clamp01, easeOutExpo, type DrawSource } from "./field";
import { useAscii } from "./useAscii";

const [, , VB_W, VB_H] = MARK_VIEWBOX.split(" ").map(Number);
/** Lắp ráp: thân xoay về 0 trong 1.7s; mảnh đầu 1s, các mảnh sau trễ 0.24s + 0.09s/mảnh, mỗi mảnh 0.95s (giống assembleMark của intro) */
const ASSEMBLY_END = 0.24 + 0.09 * (MARK_SEGMENTS.length - 2) + 0.95 + 0.2;

/**
 * Logo Möbius của Aegis dựng bằng ký tự: 7 mảnh dải (đường vẽ thật của logo, kèm dải màu kính) được vẽ lại mỗi khung
 * vào lưới ký tự. `mode="assemble"`: các mảnh bay vào và khoá lại khi khung hiện lần đầu, rồi đứng yên (chữ vẫn chảy, có dải sáng);
 * `mode="spin"`: logo lật quanh trục dọc như đồng xu, chậm.
 */
export function AsciiMobius({ text, mode = "assemble", scale = 0.88, className, label }: { text: string; mode?: "assemble" | "spin"; scale?: number; className?: string; label?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { ready } = useAscii(wrapRef, canvasRef, {
    text,
    fps: 30,
    flowMs: 150,
    sweep: true,
    // lũy thừa lớn: phần tối của dải kính tối hẳn → đọc được các nếp gấp của dải Möbius
    tone: (l, a) => Math.min(1, 0.04 + Math.pow(l, 2.3) * 1.25) * a,
    interactive: true,
    build: () => {
      const segments = MARK_SEGMENTS.map((segment) => ({ path: new Path2D(segment.d), gradient: segment.gradient }));
      let start = -1;
      const source: DrawSource = (ctx, W, H, t) => {
        const still = t < 0;
        if (!still && start < 0) start = t;
        const elapsed = still ? 99 : (t - start) / 1000;
        const s = (Math.min(W / VB_W, H / VB_H) * scale);
        ctx.translate(W / 2, H / 2);
        if (mode === "spin") {
          const turn = still ? 1 : Math.cos(t * 0.00045);
          // lật quanh trục dọc: co ngang theo cos, mặt sau tối hơn một chút
          ctx.scale(Math.abs(turn) < 0.04 ? 0.04 * Math.sign(turn || 1) : turn, 1);
        }
        ctx.scale(s, s);
        ctx.translate(-MARK_CENTER.x, -MARK_CENTER.y);
        const assembling = mode === "assemble";
        if (assembling) {
          const body = easeOutExpo(clamp01(elapsed / 1.7));
          ctx.translate(MARK_CENTER.x, MARK_CENTER.y);
          ctx.rotate((-60 * (1 - body) * Math.PI) / 180);
          ctx.translate(-MARK_CENTER.x, -MARK_CENTER.y);
        }
        segments.forEach(({ path, gradient }, index) => {
          let e = 1;
          if (assembling) {
            const delay = index === 0 ? 0 : 0.24 + 0.09 * (index - 1);
            const duration = index === 0 ? 1 : 0.95;
            e = easeOutExpo(clamp01((elapsed - delay) / duration));
            if (e <= 0.001) return;
          }
          ctx.save();
          if (e < 1) {
            ctx.translate(MARK_CENTER.x, MARK_CENTER.y);
            ctx.rotate((-46 * (1 - e) * Math.PI) / 180);
            ctx.scale(0.62 + 0.38 * e, 0.62 + 0.38 * e);
            ctx.translate(-MARK_CENTER.x, -MARK_CENTER.y);
          }
          ctx.globalAlpha = e;
          const fill = ctx.createLinearGradient(gradient.x1, gradient.y1, gradient.x2, gradient.y2);
          gradient.stops.forEach(([offset, color]) => fill.addColorStop(offset, color));
          ctx.fillStyle = fill;
          ctx.fill(path);
          ctx.restore();
        });
      };
      const settled = (t: number) => start >= 0 && (t - start) / 1000 > ASSEMBLY_END;
      return {
        source,
        isDynamic: (t) => mode === "spin" || !settled(t),
        isAnimating: (t) => mode === "spin" || !settled(t),
      };
    },
  });

  return (
    <div ref={wrapRef} className={cn("d1-mark", className)} data-ready={ready} role={label ? "img" : undefined} aria-label={label}>
      <canvas ref={canvasRef} aria-hidden />
    </div>
  );
}
