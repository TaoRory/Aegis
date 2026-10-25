"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";
import { gsap, MQ } from "@/lib/motion";

/**
 * Vùng mà khi rê chuột, các ảnh lần lượt hiện theo đuôi con trỏ rồi mờ đi (fashion/agency pattern).
 * Ảnh trang trí: alt rỗng. Chỉ chạy với chuột + không giảm chuyển động.
 */
export function ImageTrail({
  images,
  children,
  className,
  size = "clamp(9rem, 16vw, 15rem)",
  gap = 90,
}: {
  images: string[];
  children?: ReactNode;
  className?: string;
  size?: string;
  /** Khoảng di chuột (px) giữa hai ảnh */
  gap?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host || !window.matchMedia(`${MQ.fineHover} and ${MQ.anyMotion}`).matches) return;
    const nodes = [...host.querySelectorAll<HTMLImageElement>("[data-trail]")];
    let index = 0;
    let last = { x: 0, y: 0 };
    let z = 1;
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (Math.hypot(x - last.x, y - last.y) < gap) return;
      const img = nodes[index % nodes.length];
      index++;
      z++;
      gsap.killTweensOf(img);
      gsap.set(img, { x: last.x, y: last.y, xPercent: -50, yPercent: -50, opacity: 1, scale: 0.6, zIndex: z, rotate: gsap.utils.random(-8, 8) });
      gsap.to(img, { x, y, scale: 1, duration: 0.7, ease: "expo.out" });
      gsap.to(img, { opacity: 0, scale: 0.85, duration: 0.9, delay: 0.55, ease: "power2.in" });
      last = { x, y };
    };
    const onEnter = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      last = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerenter", onEnter);
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerenter", onEnter);
    };
  }, [gap]);

  return (
    <div ref={ref} className={cn("relative isolate overflow-hidden", className)}>
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- ảnh trang trí được GSAP điều khiển, không cần tối ưu next/image
        <img
          key={i}
          data-trail
          src={src}
          alt=""
          aria-hidden
          loading="lazy"
          className="pointer-events-none absolute top-0 left-0 aspect-[4/5] object-cover opacity-0"
          style={{ width: size }}
        />
      ))}
      <div className="relative">{children}</div>
    </div>
  );
}
