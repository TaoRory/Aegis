import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/** Sitemap chỉ có nội dung khi đã khai báo NEXT_PUBLIC_SITE_URL */
export default function sitemap(): MetadataRoute.Sitemap {
  // Trang mẫu demo đặt noindex nên không đưa vào sitemap
  return siteConfig.url
    ? [
        { url: siteConfig.url, changeFrequency: "monthly", priority: 1 },
        { url: `${siteConfig.url}/mau-giao-dien`, changeFrequency: "monthly", priority: 0.7 },
        { url: `${siteConfig.url}/lien-he`, changeFrequency: "yearly", priority: 0.6 },
      ]
    : [];
}
