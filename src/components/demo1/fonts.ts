import { Geist_Mono, Mona_Sans } from "next/font/google";

/**
 * Bản thiết kế tối giản /demo1: một grotesk trung tính (Mona Sans, gần tinh thần Neue Haas / Suisse của các studio tham khảo)
 * và một mono gọn cho nhãn, số thứ tự, metadata (Geist Mono). Cả hai có subset tiếng Việt.
 * Chỉ nạp trục wght (không trục wdth) để file nhẹ.
 */
export const d1Sans = Mona_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-d1-sans",
  display: "swap",
});

export const d1Mono = Geist_Mono({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500"],
  variable: "--font-d1-mono",
  display: "swap",
  // chỉ dùng cho nhãn nhỏ và hình ký tự, không phải chữ LCP
  preload: false,
});

export const d1Fonts = `${d1Sans.variable} ${d1Mono.variable}`;
