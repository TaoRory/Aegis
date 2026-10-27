import { SplitReveal } from "@/components/motion/SplitReveal";
import { Rich } from "@/components/ui/Rich";
import { ScrollRevealText } from "@/components/ui/ScrollRevealText";
import type { Locale } from "@/config/space";
import { getSiteDict } from "@/content/site";

export function About({ lang }: { lang: Locale }) {
  const { about, values } = getSiteDict(lang);
  return (
    <section
      id="gioi-thieu"
      data-chapter={about.chapter}
      aria-labelledby="gioi-thieu-title"
      data-surface="light"
      className="paper relative z-10 section-y"
    >
      <div className="container-page">
        <div className="grid gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <h2 id="gioi-thieu-title" className="label text-muted lg:sticky lg:top-28">
              {about.label}
            </h2>
          </div>
          <div className="lg:col-span-9">
            <ScrollRevealText text={about.statement} className="text-statement font-medium" />
            <p className="mt-12 max-w-[38rem] text-lead text-muted lg:ml-[25%]">{about.body}</p>
          </div>
        </div>

        {/* Lời hứa bàn giao chung cho cả 4 dịch vụ */}
        <div className="mt-20 grid gap-6 border-y border-line py-10 lg:mt-28 lg:grid-cols-12 lg:items-baseline lg:py-14">
          <p className="label text-accent lg:col-span-3">
            <span aria-hidden>↳ </span>
            {about.promise.label}
          </p>
          <p className="text-h3 font-semibold lg:col-span-9">
            <Rich text={about.promise.text} />
          </p>
        </div>

        <div className="mt-28 lg:mt-40">
          <div className="flex items-center justify-between border-b border-line pb-4 text-muted">
            <p className="label">{about.valuesLabel}</p>
            <p className="label">
              0{values.length} / {about.principles}
            </p>
          </div>
          <ol>
            {values.map((value, index) => (
              <li key={value.title} className="value-row group grid gap-4 border-b border-line py-8 lg:grid-cols-12 lg:items-center lg:py-10">
                <span className="label text-accent lg:col-span-1">0{index + 1}</span>
                <SplitReveal as="h3" className="value-word text-mega font-semibold lg:col-span-6">
                  {index === 1 ? <em>{value.title}</em> : value.title}
                </SplitReveal>
                <p className="max-w-[30rem] leading-relaxed text-muted lg:col-span-5 lg:justify-self-end">
                  {value.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
