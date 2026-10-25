"use client";

import { useEffect } from "react";
import Lenis from "lenis";

import { gsap, MQ, ScrollTrigger, setLenis } from "@/lib/motion";

/**
 * Smooth scroll (Lenis) chạy chung nhịp với GSAP ticker, đồng bộ ScrollTrigger.
 * Không bật khi người dùng giảm chuyển động. Trên cảm ứng, Lenis giữ cuộn gốc (syncTouch: false).
 */
export function MotionProvider() {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);

    if (window.matchMedia(MQ.reduced).matches) {
      return () => window.removeEventListener("load", refresh);
    }

    // Header trong suốt (mix-blend) nên section cuộn sát đỉnh màn hình, không cần offset
    const lenis = new Lenis({ lerp: 0.095, wheelMultiplier: 0.95, anchors: true, autoRaf: false });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
