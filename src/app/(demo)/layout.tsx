import type { ReactNode } from "react";

import { ThemeGuard } from "@/components/layout/ThemeGuard";

/**
 * Trang mẫu giao diện demo: mỗi mẫu là một "thương hiệu giả định" với giao diện riêng,
 * không dùng header/footer của Aegis. Thanh DemoBar (trong từng mẫu) ghi rõ đây là mẫu demo.
 */
export default function DemoLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <ThemeGuard />
      <a
        href="#noi-dung"
        className="label fixed top-3 left-3 z-[100] -translate-y-24 bg-accent px-4 py-3 text-on-accent transition-transform focus:translate-y-0"
      >
        Bỏ qua đến nội dung chính
      </a>
      <main id="noi-dung" tabIndex={-1} className="outline-none">
        {children}
      </main>
    </>
  );
}
