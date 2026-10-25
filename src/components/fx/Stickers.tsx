"use client";

import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { useRef, type CSSProperties, type ReactNode } from "react";

import { cn } from "@/lib/cn";
import { gsap, MQ, useGSAP } from "@/lib/motion";

gsap.registerPlugin(Draggable, InertiaPlugin);

/**
 * Vùng chứa các "sticker" kéo thả được, có quán tính và giới hạn trong vùng (edu/kid/sự kiện pattern).
 * Sticker là trang trí: cả vùng aria-hidden, nội dung thật đặt ngoài.
 * Giảm chuyển động: vẫn kéo được, không quán tính/nảy.
 */
export function Stickers({
  children,
  className,
}: {
  children: ReactNode;
  /** Mặc định "relative"; truyền "absolute inset-0" để phủ lên khối cha (cn không gộp class xung đột) */
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const host = ref.current;
      if (!host) return;
      const reduced = window.matchMedia(MQ.reduced).matches;
      const nodes = gsap.utils.toArray<HTMLElement>("[data-sticker]", host);
      let z = 10;
      const instances = nodes.flatMap((node) =>
        Draggable.create(node, {
          bounds: host,
          inertia: !reduced,
          edgeResistance: 0.7,
          onPress() {
            z++;
            gsap.set(node, { zIndex: z });
            if (!reduced) gsap.to(node, { scale: 1.08, boxShadow: "0 18px 40px -12px rgb(0 0 0 / 0.35)", duration: 0.25, ease: "power2.out" });
          },
          onRelease() {
            if (!reduced) gsap.to(node, { scale: 1, boxShadow: "0 6px 14px -8px rgb(0 0 0 / 0.25)", duration: 0.8, ease: "elastic.out(1, 0.45)" });
          },
        }),
      );
      return () => instances.forEach((d) => d.kill());
    },
    { scope: ref },
  );

  return (
    <div ref={ref} aria-hidden className={className ?? "relative"}>
      {children}
    </div>
  );
}

export function Sticker({
  children,
  x,
  y,
  rotate = 0,
  className,
}: {
  children: ReactNode;
  /** Vị trí ban đầu (%, px…) */
  x: string;
  y: string;
  rotate?: number;
  className?: string;
}) {
  return (
    <div data-sticker className={cn("sticker", className)} style={{ left: x, top: y, rotate: `${rotate}deg` } as CSSProperties}>
      {children}
    </div>
  );
}
