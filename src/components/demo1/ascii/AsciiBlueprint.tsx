"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/cn";

import { BLUEPRINTS, createPen, rect, type Pen } from "./blueprints";
import type { DrawSource } from "./field";
import { useAscii } from "./useAscii";

const WIPE_MS = 700;

/** Dấu góc kiểu bản vẽ kỹ thuật, chung cho mọi bản vẽ */
function corners(pen: Pen) {
  const [hx, hy] = pen.half;
  const x = hx - 0.07;
  const y = hy - 0.07;
  const l = 0.12;
  for (const [sx, sy] of [[-1, 1], [1, 1], [1, -1], [-1, -1]]) {
    pen.line([[sx * x, sy * (y - l)], [sx * x, sy * y], [sx * (x - l), sy * y]], 0.4);
  }
}

/**
 * "Bản vẽ" của từng mảng dịch vụ, in bằng 0 và 1 trên lưới ký tự (nét dày đúng một ô → hình rõ):
 * mạng nơ-ron có tín hiệu chạy · mô-đun khối nổi lên · trình duyệt + điện thoại cuộn nội dung · sóng lan tới người nhận.
 * Đổi mảng: bản vẽ mới được "in" từ trên xuống bằng một dòng quét sáng.
 */
export function AsciiBlueprint({ index, className }: { index: number; className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetRef = useRef(index);

  const { ready, kick } = useAscii(wrapRef, canvasRef, {
    text: "01",
    glyphs: "binary",
    fps: 24,
    flowMs: 1400,
    dot: "rgba(132, 228, 214, 0.08)",
    threshold: 0.42,
    tone: (l) => l,
    interactive: true,
    fontSize: (w) => (w < 640 ? 9 : 10),
    build: () => {
      let shown = targetRef.current;
      let prev = shown;
      let start = -Infinity;
      const source: DrawSource = (ctx, W, H, t) => {
        const target = targetRef.current;
        if (t < 0) {
          shown = prev = target;
          start = -Infinity;
        } else if (target !== shown) {
          prev = shown;
          shown = target;
          start = t;
        }
        const pen = createPen(ctx, W, H);
        const k = t < 0 ? 1 : Math.min(1, (t - start) / WIPE_MS);
        if (k >= 1) {
          BLUEPRINTS[shown](pen, t);
        } else {
          const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
          const y = pen.half[1] - e * pen.half[1] * 2;
          pen.within(rect(-3, 3, 3, y), () => BLUEPRINTS[shown](pen, t));
          pen.within(rect(-3, y, 3, -3), () => BLUEPRINTS[prev](pen, t));
          pen.line([[-3, y], [3, y]], 1);
        }
        corners(pen);
      };
      return { source, isDynamic: () => true, isAnimating: () => true };
    },
  });

  useEffect(() => {
    targetRef.current = index;
    kick();
    // kick đổi mỗi lần render; chỉ cần chạy khi đổi bản vẽ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <div ref={wrapRef} className={cn("d1-mark", className)} data-ready={ready}>
      <canvas ref={canvasRef} aria-hidden />
    </div>
  );
}
