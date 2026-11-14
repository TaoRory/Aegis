"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { cx, gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/motion";

import { Tilt } from "./fx/Tilt";

/** Thời gian giữ cờ data-play: dài hơn lượt chạy dài nhất của mô hình (services.css), để gỡ cờ khi hình đã về trạng thái tĩnh */
const PLAY_MS = 2400;

/**
 * Sân khấu của một dịch vụ: thẻ mô hình nổi phía trước hai "tấm lớp" mờ xếp bậc phía sau (ý "các lớp chồng thành một tài sản").
 * Ba nguồn chiều sâu, mỗi nguồn một việc:
 * - Con trỏ (fx/Tilt): cả chồng nghiêng về phía chuột; tấm ở xa lệch nhiều hơn tấm ở gần.
 * - Cuộn (máy tính): ghi biến --sy (−1…1) theo vị trí sân khấu trong màn hình; CSS đổi góc nhìn của chồng theo --sy,
 *   nên parallax giữa các tấm do phối cảnh tự sinh ra, không cần tween riêng cho từng tấm.
 * - Vào màn hình / rê chuột vào hàng: mô hình bên trong chạy MỘT lượt ngắn (cờ data-play) rồi đứng yên.
 *   Bản /demo2 để mô hình lặp vô hạn; ở đây chỉ chạy khi có lý do, nên không cần nút tạm dừng.
 *
 * Rê chuột tính trên phần tử gần nhất có [data-stage-host] (cả hàng dịch vụ), không chỉ riêng sân khấu.
 * Không JS / giảm chuyển động: chồng đứng yên ở trạng thái đã xoè, mô hình ở trạng thái hoàn chỉnh.
 * `children` là thẻ .d2-layer dựng ở server.
 */
export function ServicesStage({ tone, className, children }: { tone: string; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    if (!play) return;
    const timer = window.setTimeout(() => setPlay(false), PLAY_MS);
    return () => window.clearTimeout(timer);
  }, [play]);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add(MQ.anyMotion, () => {
        const run = () => setPlay(true);
        // Lần đầu vào màn hình: chờ thẻ trồi lên gần xong rồi mới chạy mô hình, để hai chuyển động không đè nhau
        let wait: gsap.core.Tween | undefined;
        const enter = ScrollTrigger.create({
          trigger: el,
          start: "top 82%",
          once: true,
          onEnter: () => {
            wait = gsap.delayedCall(0.55, run);
          },
        });
        const host = window.matchMedia(MQ.fineHover).matches ? (el.closest<HTMLElement>("[data-stage-host]") ?? el) : null;
        host?.addEventListener("pointerenter", run);
        return () => {
          enter.kill();
          wait?.kill();
          host?.removeEventListener("pointerenter", run);
        };
      });

      mm.add(MQ.desktopMotion, () => {
        const set = (self: ScrollTrigger) => el.style.setProperty("--sy", (self.progress * 2 - 1).toFixed(3));
        const trigger = ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onUpdate: set, onRefresh: set });
        return () => {
          trigger.kill();
          el.style.removeProperty("--sy");
        };
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cx("d2-svc-stage d3-stage", className)} data-stage={tone} data-play={play ? "" : undefined} aria-hidden>
      <Tilt className="d3-stage-tilt" max={7}>
        <div className="d3-stage-stack">
          <span className="d3-stage-plate" data-plate="2" />
          <span className="d3-stage-plate" data-plate="1" />
          <div className="d3-stage-card">{children}</div>
        </div>
      </Tilt>
    </div>
  );
}
