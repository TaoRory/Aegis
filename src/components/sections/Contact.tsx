import Link from "next/link";

import { MistCursor } from "@/components/fx/MistCursor";
import { SheetRise } from "@/components/fx/SheetRise";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Lines } from "@/components/ui/Rich";
import { siteConfig } from "@/config/site";
import { contactHref } from "@/config/routes";
import type { Locale } from "@/config/space";
import { getFlow } from "@/content/contact-flow-i18n";
import { getSiteDict } from "@/content/site";

/**
 * Màn kết trang chủ: tấm bản vẽ xanh trồi lên, câu 1 của form liên hệ nằm ngay trong tấm (không cần bấm "bắt đầu" rồi cuộn tiếp).
 * Chọn một hạng mục → sang trang liên hệ với hạng mục đã chọn sẵn (?dv=…), hỏi tiếp các câu riêng.
 */
export function Contact({ lang }: { lang: Locale }) {
  const { email, phone, address } = siteConfig.contact;
  const { contact } = getSiteDict(lang);
  const { serviceQuestion } = getFlow(lang);
  const channels = [
    email && { label: contact.channels.email, value: email, href: `mailto:${email}` },
    phone && { label: contact.channels.phone, value: phone, href: `tel:${phone.replace(/\s+/g, "")}` },
    address && { label: contact.channels.address, value: address, href: undefined },
  ].filter((item) => !!item);

  return (
    <section
      id="lien-he"
      data-chapter={contact.chapter}
      aria-labelledby="lien-he-title"
      data-surface="dark"
      className="ink relative z-10 pt-6 pb-(--section-y)"
    >
      {/* Tấm bản vẽ xanh trồi lên (Emotion "Working on something similar?") */}
      <SheetRise radius="3rem" className="mx-[calc(var(--gutter)/2)]">
        <div data-surface="accent" className="relative isolate overflow-hidden rounded-[inherit] bg-bg text-fg">
          <div aria-hidden className="blueprint-grid pointer-events-none absolute inset-0 opacity-60" />
          <MistCursor color="#ffffff" opacity={0.3} />
          <div className="container-page relative py-(--section-y)">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <p className="label text-muted">{contact.label}</p>
              <p className="label hidden text-muted sm:block">{contact.sheet}</p>
            </div>
            <SplitReveal as="h2" id="lien-he-title" className="mt-10 text-mega font-semibold">
              <Lines lines={contact.lines} />
            </SplitReveal>

            <div id="lien-he-chon" className="mt-14 grid scroll-mt-24 gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-4">
                <p className="max-w-[30rem] text-lead">{contact.lead}</p>
                <p className="label mt-10 text-fg">{contact.pickerLabel}</p>
                <p className="mt-3 max-w-[24rem] leading-relaxed text-muted">{serviceQuestion.hint}</p>

                {channels.length > 0 && (
                  <dl className="mt-10 space-y-4 border-t border-line pt-8">
                    {channels.map(({ label, value, href }) => (
                      <div key={label}>
                        <dt className="label text-muted">{label}</dt>
                        <dd className="mt-1 text-lg">{href ? <a href={href} className="underline-offset-4 hover:underline">{value}</a> : value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>

              <ul className="wizard-services lg:col-span-8">
                {serviceQuestion.options.map((option, index) => (
                  <li key={option.value}>
                    <Link href={contactHref(lang, option.value)} className="wizard-service" data-cursor="link">
                      <span className="wizard-service-face">
                        <span className="label text-accent">{String(index + 1).padStart(2, "0")}</span>
                        <span className="wizard-service-title">{option.label}</span>
                        <span className="wizard-service-note">{option.note}</span>
                        <span aria-hidden className="wizard-service-arrow">
                          →
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </SheetRise>
    </section>
  );
}
