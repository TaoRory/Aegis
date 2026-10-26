"use client";

import { useEffect, useRef } from "react";

import { spaceStore } from "@/components/space/space-store";
import { spaceCopy } from "@/content/space";
import { gsap } from "@/lib/motion";

const MIN_MS = 1800;
const MAX_MS = 3200;

/**
 * Màn khởi động kiểu terminal (không âm thanh), chỉ hiện khi vào đúng /xuong lần đầu trong phiên
 * (html[data-space-boot="playing"] do script đầu trang đặt, không có khi giảm chuyển động).
 * - Có engine 3D: tiến độ là THẬT (store.bootProgress từ engine: chunk, shader, texture); kết thúc khi engine sẵn sàng.
 * - Không có engine (bản phẳng): chạy theo thời gian ngắn.
 * Tối đa MAX_MS; bấm phím/chạm/nút "Bỏ qua" là vào luôn. CSS có failsafe 4 giây phòng khi JS lỗi.
 * Link sâu (/xuong/trung-bay…) không có màn này: nội dung hiện ngay, cảnh dựng phía sau.
 */
export function SpaceBoot() {
  const ref = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const el = ref.current;
    if (!el || root.dataset.spaceBoot !== "playing") return;
    const lines = [...el.querySelectorAll<HTMLElement>("[data-boot-line]")];
    const start = performance.now();
    let raf = 0;
    let finished = false;
    spaceStore.set("bootPhase", "playing");

    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      try {
        sessionStorage.setItem("aegis-xuong-boot", "1");
      } catch {}
      gsap.to(el, {
        autoAlpha: 0,
        duration: 0.7,
        ease: "power2.inOut",
        onComplete: () => {
          delete root.dataset.spaceBoot;
          spaceStore.set("bootPhase", "done");
        },
      });
    };

    const tick = () => {
      const t = performance.now() - start;
      const state = spaceStore.get();
      const hasEngine = state.bootProgress >= 0;
      const timeP = Math.min(1, t / MIN_MS);
      // Có engine: tiến độ thật nhưng không chạy lùi/nhảy; không có: theo thời gian
      const p = hasEngine ? Math.min(timeP, state.bootProgress) : timeP;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p.toFixed(3)})`;
      if (pctRef.current) pctRef.current.textContent = `${String(Math.round(p * 100)).padStart(3, "0")}%`;
      lines.forEach((line, i) => {
        line.dataset.on = p >= i / lines.length ? "true" : "false";
      });
      const ready = hasEngine ? state.ready && p >= 1 : t >= MIN_MS;
      if (ready || t >= MAX_MS) {
        if (barRef.current) barRef.current.style.transform = "scaleX(1)";
        if (pctRef.current) pctRef.current.textContent = "100%";
        lines.forEach((line) => (line.dataset.on = "true"));
        window.setTimeout(finish, 260);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const skip = () => finish();
    window.addEventListener("keydown", skip, { once: true });
    el.addEventListener("pointerdown", skip, { once: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", skip);
    };
  }, []);

  return (
    <div ref={ref} className="space-boot" role="status" aria-label="Đang khởi động Xưởng Aegis">
      <div aria-hidden className="blueprint-grid space-boot-grid" />
      <div className="space-boot-inner">
        <ul aria-hidden className="space-boot-log">
          {spaceCopy.boot.lines.map((line) => (
            <li key={line} data-boot-line data-on="false">
              {line}
            </li>
          ))}
        </ul>
        <div aria-hidden className="space-boot-meter">
          <span ref={barRef} className="space-boot-bar" />
        </div>
        <p aria-hidden className="space-boot-pct">
          <span ref={pctRef}>000%</span>
        </p>
        <button type="button" className="space-boot-skip label" onClick={(event) => event.stopPropagation()}>
          {spaceCopy.boot.skip}
        </button>
      </div>
    </div>
  );
}
