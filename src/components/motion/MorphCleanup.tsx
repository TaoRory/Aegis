"use client";

import { useEffect } from "react";

/**
 * Gỡ cờ html[data-morph-from] (do thư viện đặt trước khi mở một mẫu) sau khi hiệu ứng "thẻ phóng thành trang" kết thúc,
 * để lớp ảnh phủ của trang mẫu (.morph-target) trở lại ẩn. Đặt trong trang mẫu.
 */
export function MorphCleanup() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.dataset.morphFrom) return;
    const timer = window.setTimeout(() => delete root.dataset.morphFrom, 2200);
    return () => window.clearTimeout(timer);
  }, []);
  return null;
}
