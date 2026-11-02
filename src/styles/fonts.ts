import { JetBrains_Mono, Newsreader, Plus_Jakarta_Sans } from "next/font/google";

/**
 * Font chính theo Brand Guideline: Plus Jakarta Sans (có subset tiếng Việt). Serif nghiêng và mono giữ cho nhấn nhá / nhãn kỹ thuật.
 * Đổi font: thay import ở đây, giữ nguyên tên `variable` để tokens.css tiếp tục hoạt động.
 */

/** Display + body: Plus Jakarta Sans (biến thiên trục wght 200–800) */
export const brandSans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
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
