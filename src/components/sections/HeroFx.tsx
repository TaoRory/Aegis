"use client";

import { useEffect, useRef } from "react";

import { gsap, MQ, onIntroDone } from "@/lib/motion";
import { onPointerMove } from "@/lib/pointer";

const FILTER_ID = "hero-warp";

/**
 * Lớp hiệu ứng của hero (trang trí, aria-hidden):
 * 1. Tiêu đề xuất hiện với gợn sóng rồi "khớp" lại (Emotion hero); rê chuột vào tiêu đề làm gợn nhẹ lại (chỉ máy tính).
 * 2. Thước ngắm bản vẽ: hai đường kẻ chạy theo con trỏ + tọa độ mm (chỉ thiết bị có chuột).
 * (Luồng năng lượng theo chuột/ngón tay nằm trong sân khấu hạt: ParticleStage + flow-field.)
 * Giảm chuyển động / cảm ứng: chỉ còn tiêu đề tĩnh.
 */
export function HeroFx() {
  const rootRef = useRef<HTMLDivElement>(null);
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);
  const vRef = useRef<HTMLDivElement>(null);
  const hRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  // 1. Gợn sóng khi intro xong
  useEffect(() => {
    const title = document.getElementById("hero-title");
    const disp = dispRef.current;
    // Gợn sóng chỉ dành cho máy tính; điện thoại để tiêu đề hiện gọn gàng
    if (!title || !disp || !window.matchMedia(MQ.speedFx).matches) return;

    const warp = (strength: number, duration: number) => {
      const state = { s: strength };
      title.style.filter = `url(#${FILTER_ID})`;
      return gsap.to(state, {
        s: 0,
        duration,
        ease: "expo.out",
        overwrite: true,
        onUpdate: () => {
          disp.setAttribute("scale", state.s.toFixed(2));
        },
        onComplete: () => {
          title.style.filter = "";
        },
      });
    };

    const cleanupIntro = onIntroDone(() => warp(90, 2.2));
    const fine = window.matchMedia(MQ.fineHover).matches;
    const onEnter = () => warp(28, 1.2);
    if (fine) title.addEventListener("pointerenter", onEnter);
    return () => {
      cleanupIntro();
      title.removeEventListener("pointerenter", onEnter);
      title.style.filter = "";
    };
  }, []);

  // 2. Thước ngắm bản vẽ
  useEffect(() => {
    const root = rootRef.current;
    const section = root?.parentElement;
    const v = vRef.current;
    const h = hRef.current;
    const label = labelRef.current;
    if (!root || !section || !v || !h || !label || !window.matchMedia(`${MQ.fineHover} and ${MQ.anyMotion}`).matches) return;
    const xTo = gsap.quickTo(v, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(h, "y", { duration: 0.35, ease: "power3" });
    const lx = gsap.quickTo(label, "x", { duration: 0.45, ease: "power3" });
    const ly = gsap.quickTo(label, "y", { duration: 0.45, ease: "power3" });

    const stopPointer = onPointerMove((e) => {
      if (!e) {
        delete root.dataset.active;
        return;
      }
      const r = section.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > r.width || y > r.height) {
        delete root.dataset.active;
        return;
      }
      xTo(x);
      yTo(y);
      lx(x + 14);
      ly(y + 14);
      // Quy đổi sang "mm" trên bản vẽ khổ A1 (841 × 594) cho vui mắt — chỉ là trang trí
      label.textContent = `X ${String(Math.round((x / r.width) * 841)).padStart(3, "0")} · Y ${String(Math.round((y / r.height) * 594)).padStart(3, "0")} mm`;
      root.dataset.active = "true";
    });
    return stopPointer;
  }, []);

  return (
    <div ref={rootRef} aria-hidden className="hero-fx pointer-events-none absolute inset-0 z-0">
      <svg className="absolute size-0" focusable="false">
        <filter id={FILTER_ID} x="-10%" y="-20%" width="120%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.004 0.06" numOctaves="1" seed="3" result="noise" />
          <feDisplacementMap ref={dispRef} in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div ref={vRef} className="hero-crosshair-v absolute top-0 left-0 h-full w-px" />
      <div ref={hRef} className="hero-crosshair-h absolute top-0 left-0 h-px w-full" />
      <span ref={labelRef} className="hero-crosshair-label label absolute top-0 left-0 whitespace-nowrap" />
    </div>
  );
}
