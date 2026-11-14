"use client";

import { useRef, useState } from "react";

import { getLenis, gsap, MQ, useGSAP } from "@/lib/motion";

import { MotionToggle } from "./HomeMotionToggle";

/** px mỗi giây khi trang đứng yên */
const BASE_SPEED = 42;

/**
 * Dải chữ chạy của trang chủ: dải tối hơi nghiêng, chữ cỡ lớn (tên bốn lớp dịch vụ + ba gói: trang trí, nội dung đã có ở các phần khác).
 * Đây là công thức fx/VelocityMarquee (cùng class .kit-marquee*, cùng cách tính) viết lại tại chỗ vì cần thêm hai thứ công thức gốc chưa có:
 * nút tạm dừng (dải tự chạy quá 5 giây thì phải dừng được) và tốc độ tính theo giây thay vì theo khung hình (màn 120Hz không chạy nhanh gấp đôi).
 * - Máy tính có chuột: cuộn nhanh thì dải chạy nhanh, cuộn ngược thì đổi chiều.
 * - Điện thoại / máy tính bảng: chạy đều một tốc độ.
 * - Giảm chuyển động / không JS: đứng yên, không có nút.
 * - Khuất màn hình hoặc đang tạm dừng: không ghi transform nào.
 */
export function HomeMarquee({ words, labels }: { words: string[]; labels: { pause: string; play: string } }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;
      const mm = gsap.matchMedia();
      mm.add({ motion: MQ.anyMotion, reactive: MQ.speedFx }, (context) => {
        const reactive = !!context.conditions?.reactive;
        let x = 0;
        let dir = -1;
        let boost = 0;
        let lastY = window.scrollY;
        let visible = true;
        const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
        io.observe(track);
        const tick = (_time: number, deltaTime: number) => {
          if (!visible || pausedRef.current) return;
          // Quy về "khung hình 60Hz" để giữ đúng cảm giác của công thức gốc ở mọi tần số quét
          const frames = Math.min(3, deltaTime / (1000 / 60));
          const lenis = getLenis();
          const v = reactive ? (lenis ? lenis.velocity : window.scrollY - lastY) : 0;
          lastY = window.scrollY;
          if (Math.abs(v) > 0.5) dir = v > 0 ? -1 : 1;
          boost += (Math.min(18, Math.abs(v) * 0.6) - boost) * 0.1;
          x += dir * (BASE_SPEED / 60 + boost) * frames;
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
          track.style.transform = "";
        };
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  const row = words.map((word, i) => (
    <span key={word} data-tone={i % 3 === 1 ? "aqua" : i % 3 === 2 ? "line" : undefined}>
      {word}
    </span>
  ));

  return (
    <div ref={rootRef} className="d3-marquee">
      <div className="kit-marquee d3-marquee-band" aria-hidden>
        <div ref={trackRef} className="kit-marquee-track">
          <div className="kit-marquee-row">{row}</div>
          <div className="kit-marquee-row">{row}</div>
        </div>
      </div>
      <MotionToggle
        className="d3-marquee-toggle"
        paused={paused}
        labels={labels}
        onToggle={() => {
          pausedRef.current = !pausedRef.current;
          setPaused(pausedRef.current);
        }}
      />
    </div>
  );
}
