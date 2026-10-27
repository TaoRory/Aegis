import { notFound } from "next/navigation";

import { factoryHref, hasLocale, type Locale, type Variant } from "@/config/space";
import { getFactoryDict, type FactoryDict } from "@/content/factory";

export type LangParams = Promise<{ lang: string }>;

/** Đọc ngôn ngữ từ params (404 nếu không hỗ trợ) và trả về nội dung tương ứng */
export async function resolveLang(params: LangParams, variant: Variant = "neutral"): Promise<{ lang: Locale; dict: FactoryDict; href: (sub?: string) => string }> {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return { lang, dict: getFactoryDict(lang), href: (sub = "") => factoryHref(lang, sub, variant) };
}

/** Tiêu đề trang theo ngôn ngữ (dùng trong generateMetadata) */
export async function titleFor(params: LangParams, pick: (dict: FactoryDict) => string) {
  const { lang } = await params;
  return hasLocale(lang) ? { title: pick(getFactoryDict(lang)) } : {};
}
