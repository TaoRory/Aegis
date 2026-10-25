import Link from "next/link";

import { MistCursor } from "@/components/fx/MistCursor";
import { SheetRise } from "@/components/fx/SheetRise";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { RoundButton } from "@/components/ui/Button";
import { Lines } from "@/components/ui/Rich";
import { siteConfig } from "@/config/site";
import { contactSection } from "@/content/about";
import { serviceQuestion } from "@/content/contact-flow";

/**
 * Màn kết trang chủ: tấm bản vẽ xanh trồi lên, rồi câu 1 của form liên hệ.
 * Chọn một hạng mục → sang trang /lien-he với hạng mục đã chọn sẵn (?dv=…), hỏi tiếp các câu riêng.
 */
export function Contact() {
  const { email, phone, address } = siteConfig.contact;
  const channels = [
    email && { label: "Email", value: email, href: `mailto:${email}` },
    phone && { label: "Điện thoại", value: phone, href: `tel:${phone.replace(/\s+/g, "")}` },
    address && { label: "Địa chỉ", value: address, href: undefined },
  ].filter((item) => !!item);

  return (
    <section
      id="lien-he"
      data-chapter="Liên hệ"
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
              <p className="label text-muted">{contactSection.label}</p>
              <p className="label hidden text-muted sm:block">BV-06 — Bản vẽ của bạn</p>
            </div>
            <SplitReveal as="h2" id="lien-he-title" className="mt-10 text-mega font-semibold">
              <Lines lines={contactSection.lines} />
            </SplitReveal>
            <div className="mt-14 flex flex-wrap items-end justify-between gap-10">
              <p className="max-w-[30rem] text-lead">{contactSection.lead}</p>
              <RoundButton href="#lien-he-chon" size="lg">
                Bắt đầu phiếu
              </RoundButton>
            </div>
          </div>
        </div>
      </SheetRise>

      <div id="lien-he-chon" className="container-page scroll-mt-24 pt-(--section-y)">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <p className="label text-accent">{contactSection.pickerLabel}</p>
            <p className="mt-5 max-w-[24rem] leading-relaxed text-muted">{serviceQuestion.hint}</p>

            {channels.length > 0 && (
              <dl className="mt-12 space-y-4 border-t border-line pt-8">
                {channels.map(({ label, value, href }) => (
                  <div key={label}>
                    <dt className="label text-muted">{label}</dt>
                    <dd className="mt-1 text-lg">{href ? <a href={href} className="hover:text-accent">{value}</a> : value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          <ul className="wizard-services lg:col-span-8">
            {serviceQuestion.options.map((option, index) => (
              <li key={option.value}>
                <Link href={`/lien-he?dv=${option.value}`} className="wizard-service" data-cursor="link">
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
    </section>
  );
}
