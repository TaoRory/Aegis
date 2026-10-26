"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode, type RefObject } from "react";

import { spaceCopy } from "@/content/space";
import { zoneById, type ZoneId } from "@/config/space";
import { spaceStore } from "@/components/space/space-store";
import { Rich } from "@/components/ui/Rich";
import { gsap, MQ, useGSAP } from "@/lib/motion";

/**
 * Hiệu ứng mở khung: nét khung vẽ ra, khung trượt vào bằng clip-path, nội dung trồi lên lần lượt.
 * CSS giấu khung tới khi data-ready được đặt (chỉ dưới [data-motion="on"], có failsafe 3s). Chạy trong layout effect
 * nên không chớp. Khung nằm trong trang (không ở layout) vì trang cũ bị Next giữ ẩn, không có animation thoát.
 */
export function usePanelEnter(ref: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      el.dataset.ready = "true";
      const mm = gsap.matchMedia();
      mm.add(MQ.anyMotion, () => {
        const mobile = window.matchMedia("(max-width: 63.99rem)").matches;
        gsap.from(el, { clipPath: mobile ? "inset(100% 0 0 0)" : "inset(0 0 0 100%)", duration: 0.95, ease: "expo.inOut", clearProps: "clipPath" });
        gsap.from(el.querySelectorAll("[data-panel-line]"), { scaleX: 0, transformOrigin: "0 50%", duration: 1, ease: "expo.out", delay: 0.35 });
        gsap.from(el.querySelectorAll("[data-panel-in]"), { y: 26, autoAlpha: 0, duration: 0.8, ease: "expo.out", stagger: 0.06, delay: 0.45, clearProps: "transform,opacity,visibility" });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
}

export interface PanelLink {
  href: string;
  label: string;
}

/**
 * Cửa sổ nội dung của một khu: "khung tên" kiểu bản vẽ ở đầu, vùng cuộn riêng, nút đóng, trước/sau.
 * Là nội dung của route (không phải dialog): không khóa focus. Esc về route cha; khi điều hướng phía client,
 * focus chuyển vào tiêu đề h1 để trình đọc màn hình đọc nội dung mới.
 */
export function Panel({
  zone,
  eyebrow,
  title,
  closeHref,
  prev,
  next,
  children,
}: {
  zone: ZoneId;
  /** Dòng nhãn mono ở khung tên, ví dụ "SẢN PHẨM /01 · WEBSITE TUYỂN SINH" */
  eyebrow?: string;
  /** Tiêu đề h1; *dấu sao* = serif nghiêng */
  title: string;
  closeHref: string;
  prev?: PanelLink;
  next?: PanelLink;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const router = useRouter();
  usePanelEnter(ref);
  // Sheet mobile có 3 nấc cao (thấp / vừa / hết cỡ); ở nấc hết cỡ cảnh 3D phía sau được tạm dừng
  const [snap, setSnap] = useState<"low" | "mid" | "full">("mid");
  const dragStart = useRef<number | null>(null);

  const cycle = (direction: 1 | -1) => {
    const order = ["low", "mid", "full"] as const;
    setSnap((current) => order[Math.max(0, Math.min(order.length - 1, order.indexOf(current) + direction))]);
  };
  const onHandleDown = (event: ReactPointerEvent) => {
    dragStart.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onHandleUp = (event: ReactPointerEvent) => {
    if (dragStart.current === null) return;
    const dy = event.clientY - dragStart.current;
    dragStart.current = null;
    if (Math.abs(dy) < 12) cycle(snap === "full" ? -1 : 1);
    else cycle(dy < 0 ? 1 : -1);
  };

  useEffect(() => {
    if (snap !== "full" || !window.matchMedia("(max-width: 63.99rem)").matches) return;
    spaceStore.hold("sheet-full");
    return () => spaceStore.release("sheet-full");
  }, [snap]);

  useEffect(() => {
    if (spaceStore.get().navigated) titleRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("[role='dialog'], input, textarea, select")) return;
      router.push(closeHref);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, closeHref]);

  const z = zoneById[zone];
  return (
    <section ref={ref} className="space-panel" aria-label={z.name} data-zone={zone} data-snap={snap}>
      <button
        type="button"
        className="space-handle"
        aria-label="Đổi độ cao khung nội dung"
        onPointerDown={onHandleDown}
        onPointerUp={onHandleUp}
        onKeyDown={(event) => {
          if (event.key === "ArrowUp") cycle(1);
          if (event.key === "ArrowDown") cycle(-1);
        }}
      >
        <span aria-hidden />
      </button>
      <header className="space-panel-bar">
        <p className="space-eyebrow label text-muted">
          <span className="text-accent">{z.sheet}</span> · {eyebrow ?? z.name}
        </p>
        <Link href={closeHref} className="space-close label" aria-label={spaceCopy.hud.close} data-cursor="link">
          {spaceCopy.hud.close} ✕
        </Link>
        <span aria-hidden data-panel-line className="space-line" />
      </header>

      <div className="space-panel-scroll" data-panel-scroll data-lenis-prevent="">
        <h1 ref={titleRef} tabIndex={-1} data-panel-in className="space-panel-title text-h3 font-semibold outline-none">
          <Rich text={title} />
        </h1>
        {children}
      </div>

      {(prev || next) && (
        <nav className="space-panel-foot" aria-label="Chuyển mục">
          {prev ? (
            <Link href={prev.href} className="space-step label">
              <span aria-hidden>←</span> {prev.label}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={next.href} className="space-step label">
              {next.label} <span aria-hidden>→</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </section>
  );
}
