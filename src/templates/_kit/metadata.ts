import type { Metadata } from "next";

import { getTemplate, templateNotice } from "@/content/templates";

/**
 * Metadata cho trang mẫu demo. Đặt noindex để thương hiệu giả định không xuất hiện
 * trên công cụ tìm kiếm như một doanh nghiệp thật; thư viện mẫu vẫn được index.
 */
export function demoMetadata(slug: string): Metadata {
  const { template } = getTemplate(slug);
  return {
    title: `Style ${template.name}: ${template.industry} (mẫu demo ${template.brand})`,
    description: `${template.idea} ${templateNotice}`,
    robots: { index: false, follow: true },
  };
}
