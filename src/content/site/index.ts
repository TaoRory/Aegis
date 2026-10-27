import type { Locale } from "@/config/space";
import { en } from "@/content/site/en";
import type { SiteDict } from "@/content/site/types";
import { vi } from "@/content/site/vi";
import { templates, type DemoTemplate } from "@/content/templates";

export type { SiteDict, SiteLink, TemplateText } from "@/content/site/types";

const dictionaries: Record<Locale, SiteDict> = { vi, en };

/** Nội dung trang chính theo ngôn ngữ (chỉ gọi ở Server Component; phần giao diện dùng chung được truyền xuống client qua getShellDict) */
export function getSiteDict(lang: Locale): SiteDict {
  return dictionaries[lang];
}

/** Phần chữ giao diện dùng chung cho header, cài đặt, màn chờ (truyền được sang client) */
export type SiteShellDict = Pick<SiteDict, "lang" | "chrome" | "nav" | "cta" | "settings" | "intro">;

export function getShellDict(lang: Locale): SiteShellDict {
  const { chrome, nav, cta, settings, intro } = dictionaries[lang];
  return { lang, chrome, nav, cta, settings, intro };
}

/** Các style mẫu với chữ mô tả theo ngôn ngữ (tên, thương hiệu, bảng màu, font không đổi) */
export function localizedTemplates(lang: Locale): DemoTemplate[] {
  const text = dictionaries[lang].templates;
  return templates.map((t) => ({ ...t, ...text[t.slug] }));
}

export { fill } from "@/lib/fill";
