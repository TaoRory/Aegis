"use client";

import { useRef, type ElementType, type ReactNode } from "react";

import { cn } from "@/lib/cn";
import { EASE, gsap, MQ, onIntroDone, SplitText, useGSAP } from "@/lib/motion";

interface SplitRevealProps {
  as?: ElementType;
  id?: string;
  className?: string;
  children: ReactNode;
  /** "scroll": chạy khi vào khung nhìn; "intro": chạy khi preloader kết thúc (dùng cho hero) */
  trigger?: "scroll" | "intro";
  delay?: number;
}

/**
 * Tiêu đề hiện theo từng dòng, trượt lên từ trong mask.
 * Mask được nới padding (effects.css: .split-line-mask) để không cắt dấu tiếng Việt.
 * Không có JS / giảm chuyển động: chữ hiển thị bình thường.
 */
export function SplitReveal({ as: Tag = "div", id, className, children, trigger = "scroll", delay = 0 }: SplitRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.anyMotion, () => {
        let cleanupIntro = () => {};
        const split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          onSplit(self) {
            el.dataset.split = "ready";
            const vars: gsap.TweenVars = {
              yPercent: 112,
              rotate: 2,
              duration: 1.25,
              ease: EASE.out,
              stagger: 0.09,
              delay,
            };
            if (trigger === "intro") {
              const tween = gsap.from(self.lines, { ...vars, paused: true });
              cleanupIntro();
              cleanupIntro = onIntroDone(() => tween.play());
              return tween;
            }
            return gsap.from(self.lines, { ...vars, scrollTrigger: { trigger: el, start: "top 88%", once: true } });
          },
        });
        return () => {
          cleanupIntro();
          split.revert();
          delete el.dataset.split;
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} data-split="" className={cn("split-reveal", className)}>
      {children}
    </Tag>
  );
}
