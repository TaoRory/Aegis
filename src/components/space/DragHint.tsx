"use client";

import { useSpace } from "@/components/space/useSpace";
import { useFactory } from "@/components/space/factory-context";

/** Gợi ý cử chỉ trên điện thoại ("Kéo để nhìn quanh"), tự ẩn sau lần kéo đầu tiên */
export function DragHint() {
  const { ui } = useFactory();
  const mode = useSpace("mode");
  const staged = useSpace("staged");
  const dragged = useSpace("dragged");
  const zone = useSpace("zone");
  // Chỉ gợi ý ở tổng quan, cho tới khi người dùng tự thao tác camera lần đầu
  if (mode !== "3d" || !staged || dragged || zone !== "hub") return null;
  return (
    <div aria-hidden className="space-drag-hint">
      <span className="space-drag-chev">‹</span>
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="space-drag-hand">
        <path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0v4.5A6.5 6.5 0 0 1 11.5 21h-1A6 6 0 0 1 6 18.8L3.6 15.6a1.6 1.6 0 0 1 2.4-2L9 15.5" />
      </svg>
      <span className="space-drag-chev">›</span>
      <span className="space-drag-text label">
        <span className="space-drag-text-mouse">{ui.hud.dragHint}</span>
        <span className="space-drag-text-touch">{ui.hud.dragHintTouch}</span>
      </span>
    </div>
  );
}
