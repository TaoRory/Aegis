"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/cn";
import { MQ } from "@/lib/motion";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#*+-";

/**
 * Chữ xáo trộn ký tự rồi hiện lại khi rê chuột vào hàng/link chứa nó (Signal-A Studio pattern).
 * Văn bản thật luôn có trong DOM cho trình đọc màn hình (bản sr-only); hiệu ứng chỉ trên lớp hiển thị (aria-hidden).
 * Gắn vào chữ ngắn (nhãn, tên dự án), tránh đoạn văn.
 */
export function TextScramble({ text, className, trigger = "parent" }: { text: string; className?: string; trigger?: "parent" | "self" }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    // "parent": rê vào cả hàng/link chứa chữ (gần nhất là a, button hoặc [data-scramble-host])
    const host = trigger === "parent" ? (el?.closest<HTMLElement>("a, button, [data-scramble-host]") ?? el?.parentElement?.parentElement) : el;
    if (!el || !host || !window.matchMedia(`${MQ.fineHover} and ${MQ.anyMotion}`).matches) return;
    let frame = 0;
    const run = () => {
      cancelAnimationFrame(frame);
      const start = performance.now();
      const duration = 420 + text.length * 18;
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const revealed = Math.floor(t * text.length);
        el.textContent = text
          .split("")
          .map((ch, i) => (i < revealed || ch === " " ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join("");
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };
    host.addEventListener("pointerenter", run);
    return () => {
      cancelAnimationFrame(frame);
      host.removeEventListener("pointerenter", run);
      el.textContent = text;
    };
  }, [text, trigger]);

  return (
    <span className={cn("inline-block", className)}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden>
        {text}
      </span>
    </span>
  );
}
