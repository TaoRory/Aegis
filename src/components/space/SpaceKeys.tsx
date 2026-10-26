"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { setSpaceMode } from "@/components/space/SceneCanvas";
import { spaceStore } from "@/components/space/space-store";
import { useFactory } from "@/components/space/factory-context";
import { navOthers, navServices } from "@/config/space";

/**
 * Phím tắt toàn Xưởng: 1–8 mở khu theo thanh điều hướng, M về tổng quan, ? mở bảng phím tắt. B đổi 3D/phẳng. (Esc do Panel xử lý.)
 * Tắt khi đang gõ vào ô nhập hoặc khi focus đang nằm trong nội dung <main> (tránh đụng phím số của form liên hệ).
 */
/** Thứ tự phím số theo thanh điều hướng: bốn dịch vụ rồi các khu còn lại */
const keyZones = [...navServices, ...navOthers];

export function SpaceKeys() {
  const router = useRouter();
  const { href } = useFactory();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        // Chuyển giữa các mục (dự án, nguyên mẫu). Khác phím số: vẫn dùng được khi focus đang ở trong khung nội dung,
        // nhưng nhường cho ô nhập, thanh trượt và sân chơi của nguyên mẫu (chúng tự dùng phím mũi tên).
        if (target?.closest("input, textarea, select, [contenteditable='true'], [role='slider'], [role='dialog'], .space-lab-stage")) return;
        const want = event.key === "ArrowRight" ? "next" : "prev";
        const link = [...document.querySelectorAll<HTMLElement>(`.space-panel [data-step="${want}"]`)].find((el) => el.getClientRects().length > 0);
        if (link) {
          event.preventDefault();
          link.click();
        }
        return;
      }
      if (target?.closest("input, textarea, select, [contenteditable='true'], main, [role='dialog']")) return;
      const index = Number(event.key);
      if (index >= 1 && index <= keyZones.length) {
        router.push(href(keyZones[index - 1].path));
        return;
      }
      if (event.key.toLowerCase() === "m") router.push(href());
      if (event.key.toLowerCase() === "b") setSpaceMode(spaceStore.get().mode === "3d" ? "flat" : "3d");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, href]);

  return null;
}

/** Nút "Phím tắt" + bảng nhỏ (không khóa focus); Esc hoặc bấm ra ngoài để đóng. */
export function ShortcutsHelp() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    };
    const onDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const { ui } = useFactory();
  const rows = ui.hud.shortcutRows;

  return (
    <div ref={rootRef} className="relative hidden lg:block">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="space-home label"
      >
        {ui.hud.shortcuts}
      </button>
      <div id={panelId} role="dialog" aria-label={ui.hud.shortcuts} hidden={!open} className="space-shortcuts">
        <dl>
          {rows.map(([key, text]) => (
            <div key={key}>
              <dt className="label text-accent">{key}</dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
