import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { Cursor } from "@/components/motion/Cursor";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { siteConfig } from "@/config/site";
import { fontVariables } from "@/styles/fonts";
import { themeMeta } from "@/styles/theme-meta";
import "@/styles/globals.css";

const title = `${siteConfig.name} — Giải pháp công nghệ & marketing cho doanh nghiệp`;

export const metadata: Metadata = {
  ...(siteConfig.url && {
    metadataBase: new URL(siteConfig.url),
    alternates: { canonical: "/" },
  }),
  title: { default: title, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title,
    description: siteConfig.description,
    ...(siteConfig.url && { url: "/" }),
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  themeColor: themeMeta.themeColor,
};

/**
 * Chạy trước khi trang được vẽ:
 * - data-quality="low" / data-cursor-pref="off" khi người dùng đã chọn trong "Cài đặt" (localStorage)
 * - data-js="on" luôn đặt khi có JS (form liên hệ từng bước chỉ ẩn các câu khác dưới cờ này)
 * - data-motion="on" khi người dùng không bật giảm chuyển động (CSS chỉ ẩn phần tử chờ animation dưới cờ này)
 * - data-intro="playing" khi chưa xem preloader trong phiên này (chỉ ở trang chủ, nơi có preloader)
 * - data-space="on" ở /factory và /en/factory (Factory, phiên bản 2): khóa cuộn cửa sổ ngay từ khung hình đầu, trước khi React chạy;
 *   /en/factory cũng đặt html[lang="en"] để trình đọc màn hình đọc đúng ngôn ngữ
 * - data-space-boot="playing" khi vào đúng trang tổng quan của Factory lần đầu trong phiên (và không giảm chuyển động): màn khởi động; link sâu thì không có
 */
const bootScript = `(function(){var d=document.documentElement;d.dataset.js='on';var p=location.pathname,en=p.indexOf('/en/factory')===0,f=en||p.indexOf('/factory')===0;if(f)d.dataset.space='on';if(en)d.lang='en';try{var q=localStorage.getItem('aegis-quality');if(q==='low')d.dataset.quality='low';if(localStorage.getItem('aegis-cursor')==='off')d.dataset.cursorPref='off';}catch(e){}try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.dataset.motion='on';if((p==='/factory'||p==='/factory/'||p==='/en/factory'||p==='/en/factory/')&&!sessionStorage.getItem('aegis-factory-boot'))d.dataset.spaceBoot='playing';if(location.pathname==='/'&&!sessionStorage.getItem('aegis-intro'))d.dataset.intro='playing';}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="vi" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body data-surface="dark">
        <a
          href="#noi-dung"
          className="label fixed top-3 left-3 z-[100] -translate-y-24 bg-accent px-4 py-3 text-on-accent transition-transform focus:translate-y-0"
        >
          Bỏ qua đến nội dung chính
        </a>
        <MotionProvider />
        {children}
        <Cursor />
      </body>
    </html>
  );
}
