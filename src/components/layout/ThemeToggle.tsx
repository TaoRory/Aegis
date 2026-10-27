"use client";

import { useSyncExternalStore } from "react";

import { useSite } from "@/components/layout/SiteLang";
import { applyTheme, currentTheme, THEME_EVENT, type Theme } from "@/lib/theme";

const subscribe = (callback: () => void) => {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
};

/** Công tắc đổi theme tối/sáng của trang chính (kế bên nút VI | EN). Bấm để đổi, nhớ lựa chọn trong trình duyệt. */
export function ThemeToggle({ className }: { className?: string }) {
  const { chrome } = useSite();
  const theme = useSyncExternalStore<Theme>(subscribe, currentTheme, () => "dark");
  const next: Theme = theme === "light" ? "dark" : "light";
  return (
    <button
      type="button"
      className={`theme-toggle ${className ?? ""}`}
      aria-label={next === "light" ? chrome.theme.toLight : chrome.theme.toDark}
      title={next === "light" ? chrome.theme.toLight : chrome.theme.toDark}
      aria-pressed={theme === "light"}
      onClick={() => applyTheme(next)}
      data-cursor="link"
    >
      {theme === "light" ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      )}
    </button>
  );
}
