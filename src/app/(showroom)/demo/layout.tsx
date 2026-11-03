import type { ReactNode } from "react";

import "@/styles/showroom.css";

/**
 * Studio Aegis (/demo): toàn màn hình, không dùng header/footer của trang chính.
 * Nội dung nằm trong <main> để nút "Bỏ qua" và trình đọc màn hình tìm được.
 */
export default function ShowroomLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <a
        href="#noi-dung"
        className="label fixed top-3 left-3 z-[100] -translate-y-24 bg-accent-fill px-4 py-3 text-on-accent-fill transition-transform focus:translate-y-0"
      >
        Bỏ qua đến nội dung chính
      </a>
      <main id="noi-dung" tabIndex={-1} className="outline-none">
        {children}
      </main>
    </>
  );
}
