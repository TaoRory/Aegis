import { SplitReveal } from "@/components/motion/SplitReveal";
import { GalleryRing } from "@/components/templates/GalleryRing";
import type { TemplatePreview } from "@/components/templates/TemplateCard";
import { ButtonLink } from "@/components/ui/Button";
import { Lines } from "@/components/ui/Rich";
import { templatesHref } from "@/config/routes";
import type { Locale } from "@/config/space";
import previews from "@/content/template-previews.json";
import { getSiteDict, localizedTemplates } from "@/content/site";

/**
 * Trang Web & web app: cửa sổ nhìn vào "phòng trưng bày" 3D (cùng GalleryRing với trang thư viện, bản rút gọn không có bộ lọc).
 * Mỗi thẻ là một style có tên; tách bạch với dự án thực tế.
 */
export function TemplatesTeaser({ lang }: { lang: Locale }) {
  const dict = getSiteDict(lang);
  const copy = dict.webPage.templates;
  const templates = localizedTemplates(lang);
  return (
    <section
      id="mau-giao-dien"
      data-chapter={copy.chapter}
      data-surface="light"
      aria-labelledby="mau-giao-dien-title"
      className="paper relative z-10 overflow-hidden section-y"
    >
      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="label text-muted">{copy.label}</p>
            <SplitReveal as="h2" id="mau-giao-dien-title" className="mt-6 text-h2 font-semibold">
              <Lines lines={copy.lines} />
            </SplitReveal>
          </div>
          <div className="lg:col-span-5">
            <p className="text-lead text-muted">{copy.lead}</p>
            <p className="label mt-5 border-l-2 border-accent pl-3 leading-relaxed text-muted">{copy.notice}</p>
          </div>
        </div>
        <div className="label mt-14 flex items-center justify-between border-b border-line pb-4 text-muted lg:mt-20">
          <span>
            {String(templates.length).padStart(2, "0")} {copy.count}
          </span>
          <span aria-hidden>{copy.drag}</span>
        </div>

        <div className="mt-8">
          <GalleryRing
            templates={templates}
            previews={previews as Record<string, TemplatePreview>}
            copy={dict.gallery}
            groups={dict.templateGroups}
            variant="teaser"
          />
        </div>

        <div className="mt-12 flex justify-start">
          <ButtonLink href={templatesHref(lang)}>{copy.cta}</ButtonLink>
        </div>
      </div>
    </section>
  );
}
