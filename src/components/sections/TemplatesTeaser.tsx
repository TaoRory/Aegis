import { SplitReveal } from "@/components/motion/SplitReveal";
import { GalleryRing } from "@/components/templates/GalleryRing";
import type { TemplatePreview } from "@/components/templates/TemplateCard";
import { ButtonLink } from "@/components/ui/Button";
import { Lines } from "@/components/ui/Rich";
import { templatesSection } from "@/content/about";
import previews from "@/content/template-previews.json";
import { templateNotice, templates } from "@/content/templates";

/**
 * Trang chủ: cửa sổ nhìn vào "phòng trưng bày" 3D (cùng GalleryRing với trang /mau-giao-dien, bản rút gọn không có bộ lọc).
 * Mỗi thẻ là một style có tên; tách bạch với dự án thực tế.
 */
export function TemplatesTeaser() {
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
          <span aria-hidden>Kéo để xoay ↔</span>
        </div>

        <div className="mt-8">
          <GalleryRing templates={templates} previews={previews as Record<string, TemplatePreview>} variant="teaser" />
        </div>

        <div className="mt-12 flex justify-start">
          <ButtonLink href={templatesSection.cta.href}>{templatesSection.cta.label}</ButtonLink>
        </div>
      </div>
    </section>
  );
}
