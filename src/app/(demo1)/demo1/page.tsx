import type { Metadata } from "next";

import { D1About, D1ContactCta, D1Faq, D1Hero, D1Process, D1ServicesSection, D1Work } from "@/components/demo1/D1Sections";
import { d1 } from "@/content/demo1";

/** Bản demo chờ duyệt: không lập chỉ mục, không có trong sitemap */
export const metadata: Metadata = {
  title: { absolute: d1.meta.title },
  description: d1.meta.description,
  robots: { index: false, follow: false },
};

export default function Demo1Page() {
  return (
    <>
      <D1Hero />
      <D1About />
      <D1ServicesSection />
      <D1Work />
      <D1Process />
      <D1Faq />
      <D1ContactCta />
    </>
  );
}
