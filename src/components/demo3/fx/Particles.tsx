"use client";

import { useEffect, useRef, type RefObject } from "react";

import { gsap, MQ } from "@/lib/motion";

/** Một dòng hạt: chạy dọc đường `d` (toạ độ viewBox), bắt đầu có hạt từ tiến độ `at`, dày dần trong quãng `ramp` */
export type Stream = { d: string; at: number; count: number; speed: number; r?: number; ramp?: number };

const SAMPLES = 48;
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Hạt chạy dọc các đường trong một cảnh SVG (dòng khách đổ về, xung tín hiệu trong mạng lưới).
 * - Đọc tiến độ cuộn từ `progress` (ref, do D3Story ghi) mỗi khung hình: dòng nào chưa tới mốc thì không có hạt, tới mốc thì dày dần.
 * - Một vòng lặp trên gsap.ticker; dừng khi khuất màn hình, tab ẩn hoặc người xem bấm tạm dừng (`paused`).
 * - Giảm chuyển động / không JS: không chạy, hạt ẩn (CSS), cảnh vẫn đủ đường và nút.
 * Toạ độ hạt ghi bằng transform (đơn vị viewBox), không đổi thuộc tính do React quản lý.
 */
export function Particles({ streams, progress, paused, className }: { streams: Stream[]; progress: RefObject<number>; paused: boolean; className?: string }) {
  const ref = useRef<SVGGElement>(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const group = ref.current;
    if (!group || !window.matchMedia(MQ.anyMotion).matches) return;
    const paths = [...group.querySelectorAll<SVGPathElement>("path")];
    const dots = [...group.querySelectorAll<SVGCircleElement>("circle")];
    const samples = paths.map((path) => {
      const length = path.getTotalLength();
      return Array.from({ length: SAMPLES }, (_, i) => {
        const point = path.getPointAtLength((length * i) / (SAMPLES - 1));
        return [point.x, point.y] as const;
      });
    });

    let visible = false;
    const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { rootMargin: "80px" });
    observer.observe(group.ownerSVGElement ?? group);

    let clock = 0;
    const tick = (_time: number, delta: number) => {
      if (!visible || pausedRef.current || document.hidden) return;
      clock += Math.min(delta, 50) / 1000;
      const p = progress.current ?? 1;
      let k = 0;
      streams.forEach((stream, si) => {
        const points = samples[si];
        const shown = p < stream.at ? 0 : Math.max(1, Math.ceil(clamp01((p - stream.at) / (stream.ramp ?? 0.2)) * stream.count));
        for (let i = 0; i < stream.count; i++) {
          const dot = dots[k++];
          if (!dot) continue;
          if (i >= shown) {
            dot.style.opacity = "0";
            continue;
          }
          const u = (clock * stream.speed + i / stream.count) % 1;
          const f = u * (SAMPLES - 1);
          const a = Math.floor(f);
          const b = Math.min(SAMPLES - 1, a + 1);
          const w = f - a;
          const x = points[a][0] + (points[b][0] - points[a][0]) * w;
          const y = points[a][1] + (points[b][1] - points[a][1]) * w;
          dot.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
          // Mờ ở hai đầu đường, rõ ở giữa
          dot.style.opacity = Math.sin(u * Math.PI).toFixed(3);
        }
      });
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      observer.disconnect();
      dots.forEach((dot) => dot.removeAttribute("style"));
    };
  }, [streams, progress]);

  return (
    <g ref={ref} className={className ? `d3-fx-particles ${className}` : "d3-fx-particles"} aria-hidden>
      {streams.map((stream, si) => (
        <path key={`p${si}`} d={stream.d} fill="none" stroke="none" />
      ))}
      {streams.flatMap((stream, si) => Array.from({ length: stream.count }, (_, i) => <circle key={`${si}-${i}`} r={stream.r ?? 3} />))}
    </g>
  );
}
