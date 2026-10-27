import type { ReactNode } from "react";

import { SiteShell } from "@/components/layout/SiteShell";

/** Các trang tiếng Việt của website Aegis (trang chủ, dịch vụ, liên hệ, thư viện mẫu): header + footer của Aegis */
export default function ViSiteLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <SiteShell lang="vi">{children}</SiteShell>;
}
