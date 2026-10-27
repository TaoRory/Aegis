import type { ReactNode } from "react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SiteLangProvider } from "@/components/layout/SiteLang";
import type { Locale } from "@/config/space";
import { getShellDict, getSiteDict } from "@/content/site";

/** Vỏ chung của các trang chính Aegis theo ngôn ngữ: nút bỏ qua, header, nội dung, footer (layout của từng ngôn ngữ gọi vào đây) */
export function SiteShell({ lang, children }: { lang: Locale; children: ReactNode }) {
  const dict = getSiteDict(lang);
  return (
    <SiteLangProvider shell={getShellDict(lang)}>
      <a
        href="#noi-dung"
        className="label fixed top-3 left-3 z-[100] -translate-y-24 bg-accent px-4 py-3 text-on-accent transition-transform focus:translate-y-0"
      >
        {dict.chrome.skip}
      </a>
      <Header />
      <main id="noi-dung" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer lang={lang} />
    </SiteLangProvider>
  );
}
