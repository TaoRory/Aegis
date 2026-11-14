"use client";

import { useRef, useState, type CSSProperties } from "react";

import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/motion";

import { Rise } from "./fx/Rise";

/**
 * Ba nguyên tắc thành ba hàng chữ lớn; MỘT khối Aqua trượt từ hàng này sang hàng kia theo vị trí đang đọc khi cuộn.
 * Khối chỉ là dấu chỉ chỗ: mọi hàng luôn hiện đủ chữ, không hàng nào bị làm mờ.
 *
 * Các hàng cao bằng nhau (grid 1fr) nên khối chỉ cần translateY theo bội số chiều cao của chính nó: không đo DOM,
 * không animate height. Hàng đang đọc đi qua state của React (không tự gắn thuộc tính lên DOM).
 * Không JS / giảm chuyển động: không có khối, ba hàng đứng yên như một danh sách thường.
 */
export function AboutValues({ items }: { items: { title: string; description: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);
  const count = items.length;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.anyMotion, () => {
        const at = (progress: number) => Math.min(count - 1, Math.floor(progress * count));
        const trigger = ScrollTrigger.create({
          trigger: el,
          // "Đang đọc" = hàng nằm trên vạch 60% chiều cao màn hình
          start: "top 60%",
          end: "bottom 60%",
          onUpdate: (self) => setActive(at(self.progress)),
          onLeaveBack: () => setActive(-1),
          // Tải lại trang khi đã cuộn qua phần này: đặt đúng hàng ngay, không chờ lần cuộn kế tiếp
          onRefresh: (self) => setActive(self.progress > 0 ? at(self.progress) : -1),
        });
        return () => {
          trigger.kill();
          setActive(-1);
        };
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [count] },
  );

  return (
    <div ref={ref} className="d3-values" data-live={active >= 0 ? "true" : undefined} style={{ "--n": count, "--at": Math.max(0, active) } as CSSProperties}>
      <span className="d3-values-marker" aria-hidden />
      <dl className="d2-values">
        {items.map((item, i) => (
          <Rise key={item.title} index={i} data-active={i === active ? "true" : undefined}>
            <dt>{item.title}</dt>
            <dd>{item.description}</dd>
          </Rise>
        ))}
      </dl>
    </div>
  );
}
