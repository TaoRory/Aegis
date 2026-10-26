"use client";

import { useEffect, useId, useRef, useState } from "react";

import { gsap, MQ } from "@/lib/motion";

/**
 * Thí nghiệm 03: chữ tách màu theo tốc độ con trỏ. Ba lớp chữ chồng nhau (gốc + hai lớp màu dịch ngược chiều);
 * dịch chuyển lấy từ vận tốc ngang của con trỏ rồi tắt dần. Chỉ CSS + JavaScript.
 */
export default function ChromaType() {
  const [text, setText] = useState("Aegis");
  const stageRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || window.matchMedia(MQ.reduced).matches) return;
    let target = 0;
    let current = 0;
    let lastX = 0;
    let lastT = 0;
    const onMove = (event: PointerEvent) => {
      const now = performance.now();
      const dx = event.clientX - lastX;
      const dt = Math.max(8, now - lastT);
      lastX = event.clientX;
      lastT = now;
      // px/ms → độ lệch (px), có chặn trên
      target = Math.max(-46, Math.min(46, (dx / dt) * 38));
    };
    const tick = () => {
      target *= 0.9;
      current += (target - current) * 0.2;
      stage.style.setProperty("--split", `${current.toFixed(2)}px`);
    };
    stage.addEventListener("pointermove", onMove);
    gsap.ticker.add(tick);
    return () => {
      stage.removeEventListener("pointermove", onMove);
      gsap.ticker.remove(tick);
    };
  }, []);

  const shown = text.trim() || "Aegis";
  return (
    <div className="space-lab-fill">
      <div ref={stageRef} className="space-chroma-stage" role="img" aria-label={`Chữ “${shown}” tách thành ba lớp màu khi rê chuột nhanh`}>
        <span aria-hidden className="space-chroma-layer" style={{ color: "var(--palette-danger-light)", transform: "translateX(calc(var(--split, 0px) * -1))", mixBlendMode: "screen" }}>
          {shown}
        </span>
        <span aria-hidden className="space-chroma-layer" style={{ color: "var(--palette-ultramarine-light)", transform: "translateX(var(--split, 0px))", mixBlendMode: "screen" }}>
          {shown}
        </span>
        <span aria-hidden className="space-chroma-layer" style={{ color: "var(--palette-paper)" }}>
          {shown}
        </span>
      </div>
      <div className="space-lab-controls">
        <label htmlFor={inputId} className="label text-muted">
          Chữ
        </label>
        <input
          id={inputId}
          value={text}
          maxLength={14}
          onChange={(event) => setText(event.target.value)}
          className="w-48 border-b border-line-strong bg-transparent py-1 text-lg outline-none focus:border-accent"
        />
      </div>
    </div>
  );
}
