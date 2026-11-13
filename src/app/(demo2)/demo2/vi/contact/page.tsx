import type { Metadata } from "next";
import Link from "next/link";

import { ContactWizard } from "@/components/contact/ContactWizard";
import { D2Shell } from "@/components/demo2/D2Page";
import { d2Home, getD2 } from "@/content/demo2";
import { isContactDeliveryConfigured } from "@/lib/contact/delivery";

const t = getD2("vi");

export const metadata: Metadata = {
  title: { absolute: `${t.contact.title} — Aegis` },
  description: t.contact.lead,
  robots: { index: false, follow: false },
};

/** Phiếu yêu cầu của /demo2: dùng lại đúng form từng bước của trang chính (gửi thật qua src/lib/contact/delivery.ts, không giả lập thành công) */
export default function Demo2Contact() {
  return (
    <D2Shell t={t} sub="/contact">
      <section aria-labelledby="d2-contact-title" className="d2-wrap d2-section-tight pb-(--d2-section)">
        <Link href={d2Home(t.lang)} className="d2-link d2-small">
          {t.contact.back}
        </Link>
        <h1 id="d2-contact-title" className="d2-h2 mt-5 max-w-[16em]">
          {t.contact.title}
        </h1>
        <p className="d2-lead mt-4">{t.contact.lead}</p>
        <div className="mt-12">
          <ContactWizard isConfigured={isContactDeliveryConfigured()} lang="vi" sheetCode="" />
        </div>
      </section>
    </D2Shell>
  );
}
