"use client";

import { Fragment, useRef, type CSSProperties } from "react";

import { cx, gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/motion";

/**
 * Câu tuyên bố "tô dần" theo cuộn: từng từ chuyển từ tông phụ (--d2-muted, vẫn 10,9:1 trên nền Cloud) sang mực đậm,
 * kèm một khối Aqua lướt qua đúng những từ đang được tô (chữ ký khối Aqua của trang, dùng làm "đầu đọc").
 *
 * Vì sao tách từ ở đây chứ không dùng SplitText: các thẻ từ có sẵn trong HTML từ server nên không nháy khi hydrate,
 * và JS chỉ phải ghi MỘT biến (--p, 0 → 1) mỗi lần cuộn; mức tô của từng từ do CSS tính từ --p, --i, --n (about.css).
 * Chữ luôn đọc được ở mọi thời điểm. Không JS / giảm chuyển động: không có --p → CSS lấy 1 → cả câu ở màu đậm.
 */
export function AboutStatement({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(" ");

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.anyMotion, () => {
        const set = (self: ScrollTrigger) => el.style.setProperty("--p", self.progress.toFixed(4));
        // clamp(): câu này nằm ngay màn đầu, nên mốc bắt đầu được kẹp về vị trí cuộn 0 (chưa cuộn thì chưa tô)
        const trigger = ScrollTrigger.create({ trigger: el, start: "clamp(top 70%)", end: "clamp(bottom 42%)", onUpdate: set, onRefresh: set });
        return () => {
          trigger.kill();
          el.style.removeProperty("--p");
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <p ref={ref} className={cx("d2-statement d3-fill", className)} style={{ "--n": words.length } as CSSProperties}>
      {words.map((word, i) => (
        <Fragment key={`${i}-${word}`}>
          {i > 0 && " "}
          <span className="d3-fill-w" style={{ "--i": i } as CSSProperties}>
            {word}
          </span>
        </Fragment>
      ))}
    </p>
  );
}
