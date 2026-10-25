"use client";

import { useRef, type ElementType } from "react";

import { cn } from "@/lib/cn";
import { gsap, MQ, SplitText, useGSAP } from "@/lib/motion";

/**
 * Tiêu đề mà từng ký tự lệch cao thấp rồi "khớp hàng" dần theo cuộn (quan sát từ Flashform/Emotion).
 * Split theo ký tự trong từng từ (giữ tổ hợp dấu tiếng Việt), scrub theo vị trí cuộn.
 */
export function CharWave({
  as: Tag = "h2",
  id,
  text,
  className,
  amplitude = 0.9,
}: {
  as?: ElementType;
  id?: string;
  text: string;
  className?: string;
  /** Độ lệch tối đa (em) */
  amplitude?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.anyMotion, () => {
        const split = SplitText.create(el, { type: "words,chars", aria: "auto" });
        const offsets = split.chars.map((_, i) => Math.sin(i * 1.7) * amplitude + (i % 3 === 0 ? amplitude * 0.5 : 0));
        gsap.fromTo(
          split.chars,
          { y: (i) => `${offsets[i]}em`, opacity: (i) => (i % 4 === 0 ? 0.35 : 1) },
          {
            y: 0,
            opacity: 1,
            ease: "none",
            stagger: { each: 0.01, from: "random" },
            scrollTrigger: { trigger: el, start: "top 95%", end: "top 45%", scrub: 1 },
          },
        );
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} className={cn("char-wave", className)}>
      {text}
    </Tag>
  );
}
