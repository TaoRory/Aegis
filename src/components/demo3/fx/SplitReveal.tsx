"use client";

import { useRef, type ElementType, type ReactNode } from "react";

import { cx, DUR, EASE, gsap, MQ, SplitText, useGSAP } from "@/lib/motion";

/**
 * Tiêu đề hiện theo từng dòng, trượt lên từ trong mặt nạ (GSAP SplitText, mask: "lines").
 * - trigger "load": chạy ngay khi trang tải (hero). trigger "scroll": chạy khi tiêu đề vào khung nhìn (sớm, ở 88% chiều cao màn hình).
 * - autoSplit: tự tách lại khi font tải xong hoặc đổi kích thước, nên dòng không bị gãy sai.
 * - Mặt nạ được nới (motion.css: .split-line-mask) để không cắt dấu tiếng Việt (ễ, ặ, ữ).
 * - Không JS / giảm chuyển động: chữ hiện bình thường. CSS chỉ ẩn chữ chờ tách dưới html[data-motion="on"], có failsafe 3 giây.
 *
 * Chỉ dùng cho tiêu đề (h1, h2, câu tuyên bố). Đoạn văn dài thì dùng data-rise.
 *
 * GIỚI HẠN: nội dung phải TĨNH. SplitText thay các nút chữ bằng thẻ dòng, nên khi chữ đổi theo state React không cập nhật được
 * (tiêu đề đứng nguyên chữ cũ). Chữ có thể đổi thì đặt key theo nội dung để dựng lại: <SplitReveal key={text}>{text}</SplitReveal>.
 */
export function SplitReveal({
  as: Tag = "div",
  id,
  className,
  children,
  trigger = "scroll",
  delay = 0,
}: {
  as?: ElementType;
  id?: string;
  className?: string;
  children: ReactNode;
  trigger?: "load" | "scroll";
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.anyMotion, () => {
        const split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          onSplit(self) {
            el.dataset.split = "ready";
            // Trả tween về cho SplitText: lần tách lại sau (font, resize) sẽ tự dọn tween cũ và giữ tiến độ
            return gsap.from(self.lines, {
              yPercent: 112,
              rotate: 2,
              duration: DUR.reveal * 1.2,
              ease: EASE.out,
              stagger: 0.09,
              delay,
              scrollTrigger: trigger === "scroll" ? { trigger: el, start: "top 88%", once: true } : undefined,
            });
          },
        });
        return () => {
          split.revert();
          delete el.dataset.split;
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} data-split="" className={cx("split-reveal", className)}>
      {children}
    </Tag>
  );
}
