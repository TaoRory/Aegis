import type { MetadataRoute } from "next";

import { contactHref, homeHref, serviceHref, templatesHref } from "@/config/routes";
import { locales, type Locale } from "@/config/space";
import { siteConfig } from "@/config/site";
import { serviceIds } from "@/config/space";

/** Sitemap chỉ có nội dung khi đã khai báo NEXT_PUBLIC_SITE_URL. Hai ngôn ngữ có hreflang qua alternates. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  if (!base) return [];
  const page = (path: (lang: Locale) => string, changeFrequency: "monthly" | "yearly", priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${base}${path("vi") === "/" ? "" : path("vi")}`,
    changeFrequency,
    priority,
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${base}${path(l) === "/" ? "" : path(l)}`])) },
  });
  // Trang mẫu demo và Factory đặt noindex nên không đưa vào sitemap
  return [
    page(homeHref, "monthly", 1),
    ...serviceIds.map((id) => page((l) => serviceHref(l, id), "monthly", id === "web" ? 0.8 : 0.7)),
    page(templatesHref, "monthly", 0.6),
    page((l) => contactHref(l), "yearly", 0.6),
  ];
}
