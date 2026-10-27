"use client";

import { useEffect } from "react";

/** Mẫu demo có bảng màu riêng của "thương hiệu giả định": gỡ theme sáng/tối của trang chính trong lúc xem, trả lại khi rời */
export function ThemeGuard() {
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.dataset.theme;
    delete root.dataset.theme;
    return () => {
      if (previous) root.dataset.theme = previous;
    };
  }, []);
  return null;
}
