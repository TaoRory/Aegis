import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { d3Href, d3Projects, getD3 } from "@/content/demo3";
import { d3Posts } from "@/lib/demo3-blog";

/**
 * Sitemap của website chính (bản demo3: tiếng Anh ở gốc, tiếng Việt ở /vi). Chỉ có nội dung khi biết tên miền (siteConfig.url).
 * Trang có bản song song cùng địa chỉ: một mục cho mỗi ngôn ngữ, kèm hreflang en / vi / x-default (→ en).
 * Bài blog mỗi ngôn ngữ một slug riêng nên chỉ có mục của chính nó. Các bản demo cũ, thư viện mẫu và Factory không đưa vào.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  if (!base) return [];
  const abs = (path: string) => `${base}${path === "/" ? "" : path}`;
  const pair = (path: string, changeFrequency: "weekly" | "monthly" | "yearly", priority: number): MetadataRoute.Sitemap => {
    const languages = { en: abs(d3Href("en", path)), vi: abs(d3Href("vi", path)), "x-default": abs(d3Href("en", path)) };
    return (["en", "vi"] as const).map((lang) => ({ url: abs(d3Href(lang, path)), changeFrequency, priority, alternates: { languages } }));
  };
  const t = getD3("en");
  return [
    ...pair("", "monthly", 1),
    ...["/services", "/plans", "/work", "/process", "/about", "/blog", "/contact"].flatMap((path) => pair(path, "monthly", 0.8)),
    ...t.services.items.flatMap((service) => pair(`/services/${service.id}`, "monthly", 0.7)),
    ...d3Projects("en").flatMap((project) => pair(`/work/${project.slug}`, "yearly", 0.6)),
    ...(["en", "vi"] as const).flatMap((lang) => d3Posts(lang).map((post) => ({ url: abs(d3Href(lang, `/blog/${post.slug}`)), changeFrequency: "yearly" as const, priority: 0.5 }))),
  ];
}
