"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";

import { cx, EASE, gsap, MQ, useGSAP } from "@/lib/motion";

/**
 * Thẻ xếp chồng khi cuộn: mỗi thẻ dính (sticky) lệch nhau một bậc; thẻ phía dưới thu nhỏ và tối dần khi thẻ kế trồi lên.
 * Không pin bằng JS nên mượt cả trên điện thoại. Giảm chuyển động / không JS: chỉ còn sticky, nội dung đủ.
 * Hợp cho 3–5 mục ngang hàng (gói dịch vụ, bước quy trình, lý do chọn).
 */
export function StackCards({
  items,
  className,
  cardClassName,
  top = "12vh",
  step = "1.25rem",
}: {
  items: ReactNode[];
  className?: string;
  cardClassName?: string;
  /** Khoảng cách từ đỉnh màn hình tới thẻ đầu tiên khi dính */
  top?: string;
  /** Mỗi thẻ sau lệch xuống thêm bao nhiêu */
  step?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.anyMotion, () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-stack-card]", ref.current);
        cards.forEach((card, i) => {
          const next = cards[i + 1];
          if (!next) return;
          // fromTo: tween filter từ "none" làm GSAP nội suy sai (độ sáng về 0)
          gsap.fromTo(
            card,
            { scale: 1, filter: "brightness(1)" },
            {
              scale: 0.92,
              filter: "brightness(0.85)",
              ease: EASE.scrub,
              scrollTrigger: { trigger: next, start: "top bottom", end: `top ${top}`, scrub: true },
            },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cx("kit-stack", className)} style={{ "--stack-top": top, "--stack-step": step } as CSSProperties}>
      {items.map((item, i) => (
        <div key={i} data-stack-card className={cx("kit-stack-card", cardClassName)} style={{ "--i": i } as CSSProperties}>
          {item}
        </div>
      ))}
    </div>
  );
}
