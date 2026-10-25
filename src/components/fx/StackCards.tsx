"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";

import { cn } from "@/lib/cn";
import { gsap, MQ, useGSAP } from "@/lib/motion";

/**
 * Thẻ xếp chồng khi cuộn: mỗi thẻ dính (sticky) lệch nhau một bậc; thẻ phía dưới thu nhỏ và tối dần khi thẻ kế trồi lên.
 * Không pin bằng JS nên mượt cả trên mobile. Giảm chuyển động: chỉ còn sticky.
 * Truyền mỗi thẻ như một phần tử của mảng items.
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
  top?: string;
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
          gsap.fromTo(card, { scale: 1, filter: "brightness(1)" }, {
            scale: 0.92,
            filter: "brightness(0.85)",
            ease: "none",
            scrollTrigger: { trigger: next, start: "top bottom", end: `top ${top}`, scrub: true },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("relative", className)} style={{ "--stack-top": top, "--stack-step": step } as CSSProperties}>
      {items.map((item, i) => (
        <div key={i} data-stack-card className={cn("stack-card", cardClassName)} style={{ "--i": i } as CSSProperties}>
          {item}
        </div>
      ))}
    </div>
  );
}
