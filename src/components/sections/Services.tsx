import { SplitReveal } from "@/components/motion/SplitReveal";
import { ServiceChapters } from "@/components/services/ServiceChapters";
import { Lines } from "@/components/ui/Rich";
import type { Locale } from "@/config/space";
import { getSiteDict } from "@/content/site";

export function Services({ lang }: { lang: Locale }) {
  const { servicesSection, services, chapters } = getSiteDict(lang);
  return (
    <section
      id="dich-vu"
      data-surface="dark"
      data-chapter={servicesSection.chapter}
      aria-labelledby="dich-vu-title"
      className="relative"
    >
      <div aria-hidden className="blueprint-grid pointer-events-none absolute inset-0 -z-10" />
      <div className="services-intro container-page pt-(--section-y) pb-16 lg:pb-8">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="label text-muted">{servicesSection.label}</p>
            <SplitReveal as="h2" id="dich-vu-title" className="mt-6 text-h2 font-semibold">
              <Lines lines={servicesSection.lines} />
            </SplitReveal>
          </div>
          <p className="max-w-[28rem] text-lead text-muted lg:col-span-4 lg:justify-self-end">{servicesSection.lead}</p>
        </div>
      </div>
      <ServiceChapters services={services} lang={lang} copy={chapters} />
    </section>
  );
}
