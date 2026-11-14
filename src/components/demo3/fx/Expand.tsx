"use client";

import { useRef, useState, type ReactNode } from "react";

import { cx, gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/motion";

/**
 * Tấm tối "nở tràn màn hình" theo cuộn (bề mặt bên trong mang class .d3-expand-slab, kiểu ở shell.css):
 * đứng yên thì tấm nằm gọn trong lề trang như mọi tấm khác; cuộn tới thì một lớp nền cùng màu phía sau tấm giãn ngang
 * tới sát hai mép màn hình, đi qua rồi lại thu về. Chữ và nền thật của tấm không đổi.
 *
 * Hiệu năng: lớp giãn là ::before chỉ đổi transform scaleX (--sx = 1 → bề rộng màn hình / bề rộng tấm),
 * không vẽ lại tấm mỗi khung hình như cách dùng clip-path.
 * Không JS / giảm chuyển động: không có data-live → không có lớp giãn, tấm như bản tĩnh.
 */
export function Expand({ className, children, ...rest }: { className?: string; children: ReactNode; [prop: string]: unknown }) {
  const ref = useRef<HTMLElement>(null);
  const [live, setLive] = useState(false);

  useGSAP(
    () => {
      const el = ref.current;
      const slab = el?.querySelector<HTMLElement>(".d3-expand-slab");
      if (!el || !slab) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.anyMotion, () => {
        let enter = 0;
        let exit = 0;
        let full = 1;
        const measure = () => {
          full = el.clientWidth / (slab.offsetWidth || 1);
        };
        const write = () => {
          const e = Math.min(enter, 1 - exit);
          el.style.setProperty("--sx", (1 + (full - 1) * e).toFixed(4));
        };
        measure();
        setLive(true);
        const triggers = [
          ScrollTrigger.create({ trigger: el, start: "top 88%", end: "top 20%", onUpdate: (self) => ((enter = self.progress), write()), onRefresh: (self) => (measure(), (enter = self.progress), write()) }),
          ScrollTrigger.create({ trigger: el, start: "bottom 80%", end: "bottom 12%", onUpdate: (self) => ((exit = self.progress), write()), onRefresh: (self) => ((exit = self.progress), write()) }),
        ];
        write();
        return () => {
          triggers.forEach((trigger) => trigger.kill());
          el.style.removeProperty("--sx");
          setLive(false);
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className={cx("d3-expand", className)} data-live={live ? "true" : undefined} {...rest}>
      {children}
    </section>
  );
}
