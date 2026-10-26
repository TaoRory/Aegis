import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SpaceShell } from "@/components/space/SpaceShell";
import { spaceCopy } from "@/content/space";
import "@/styles/space.css";

/**
 * Xưởng Aegis (phiên bản 2 của website): không gian nhiều phần thay cho trang cuộn dài.
 * Layout giữ vỏ cố định (mặt bằng/cảnh 3D, HUD) qua mọi route con; mỗi trang chỉ cung cấp Panel nội dung.
 * Bản thử nghiệm: noindex, không nằm trong sitemap.
 */
export const metadata: Metadata = {
  title: { default: spaceCopy.name, template: `%s — ${spaceCopy.name}` },
  description: spaceCopy.hub.lead,
  robots: { index: false, follow: true },
};

export default function SpaceLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <SpaceShell>{children}</SpaceShell>;
}
