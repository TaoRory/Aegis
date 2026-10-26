import type { ReactNode } from "react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

/** Các trang của website Aegis (trang chủ, thư viện mẫu): header + footer của Aegis */
export default function SiteLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <Header />
      <main id="noi-dung" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
    </>
  );
}
