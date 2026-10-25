import { DragSlider } from "@/components/fx/DragSlider";
import { TextScramble } from "@/components/fx/TextScramble";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { TemplateStage, type TemplatePreview } from "@/components/templates/TemplateCard";
import { ButtonLink } from "@/components/ui/Button";
import { Lines } from "@/components/ui/Rich";
import { templatesSection } from "@/content/about";
import previews from "@/content/template-previews.json";
import { templateNotice, templates } from "@/content/templates";

/**
 * Trang chủ: thư viện style dạng dải kéo được (cong theo tốc độ kéo, học từ Sofia Shcherbak).
 * Mỗi thẻ là một style có tên; tách bạch với dự án thực tế.
 */
export function TemplatesTeaser() {
  const map = previews as Record<string, TemplatePreview>;
  return (
    <section
      id="mau-giao-dien"
      data-chapter="Mẫu giao diện"
      data-surface="light"
      aria-labelledby="mau-giao-dien-title"
      className="paper relative z-10 overflow-hidden section-y"
    >
      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="label text-muted">{templatesSection.label}</p>
            <SplitReveal as="h2" id="mau-giao-dien-title" className="mt-6 text-h2 font-semibold">
              <Lines lines={templatesSection.lines} />
            </SplitReveal>
          </div>
          <div className="lg:col-span-5">
            <p className="text-lead text-muted">{templatesSection.lead}</p>
            <p className="label mt-5 border-l-2 border-accent pl-3 leading-relaxed text-muted">{templateNotice}</p>
          </div>
        </div>
        <div className="label mt-14 flex items-center justify-between border-b border-line pb-4 text-muted lg:mt-20">
          <span>{String(templates.length).padStart(2, "0")} style · mỗi style một ngành</span>
          <span aria-hidden>Kéo ↔</span>
        </div>
      </div>

      <DragSlider label="Các style giao diện" bend className="mt-10 pb-6" trackClassName="gap-5 px-(--gutter) lg:gap-8">
        {templates.map((template, index) => (
          <article key={template.slug} className="style-card group relative w-[min(82vw,22rem)] shrink-0 lg:w-[clamp(22rem,30vw,30rem)]">
            <TemplateStage template={template} preview={map[template.slug]} sizes="(min-width: 1024px) 30vw, 82vw" />
            <div className="mt-5 flex items-baseline justify-between gap-4">
              <h3 className="text-[clamp(1.9rem,1.4rem+1.6vw,3rem)] leading-none font-semibold tracking-[-0.03em]">
                <a href={`/mau-giao-dien/${template.slug}`} className="stretched-link transition-colors group-hover:text-accent">
                  <TextScramble text={template.name} trigger="parent" />
                </a>
              </h3>
              <span className="label text-accent">/{String(index + 1).padStart(2, "0")}</span>
            </div>
            <p className="label mt-3 text-muted">
              {template.industry} · {template.emotion}
            </p>
            <p className="mt-3 max-w-[26rem] text-[0.95rem] leading-relaxed text-muted">{template.signature}</p>
            <ul aria-label="Bảng màu" className="mt-4 flex gap-1.5">
              {template.palette.map((color) => (
                <li key={color} className="size-4 rounded-full border border-line" style={{ background: color }}>
                  <span className="sr-only">{color}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </DragSlider>

      <div className="container-page">
        <div className="mt-14 flex justify-start">
          <ButtonLink href={templatesSection.cta.href}>{templatesSection.cta.label}</ButtonLink>
        </div>
      </div>
    </section>
  );
}
