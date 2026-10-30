/**
 * Theme sáng/tối của trang chính. MẶC ĐỊNH LÀ SÁNG. Lưu lựa chọn "tối" trong localStorage ("aegis-theme" = "dark"); script đầu trang
 * (app/layout.tsx) đặt html[data-theme] = "light" | "dark" trước khi vẽ. Factory và các mẫu demo không có thuộc tính này (giữ bảng màu riêng).
 */
import { themeMeta } from "@/styles/theme-meta";

export const THEME_KEY = "aegis-theme";
export const THEME_EVENT = "aegis:theme";

export type Theme = "dark" | "light";

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  // Thanh trình duyệt và control native đổi theo theme đã chọn (meta theme-color của layout chỉ theo hệ điều hành)
  root.style.colorScheme = theme;
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", themeMeta[theme]));
  try {
    if (theme === "dark") localStorage.setItem(THEME_KEY, "dark");
    else localStorage.removeItem(THEME_KEY);
  } catch {}
  window.dispatchEvent(new Event(THEME_EVENT));
}
