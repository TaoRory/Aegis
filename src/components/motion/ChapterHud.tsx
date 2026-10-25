"use client";

import { useEffect, useRef } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Chỉ báo chương cố định góc dưới trái (desktop): [02 / 06] DỊCH VỤ · ↓ 045%.
 * Section đăng ký bằng thuộc tính data-chapter="Tên chương".
 * Cập nhật DOM trực tiếp qua ref (không re-render React khi cuộn).
 */
export function ChapterHud() {
  const rootRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>("[data-chapter]")];
    if (sections.length === 0 || !rootRef.current) return;
    rootRef.current.dataset.ready = "on";

    const show = (i: number) => {
      if (indexRef.current) indexRef.current.textContent = `[${pad(i + 1)} / ${pad(sections.length)}]`;
      if (nameRef.current) nameRef.current.textContent = sections[i].dataset.chapter ?? "";
    };
    show(0);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) show(sections.indexOf(entry.target as HTMLElement));
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    sections.forEach((s) => observer.observe(s));

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? Math.round((window.scrollY / max) * 100) : 0;
        if (percentRef.current) percentRef.current.textContent = String(pct).padStart(3, "0");
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="chapter-hud label pointer-events-none fixed bottom-6 z-40 hidden gap-4 text-blend data-[ready=on]:lg:flex"
    >
      <span ref={indexRef} />
      <span ref={nameRef} className="min-w-[12ch]" />
      <span>
        ↓ <span ref={percentRef}>000</span>%
      </span>
    </div>
  );
}
