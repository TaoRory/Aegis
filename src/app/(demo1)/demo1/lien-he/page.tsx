import type { Metadata } from "next";

import { ContactWizard } from "@/components/contact/ContactWizard";
import { siteConfig } from "@/config/site";
import { d1 } from "@/content/demo1";
import { isContactDeliveryConfigured } from "@/lib/contact/delivery";

export const metadata: Metadata = {
  title: "Phiếu yêu cầu",
  description: d1.contact.pageLead,
  robots: { index: false, follow: false },
};

/**
 * /demo1/lien-he: dùng lại đúng bộ câu hỏi từng bước của trang chính (gửi thật qua src/lib/contact/delivery.ts,
 * không giả lập thành công), chỉ đổi vỏ sang ngôn ngữ /demo1. Hạng mục chọn sẵn qua ?dv=.
 */
export default function Demo1ContactPage() {
  const { contact } = d1;
  const { email, phone, address } = siteConfig.contact;
  return (
    <section aria-labelledby="d1-contact-title" className="d1-wrap pt-[clamp(2rem,1.2rem+3vw,4.5rem)] pb-(--d1-section)">
      <div className="d1-grid gap-y-6 border-b border-line pb-10">
        <h1 id="d1-contact-title" className="d1-h2 col-span-12 lg:col-span-7">
          {contact.pageTitle[0]} <span className="d1-faint">{contact.pageTitle[1]}</span>
        </h1>
        <p className="col-span-12 max-w-[30rem] text-muted lg:col-span-4 lg:col-start-9 lg:self-end">{contact.pageLead}</p>
      </div>

      <div className="mt-12 lg:mt-16">
        <ContactWizard isConfigured={isContactDeliveryConfigured()} lang="vi" sheetCode="" />
      </div>

      {(email || phone || address) && (
        <dl className="mt-16 grid gap-6 border-t border-line pt-8 sm:grid-cols-3">
          {email && (
            <div>
              <dt className="d1-label text-muted">{contact.channels.email}</dt>
              <dd className="mt-2">
                <a href={`mailto:${email}`} className="d1-link">
                  {email}
                </a>
              </dd>
            </div>
          )}
          {phone && (
            <div>
              <dt className="d1-label text-muted">{contact.channels.phone}</dt>
              <dd className="mt-2">
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="d1-link">
                  {phone}
                </a>
              </dd>
            </div>
          )}
          {address && (
            <div>
              <dt className="d1-label text-muted">{contact.channels.address}</dt>
              <dd className="mt-2">{address}</dd>
            </div>
          )}
        </dl>
      )}
    </section>
  );
}
