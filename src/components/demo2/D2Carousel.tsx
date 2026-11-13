"use client";

import { useRef, type ReactNode } from "react";

import { ArrowRight } from "@/components/demo1/icons";

/**
 * Băng chuyền ngang dùng cuộn gốc của trình duyệt (scroll-snap): vuốt, kéo thanh cuộn, Shift + lăn chuột, hoặc hai nút mũi tên.
 * Không JS thì vẫn cuộn ngang bình thường (chỉ mất hai nút).
 */
export function D2Carousel({ children, label, prev, next }: { children: ReactNode; label: string; prev: string; next: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const move = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const step = (track.firstElementChild as HTMLElement | null)?.offsetWidth ?? track.clientWidth * 0.8;
    track.scrollBy({ left: direction * (step + 20), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  return (
    <div className="d2-carousel">
      <div ref={trackRef} className="d2-carousel-track" role="group" aria-label={label} tabIndex={0}>
        {children}
      </div>
      <div className="d2-carousel-nav">
        <button type="button" aria-label={prev} onClick={() => move(-1)}>
          <ArrowRight className="rotate-180" />
        </button>
        <button type="button" aria-label={next} onClick={() => move(1)}>
          <ArrowRight />
        </button>
      </div>
    </div>
  );
}
