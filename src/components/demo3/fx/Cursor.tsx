"use client";

import { useEffect, useRef, useState } from "react";

import { gsap, MQ } from "@/lib/motion";

/** Những bề mặt có "đèn soi" đi theo con trỏ (vệt Aqua mờ, kiểu dáng ở shell.css) */
const GLOW = ".d2-darkslab, .d2-teaser, .d2-footer-slab, .d2-final > a, .d2-plan-card";

/**
 * Con trỏ có nhãn + đèn soi, chỉ cho máy có chuột và không giảm chuyển động. Một vòng lặp duy nhất (gsap.quickTo trên gsap.ticker).
 * - Phần tử nào muốn có nhãn thì khai báo `data-cursor="view" | "drag" | "open" | "read"` ngay trong JSX.
 *   Rê vào: một viên tròn Teal mang nhãn nở ra và trôi theo con trỏ (con trỏ hệ thống ẩn trong vùng đó). Rời ra: viên thu lại.
 * - Bề mặt trong GLOW nhận hai biến --gx / --gy (toạ độ con trỏ trong bề mặt) và data-glow khi đang rê; CSS vẽ vệt sáng.
 * Điện thoại, bàn phím, giảm chuyển động: không có gì xảy ra; nhãn chỉ là trang trí (link vẫn có chữ riêng cho trình đọc màn hình).
 */
export function D3Cursor({ labels }: { labels: Record<string, string> }) {
  const ref = useRef<HTMLDivElement>(null);
  // `key` giữ nhãn cuối cùng để chữ không biến mất trước khi viên tròn thu lại xong
  const [cursor, setCursor] = useState<{ on: boolean; key: string }>({ on: false, key: "" });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia(`${MQ.fineHover} and ${MQ.anyMotion}`);
    let stop: (() => void) | null = null;

    const start = () => {
      const root = document.documentElement;
      root.dataset.d3Cursor = "on";
      const toX = gsap.quickTo(el, "x", { duration: 0.55, ease: "power3" });
      const toY = gsap.quickTo(el, "y", { duration: 0.55, ease: "power3" });
      let placed = false;
      let key: string | null = null;
      let lit: HTMLElement | null = null;

      const unlight = () => {
        if (lit) delete lit.dataset.glow;
        lit = null;
      };

      const move = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        if (!placed) {
          // Lần đầu: đặt thẳng vào chỗ con trỏ, không trôi từ góc màn hình
          gsap.set(el, { x: event.clientX, y: event.clientY });
          placed = true;
        }
        toX(event.clientX);
        toY(event.clientY);

        const target = event.target instanceof Element ? event.target : null;
        const next = target?.closest<HTMLElement>("[data-cursor]")?.dataset.cursor ?? null;
        if (next !== key) {
          key = next;
          setCursor((prev) => (next ? { on: true, key: next } : { on: false, key: prev.key }));
        }

        const surface = target?.closest<HTMLElement>(GLOW) ?? null;
        if (surface !== lit) {
          unlight();
          if (surface) {
            surface.dataset.glow = "on";
            lit = surface;
          }
        }
        if (lit) {
          const rect = lit.getBoundingClientRect();
          lit.style.setProperty("--gx", `${(event.clientX - rect.left).toFixed(1)}px`);
          lit.style.setProperty("--gy", `${(event.clientY - rect.top).toFixed(1)}px`);
        }
      };

      const leave = () => {
        key = null;
        setCursor((prev) => ({ on: false, key: prev.key }));
        unlight();
      };

      window.addEventListener("pointermove", move, { passive: true });
      document.documentElement.addEventListener("pointerleave", leave);
      // Bấm sang trang khác: nhãn tắt ngay, không treo trên trang mới
      window.addEventListener("pointerdown", leave);

      stop = () => {
        window.removeEventListener("pointermove", move);
        document.documentElement.removeEventListener("pointerleave", leave);
        window.removeEventListener("pointerdown", leave);
        unlight();
        setCursor((prev) => ({ on: false, key: prev.key }));
        delete root.dataset.d3Cursor;
      };
    };

    const sync = () => {
      stop?.();
      stop = null;
      if (mq.matches) start();
    };
    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      stop?.();
    };
  }, []);

  return (
    <div ref={ref} className="d3-cursor" aria-hidden data-on={cursor.on ? "true" : undefined}>
      <span>{labels[cursor.key] ?? ""}</span>
    </div>
  );
}
