"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";

import { getLenis, gsap, MQ, ScrollTrigger, setLenis } from "@/lib/motion";

/**
 * Smooth scroll (Lenis) chạy chung nhịp với GSAP ticker, đồng bộ ScrollTrigger.
 * Không bật khi người dùng giảm chuyển động. Trên cảm ứng, Lenis giữ cuộn gốc (syncTouch: false).
 */
export function MotionProvider() {
  const pathname = usePathname();

  // Đổi trang (điều hướng phía client): Lenis giữ "vị trí đích" của trang cũ. Nếu người dùng vừa cuộn xong rồi bấm link ngay,
  // Next cuộn trang mới về đầu nhưng vòng lặp của Lenis lập tức kéo về vị trí cũ (kẹt ở cuối trang, lăn chuột không đi đâu).
  // Sau mỗi lần đổi route: đặt lại Lenis ngay (không animation) về đầu trang, hoặc về mục trong #hash nếu có, lặp lại vài khung hình
  // để thắng cả cuộn của Next lẫn vòng lặp cũ của Lenis.
  const previousPath = useRef(pathname);
  /** Vị trí cuộn cuối cùng của từng URL, để nút Back/Forward trả người dùng về đúng chỗ đang xem */
  const scrollMemory = useRef(new Map<string, number>());
  const poppedRef = useRef(false);

  useEffect(() => {
    const memory = scrollMemory.current;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => memory.set(window.location.pathname + window.location.search, window.scrollY));
    };
    const onPop = () => {
      poppedRef.current = true;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("popstate", onPop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    const popped = poppedRef.current;
    poppedRef.current = false;
    const lenis = getLenis();
    if (!lenis) return;
    const remembered = popped ? (scrollMemory.current.get(window.location.pathname + window.location.search) ?? 0) : 0;
    const reset = () => {
      lenis.resize();
      const hash = window.location.hash;
      const target = hash.length > 1 ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
      lenis.scrollTo(target ?? remembered, { immediate: true, force: true });
    };
    reset();
    const frames: number[] = [];
    const after = (n: number) => {
      if (n === 0) {
        reset();
        ScrollTrigger.refresh();
        return;
      }
      frames.push(
        requestAnimationFrame(() => {
          reset();
          after(n - 1);
        }),
      );
    };
    after(3);
    // Trang dài có section ghim (trang chủ): chờ chiều cao ổn định rồi đặt lại một lần nữa khi Back/Forward
    const late = popped ? window.setTimeout(reset, 350) : 0;
    return () => {
      frames.forEach(cancelAnimationFrame);
      window.clearTimeout(late);
    };
  }, [pathname]);

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
