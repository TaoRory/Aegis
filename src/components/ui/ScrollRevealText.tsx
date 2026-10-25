"use client";

import { useEffect, useRef, type CSSProperties } from "react";

import { cn } from "@/lib/cn";

/**
 * Đoạn văn sáng dần theo từng chữ khi cuộn.
 * Trước khi JavaScript chạy, hoặc khi người dùng giảm chuyển động, chữ hiển thị đầy đủ.
 */
export function ScrollRevealText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  // Hỗ trợ cú pháp *nghiêng*: mỗi từ mang cờ italic
  const words = text
    .split("*")
    .flatMap((part, i) => part.split(" ").filter(Boolean).map((word) => ({ word, italic: i % 2 === 1 })));

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(prefers-reduced-motion: no-preference)").matches) return;

    let frame = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 khi đoạn văn vừa chạm 85% màn hình, 1 khi phần cuối lên tới 40% màn hình
      const progress = (vh * 0.85 - rect.top) / (rect.height + vh * 0.45);
      el.style.setProperty("--progress", Math.min(1, Math.max(0, progress)).toFixed(3));
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    el.dataset.reveal = "on";
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <p ref={ref} className={cn("scroll-reveal-text", className)} style={{ "--count": words.length } as CSSProperties}>
      {words.map(({ word, italic }, index) => (
        <span key={`${word}-${index}`} style={{ "--at": index / words.length } as CSSProperties}>
          {italic ? <em>{word}</em> : word}{" "}
        </span>
      ))}
    </p>
  );
}
