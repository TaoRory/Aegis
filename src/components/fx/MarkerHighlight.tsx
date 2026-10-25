"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Bút dạ quang quét dưới chữ khi đoạn chữ vào khung nhìn (Emotion pattern).
 * Màu lấy từ biến --marker của nơi dùng. Không có JS/giảm chuyển động: nét quét hiện sẵn (xem fx.css).
 */
export function MarkerHighlight({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.on = "true";
        io.disconnect();
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <span ref={ref} className={cn("marker", className)} style={{ transitionDelay: `${delay}s` }}>
      {children}
    </span>
  );
}
