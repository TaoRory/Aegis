/**
 * Theme sáng/tối của trang chính. MẶC ĐỊNH LÀ SÁNG. Lưu lựa chọn "tối" trong localStorage ("aegis-theme" = "dark"); script đầu trang
 * (app/layout.tsx) đặt html[data-theme] = "light" | "dark" trước khi vẽ. Factory và các mẫu demo không có thuộc tính này (giữ bảng màu riêng).
 */
export const THEME_KEY = "aegis-theme";
export const THEME_EVENT = "aegis:theme";

export type Theme = "dark" | "light";

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    if (theme === "dark") localStorage.setItem(THEME_KEY, "dark");
    else localStorage.removeItem(THEME_KEY);
  } catch {}
  window.dispatchEvent(new Event(THEME_EVENT));
}
