"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode, type RefObject } from "react";

import { spaceCopy } from "@/content/space";
import { zoneById, type ZoneId } from "@/config/space";
import { spaceStore } from "@/components/space/space-store";
import { useSpace } from "@/components/space/useSpace";
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

/** Nấc cao của sheet điện thoại; "auto" = mặc định theo chế độ (3D: chỉ nhô tiêu đề để cảnh chiếm màn hình, phẳng: vừa) */
type Snap = "auto" | "peek" | "low" | "mid" | "full";
const SNAP_ORDER = ["peek", "low", "mid", "full"] as const;

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
  step,
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
  /** Vị trí trong danh sách (hiện ở bộ chuyển mục nổi trên điện thoại): index tính từ 1 */
  step?: { index: number; total: number };
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const router = useRouter();
  usePanelEnter(ref);
  // Sheet điện thoại có nhiều nấc cao (nhô / thấp / vừa / hết cỡ); ở nấc hết cỡ cảnh 3D phía sau được tạm dừng.
  // Mặc định ở chế độ 3D là "nhô": cảnh chiếm gần cả màn hình, người dùng kéo/chạm tay nắm để đọc chi tiết.
  const mode = useSpace("mode");
  const [chosen, setChosen] = useState<Snap>("auto");
  const snap: Exclude<Snap, "auto"> = chosen === "auto" ? (mode === "3d" ? "peek" : "mid") : chosen;
  const dragStart = useRef<number | null>(null);

  const cycle = (direction: 1 | -1) => {
    setChosen(SNAP_ORDER[Math.max(0, Math.min(SNAP_ORDER.length - 1, SNAP_ORDER.indexOf(snap) + direction))]);
  };
  const onHandleDown = (event: ReactPointerEvent) => {
    dragStart.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onHandleUp = (event: ReactPointerEvent) => {
    if (dragStart.current === null) return;
    const dy = event.clientY - dragStart.current;
    dragStart.current = null;
    if (Math.abs(dy) < 12) setChosen(snap === "peek" || snap === "low" ? "mid" : snap === "mid" ? "full" : "mid");
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
        <span className="space-handle-label label">{snap === "peek" ? spaceCopy.hud.details : ""}</span>
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

      {step && (
        <nav className="space-stepper md:hidden" aria-label="Chuyển mục">
          {prev ? (
            <Link href={prev.href} className="space-stepper-btn" aria-label={`Mục trước: ${prev.label}`} data-cursor="link">
              <span aria-hidden>‹</span>
            </Link>
          ) : (
            <span className="space-stepper-btn" aria-hidden data-off="true">
              ‹
            </span>
          )}
          <span className="space-stepper-count label" aria-label={`${spaceCopy.hud.stepOf} ${step.index} / ${step.total}`}>
            {String(step.index).padStart(2, "0")} / {String(step.total).padStart(2, "0")}
          </span>
          {next ? (
            <Link href={next.href} className="space-stepper-btn" aria-label={`Mục sau: ${next.label}`} data-cursor="link">
              <span aria-hidden>›</span>
            </Link>
          ) : (
            <span className="space-stepper-btn" aria-hidden data-off="true">
              ›
            </span>
          )}
        </nav>
      )}

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
