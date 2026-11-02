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
    // Touchpad gửi rất nhiều sự kiện wheel nhỏ (cỡ px chuyển động của ngón tay, thường < 40), còn mỗi nấc bánh xe chuột là ~100px.
    // Nhận diện luồng touchpad (có delta nhỏ trong 250ms gần nhất): nhân thêm PAD_BOOST và giảm độ trễ làm mượt (lerp lớn hơn = bám tay
    // hơn) chỉ cho luồng đó; chuột giữ nguyên. Hệ số chuột 1.4 (trước 1.9) vì từ khi sửa lỗi mất delta ở remeasure (xem bên dưới),
    // mọi delta đều được cuộn đủ: 1.9 cho cảm giác nhanh hơn hẳn so với bản cũ (thực tế cũ chỉ cuộn được khoảng 1.0–1.2 lần delta).
    const MOUSE_LERP = 0.12;
    const MOUSE_MULTIPLIER = 1.4;
    const PAD_LERP = 0.2;
    const PAD_BOOST = 1.2;
    let padUntil = 0;
    const lenis = new Lenis({
      lerp: MOUSE_LERP,
      wheelMultiplier: MOUSE_MULTIPLIER,
      anchors: true,
      autoRaf: false,
      virtualScroll: (data) => {
        const event = data.event;
        if (event.type !== "wheel" || (event as WheelEvent).ctrlKey) return true; // ctrl + wheel là zoom của touchpad (chụm), không đụng tới
        const wheel = event as WheelEvent;
        const now = performance.now();
        if (wheel.deltaMode === 0 && Math.max(Math.abs(wheel.deltaY), Math.abs(wheel.deltaX)) < 40) padUntil = now + 250;
        const pad = now < padUntil;
        lenis.options.lerp = pad ? PAD_LERP : MOUSE_LERP;
        if (pad) {
          data.deltaX *= PAD_BOOST;
          data.deltaY *= PAD_BOOST;
        }
        return true;
      },
    });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Chiều cao trang đổi SAU lúc Lenis đo (chữ wordmark chân trang co giãn khi font tải xong, ảnh lười, section ghim…):
    // nếu không đo lại, giới hạn cuộn của Lenis bị cũ và người dùng không kéo được tới hết trang.
    // ResizeObserver riêng trên <body> (không debounce, gom theo khung hình) + đo lại mỗi lần ScrollTrigger refresh.
    // Chỉ đo lại kích thước (cập nhật giới hạn cuộn), KHÔNG gọi lenis.resize(): hàm đó còn đặt lại đích cuộn về vị trí hiện tại.
    // ResizeObserver trên <body> nổ gần như mỗi khung hình khi đang cuộn (chiều cao lẻ pixel dao động), nên gọi resize() liên tục
    // làm mất phần lớn delta bánh xe/touchpad chưa kịp chạy: cuộn chậm hẳn, touchpad (nhiều sự kiện nhỏ) bị nặng nhất.
    let sizeRaf = 0;
    const remeasure = () => {
      cancelAnimationFrame(sizeRaf);
      sizeRaf = requestAnimationFrame(() => lenis.dimensions.resize());
    };
    const sizeObserver = new ResizeObserver(remeasure);
    sizeObserver.observe(document.body);
    ScrollTrigger.addEventListener("refresh", remeasure);
    window.addEventListener("load", remeasure);
    document.fonts?.ready.then(remeasure);

    return () => {
      window.removeEventListener("load", refresh);
      window.removeEventListener("load", remeasure);
      ScrollTrigger.removeEventListener("refresh", remeasure);
      sizeObserver.disconnect();
      cancelAnimationFrame(sizeRaf);
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
