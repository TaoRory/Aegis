"use client";

import { useRef, type ReactNode } from "react";

import { assembleMark } from "@/components/brand/mark-motion";
import { DUR, EASE, gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/motion";

/**
 * Chữ ký ở chân trang (mọi trang): khi chân trang vào màn hình, logo Möbius tự lắp ráp MỘT lần cạnh câu tagline
 * (assembleMark: motion identity của thương hiệu), rồi năm chữ AEGIS lần lượt trồi lên từ dưới mép khung.
 *
 * Trạng thái chờ do GSAP đặt lúc gắn (không viết trong CSS): không JS hoặc giảm chuyển động thì logo và chữ đứng yên, đủ, ngay từ đầu.
 * Hai mốc kích hoạt riêng vì logo ở đầu chân trang còn chữ lớn ở cuối: gộp một mốc thì chữ chạy xong trước khi người xem cuộn tới.
 * Nội dung bên trong (liên kết, tiêu đề cột) là Server Component truyền qua `children`.
 */
export function FooterStage({ className, children }: { className?: string; children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.anyMotion, () => {
        const mark = root.querySelector<SVGSVGElement>("svg.d3-foot-mark");
        const word = root.querySelector<SVGSVGElement>("[data-foot-word]");
        const triggers: ScrollTrigger[] = [];

        if (mark) {
          // assembleMark đặt sẵn trạng thái đầu (các mảnh ẩn, xoay lệch) rồi trả về timeline: giữ lại ở giây 0 cho tới khi chân trang hiện
          const assemble = assembleMark(mark, { duration: DUR.scene }).pause(0);
          triggers.push(ScrollTrigger.create({ trigger: mark, start: "top 92%", once: true, onEnter: () => assemble.play() }));
        }

        if (word) {
          const letters = word.querySelectorAll("[data-foot-letter]");
          // 104 đơn vị của khung nhìn (chữ cao 100): chữ nằm hẳn dưới mép khung, svg tự cắt phần tràn
          gsap.set(letters, { y: 104 });
          const rise = gsap.to(letters, { y: 0, duration: DUR.reveal * 1.1, ease: EASE.out, stagger: 0.08, paused: true });
          triggers.push(ScrollTrigger.create({ trigger: word, start: "top 96%", once: true, onEnter: () => rise.play() }));
        }

        return () => triggers.forEach((trigger) => trigger.kill());
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className={className} data-d2-tone="dark">
      {children}
    </div>
  );
}
