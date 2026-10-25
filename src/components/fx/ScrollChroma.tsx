"use client";

import { useEffect } from "react";

import { getLenis, gsap, MQ } from "@/lib/motion";

/**
 * Tách kênh màu (chromatic aberration) cho chữ lớn theo TỐC ĐỘ cuộn (Emotion pattern):
 * cuộn nhanh → chữ "rách" thành viền đỏ/xanh lệch nhau, đứng yên → khớp lại.
 * Áp cho `.chroma`, `.text-h2`, `.text-mega`; đặt <ScrollChroma /> một lần trong layout.
 * Chỉ ghi biến CSS lên chính các phần tử `.chroma` (không ghi lên :root để tránh tính lại style cả trang).
 */
export function ScrollChroma() {
  useEffect(() => {
    if (!window.matchMedia(MQ.anyMotion).matches) return;
    let nodes: HTMLElement[] = [];
    let frame = 0;
    let current = 0;
    let lastY = window.scrollY;
    // Bắt đầu = 0 (khớp với giá trị mặc định trong CSS): không ghi gì khi chưa cuộn → không lệch hydration
    let written = 0;

    const tick = () => {
      if (frame++ % 60 === 0) nodes = [...document.querySelectorAll<HTMLElement>(".chroma, .text-h2, .text-mega")];
      const lenis = getLenis();
      const v = lenis ? lenis.velocity : window.scrollY - lastY;
      lastY = window.scrollY;
      const target = Math.min(14, Math.abs(v) * 0.55) * Math.sign(v || 1);
      current += (target - current) * 0.18;
      const rounded = Math.round(current * 10) / 10;
      if (rounded === written) return;
      written = rounded;
      const alpha = Math.min(0.75, Math.abs(rounded) / 6).toFixed(2);
      for (const el of nodes) {
        el.style.setProperty("--chroma", `${rounded}px`);
        el.style.setProperty("--chroma-a", alpha);
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return null;
}
