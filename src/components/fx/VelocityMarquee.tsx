"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";
import { getLenis, gsap, MQ } from "@/lib/motion";

/**
 * Dải chữ chạy vô hạn mà tốc độ và chiều phụ thuộc vào tốc độ cuộn (cuộn nhanh → chạy nhanh, cuộn ngược → đổi chiều).
 * Nội dung nhân đôi, bản sao aria-hidden. Giảm chuyển động: đứng yên.
 */
export function VelocityMarquee({
  children,
  className,
  speed = 0.6,
  reverse = false,
}: {
  children: ReactNode;
  className?: string;
  /** px mỗi frame khi không cuộn */
  speed?: number;
  reverse?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !window.matchMedia(MQ.anyMotion).matches) return;
    // Điện thoại / máy tính bảng: chạy đều một tốc độ, không đổi chiều hay tăng tốc theo cú cuộn
    const reactive = window.matchMedia(MQ.speedFx).matches;
    let x = 0;
    let dir = reverse ? 1 : -1;
    let boost = 0;
    let lastY = window.scrollY;
    const tick = () => {
      const lenis = getLenis();
      const v = reactive ? (lenis ? lenis.velocity : window.scrollY - lastY) : 0;
      lastY = window.scrollY;
      if (Math.abs(v) > 0.5) dir = (v > 0 ? -1 : 1) * (reverse ? -1 : 1);
      boost += (Math.min(18, Math.abs(v) * 0.6) - boost) * 0.1;
      x += dir * (speed + boost);
      const half = track.scrollWidth / 2;
      if (half > 0) {
        if (x <= -half) x += half;
        if (x > 0) x -= half;
      }
      track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [speed, reverse]);

  return (
    <div className={cn("overflow-hidden whitespace-nowrap", className)}>
      <div ref={trackRef} className="flex w-max will-change-transform">
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
