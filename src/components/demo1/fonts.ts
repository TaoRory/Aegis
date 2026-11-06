import { Chivo_Mono, Hanken_Grotesk } from "next/font/google";

/**
 * Bản thiết kế tối giản /demo1: một grotesk trung tính (Hanken Grotesk, gần tinh thần Neue Haas / BDO Grotesk của các studio
 * tham khảo) và một mono gọn cho nhãn, số thứ tự, metadata (Chivo Mono). Cả hai có subset tiếng Việt và KHÔNG nằm trong danh sách
 * font "dùng quá nhiều" của Impeccable (Inter, Geist, Mona Sans, Space Grotesk… là dấu hiệu website do AI dựng).
 * Chọn sau khi so bảng mẫu chữ tiếng Việt (Hanken, Archivo, Chivo, Familjen, Be Vietnam Pro, Reddit Sans, Public Sans).
 */
export const d1Sans = Hanken_Grotesk({
  subsets: ["latin", "vietnamese"],
  variable: "--font-d1-sans",
  display: "swap",
});

export const d1Mono = Chivo_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-d1-mono",
  display: "swap",
  // chỉ dùng cho nhãn nhỏ và hình ký tự, không phải chữ LCP
  preload: false,
});

export const d1Fonts = `${d1Sans.variable} ${d1Mono.variable}`;
