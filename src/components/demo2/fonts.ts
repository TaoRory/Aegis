import { Hanken_Grotesk } from "next/font/google";

/**
 * /demo2: tiêu đề dùng Bricolage Grotesque (đã nạp ở layout gốc qua --font-brand-sans), nội dung dùng Hanken Grotesk.
 * Cả hai có subset tiếng Việt. Mono (JetBrains, --font-brand-mono) chỉ xuất hiện trong mô hình giao diện minh hoạ.
 */
export const d2Sans = Hanken_Grotesk({
  subsets: ["latin", "vietnamese"],
  variable: "--font-d2-sans",
  display: "swap",
});
