import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { SpaceShell } from "@/components/space/SpaceShell";
import { hasLocale, locales } from "@/config/space";
import { getFactoryDict } from "@/content/factory";
import "@/styles/space.css";

type Params = Promise<{ lang: string }>;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

/**
 * Factory "Aegis Foundation" (phiên bản 2 của website): không gian nhiều phần thay cho trang cuộn dài, song ngữ.
 * Layout giữ vỏ cố định (mặt bằng/cảnh 3D, HUD) qua mọi route con; mỗi trang chỉ cung cấp Panel nội dung.
 * Chạy song song với trang chủ: noindex, không nằm trong sitemap.
 */
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { ui, meta } = getFactoryDict(lang);
  return {
    title: { default: ui.name, template: `%s — ${ui.name}` },
    description: meta.description,
    robots: { index: false, follow: true },
    alternates: { languages: { vi: "/factory", en: "/en/factory" } },
  };
}

export default function FactoryLayout({ children, params }: { children: ReactNode; params: Params }) {
  return (
    <Suspense fallback={null}>
      <LocalizedShell params={params}>{children}</LocalizedShell>
    </Suspense>
  );
}

async function LocalizedShell({ children, params }: { children: ReactNode; params: Params }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return <SpaceShell ui={getFactoryDict(lang).ui}>{children}</SpaceShell>;
}
