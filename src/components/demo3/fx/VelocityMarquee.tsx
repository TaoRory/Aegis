"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cx, getLenis, gsap, MQ } from "@/lib/motion";

/**
 * Dải chữ chạy vô hạn, phản ứng với tốc độ cuộn: cuộn nhanh thì chạy nhanh, cuộn ngược thì đổi chiều (chỉ máy tính có chuột;
 * điện thoại chạy đều một tốc độ). Nội dung nhân đôi, bản sao aria-hidden. Giảm chuyển động / không JS: đứng yên.
 * Dùng một lần mỗi trang, làm nhịp nghỉ giữa hai phần nội dung. Chữ trong dải nên là thứ đã có ở chỗ khác trên trang (trang trí).
 */
export function VelocityMarquee({
  children,
  className,
  speed = 0.6,
  reverse = false,
}: {
  children: ReactNode;
  className?: string;
  /** px mỗi khung hình khi không cuộn */
  speed?: number;
  reverse?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !window.matchMedia(MQ.anyMotion).matches) return;
    const reactive = window.matchMedia(MQ.speedFx).matches;
    let x = 0;
    let dir = reverse ? 1 : -1;
    let boost = 0;
    let lastY = window.scrollY;
    let visible = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(track);
    const tick = () => {
      if (!visible) return;
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
    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
    };
  }, [speed, reverse]);

  return (
    <div className={cx("kit-marquee", className)}>
      <div ref={trackRef} className="kit-marquee-track">
        <div className="kit-marquee-row">{children}</div>
        <div className="kit-marquee-row" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
