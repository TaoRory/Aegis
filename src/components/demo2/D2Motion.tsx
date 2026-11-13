"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Chuyển động "trồi lên" khi phần tử vào màn hình cho /demo2.
 * Phần tử có `data-rise` chỉ bị dịch xuống / thu nhỏ nhẹ (KHÔNG ẩn: chữ luôn đọc được), vào màn hình thì nhận `data-in` và trượt về chỗ.
 * Trạng thái chờ chỉ áp dụng dưới html[data-motion="on"] (xem demo2.css) nên không JS / giảm chuyển động thì mọi thứ đứng yên đúng chỗ.
 */
export function D2Motion() {
  const pathname = usePathname();
  useEffect(() => {
    const nodes = [...document.querySelectorAll<HTMLElement>(".d2 [data-rise]:not([data-in])")];
    if (!nodes.length) return;
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.setAttribute("data-in", ""));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-in", "");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [pathname]);
  return null;
}
