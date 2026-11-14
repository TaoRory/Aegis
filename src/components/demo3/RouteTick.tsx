"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, ViewTransition } from "react";

/**
 * Điểm kích hoạt chuyển trang của /demo3, đặt ở LAYOUT (không bị gỡ khi đổi route).
 *
 * Vì sao cần: với cacheComponents, Next dựng sẵn trang đích trong một <Activity> ẩn rồi chỉ "bật hiện" khi điều hướng.
 * Bật hiện không phải là "gắn mới", nên <ViewTransition> đặt trong trang (PageTransition) không bao giờ được tính là "enter"
 * và React không gọi document.startViewTransition: hiệu ứng chuyển trang trong CSS chưa từng chạy (đo bằng Playwright, 2026-11).
 * Ở đây một <ViewTransition> mang key = đường dẫn được gắn mới ĐÚNG trong lần commit của điều hướng, nên React bắt đầu
 * một view transition (loại do D3Link đặt). Bản thân nó là một chấm vô hình, enter/exit "none": hiệu ứng thật nằm trên
 * ảnh chụp gốc ::view-transition-old/new(root) trong shell.css.
 *
 * Thêm một điều: React tự HUỶ ảnh chụp gốc (đặt view-transition-name: none lên <html>) khi nó cho rằng không có gì
 * ngoài các ranh giới <ViewTransition> thay đổi, mà lần "bật hiện" trang ở trên lại không được tính là thay đổi.
 * React chỉ huỷ khi <html> chưa có tên đặt trực tiếp, nên trong lúc /demo3 đang hiện ta đặt sẵn tên "root" (bỏ đi khi rời).
 */
export function RouteTick() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.style.viewTransitionName = "root";
    return () => {
      root.style.removeProperty("view-transition-name");
    };
  }, []);
  return (
    <ViewTransition key={pathname} enter="none" exit="none" default="none">
      <span aria-hidden className="vt-marker" />
    </ViewTransition>
  );
}
