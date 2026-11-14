import { ContactWizard } from "@/components/contact/ContactWizard";
import type { D3Dict } from "@/content/demo3";
import { isContactDeliveryConfigured } from "@/lib/contact/delivery";

import { D3Shell } from "./D3Shell";

/** Phiếu yêu cầu: dùng lại đúng form từng bước của trang chính (gửi thật qua src/lib/contact/delivery.ts, không giả lập thành công) */
export function D3ContactPage({ t }: { t: D3Dict }) {
  return (
    <D3Shell t={t}>
      <section aria-labelledby="d2-contact-title" className="d2-wrap d2-pagehead pb-(--d2-section)">
        <h1 id="d2-contact-title" className="d2-h2 max-w-[16em]">
          {t.contact.title}
        </h1>
        <p className="d2-lead mt-4">{t.contact.lead}</p>
        <div className="mt-12">
          <ContactWizard isConfigured={isContactDeliveryConfigured()} lang={t.lang} sheetCode="" />
        </div>
      </section>
    </D3Shell>
  );
}
