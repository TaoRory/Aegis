import type { ReactNode } from "react";

import { SiteIntro } from "@/components/intro/SiteIntro";
import { SiteLangProvider } from "@/components/layout/SiteLang";
import { getShellDict } from "@/content/site";

import "@/styles/showroom.css";

/**
 * Studio Aegis (/demo): toàn màn hình, không dùng header/footer của trang chính.
 * Nội dung nằm trong <main> để nút "Bỏ qua" và trình đọc màn hình tìm được.
 * Vào trang chạy intro logo của trang chính (SiteIntro; script đầu trang đặt data-intro cho /demo): lắp xong tự phóng (hoặc cuộn) xuyên lõi logo
 * là vào thẳng phòng 3D. Intro phải là con trực tiếp của <main> (phần còn lại của <main> tạm inert trong lúc intro chạy).
 */
export default function ShowroomLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <SiteLangProvider shell={getShellDict("vi")}>
      <a
        href="#noi-dung"
        className="label fixed top-3 left-3 z-[100] -translate-y-24 bg-accent-fill px-4 py-3 text-on-accent-fill transition-transform focus:translate-y-0"
      >
        Bỏ qua đến nội dung chính
      </a>
      <main id="noi-dung" tabIndex={-1} className="outline-none">
        <SiteIntro />
        {children}
      </main>
    </SiteLangProvider>
  );
}
