"use client";

import { useEffect, useRef, useState } from "react";

import { gsap, MQ } from "@/lib/motion";

/**
 * Con trỏ phụ (chấm + vòng có nhãn), chỉ trên thiết bị có chuột và khi không giảm chuyển động.
 * Con trỏ gốc vẫn giữ nguyên; riêng vùng có data-cursor="view" ẩn con trỏ gốc để hiện bong bóng nhãn.
 *   data-cursor="view" | "drag" + data-cursor-label="Xem ↗" → bong bóng lớn có nhãn
 *   a, button, [data-cursor="link"]               → vòng phóng to nhẹ
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const media = window.matchMedia(`${MQ.fineHover} and ${MQ.anyMotion}`);
    const update = () => setEnabled(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled || !dotRef.current || !ringRef.current) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3" });

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      dotX(event.clientX);
      dotY(event.clientY);
      ringX(event.clientX);
      ringY(event.clientY);
      document.documentElement.dataset.cursor ||= "idle";
    };

    const onOver = (event: PointerEvent) => {
      const target = event.target as Element | null;
      const view = target?.closest<HTMLElement>("[data-cursor='view'], [data-cursor='drag']");
      const link = target?.closest("a, button, [role='button'], label, [data-cursor='link']");
      const state = view ? "view" : link ? "link" : "idle";
      document.documentElement.dataset.cursor = state;
      if (labelRef.current) labelRef.current.textContent = view?.dataset.cursorLabel ?? "";
    };

    const onLeaveWindow = () => delete document.documentElement.dataset.cursor;

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeaveWindow);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeaveWindow);
      delete document.documentElement.dataset.cursor;
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="cursor-layer pointer-events-none fixed inset-0 z-[80]">
      <div ref={ringRef} className="cursor-ring">
        <span ref={labelRef} className="cursor-label label" />
      </div>
      <div ref={dotRef} className="cursor-dot" />
    </div>
  );
}
