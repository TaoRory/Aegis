/**
 * Màu thanh trình duyệt (meta theme-color) cho hai theme của trang chính. Giữ khớp với --palette-bright (Cloud Dancer)
 * và --palette-ink (Deep Ink Teal) trong tokens.css. Theme do người dùng chọn nên lib/theme.ts cập nhật thẻ meta khi đổi.
 */
export const themeMeta = {
  light: "#f5f7f6",
  dark: "#071f1e",
} as const;
