"use client";

import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";
import { gsap, MQ, useGSAP } from "@/lib/motion";

/**
 * Section "trồi lên như tấm sheet" đè lên section trước: thu nhỏ + bo góc khi bắt đầu,
 * nở ra full khung khi vào giữa màn hình (Flashform, nhiều site agency).
 * overflow: clip (không phải hidden) để position: sticky bên trong vẫn hoạt động.
 * Đặt trong khối có nền tương phản (vd. data-surface="dark" + .ink) để thấy góc bo khi sheet còn nhỏ.
 * KHÔNG bọc section có ScrollTrigger pin (transform ở tổ tiên làm hỏng pin).
 */
export function SheetRise({
  children,
  className,
  radius = "2rem",
}: {
  children: ReactNode;
  className?: string;
  radius?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.anyMotion, () => {
        gsap.fromTo(
          el,
          { scale: 0.9, borderRadius: radius, y: 80 },
          {
            scale: 1,
            borderRadius: "0rem",
            y: 0,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "top 20%", scrub: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("relative z-10 origin-top overflow-clip will-change-transform", className)}>
      {children}
    </div>
  );
}
