"use client";

import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";
import { gsap, MQ, useGSAP } from "@/lib/motion";

/**
 * Khung ảnh lộ dần (clip-path) khi vào khung nhìn, ảnh bên trong trôi parallax theo cuộn.
 * Pattern phổ biến nhất trên các site editorial/fashion/F&B đoạt giải.
 * - reveal: "up" (mở từ dưới lên) | "center" (mở từ giữa ra) | "none"
 * - depth: biên độ parallax (% chiều cao), 0 để tắt
 */
export function ScrollParallax({
  children,
  className,
  innerClassName,
  reveal = "up",
  depth = 12,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
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
          gsap.fromTo(
            el,
            { clipPath: reveal === "up" ? "inset(100% 0% 0% 0%)" : "inset(18% 18% 18% 18%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1.4,
              ease: "expo.out",
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            },
          );
          gsap.fromTo(inner, { scale: 1.25 }, { scale: 1, duration: 1.8, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
        }
        if (depth > 0) {
          gsap.fromTo(
            inner,
            { yPercent: -depth / 2 },
            { yPercent: depth / 2, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
          );
        }
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <div className={cn("relative h-[115%] -translate-y-[6.5%] will-change-transform", depth === 0 && "h-full translate-y-0", innerClassName)}>{children}</div>
    </div>
  );
}
