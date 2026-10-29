import type { MetadataRoute } from "next";

import { contactHref, homeHref, serviceHref, templatesHref } from "@/config/routes";
import { locales, type Locale } from "@/config/space";
import { siteConfig } from "@/config/site";
import { serviceIds } from "@/config/space";

/**
 * Sitemap chỉ có nội dung khi biết tên miền (siteConfig.url). Mỗi trang có một mục cho từng ngôn ngữ, kèm hreflang của cả bộ
 * (vi, en, x-default → vi) như Google khuyến nghị.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  if (!base) return [];
  const abs = (path: string) => `${base}${path === "/" ? "" : path}`;
  const page = (path: (lang: Locale) => string, changeFrequency: "monthly" | "yearly", priority: number): MetadataRoute.Sitemap => {
    const languages = { ...Object.fromEntries(locales.map((l) => [l, abs(path(l))])), "x-default": abs(path("vi")) };
    return locales.map((lang) => ({ url: abs(path(lang)), changeFrequency, priority, alternates: { languages } }));
  };
  // Trang mẫu demo và Factory đặt noindex nên không đưa vào sitemap
  return [
    ...page(homeHref, "monthly", 1),
    ...serviceIds.flatMap((id) => page((l) => serviceHref(l, id), "monthly", id === "web" ? 0.8 : 0.7)),
    ...page(templatesHref, "monthly", 0.6),
    ...page((l) => contactHref(l), "yearly", 0.6),
  ];
}
