"use client";

import { GalleryRing, type RingItem, type RingText } from "@/components/templates/GalleryRing";
import type { SiteDict } from "@/content/site/types";
import type { PreviewImage } from "@/content/types";

export type D2RingItem = RingItem & { href: string; text: RingText };

/**
 * Vòng xoay 3D của thư viện mẫu (GalleryRing, WebGL2 + vòng CSS dự phòng), dùng cho 7 dự án thật ở /demo2.
 * Dữ liệu (đường dẫn, chữ dock) tính sẵn ở server; ở đây chỉ nối thành hàm cho GalleryRing. Mở thẻ = sang trang dự án (không "phóng").
 */
export function D2Ring({ items, previews, copy }: { items: D2RingItem[]; previews: Record<string, { full: PreviewImage }>; copy: SiteDict["gallery"] }) {
  return <GalleryRing templates={items} previews={previews} copy={copy} variant="teaser" morph={false} hrefOf={(item) => item.href} describe={(item) => item.text} />;
}
