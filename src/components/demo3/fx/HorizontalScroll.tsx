"use client";

import { useRef, type ReactNode } from "react";

import { cx, EASE, gsap, MQ, useGSAP } from "@/lib/motion";

/**
 * Dải ngang chạy theo cuộn dọc: phần này ghim lại, hàng thẻ trượt sang trái cho tới hết rồi trang cuộn tiếp.
 * - Chỉ bật trên máy tính (MQ.desktopMotion). Điện thoại / giảm chuyển động / không JS: thành hàng cuộn ngang gốc có điểm bắt.
 * - Quãng chạy = track.scrollWidth − wrap.clientWidth, tính lại mỗi lần refresh (invalidateOnRefresh) nên đổi kích thước không vỡ.
 * - Dùng tối đa một lần mỗi trang và giữ ngắn (3–6 thẻ): ghim dài làm người dùng thấy bị "cướp" thanh cuộn.
 *
 * Muốn animate phần tử BÊN TRONG dải theo vị trí ngang, truyền `containerAnimation` (xem vendor/gsap-skills/gsap-scrolltrigger).
 */
export function HorizontalScroll({ children, className, label }: { children: ReactNode; className?: string; label?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const wrap = wrapRef.current;
      const track = trackRef.current;
      if (!wrap || !track) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.desktopMotion, () => {
        const distance = () => Math.max(0, track.scrollWidth - wrap.clientWidth);
        if (distance() === 0) return;
        wrap.dataset.live = "true";
        gsap.to(track, {
          x: () => -distance(),
          ease: EASE.scrub,
          scrollTrigger: {
            trigger: wrap,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
        return () => {
          delete wrap.dataset.live;
        };
      });
      return () => mm.revert();
    },
    { scope: wrapRef },
  );

  return (
    <div ref={wrapRef} className={cx("kit-hscroll", className)} role="group" aria-label={label} tabIndex={0}>
      <div ref={trackRef} className="kit-hscroll-track">
        {children}
      </div>
    </div>
  );
}
