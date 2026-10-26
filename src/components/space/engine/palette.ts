import { Color } from "three";

/**
 * Bảng màu của cảnh, đọc từ CSS token lúc chạy (không có mã màu trong engine): đổi theme ở tokens.css là cảnh đổi theo.
 * Giá trị dự phòng chỉ dùng khi token không đọc được.
 */
export interface Palette {
  ink: Color;
  inkRaised: Color;
  inkSurface: Color;
  accent: Color;
  accentLight: Color;
  accentPale: Color;
  paper: Color;
  graphite: Color;
  danger: Color;
}

function read(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new Color(/^#[0-9a-f]{3,8}$/i.test(value) ? value : fallback);
}

export function readPalette(): Palette {
  return {
    ink: read("--palette-ink", "#0d0e11"),
    inkRaised: read("--palette-ink-raised", "#15171c"),
    inkSurface: read("--palette-ink-surface", "#1d2027"),
    accent: read("--palette-ultramarine", "#3b3fff"),
    accentLight: read("--palette-ultramarine-light", "#8c8fff"),
    accentPale: read("--palette-ultramarine-pale", "#b5b7ff"),
    paper: read("--palette-paper", "#eceae4"),
    graphite: read("--palette-graphite-light", "#a3a6ae"),
    danger: read("--palette-danger-light", "#ff8a80"),
  };
}

/** Họ font thật của next/font (đã băm tên) để vẽ chữ lên canvas texture */
export function fontFamily(variable: "--font-brand-sans" | "--font-brand-mono" | "--font-brand-serif", fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return value || fallback;
}
