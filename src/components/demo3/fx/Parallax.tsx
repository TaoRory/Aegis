"use client";

import { useRef, type ReactNode } from "react";

import { cx, EASE, gsap, MQ, useGSAP } from "@/lib/motion";

/**
 * Khung ảnh lộ dần (clip-path) khi vào khung nhìn, ảnh bên trong trôi chậm hơn trang (parallax).
 * - reveal: "up" (mở từ dưới lên) | "center" (mở từ giữa ra) | "none"
 * - depth: biên độ parallax theo % chiều cao ảnh, tối đa 12; 0 để tắt
 * Chỉ dùng cho ẢNH / video (trang trí). Khung PHẢI có chiều cao xác định: truyền className có aspect-ratio hoặc height
 * (ảnh bên trong được đặt absolute để có chỗ trôi).
 * Giảm chuyển động / không JS: ảnh hiện đủ, đứng yên.
 */
export function Parallax({
  children,
  className,
  reveal = "up",
  depth = 12,
}: {
  children: ReactNode;
  className?: string;
  reveal?: "up" | "center" | "none";
  depth?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      const inner = el?.firstElementChild as HTMLElement | null;
      if (!el || !inner) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.anyMotion, () => {
        if (reveal !== "none") {
          const once = { trigger: el, start: "top 88%", once: true };
          gsap.fromTo(
            el,
            { clipPath: reveal === "up" ? "inset(100% 0% 0% 0%)" : "inset(18% 18% 18% 18%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: EASE.out, scrollTrigger: once },
          );
          gsap.fromTo(inner, { scale: 1.25 }, { scale: 1, duration: 1.8, ease: EASE.out, scrollTrigger: once });
        }
        if (depth > 0) {
          const shift = Math.min(12, depth) / 2;
          gsap.fromTo(
            inner,
            { yPercent: -shift },
            { yPercent: shift, ease: EASE.scrub, scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
          );
        }
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cx("kit-parallax", className)}>
      <div className="kit-parallax-inner" data-depth={depth > 0 ? "on" : undefined}>
        {children}
      </div>
    </div>
  );
}
