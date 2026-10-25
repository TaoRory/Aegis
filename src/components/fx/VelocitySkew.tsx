"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

import { cn } from "@/lib/cn";
import { getLenis, gsap, MQ } from "@/lib/motion";

/**
 * Nghiêng/giãn nội dung theo TỐC ĐỘ cuộn (cảm giác "có quán tính" của các site Awwwards).
 * Đứng yên thì thẳng lại mượt. Dùng cho dòng chữ lớn, lưới ảnh, danh sách dự án.
 */
export function VelocitySkew({
  as: Tag = "div",
  children,
  className,
  strength = 1,
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** 1 = mặc định (tối đa ~6°) */
  strength?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia(MQ.anyMotion).matches) return;
    let current = 0;
    let lastY = window.scrollY;
    const tick = () => {
      const lenis = getLenis();
      const velocity = lenis ? lenis.velocity : window.scrollY - lastY;
      lastY = window.scrollY;
      const target = Math.max(-6, Math.min(6, velocity * 0.18 * strength));
      current += (target - current) * 0.12;
      if (Math.abs(current) < 0.01) current = 0;
      el.style.transform = current ? `skewY(${current.toFixed(2)}deg)` : "";
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [strength]);

  return (
    <Tag ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </Tag>
  );
}
