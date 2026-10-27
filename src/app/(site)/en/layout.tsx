import type { ReactNode } from "react";

import { SiteShell } from "@/components/layout/SiteShell";

/** Các trang tiếng Anh của website Aegis (/en, /en/web, /en/contact…): cùng vỏ với bản tiếng Việt */
export default function EnSiteLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <SiteShell lang="en">{children}</SiteShell>;
}
