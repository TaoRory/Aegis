import { Bricolage_Grotesque, JetBrains_Mono, Newsreader } from "next/font/google";

/**
 * Font TẠM THỜI (chưa phải nhận diện chính thức). Cả ba có subset tiếng Việt.
 * Đổi font: thay import ở đây, giữ nguyên tên `variable` để tokens.css tiếp tục hoạt động.
 */

/** Display + body: grotesk có cá tính, trục opsz/wdth */
export const brandSans = Bricolage_Grotesque({
  subsets: ["latin", "vietnamese"],
  axes: ["opsz", "wdth"],
  variable: "--font-brand-sans",
  display: "swap",
});

/** Serif nghiêng cho từ khóa cảm xúc */
export const brandSerif = Newsreader({
  subsets: ["latin", "vietnamese"],
  style: ["italic"],
  axes: ["opsz"],
  variable: "--font-brand-serif",
  display: "swap",
});

/** Mono cho nhãn, chỉ số, metadata */
export const brandMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500"],
  variable: "--font-brand-mono",
  display: "swap",
});

export const fontVariables = [brandSans.variable, brandSerif.variable, brandMono.variable].join(" ");
