import type { ReactNode } from "react";

import { D1DetailsHash } from "@/components/demo1/D1DetailsHash";
import { D1Footer } from "@/components/demo1/D1Footer";
import { D1Header } from "@/components/demo1/D1Header";
import { D1Quick } from "@/components/demo1/D1Quick";
import { d1Fonts } from "@/components/demo1/fonts";
import { ThemeGuard } from "@/components/layout/ThemeGuard";
import { d1 } from "@/content/demo1";

import "@/styles/demo1.css";

/**
 * /demo1 — bản thiết kế tối giản của website Aegis (chờ duyệt, không lập chỉ mục).
 * Vỏ riêng: header nổi + nút lối tắt "+", footer riêng, font riêng, token riêng (.d1), con trỏ gốc (Cursor.tsx bỏ qua /demo1),
 * không có rèm chuyển trang của trang chính (data-no-cover).
 */
export default function Demo1Layout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className={`d1 ${d1Fonts}`} data-no-cover>
      <ThemeGuard />
      <a href="#d1-main" className="d1-skip">
        {d1.chrome.skip}
      </a>
      <D1Header />
      <main id="d1-main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <D1Footer />
      <D1Quick />
      <D1DetailsHash />
    </div>
  );
}
