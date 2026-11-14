import type { Metadata } from "next";

import { d3Href, type D3Lang } from "@/content/demo3";

/**
 * Metadata chung của website chính (bản demo3: tiếng Anh ở gốc, tiếng Việt ở /vi).
 * `path` là phần sau tiền tố ngôn ngữ ("" = trang chủ). Có canonical cho chính trang đó và hreflang en / vi / x-default (→ en).
 * `paired = false` cho trang không có bản song song cùng địa chỉ (bài blog: mỗi ngôn ngữ một slug riêng) → chỉ canonical.
 * Đường dẫn tương đối: Next ghép với metadataBase (siteConfig.url) ở layout gốc.
 */
export const d3Meta = (title: string, description: string, lang: D3Lang, path: string, paired = true): Metadata => ({
  title: { absolute: title },
  description,
  alternates: {
    canonical: d3Href(lang, path),
    ...(paired && { languages: { en: d3Href("en", path), vi: d3Href("vi", path), "x-default": d3Href("en", path) } }),
  },
  openGraph: { title, description, url: d3Href(lang, path), locale: lang === "en" ? "en_US" : "vi_VN" },
});
