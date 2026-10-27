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
 * - data-space="on" ở /factory, /web/factory và bản /en của chúng (Factory): khóa cuộn cửa sổ ngay từ khung hình đầu, trước khi React chạy;
 *   mọi địa chỉ dưới /en đặt html[lang="en"] để trình đọc màn hình đọc đúng ngôn ngữ
 *   (không dùng regex trong chuỗi này: dấu gạch chéo ngược trong template literal bị mất)
 * - data-space-boot="playing" khi vào đúng trang tổng quan của Factory lần đầu trong phiên (và không giảm chuyển động): màn khởi động; link sâu thì không có
 */
const bootScript = `(function(){var d=document.documentElement;d.dataset.js='on';var p=location.pathname,parts=p.split('/').filter(Boolean),en=parts[0]==='en',rest=en?parts.slice(1):parts,fi=rest[0]==='web'?1:0,f=rest[fi]==='factory';if(f)d.dataset.space='on';if(en)d.lang='en';try{var q=localStorage.getItem('aegis-quality');if(q==='low')d.dataset.quality='low';if(localStorage.getItem('aegis-cursor')==='off')d.dataset.cursorPref='off';}catch(e){}if(!f&&!(parts[0]==='mau-giao-dien'&&parts.length>1)){d.dataset.theme='light';try{if(localStorage.getItem('aegis-theme')==='dark')d.dataset.theme='dark';}catch(e){}}try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.dataset.motion='on';if(f&&rest.length===fi+1&&!sessionStorage.getItem('aegis-factory-boot'))d.dataset.spaceBoot='playing';if(parts.length===(en?1:0)&&!sessionStorage.getItem('aegis-intro'))d.dataset.intro='playing';}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="vi" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body data-surface="dark">
        {/* Nút "Bỏ qua đến nội dung chính" nằm trong vỏ của từng khu vực (SiteShell, SpaceShell, DemoLayout) để đúng ngôn ngữ */}
        <MotionProvider />
        {children}
        <Cursor />
      </body>
    </html>
  );
}
