import type { ReactNode } from "react";

import { d2Sans } from "@/components/demo2/fonts";
import { D3Intro } from "@/components/demo3/D3Intro";
import { RouteTick } from "@/components/demo3/RouteTick";
import { ThemeGuard } from "@/components/layout/ThemeGuard";

import "@/styles/demo2.css";
import "@/styles/motion-kit.css";
import "@/styles/demo3/base.css";
import "@/styles/demo3/shell.css";
import "@/styles/demo3/type.css";
import "@/styles/demo3/hero.css";
import "@/styles/demo3/home.css";
import "@/styles/demo3/services.css";
import "@/styles/demo3/plans.css";
import "@/styles/demo3/work.css";
import "@/styles/demo3/process.css";
import "@/styles/demo3/about.css";

/**
 * /demo3 — bản nâng cấp chuyển động của /demo2 (cùng nội dung và định vị), tiếng Anh là chính, tiếng Việt ở /demo3/vi.
 * Chờ duyệt, không lập chỉ mục. Dùng lại class nền .d2-* của /demo2 (vỏ mang cả hai class .d2 .d3); kiểu riêng nằm ở src/styles/demo3/.
 * Chuyển động theo bộ công thức aegis-web-kit (src/components/demo3/fx, src/styles/motion-kit.css): khối trồi lên bằng <Rise>.
 * Header và footer do từng trang dựng qua D3Shell vì chúng phụ thuộc ngôn ngữ.
 */
export default function Demo3Layout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className={`d2 d3 ${d2Sans.variable}`} data-no-cover>
      <ThemeGuard />
      {/* Intro thương hiệu: chỉ lần đầu của phiên, ở trang chủ; đặt trước nội dung để script của nó chạy trước khung hình đầu tiên */}
      <D3Intro />
      {/* Kích hoạt hiệu ứng chuyển trang mỗi lần đổi đường dẫn (xem RouteTick) */}
      <RouteTick />
      {children}
    </div>
  );
}
