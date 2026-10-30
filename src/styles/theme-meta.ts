/**
 * Màu thanh trình duyệt (meta theme-color) cho hai theme của trang chính. Giữ khớp với --palette-bright và --palette-ink trong tokens.css.
 * Theme do người dùng chọn (không theo hệ điều hành) nên lib/theme.ts cập nhật thẻ meta khi đổi; đây là giá trị khởi tạo.
 */
export const themeMeta = {
  light: "#fbfaf6",
  dark: "#0d0e11",
} as const;
