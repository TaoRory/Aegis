"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";
import { gsap, MQ } from "@/lib/motion";

/**
 * Danh sách mà khi rê vào từng hàng, một khung ảnh bám theo con trỏ (trễ nhẹ) và đổi ảnh theo hàng (Signal-A pattern).
 * Mỗi hàng gắn data-preview="/anh.webp". Ảnh trong khung là trang trí (alt rỗng), nội dung thật nằm ở hàng.
 * Chỉ chạy với chuột + không giảm chuyển động; nơi dùng nên tự hiện ảnh nhỏ trong hàng cho mobile.
 */
export function CursorPreview({
  children,
  className,
  size = "clamp(14rem, 22vw, 22rem)",
  ratio = "4 / 5",
}: {
  children: ReactNode;
  className?: string;
  size?: string;
  ratio?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const frame = frameRef.current;
    if (!host || !frame || !window.matchMedia(`${MQ.fineHover} and ${MQ.anyMotion}`).matches) return;
    const xTo = gsap.quickTo(frame, "x", { duration: 0.6, ease: "power3" });
    const yTo = gsap.quickTo(frame, "y", { duration: 0.6, ease: "power3" });
    const rTo = gsap.quickTo(frame, "rotation", { duration: 0.8, ease: "power3" });
    let current = "";
    let lastX = 0;

    const show = (src: string) => {
      if (src === current) return;
      current = src;
      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.decoding = "async";
      frame.appendChild(img);
      gsap.fromTo(img, { clipPath: "inset(100% 0 0 0)", scale: 1.25 }, { clipPath: "inset(0% 0 0 0)", scale: 1, duration: 0.55, ease: "expo.out" });
      // Giữ tối đa 2 ảnh trong khung
      while (frame.children.length > 2) frame.firstElementChild?.remove();
    };

    const onMove = (e: PointerEvent) => {
      const w = frame.offsetWidth;
      const h = frame.offsetHeight;
      xTo(e.clientX - w / 2);
      yTo(e.clientY - h / 2);
      rTo(Math.max(-10, Math.min(10, (e.clientX - lastX) * 0.4)));
      lastX = e.clientX;
      const row = (e.target as Element | null)?.closest<HTMLElement>("[data-preview]");
      if (row?.dataset.preview) {
        show(row.dataset.preview);
        gsap.to(frame, { opacity: 1, scale: 1, duration: 0.5, ease: "expo.out", overwrite: "auto" });
      } else {
        gsap.to(frame, { opacity: 0, scale: 0.6, duration: 0.4, ease: "power2.out", overwrite: "auto" });
      }
    };
    const onLeave = () => {
      current = "";
      gsap.to(frame, { opacity: 0, scale: 0.6, duration: 0.4, ease: "power2.out", overwrite: "auto" });
    };
    const onEnter = (e: PointerEvent) => {
      lastX = e.clientX;
      gsap.set(frame, { x: e.clientX - frame.offsetWidth / 2, y: e.clientY - frame.offsetHeight / 2 });
    };
    host.addEventListener("pointerenter", onEnter);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={hostRef} className={cn("relative", className)}>
      {children}
      <div ref={frameRef} aria-hidden className="cursor-preview" style={{ width: size, aspectRatio: ratio }} />
    </div>
  );
}
