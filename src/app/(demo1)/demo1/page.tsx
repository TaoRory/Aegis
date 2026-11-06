import type { Metadata } from "next";

import { D1Hero } from "@/components/demo1/D1Hero";
import { D1Ledger } from "@/components/demo1/D1Ledger";
import { D1Minimap } from "@/components/demo1/D1Minimap";
import { D1ProjectStack } from "@/components/demo1/D1ProjectStack";
import { D1ContactCta, D1Faq, D1Studio } from "@/components/demo1/D1Sections";
import { D1Services } from "@/components/demo1/D1Services";
import { D1Testimonials } from "@/components/demo1/D1Testimonials";
import { d1 } from "@/content/demo1";

/** Bản demo chờ duyệt: không lập chỉ mục, không có trong sitemap */
export const metadata: Metadata = {
  title: { absolute: d1.meta.title },
  description: d1.meta.description,
  robots: { index: false, follow: false },
};

/**
 * Trang chủ /demo1: mở đầu (logo ký tự, cánh cửa tối) → cách làm (sổ cái) → dịch vụ (bản vẽ ký tự) → dự án (chồng thẻ 3D)
 * → lời khách (khi có) → về Aegis → câu hỏi → lời mời. Bản đồ trang thu nhỏ ở góc phải (máy tính).
 */
export default function Demo1Page() {
  return (
    <>
      <D1Hero />
      <D1Ledger />
      <D1Services />
      <D1ProjectStack />
      <D1Testimonials />
      <D1Studio />
      <D1Faq />
      <D1ContactCta />
      <D1Minimap />
    </>
  );
}
