"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

import { clamp01, type DrawSource } from "./field";
import { useAscii } from "./useAscii";

/**
 * Lớp phủ "ký tự → ảnh thật" cho ảnh dự án: lúc gắn hiện ảnh dưới dạng ký tự, sau `delay` các ô lần lượt chuyển thành
 * khối màu thật của ảnh, xong thì canvas mờ đi để lộ ảnh gốc nằm bên dưới. Giảm chuyển động: lớp phủ ẩn bằng CSS (demo1.css).
 */
export function AsciiResolve({ src, text, delay = 260, duration = 950, className }: { src: string; text: string; delay?: number; duration?: number; className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const kickRef = useRef<() => void>(() => {});
  const [done, setDone] = useState(false);

  const { ready, kick } = useAscii(wrapRef, canvasRef, {
    text,
    fps: 40,
    dot: null,
    threshold: 0,
    tone: (l) => 0.1 + l * 0.95,
    fontSize: (w) => (w < 420 ? 8 : 9),
    build: () => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => kickRef.current();
      img.src = src;
      let start = -1;
      let finished = false;
      const source: DrawSource = (ctx, W, H) => {
        if (!img.naturalWidth) return;
        // object-fit: cover, neo phía trên (ảnh chụp trang web)
        const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
        ctx.drawImage(img, (W - img.naturalWidth * scale) / 2, 0, img.naturalWidth * scale, img.naturalHeight * scale);
      };
      return {
        source,
        isDynamic: () => false,
        isAnimating: () => !finished,
        beforeDraw: (field, t) => {
          if (!img.naturalWidth) return;
          if (start < 0) start = t;
          field.resolve = clamp01((t - start - delay) / duration);
          if (field.resolve >= 1 && !finished) {
            finished = true;
            setDone(true);
          }
        },
      };
    },
  });

  useEffect(() => {
    kickRef.current = kick;
  });

  return (
    <div ref={wrapRef} aria-hidden className={cn("d1-resolve", className)} data-ready={ready} data-done={done}>
      <canvas ref={canvasRef} />
    </div>
  );
}
