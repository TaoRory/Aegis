"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cx, gsap, MQ } from "@/lib/motion";

/**
 * Bọc một phần tử để nó "hút" theo con trỏ trong phạm vi của nó (chỉ thiết bị có chuột, không giảm chuyển động).
 * gsap.quickTo: cập nhật theo con trỏ mà không tạo tween mới mỗi lần di chuột.
 * Chỉ dùng cho 1–2 nút quan trọng nhất (nút lời mời chính, nút menu), không gắn cho mọi nút.
 * Thẻ bọc là <span> (inline-block) nên đặt được trong đoạn văn; phần tử con nên là nội dung dòng (a, button).
 */
export function Magnetic({ children, strength = 0.35, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia(`${MQ.fineHover} and ${MQ.anyMotion}`).matches) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "elastic.out(1, 0.35)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "elastic.out(1, 0.35)" });
    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      xTo((event.clientX - rect.left - rect.width / 2) * strength);
      yTo((event.clientY - rect.top - rect.height / 2) * strength);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "transform" });
    };
  }, [strength]);

  return (
    <span ref={ref} className={cx("kit-magnetic", className)}>
      {children}
    </span>
  );
}
