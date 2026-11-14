"use client";

import dynamic from "next/dynamic";
import { useRef, useState, type ReactNode } from "react";

import { gsap, MQ, useGSAP } from "@/lib/motion";

import { FinalStill } from "./FinalStill";
import { MotionToggle } from "./HomeMotionToggle";

// Mã WebGL chỉ tải khi khối sắp vào màn hình (và chỉ trên máy tính có chuột, không giảm chuyển động)
const Threads = dynamic(() => import("./fx/Threads").then((mod) => mod.Threads), { ssr: false });

/**
 * Tấm tối của lời mời cuối trang + nền "bó sợi" phía sau tiêu đề và hai ô lớn.
 * - Mặc định (server, không JS, điện thoại, giảm chuyển động, WebGL lỗi): nền tĩnh SVG cùng màu (FinalStill).
 * - Máy tính có chuột, không giảm chuyển động: khi khối tới gần màn hình mới tải bản WebGL; vẽ xong khung đầu thì đổi chỗ với bản tĩnh.
 * - Chỉ chạy khi khối đang trong màn hình, tab đang mở, người xem không bấm dừng, VÀ không có canvas nào khác đang hiện
 *   (vòng xoay dự án ở trang chủ): mỗi lúc tối đa một canvas WebGL chạy.
 * - Nền nằm trong lớp absolute phủ kín tấm, nên tải hay không tải cũng không làm xô bố cục.
 */
export function FinalStage({ labels, children }: { labels: { pause: string; play: string }; children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [colors, setColors] = useState<{ color: string; accent: string } | null>(null);
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState(false);
  const [failed, setFailed] = useState(false);
  const [userPaused, setUserPaused] = useState(false);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.speedFx, () => {
        // Màu lấy từ token của dự án, không viết cứng trong component
        const style = getComputedStyle(root);
        setColors({ color: style.getPropertyValue("--d2-teal").trim(), accent: style.getPropertyValue("--d2-aqua").trim() });

        // Canvas khác trên trang (vòng xoay dự án): đang hiện thì nền này đứng yên
        const showing = new Set<Element>();
        const others = new IntersectionObserver((entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) showing.add(entry.target);
            else showing.delete(entry.target);
          }
          setBusy(showing.size > 0);
        });
        const nearby = new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting) return;
            setNear(true);
            nearby.disconnect();
            document.querySelectorAll("canvas").forEach((canvas) => !root.contains(canvas) && others.observe(canvas));
          },
          { rootMargin: "60% 0px" },
        );
        const view = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
        nearby.observe(root);
        view.observe(root);
        return () => {
          others.disconnect();
          nearby.disconnect();
          view.disconnect();
          setColors(null);
          setLive(false);
        };
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  const on = live && !failed && !!colors;
  return (
    <div ref={rootRef} className="d3-final-slab" data-d2-tone="dark" data-live={on}>
      <div className="d3-final-bg" aria-hidden>
        <FinalStill />
        {colors && near && !failed && (
          <Threads className="d3-final-canvas" color={colors.color} accent={colors.accent} angle={20} shiftY={0.02} paused={!inView || busy || userPaused} onReady={() => setLive(true)} onFail={() => setFailed(true)} />
        )}
      </div>
      {children}
      {on && <MotionToggle className="d3-final-toggle" paused={userPaused} labels={labels} onToggle={() => setUserPaused((value) => !value)} />}
    </div>
  );
}
