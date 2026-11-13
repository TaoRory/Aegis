import type { ReactNode } from "react";

import { D2Motion } from "@/components/demo2/D2Motion";
import { d2Sans } from "@/components/demo2/fonts";
import { ThemeGuard } from "@/components/layout/ThemeGuard";

import "@/styles/demo2.css";

/**
 * /demo2 — bản thiết kế hướng "Growth" (tài sản số, ba gói Own / Grow / Amplify), tiếng Anh là chính, tiếng Việt ở /demo2/vi.
 * Chờ duyệt, không lập chỉ mục. Vỏ riêng (.d2), con trỏ gốc, không có rèm chuyển trang của trang chính (data-no-cover).
 * Header và footer do từng trang dựng qua D2Shell vì chúng phụ thuộc ngôn ngữ.
 */
export default function Demo2Layout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className={`d2 ${d2Sans.variable}`} data-no-cover>
      <ThemeGuard />
      <D2Motion />
      {children}
    </div>
  );
}
