import type { Metadata } from "next";

import { MARK_IMAGE } from "@/components/brand/mark-data";
import { Showroom } from "@/components/showroom/Showroom";
import previews from "@/content/project-previews.json";
import { projects } from "@/content/projects";
import { showroom } from "@/content/showroom";
import { isContactDeliveryConfigured } from "@/lib/contact/delivery";
import { optimizedImageUrl } from "@/lib/image-url";

/** Bản demo chờ duyệt: không lập chỉ mục, không có trong sitemap */
export const metadata: Metadata = {
  title: showroom.meta.title,
  description: showroom.meta.description,
  robots: { index: false, follow: false },
};

type Previews = Record<string, { cover: { src: string } }>;

export default function DemoPage() {
  const pv = previews as Previews;
  // Ảnh dự án cho màn hình và bảng ghim: bản thu nhỏ qua image optimizer (texture chỉ cần ~640px)
  const covers = projects.map((p) => pv[p.slug]?.cover.src).filter((src): src is string => !!src).map((src) => optimizedImageUrl(src, 640));
  return <Showroom isConfigured={isContactDeliveryConfigured()} covers={covers} emblem={MARK_IMAGE.small} />;
}
