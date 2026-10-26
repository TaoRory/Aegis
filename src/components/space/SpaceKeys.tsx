"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { navZones, SPACE_BASE } from "@/config/space";
import { spaceCopy } from "@/content/space";

/**
 * Phím tắt toàn Xưởng: 1–6 mở khu, M về tổng mặt bằng, ? mở bảng phím tắt. (Esc do Panel xử lý; B đổi 3D/phẳng do SpaceMode.)
 * Tắt khi đang gõ vào ô nhập hoặc khi focus đang nằm trong nội dung <main> (tránh đụng phím số của form liên hệ).
 */
export function SpaceKeys() {
  const router = useRouter();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true'], main, [role='dialog']")) return;
      const index = Number(event.key);
      if (index >= 1 && index <= navZones.length) {
        router.push(navZones[index - 1].route);
        return;
      }
      if (event.key.toLowerCase() === "m") router.push(SPACE_BASE);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

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

  const rows: [string, string][] = [
    ["1 – 6", "Mở khu tương ứng trên thanh điều hướng"],
    ["M", "Về tổng mặt bằng"],
    ["Esc", "Đóng khung nội dung"],
    ["B", `Đổi ${spaceCopy.hud.threeD} / ${spaceCopy.hud.flat}`],
    ["Kéo chuột", "Nhìn quanh trong cảnh 3D"],
  ];

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
        {spaceCopy.hud.shortcuts}
      </button>
      <div id={panelId} role="dialog" aria-label={spaceCopy.hud.shortcuts} hidden={!open} className="space-shortcuts">
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
