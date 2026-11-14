"use client";

import { useRef, type ReactNode } from "react";

import { DUR, EASE, gsap, MQ, SplitText, useGSAP } from "@/lib/motion";

import { onD3IntroDone } from "./D3Intro";

/** Bố cục "chồng lớp 3D" của tấm tài sản bắt đầu từ bề rộng này (khớp với hero.css) */
const STACKED = "(min-width: 60rem)";
/** Hướng xoay nhẹ của từng lớp lúc bay vào (độ): Website, Search, Social, AI */
const SPIN = [-5, 4, -4, 5];
/** JS tới muộn hơn mốc này thì CSS dự phòng đã đưa mọi thứ về chỗ (hero.css, motion-kit.css: 3 giây): không diễn lại cảnh mở */
const TOO_LATE = 2800;

/**
 * Sân khấu của màn đầu trang chủ /demo3. Dựng thẻ <section> và điều khiển hai cảnh, nội dung bên trong vẫn là Server Component:
 *
 * 1. Cảnh mở (mọi thiết bị, một timeline, xong trong khoảng 1,5 giây): tiêu đề hiện theo từng dòng từ trong mặt nạ, khối Aqua quét
 *    vào sau từ khoá, đoạn dẫn và hai nút về chỗ, rồi bốn lớp Website → Search → Social → AI bay từ phía người xem vào và xếp lên
 *    tấm nền theo đúng thứ tự (động từ của thương hiệu: xếp từng lớp thành một tài sản). Điện thoại: các lớp chỉ trồi lên, không 3D.
 *    Có intro thương hiệu thì chờ intro mở trang (onD3IntroDone), không thì chạy ngay.
 * 2. Cảnh cuộn (chỉ máy tính, scrub): khi màn đầu trôi đi, bốn lớp tách nhau theo chiều sâu như bản vẽ phân rã. JS chỉ ghi một biến
 *    --d3-ex (0…1) lên bảng; mỗi lớp tự tính quãng của mình bằng thuộc tính translate / rotate trong hero.css, nên không đụng tới
 *    transform của hiệu ứng nghiêng theo chuột (trên .d2-board) lẫn transition đổi gói (trên .d2-layer).
 *
 * Tiêu đề dùng đúng công thức của fx/SplitReveal (SplitText mask "lines", autoSplit, cùng class và cùng cờ data-split) nhưng viết
 * tại đây, vì tween của nó phải nằm trong timeline chung và phải chờ được intro; component SplitReveal tự chạy ngay khi gắn.
 * Trạng thái chờ trước khi JS tới nằm trong hero.css dưới html[data-motion="on"]; ở đây đặt data-live để GSAP nhận lại.
 */
export function HeroStage({ children, labelledBy }: { children: ReactNode; labelledBy: string }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();

      mm.add(MQ.anyMotion, () => {
        const title = root.querySelector<HTMLElement>("[data-hero='title']");
        if (performance.now() > TOO_LATE) {
          root.dataset.live = "on";
          if (title) title.dataset.split = "ready";
          return;
        }
        const rise = gsap.utils.toArray<HTMLElement>("[data-hero='rise']", root);
        const slots = gsap.utils.toArray<HTMLElement>(".d3-slot", root);
        const stacked = window.matchMedia(STACKED).matches;

        const tl = gsap.timeline({ paused: true, defaults: { ease: EASE.out } });

        // Đoạn dẫn và hai nút: chỉ dịch chuyển, chữ luôn đọc được
        tl.from(rise, { y: 28, duration: 0.9, stagger: 0.07, clearProps: "transform" }, 0.22);

        // Bốn lớp: hiện nhanh (0,3 giây) rồi mới đáp, để người xem thấy chúng bay tới chứ không phải mờ dần ra
        tl.from(slots, { autoAlpha: 0, duration: 0.3, ease: "power1.out", stagger: 0.09, clearProps: "opacity,visibility" }, 0.38);
        tl.from(
          slots,
          stacked
            ? { z: 240, yPercent: -16, rotationX: -24, rotationZ: (i: number) => SPIN[i % SPIN.length], duration: 0.85, stagger: 0.09, clearProps: "transform" }
            : { y: 32, scale: 0.94, duration: 0.8, stagger: 0.07, clearProps: "transform" },
          0.38,
        );

        const split = title
          ? SplitText.create(title, {
              type: "lines",
              mask: "lines",
              linesClass: "split-line",
              autoSplit: true,
              onSplit(self) {
                title.dataset.split = "ready";
                // Tách lại (font tải xong, đổi bề rộng) thì SplitText huỷ đoạn cũ, giữ tiến độ; đoạn mới được gắn lại vào timeline chung
                const lines = gsap.timeline({ defaults: { ease: EASE.out } });
                lines.from(self.lines, { yPercent: 112, rotate: 2, duration: DUR.reveal, stagger: 0.09 }, 0);
                // Khối Aqua sau từ khoá quét vào khi dòng của nó gần đứng yên (nếu từ khoá gãy thành hai dòng thì quét lần lượt)
                const marks = title.querySelectorAll(".d2-mark");
                if (marks.length) lines.fromTo(marks, { "--d3-mark": 0 }, { "--d3-mark": 1, duration: 0.7, stagger: 0.12 }, 0.4);
                tl.add(lines, 0);
                return lines;
              },
            })
          : null;

        root.dataset.live = "on";
        const off = onD3IntroDone(() => tl.play());
        return () => {
          off();
          split?.revert();
          if (title) delete title.dataset.split;
        };
      });

      mm.add(MQ.desktopMotion, () => {
        const asset = root.querySelector<HTMLElement>(".d2-asset");
        const board = root.querySelector<HTMLElement>(".d2-board");
        if (!asset || !board) return;
        // Bắt đầu khi tấm tài sản đã nằm giữa màn hình (người xem còn chơi với nút gói thì các lớp đứng yên); tách hết cỡ khi tấm còn
        // một phần ba trong màn hình, vì sau mốc đó các lớp đã khuất dưới header, tách thêm cũng không ai thấy
        gsap.fromTo(board, { "--d3-ex": 0 }, { "--d3-ex": 1, ease: EASE.scrub, scrollTrigger: { trigger: asset, start: "center 50%", end: "bottom 30%", scrub: true } });
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="top" aria-labelledby={labelledBy} className="d2-wrap d2-hero d3-hero">
      {children}
    </section>
  );
}
