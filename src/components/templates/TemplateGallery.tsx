import { CursorPreview } from "@/components/fx/CursorPreview";
import { TextScramble } from "@/components/fx/TextScramble";
import { TemplateStage, type TemplatePreview } from "@/components/templates/TemplateCard";
import { ButtonLink } from "@/components/ui/Button";
import { SmartLink } from "@/components/ui/SmartLink";
import type { SiteDict } from "@/content/site/types";
import type { DemoTemplate } from "@/content/templates";
import { cn } from "@/lib/cn";
import { fill } from "@/lib/fill";

/** Mục lục style: mỗi hàng là một tên style; rê chuột thì ảnh mẫu bám con trỏ, tên xáo chữ (Signal-A pattern). */
export function StyleIndex({ templates, previews }: { templates: DemoTemplate[]; previews: Record<string, TemplatePreview> }) {
  return (
    <CursorPreview ratio="16 / 10" size="clamp(16rem, 26vw, 26rem)">
      <ol className="border-t border-line">
        {templates.map((template, index) => (
          <li key={template.slug}>
            <a
              href={`#style-${template.slug}`}
              data-preview={previews[template.slug]?.cover.src}
              className="style-index-row group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 border-b border-line py-5 transition-colors lg:grid-cols-12 lg:py-7"
            >
              <span className="label text-muted lg:col-span-1">{String(index + 1).padStart(2, "0")}</span>
              <span className="text-[clamp(2.2rem,1.2rem+4.4vw,6.5rem)] leading-[0.95] font-semibold tracking-[-0.045em] transition-colors group-hover:text-accent lg:col-span-6">
                <TextScramble text={template.name} />
              </span>
              <span className="label text-muted lg:col-span-3 max-lg:col-start-2 max-lg:row-start-2 max-lg:mt-2">
                {template.industry} · {template.emotion}
              </span>
              <span className="label hidden text-muted lg:col-span-2 lg:block lg:justify-self-end">
                {template.brand} <span aria-hidden className="text-fg">↓</span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </CursorPreview>
  );
}

/** Hồ sơ từng style: sân khấu xem trước + công thức tóm tắt + nút mở mẫu. Xen kẽ trái/phải. */
export function StyleProfiles({
  templates,
  previews,
  copy,
  cursorOpen,
}: {
  templates: DemoTemplate[];
  previews: Record<string, TemplatePreview>;
  copy: SiteDict["templatesPage"]["profile"];
  cursorOpen: string;
}) {
  return (
    <div>
      {templates.map((template, index) => {
        const flip = index % 2 === 1;
        return (
          <article
            key={template.slug}
            id={`style-${template.slug}`}
            aria-labelledby={`style-${template.slug}-title`}
            className="grid scroll-mt-24 gap-10 border-b border-line py-16 lg:grid-cols-12 lg:items-center lg:gap-12 lg:py-24"
          >
            <SmartLink
              href={`/mau-giao-dien/${template.slug}`}
              data-cursor="view"
              data-cursor-label={cursorOpen}
              className={cn("group block lg:col-span-7", flip && "lg:order-2")}
              aria-label={fill(copy.openAria, { name: template.name })}
            >
              <TemplateStage
                template={template}
                preview={previews[template.slug]}
                alt={fill(copy.stageAlt, { brand: template.brand })}
                sizes="(min-width: 1024px) 55vw, 100vw"
              />
            </SmartLink>
            <div className={cn("lg:col-span-5", flip && "lg:order-1")}>
              <p className="label text-accent">
                {copy.style} /{String(index + 1).padStart(2, "0")} · {template.industry}
              </p>
              <h2 id={`style-${template.slug}-title`} className="mt-4 text-[clamp(2.8rem,1.6rem+4vw,5.5rem)] leading-[0.92] font-semibold tracking-[-0.045em]">
                {template.name}
              </h2>
              <p className="mt-5 text-lead">{template.idea}</p>
              <dl className="label mt-8 grid grid-cols-[8rem_1fr] gap-y-3 border-t border-line pt-6 text-muted">
                <dt>{copy.signature}</dt>
                <dd className="text-fg normal-case tracking-normal">{template.signature}</dd>
                <dt>{copy.emotion}</dt>
                <dd className="text-fg">{template.emotion}</dd>
                <dt>{copy.font}</dt>
                <dd className="text-fg">{template.fonts}</dd>
                <dt>{copy.palette}</dt>
                <dd>
                  <ul aria-label={fill(copy.paletteAria, { name: template.name })} className="flex gap-1.5">
                    {template.palette.map((color) => (
                      <li key={color} className="size-5 rounded-full border border-line-strong" style={{ background: color }} title={color}>
                        <span className="sr-only">{color}</span>
                      </li>
                    ))}
                  </ul>
                </dd>
                <dt>{copy.tryIt}</dt>
                <dd className="text-fg normal-case tracking-normal">{template.interactions.join(" · ")}</dd>
                <dt>{copy.fits}</dt>
                <dd className="text-fg normal-case tracking-normal">{template.fits.join(" · ")}</dd>
                <dt>{copy.brand}</dt>
                <dd>
                  {template.brand} <span className="text-muted">{copy.fictional}</span>
                </dd>
              </dl>
              <div className="mt-8">
                <ButtonLink href={`/mau-giao-dien/${template.slug}`} arrow="↗">
                  {fill(copy.open, { name: template.name })}
                </ButtonLink>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
