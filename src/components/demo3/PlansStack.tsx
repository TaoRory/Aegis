"use client";

import { Fragment, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/motion";

/** Trạng thái dấu tick của một thẻ: chưa quan sát (đứng yên, hiện sẵn) → "armed" (đang chờ dưới màn hình) → "drawn" (vẽ vào) */
type Ticks = "armed" | "drawn" | undefined;

/**
 * Ba gói xếp chồng khi cuộn (theo công thức fx/StackCards, viết riêng vì trang này cần ba thứ công thức gốc không có):
 *
 * 1. Mỏ neo tách khỏi thẻ. `#plan-own`, `#plan-grow`, `#plan-amplify` nằm trên một <span> KHÔNG dính đặt ngay trước thẻ.
 *    Thẻ đang dính trả về vị trí "đang dính" chứ không phải vị trí thật trong trang, nên cuộn tới thẻ sẽ đứng sai chỗ
 *    (bấm "Own" khi đang xem Amplify thì không đi đâu). Mỏ neo luôn ở vị trí thật; scroll-margin của nó bằng đúng
 *    điểm dính của thẻ, nên thẻ dừng lại vừa khít dưới header.
 * 2. Thẻ cao hơn màn hình (điện thoại) vẫn đọc được hết: điểm dính lùi lên sao cho ĐÁY thẻ chạm đáy màn hình rồi mới dính.
 *    Cần chiều cao thật của thẻ nên đo bằng ResizeObserver và đưa vào biến --card-h qua state.
 * 3. Độ lùi theo số thẻ đang nằm trên: thẻ Own lùi thêm một bậc khi Amplify trồi lên, chồng thẻ nhìn có chiều sâu thật.
 *
 * Chỉ dính khi component đã đo xong (data-live) VÀ người dùng không giảm chuyển động. Không JS / giảm chuyển động:
 * ba thẻ nằm nối tiếp nhau như một danh sách thường, không có gì bị che.
 */
export function PlansStack({ items }: { items: { id: string; node: ReactNode }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [heights, setHeights] = useState<number[] | null>(null);
  const [ticks, setTicks] = useState<Ticks[]>([]);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.anyMotion, () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-stack-card]", root);
        const anchors = gsap.utils.toArray<HTMLElement>("[data-stack-anchor]", root);

        // Chiều cao thẻ đổi theo bề rộng màn hình và khi font tải xong: đo lại mỗi lần, chỉ render lại khi số thật sự đổi
        const sizes = new ResizeObserver(() => {
          const next = cards.map((card) => card.offsetHeight);
          setHeights((prev) => (prev && prev.length === next.length && prev.every((h, i) => h === next[i]) ? prev : next));
        });
        cards.forEach((card) => sizes.observe(card));

        // Độ lùi của thẻ i = tổng tiến độ trồi lên của các thẻ phía sau nó. Ghi ra biến --stack-d, CSS đổi thành scale + độ sáng.
        // Điểm kết thúc lấy từ scroll-margin của mỏ neo (= điểm dính của thẻ) để CSS là nguồn duy nhất của con số này.
        const progress = cards.map(() => 0);
        const apply = () => {
          cards.forEach((card, i) => {
            let depth = 0;
            for (let j = i + 1; j < cards.length; j++) depth += progress[j];
            card.style.setProperty("--stack-d", depth.toFixed(3));
          });
        };
        anchors.forEach((anchor, j) => {
          if (j === 0) return;
          const sync = (self: ScrollTrigger) => {
            progress[j] = self.progress;
            apply();
          };
          ScrollTrigger.create({
            trigger: anchor,
            start: "top bottom",
            end: () => `top ${parseFloat(getComputedStyle(anchor).scrollMarginTop) || 0}px`,
            onUpdate: sync,
            onRefresh: sync,
          });
        });

        // Dấu tick vẽ vào khi danh sách "Bao gồm" của thẻ tới màn hình. Lần gọi đầu của IntersectionObserver cho biết danh sách
        // đang ở đâu: đã trong màn hình thì để yên (không ẩn rồi vẽ lại thứ người xem đang nhìn), còn ở dưới thì chuyển sang chờ.
        const lists = cards.map((card) => card.querySelector(".d2-checks"));
        const seen = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              const i = lists.indexOf(entry.target);
              if (i < 0) continue;
              if (entry.isIntersecting) seen.unobserve(entry.target);
              setTicks((prev) => {
                const state: Ticks = entry.isIntersecting ? (prev[i] === "armed" ? "drawn" : prev[i]) : (prev[i] ?? "armed");
                if (state === prev[i]) return prev;
                const next = [...prev];
                next[i] = state;
                return next;
              });
            }
          },
          { rootMargin: "0px 0px -12% 0px" },
        );
        lists.forEach((list) => list && seen.observe(list));

        return () => {
          sizes.disconnect();
          seen.disconnect();
          cards.forEach((card) => card.style.removeProperty("--stack-d"));
          setHeights(null);
          setTicks([]);
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="d3-plans-stack" data-live={heights ? "true" : undefined}>
      {items.map((item, i) => (
        <Fragment key={item.id}>
          <span id={`plan-${item.id}`} data-stack-anchor className="d3-plans-anchor" style={{ "--i": i } as CSSProperties} />
          <div
            data-stack-card
            data-ticks={ticks[i]}
            className="d3-plans-slot"
            style={{ "--i": i, "--card-h": heights ? `${heights[i]}px` : undefined } as CSSProperties}
          >
            {item.node}
          </div>
        </Fragment>
      ))}
    </div>
  );
}
