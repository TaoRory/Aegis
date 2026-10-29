import Link from "next/link";

import { ContactWizard } from "@/components/contact/ContactWizard";
import { ChapterHud } from "@/components/motion/ChapterHud";
import { PageTransition } from "@/components/motion/PageTransition";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { FactoryInvite } from "@/components/sections/FactoryInvite";
import { Process } from "@/components/sections/Process";
import { Projects } from "@/components/sections/Projects";
import { TemplatesTeaser } from "@/components/sections/TemplatesTeaser";
import { JsonLd } from "@/components/seo/JsonLd";
import { RoundButton } from "@/components/ui/Button";
import { Lines } from "@/components/ui/Rich";
import { homeHref, serviceHref } from "@/config/routes";
import type { Locale } from "@/config/space";
import { getSiteDict } from "@/content/site";
import type { ServiceId } from "@/content/types";
import { isContactDeliveryConfigured } from "@/lib/contact/delivery";
import { serviceJsonLd } from "@/lib/seo/jsonld";

/**
 * Trang một dịch vụ (/web, /ai, /software, /marketing và bản /en): tóm tắt, nhu cầu thường gặp, phạm vi, giá trị, cách làm việc,
 * rồi bộ câu hỏi liên hệ với dịch vụ đã chọn sẵn.
 * Riêng trang Web & web app có thêm dự án đã thực hiện, thư viện mẫu giao diện và lời mời tham quan Factory (/web/factory):
 * sản phẩm đã làm chỉ hiện khi khách đã quan tâm tới mảng web, để không khiến Aegis trông chỉ mạnh về web.
 */
export function ServicePage({ lang, id }: { lang: Locale; id: ServiceId }) {
  const dict = getSiteDict(lang);
  const service = dict.services.find((s) => s.id === id)!;
  const copy = dict.servicePage;
  const others = dict.services.filter((s) => s.id !== id);

  return (
    <>
      <JsonLd data={serviceJsonLd(lang, id)} />
      <PageTransition />
      <section
        data-surface="dark"
        data-chapter={service.shortTitle}
        aria-labelledby="dich-vu-title"
        className="ink relative pt-[calc(var(--header-h)+var(--section-y)*0.4)] pb-(--section-y)"
      >
        <div aria-hidden className="blueprint-grid pointer-events-none absolute inset-0" />
        <div className="container-page relative">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <Link href={homeHref(lang)} className="label text-muted transition-colors hover:text-fg">
              {copy.back}
            </Link>
            <p className="label text-muted">{copy.eyebrow}</p>
          </div>
          <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-end">
            <SplitReveal as="h1" id="dich-vu-title" trigger="intro" className="text-h2 font-semibold lg:col-span-8">
              {service.title}
            </SplitReveal>
            <div className="lg:col-span-4 lg:justify-self-end">
              <p className="max-w-[28rem] text-lead text-muted">{service.summary}</p>
              <div className="mt-8">
                <RoundButton href="#lien-he-dich-vu">{copy.contactLabel}</RoundButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section data-surface="light" aria-label={service.shortTitle} className="paper relative z-10 section-y">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 className="label text-muted">{copy.needs}</h2>
              <ul className="mt-6 space-y-4 text-lead leading-relaxed text-muted">
                {service.needs.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-line-strong" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <h2 className="label text-muted">{copy.scope}</h2>
              <ul className="mt-6 space-y-4 text-lead leading-relaxed">
                {service.scope.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span aria-hidden className="font-mono text-accent">
                      +
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-16 border-t border-line pt-10 lg:mt-24">
            <p className="label text-accent">{copy.value}</p>
            <p className="mt-4 max-w-[46rem] font-serif text-[clamp(1.5rem,1.1rem+1.4vw,2.4rem)] leading-snug italic">“{service.value}”</p>
          </div>
        </div>
      </section>

      {id === "web" && (
        <>
          <Projects lang={lang} />
          <TemplatesTeaser lang={lang} />
          <FactoryInvite lang={lang} />
        </>
      )}

      <Process process={dict.process} />

      <section
        id="lien-he-dich-vu"
        data-chapter={dict.contact.chapter}
        data-surface="dark"
        aria-labelledby="lien-he-dich-vu-title"
        className="ink relative z-10 scroll-mt-16 pt-(--section-y) pb-(--section-y)"
      >
        <div aria-hidden className="blueprint-grid pointer-events-none absolute inset-x-0 top-0 h-[70svh]" />
        <div className="container-page relative">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <p className="label text-muted">{copy.contactLabel}</p>
            <p className="label hidden text-muted sm:block">{dict.contact.sheet}</p>
          </div>
          <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-end">
            <SplitReveal as="h2" id="lien-he-dich-vu-title" className="text-h2 font-semibold lg:col-span-8">
              <Lines lines={copy.contactLines} />
            </SplitReveal>
            <p className="max-w-[28rem] text-lead text-muted lg:col-span-4 lg:justify-self-end">{copy.contactLead}</p>
          </div>

          <div className="mt-16 lg:mt-24">
            <ContactWizard isConfigured={isContactDeliveryConfigured()} lang={lang} presetService={id} />
          </div>

          <nav aria-label={copy.others} className="mt-24 border-t border-line pt-8">
            <h2 className="label text-muted">{copy.others}</h2>
            <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
              {others.map((other) => (
                <li key={other.id}>
                  <Link href={serviceHref(lang, other.id)} className="link-underline">
                    {other.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
      <ChapterHud />
    </>
  );
}
