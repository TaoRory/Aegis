import { ContactWizard } from "@/components/contact/ContactWizard";
import { PageTransition } from "@/components/motion/PageTransition";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Lines } from "@/components/ui/Rich";
import type { Locale } from "@/config/space";
import { siteConfig } from "@/config/site";
import { getSiteDict } from "@/content/site";
import { isContactDeliveryConfigured } from "@/lib/contact/delivery";

/** Trang liên hệ (/lien-he và /en/contact): bộ câu hỏi từng bước, chọn hạng mục ở câu 1 hoặc nhận sẵn từ ?dv= */
export function ContactPageView({ lang }: { lang: Locale }) {
  const { contact } = getSiteDict(lang);
  const { email, phone, address } = siteConfig.contact;
  return (
    <>
      <PageTransition />
      <section
        data-surface="dark"
        aria-labelledby="lien-he-title"
        className="ink relative min-h-svh pt-[calc(var(--header-h)+var(--section-y)*0.5)] pb-(--section-y)"
      >
        <div aria-hidden className="blueprint-grid pointer-events-none absolute inset-x-0 top-0 h-[70svh]" />
        <div className="container-page relative">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <p className="label text-muted">{contact.pageLabel}</p>
            <p className="label hidden text-muted sm:block">{contact.sheet}</p>
          </div>
          <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-end">
            <SplitReveal as="h1" id="lien-he-title" className="text-h2 font-semibold lg:col-span-8">
              <Lines lines={contact.pageLines} />
            </SplitReveal>
            <p className="max-w-[28rem] text-lead text-muted lg:col-span-4 lg:justify-self-end">{contact.pageLead}</p>
          </div>

          <div className="mt-16 lg:mt-24">
            <ContactWizard isConfigured={isContactDeliveryConfigured()} lang={lang} />
          </div>

          {/* Kênh liên hệ trực tiếp: chỉ hiện các mục đã xác nhận trong siteConfig.contact */}
          {(email || phone || address) && (
            <ul className="mt-16 grid gap-6 border-t border-line pt-8 sm:grid-cols-3">
              {email && (
                <li>
                  <p className="label text-muted">{contact.channels.email}</p>
                  <a href={`mailto:${email}`} className="link-underline mt-2 inline-block text-lead">
                    {email}
                  </a>
                </li>
              )}
              {phone && (
                <li>
                  <p className="label text-muted">{contact.channels.phone}</p>
                  <a href={`tel:${phone.replace(/\s+/g, "")}`} className="link-underline mt-2 inline-block text-lead">
                    {phone}
                  </a>
                </li>
              )}
              {address && (
                <li>
                  <p className="label text-muted">{contact.channels.address}</p>
                  <p className="mt-2 text-lead">{address}</p>
                </li>
              )}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
