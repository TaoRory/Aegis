"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";

import type { SettingsCopy } from "@/content/settings-copy";
import { cn } from "@/lib/cn";

/**
 * Cài đặt hiệu ứng (kiểu Emotion "Settings"): chất lượng đồ họa và con trỏ riêng.
 * Lưu trong localStorage; script đầu trang (layout.tsx) đọc và đặt html[data-quality] / html[data-cursor-pref] trước khi vẽ.
 * Đổi cài đặt thì tải lại trang để các engine WebGL dựng lại đúng cấu hình.
 *   quality: "low" → hạt ít hơn, không khói theo chuột, thư viện style dùng vòng 3D bằng CSS
 *   cursor:  "off" → dùng con trỏ gốc của trình duyệt
 */

const STORAGE = { quality: "aegis-quality", cursor: "aegis-cursor" } as const;

type Quality = "high" | "low";
type CursorPref = "on" | "off";

const subscribe = () => () => {};
const readKey = () =>
  `${document.documentElement.dataset.quality === "low" ? "low" : "high"}|${document.documentElement.dataset.cursorPref === "off" ? "off" : "on"}`;
const serverKey = () => "high|on";

export function SettingsMenu({ copy, inline = false, className }: { copy: SettingsCopy; inline?: boolean; className?: string }) {
  const [open, setOpen] = useState(false);
  const [quality, cursor] = useSyncExternalStore(subscribe, readKey, serverKey).split("|") as [Quality, CursorPref];
  const values = { quality, cursor };
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open || inline) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus(); // trả focus về nút mở để người dùng bàn phím không bị rơi ra đầu trang
    };
    const onDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open, inline]);

  const apply = (key: keyof typeof STORAGE, value: string) => {
    const defaults = { quality: "high", cursor: "on" } as const;
    try {
      if (value === defaults[key]) localStorage.removeItem(STORAGE[key]);
      else localStorage.setItem(STORAGE[key], value);
    } catch {}
    window.location.reload();
  };

  const group = (key: keyof typeof STORAGE, label: string, hint: string, options: { value: string; label: string }[]) => (
    <div>
      <p className="label text-muted">{label}</p>
      <div role="group" aria-label={label} className="mt-2 flex gap-2">
        {options.map((option) => {
          const pressed = values[key] === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={pressed}
              onClick={() => !pressed && apply(key, option.value)}
              className={cn(
                "label h-9 flex-1 rounded-sm border px-3 transition-colors",
                pressed ? "border-fg bg-fg text-bg" : "border-line-strong text-muted hover:border-fg hover:text-fg",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-subtle">{hint}</p>
    </div>
  );

  const body = (
    <div className="space-y-5">
      {group("quality", copy.quality.label, copy.quality.hint, [
        { value: "high", label: copy.quality.high },
        { value: "low", label: copy.quality.low },
      ])}
      {group("cursor", copy.cursor.label, copy.cursor.hint, [
        { value: "on", label: copy.cursor.on },
        { value: "off", label: copy.cursor.off },
      ])}
      <p className="text-xs leading-relaxed text-subtle">{copy.reload}</p>
    </div>
  );

  if (inline) {
    return (
      <div className={cn("border-t border-line pt-5", className)}>
        <p className="label mb-4 text-accent">{copy.title}</p>
        {body}
      </div>
    );
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="btn btn-box label h-10 border border-line-strong px-4 text-fg hover:border-fg"
      >
        {copy.button}
      </button>
      <div
        id={panelId}
        role="dialog"
        aria-label={copy.title}
        hidden={!open}
        data-surface="dark"
        className="absolute top-[calc(100%+0.6rem)] right-0 z-50 w-72 rounded-sm border border-line-strong bg-bg p-5 text-fg shadow-none"
      >
        {body}
      </div>
    </div>
  );
}
