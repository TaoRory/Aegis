"use client";

import type { RefObject } from "react";

import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/motion";

/**
 * Kể chuyện ghim khi cuộn mà không dùng pin của JS: phần tử ngoài cao (vd. 280vh), phần trong `position: sticky`.
 * Hook này đo tiến độ cuộn qua phần tử ngoài (0 → 1), ghi vào biến CSS `--p` và gọi `onProgress`.
 *
 * Vì sao dùng sticky thay cho `pin: true`: không đổi cấu trúc DOM, không giật trên điện thoại, và khi hook không chạy
 * (điện thoại, giảm chuyển động, không JS) phần tử chỉ là một khối bình thường với nội dung hiện đủ.
 *
 * HTML:
 *   <section ref={ref} className="kit-pin">          ← hook đặt data-live="true" khi đang ở chế độ ghim
 *     <div className="kit-pin-inner">…nội dung…</div>
 *   </section>
 * CSS (motion.css): .kit-pin[data-live="true"] { min-height: var(--kit-pin-length, 280vh) } và .kit-pin-inner dính.
 *
 * Dùng `--p` trong CSS, ví dụ vẽ dần một đường SVG: stroke-dashoffset: calc(1 - var(--p, 1)) với pathLength={1}.
 * Mặc định `--p` không có → fallback 1 → hình ở trạng thái hoàn chỉnh khi không ghim.
 *
 * Ví dụ đổi bước đang đọc:
 *   const [step, setStep] = useState(0);
 *   usePinProgress(ref, { onProgress: (p) => setStep(Math.min(4, Math.floor(p * 5 * 0.999))) });
 */
export function usePinProgress(
  ref: RefObject<HTMLElement | null>,
  { query = MQ.desktopMotion, onProgress }: { query?: string; onProgress?: (progress: number) => void } = {},
) {
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(query, () => {
        el.dataset.live = "true";
        const set = (progress: number) => {
          el.style.setProperty("--p", progress.toFixed(4));
          onProgress?.(progress);
        };
        const trigger = ScrollTrigger.create({
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => set(self.progress),
          // Chiều cao đổi sau khi bật data-live: đo lại rồi cập nhật ngay
          onRefresh: (self) => set(self.progress),
        });
        ScrollTrigger.refresh();
        return () => {
          trigger.kill();
          el.style.removeProperty("--p");
          delete el.dataset.live;
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
}
