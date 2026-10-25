import type { ReactNode } from "react";

/**
 * Trang mẫu giao diện demo: mỗi mẫu là một "thương hiệu giả định" với giao diện riêng,
 * không dùng header/footer của Aegis. Thanh DemoBar (trong từng mẫu) ghi rõ đây là mẫu demo.
 */
export default function DemoLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <main id="noi-dung" tabIndex={-1} className="outline-none">
      {children}
    </main>
  );
}
