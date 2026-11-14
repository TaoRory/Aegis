"use client";

import { useRef, type ReactNode } from "react";

import { EASE, gsap, MQ, useGSAP } from "@/lib/motion";

/**
 * Phần "chỗ trống" phía dưới mỗi cột ngắn mà cột được phép trôi xuống (0–1), theo thứ tự cột.
 * Cột cao nhất không có chỗ trống nên đứng yên và làm mốc; hai cột còn lại tụt lại với hai nhịp khác nhau.
 */
const DRIFT = [0.3, 0.3, 0.46];
/** Trần của quãng trôi (px): đủ để thấy chiều sâu, không đủ để ô dự án "bơi" khỏi chỗ */
const DRIFT_MAX = 150;

/**
 * Tường dự án ba cột có chiều sâu: khi cuộn, các cột ngắn trôi chậm hơn cột dài một chút (scrub, tuyến tính),
 * nên lúc đầu ba cột lệch nhau ở mép trên, cuối tường thì khép dần ở mép dưới.
 * Chỉ máy tính (MQ.desktopMotion). Điện thoại, giảm chuyển động, không JS: tường đứng yên, đủ nội dung.
 * Quãng trôi tính từ chỗ trống thật của từng cột (offsetTop / offsetHeight, không bị transform làm sai) và tính lại mỗi lần refresh,
 * nên cột không bao giờ thò ra khỏi tường dù đổi kích thước cửa sổ.
 */
export function WorkWall({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const wall = ref.current;
      if (!wall) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.desktopMotion, () => {
        const columns = gsap.utils.toArray<HTMLElement>(".d2-wall-col", wall);
        // Cột là flex item nên bị kéo cao bằng tường: chỗ trống thật = đáy tường trừ đáy ô cuối cùng của cột.
        // Tường, cột và ô có chung offsetParent (cột và tường không position), nên so offsetTop với nhau được.
        const spare = (column: HTMLElement) => {
          const last = column.lastElementChild as HTMLElement | null;
          return last ? Math.max(0, wall.offsetTop + wall.offsetHeight - (last.offsetTop + last.offsetHeight)) : 0;
        };
        const timeline = gsap.timeline({
          defaults: { ease: EASE.scrub },
          // clamp: tường đã nằm trong màn đầu, tiến độ vẫn bắt đầu từ 0 ở đầu trang (không nhảy vị trí lúc tải)
          scrollTrigger: { trigger: wall, start: "clamp(top bottom)", end: "bottom 62%", scrub: true, invalidateOnRefresh: true },
        });
        columns.forEach((column, i) => {
          timeline.to(column, { y: () => Math.min(DRIFT_MAX, spare(column) * (DRIFT[i] ?? 0.3)) }, 0);
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="d2-wall d3-wall">
      {children}
    </div>
  );
}
