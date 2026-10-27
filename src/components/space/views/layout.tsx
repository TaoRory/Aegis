import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { SpaceShell } from "@/components/space/SpaceShell";
import { factoryHref, hasLocale, locales, type Variant } from "@/config/space";
import { getFactoryDict } from "@/content/factory";
import "@/styles/space.css";

export type LayoutParams = Promise<{ lang: string }>;

export function factoryStaticParams() {
  return locales.map((lang) => ({ lang }));
}

/**
 * Factory "Aegis Forge": không gian nhiều phần thay cho trang cuộn dài, song ngữ, hai bản (trung tính /factory, web /web/factory).
 * Layout giữ vỏ cố định (mặt bằng/cảnh 3D, HUD) qua mọi route con; mỗi trang chỉ cung cấp Panel nội dung.
 * Chạy song song với trang chủ: noindex, không nằm trong sitemap.
 */
export async function factoryMetadata(params: LayoutParams, variant: Variant): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { ui, meta } = getFactoryDict(lang);
  return {
    title: { default: ui.name, template: `%s — ${ui.name}` },
    description: meta.description,
    robots: { index: false, follow: true },
    alternates: { languages: { vi: factoryHref("vi", "", variant), en: factoryHref("en", "", variant) } },
  };
}

export function FactoryLayoutView({ children, params, variant }: { children: ReactNode; params: LayoutParams; variant: Variant }) {
  return (
    <Suspense fallback={null}>
      <LocalizedShell params={params} variant={variant}>
        {children}
      </LocalizedShell>
    </Suspense>
  );
}

async function LocalizedShell({ children, params, variant }: { children: ReactNode; params: LayoutParams; variant: Variant }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    <SpaceShell ui={getFactoryDict(lang).ui} variant={variant}>
      {children}
    </SpaceShell>
  );
}
