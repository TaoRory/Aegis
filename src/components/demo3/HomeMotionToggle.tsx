"use client";

import { cx } from "@/lib/motion";

/**
 * Nút tạm dừng / chạy tiếp cho thứ tự chuyển động quá 5 giây (dải chữ chạy, nền động ở lời mời cuối).
 * Nhãn đổi theo trạng thái ("Tạm dừng…" ↔ "Chạy tiếp…") nên không dùng thêm aria-pressed.
 * CSS (.d3-motion-toggle) chỉ hiện nút khi trang đang bật chuyển động: không JS / giảm chuyển động thì không có gì để dừng.
 */
export function MotionToggle({ paused, labels, onToggle, className }: { paused: boolean; labels: { pause: string; play: string }; onToggle: () => void; className?: string }) {
  return (
    <button type="button" className={cx("d3-motion-toggle", className)} aria-label={paused ? labels.play : labels.pause} onClick={onToggle}>
      <svg viewBox="0 0 16 16" aria-hidden fill="currentColor">
        {paused ? <path d="M4.5 2.8v10.4L13 8z" /> : <path d="M4 3h2.6v10H4zM9.4 3H12v10H9.4z" />}
      </svg>
    </button>
  );
}
