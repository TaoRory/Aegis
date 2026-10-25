"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import type Lenis from "lenis";

/** Đăng ký plugin GSAP một lần cho toàn dự án. Luôn import gsap từ file này. */
gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

export { gsap, ScrollTrigger, SplitText, useGSAP };

export const MQ = {
  /** Pin/scrub dài: chỉ desktop đủ cao và không giảm chuyển động */
  desktopMotion: "(min-width: 64rem) and (min-height: 40rem) and (prefers-reduced-motion: no-preference)",
  mobileMotion: "not ((min-width: 64rem) and (min-height: 40rem)) and (prefers-reduced-motion: no-preference)",
  anyMotion: "(prefers-reduced-motion: no-preference)",
  reduced: "(prefers-reduced-motion: reduce)",
  fineHover: "(hover: hover) and (pointer: fine)",
} as const;

export const EASE = {
  out: "expo.out",
  inOut: "power4.inOut",
} as const;

/** Sự kiện phát khi preloader kết thúc (hoặc ngay lập tức nếu không có preloader) */
export const INTRO_DONE_EVENT = "aegis:intro-done";

let lenisInstance: Lenis | null = null;

export function setLenis(lenis: Lenis | null) {
  lenisInstance = lenis;
}

export function getLenis() {
  return lenisInstance;
}

/** Cuộn tới phần tử/vị trí: dùng Lenis nếu có, nếu không thì cuộn gốc */
export function scrollToTarget(target: HTMLElement | number, options: { immediate?: boolean } = {}) {
  const reduced = window.matchMedia(MQ.reduced).matches;
  if (lenisInstance) {
    lenisInstance.scrollTo(target, { immediate: options.immediate || reduced, force: true });
    return;
  }
  const top = typeof target === "number" ? target : target.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top, behavior: options.immediate || reduced ? "auto" : "smooth" });
}

export function introIsDone() {
  return document.documentElement.dataset.intro !== "playing";
}

/** Chạy callback khi intro xong (ngay lập tức nếu không có intro) */
export function onIntroDone(callback: () => void) {
  if (introIsDone()) {
    callback();
    return () => {};
  }
  window.addEventListener(INTRO_DONE_EVENT, callback, { once: true });
  return () => window.removeEventListener(INTRO_DONE_EVENT, callback);
}
