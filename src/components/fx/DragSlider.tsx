"use client";

import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";

import { cn } from "@/lib/cn";
import { gsap, MQ } from "@/lib/motion";

/**
 * Dải ngang kéo được có quán tính (Awwwards/Emotion pattern).
 * - Chuột/cảm ứng: kéo, thả thì trôi tiếp theo vận tốc và dừng mượt.
 * - Lăn chuột ngang (trackpad) và phím ←/→ cũng điều khiển được.
 * - Các phần tử con nghiêng nhẹ theo vận tốc (biến CSS --drag-skew), CSS của từng nơi dùng tự quyết định.
 * - bend: dải cong thành cung theo vận tốc kéo (Sofia Shcherbak pattern): mỗi con trực tiếp nhận --bend-y/--bend-r.
 * - Giảm chuyển động: vẫn kéo được nhưng không có quán tính/nghiêng/cong.
 * Gắn data-cursor="drag" để con trỏ hiện nhãn "Kéo".
 */
export function DragSlider({
  children,
  className,
  trackClassName,
  label,
  bend = false,
}: {
  children: ReactNode;
  className?: string;
  trackClassName?: string;
  /** Nhãn cho trình đọc màn hình */
  label: string;
  /** Cong dải theo vận tốc kéo */
  bend?: boolean;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const state = useRef({ x: 0, target: 0, min: 0, velocity: 0 });

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const reduced = window.matchMedia(MQ.reduced).matches;
    const s = state.current;

    let items: { el: HTMLElement; center: number }[] = [];
    const measure = () => {
      s.min = Math.min(0, viewport.clientWidth - track.scrollWidth);
      s.target = Math.max(s.min, Math.min(0, s.target));
      items = bend ? [...track.children].map((el) => ({ el: el as HTMLElement, center: (el as HTMLElement).offsetLeft + (el as HTMLElement).offsetWidth / 2 })) : [];
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    ro.observe(track);

    let dragging = false;
    let startX = 0;
    let startTarget = 0;
    let lastX = 0;
    let lastT = 0;
    let moved = 0;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      moved = 0;
      startX = lastX = e.clientX;
      startTarget = s.target;
      lastT = performance.now();
      viewport.setPointerCapture(e.pointerId);
      viewport.dataset.dragging = "true";
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      // Kéo quá biên thì chống lại (rubber band)
      let next = startTarget + dx;
      if (next > 0) next *= 0.35;
      if (next < s.min) next = s.min + (next - s.min) * 0.35;
      s.target = next;
      s.velocity = (e.clientX - lastX) / Math.max(1, now - lastT);
      lastX = e.clientX;
      lastT = now;
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      delete viewport.dataset.dragging;
      viewport.releasePointerCapture?.(e.pointerId);
      // Quán tính: trôi thêm theo vận tốc lúc thả
      if (!reduced) s.target += s.velocity * 320;
      s.target = Math.max(s.min, Math.min(0, s.target));
    };
    // Chặn click vào link con nếu vừa kéo (tránh mở link ngoài ý muốn)
    const onClick = (e: MouseEvent) => {
      if (moved > 6) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      s.target = Math.max(s.min, Math.min(0, s.target - e.deltaX));
    };

    viewport.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    viewport.addEventListener("click", onClick, true);
    viewport.addEventListener("wheel", onWheel, { passive: false });

    let bendV = 0;
    const tick = () => {
      const lerp = reduced ? 1 : dragging ? 0.35 : 0.085;
      const prev = s.x;
      s.x += (s.target - s.x) * lerp;
      const v = s.x - prev;
      if (bend && !reduced) {
        bendV += (Math.max(-1, Math.min(1, v / 22)) - bendV) * 0.14;
        const half = viewport.clientWidth / 2;
        for (const it of items) {
          const u = Math.max(-1.6, Math.min(1.6, (it.center + s.x - half) / half));
          it.el.style.setProperty("--bend-y", `${(Math.abs(bendV) * 150 * u * u).toFixed(2)}px`);
          it.el.style.setProperty("--bend-r", `${(bendV * -9 * u).toFixed(2)}deg`);
          it.el.style.setProperty("--bend-s", `${(Math.abs(bendV) * 0.06 * Math.abs(u)).toFixed(3)}`);
        }
      }
      track.style.transform = `translate3d(${s.x.toFixed(2)}px,0,0)`;
      track.style.setProperty("--drag-skew", reduced ? "0deg" : `${Math.max(-8, Math.min(8, v * -0.25)).toFixed(2)}deg`);
      track.style.setProperty("--drag-progress", s.min < 0 ? (s.x / s.min).toFixed(3) : "0");
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      viewport.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      viewport.removeEventListener("click", onClick, true);
      viewport.removeEventListener("wheel", onWheel);
    };
  }, [bend]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const s = state.current;
    const step = (viewportRef.current?.clientWidth ?? 600) * 0.6;
    if (e.key === "ArrowRight") s.target = Math.max(s.min, s.target - step);
    else if (e.key === "ArrowLeft") s.target = Math.min(0, s.target + step);
    else return;
    e.preventDefault();
  };

  return (
    <div
      ref={viewportRef}
      role="region"
      aria-roledescription="dải trượt"
      aria-label={`${label} — kéo hoặc dùng phím mũi tên trái/phải`}
      tabIndex={0}
      onKeyDown={onKey}
      data-cursor="drag"
      data-cursor-label="Kéo ↔"
      data-lenis-prevent-horizontal=""
      className={cn("drag-slider cursor-grab touch-pan-y overflow-hidden select-none data-[dragging=true]:cursor-grabbing", className)}
    >
      <div ref={trackRef} className={cn("drag-track flex w-max will-change-transform", bend && "drag-bend", trackClassName)}>
        {children}
      </div>
    </div>
  );
}
