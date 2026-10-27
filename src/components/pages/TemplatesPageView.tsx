import Link from "next/link";

import { PageTransition } from "@/components/motion/PageTransition";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { GalleryRing } from "@/components/templates/GalleryRing";
import { StyleProfiles } from "@/components/templates/TemplateGallery";
import type { TemplatePreview } from "@/components/templates/TemplateCard";
import { ButtonLink } from "@/components/ui/Button";
import { Lines, Rich } from "@/components/ui/Rich";
import { contactHref, serviceHref } from "@/config/routes";
import type { Locale } from "@/config/space";
import previews from "@/content/template-previews.json";
import { fill, getSiteDict, localizedTemplates } from "@/content/site";

/** Thư viện style giao diện (/mau-giao-dien và /en/templates). Các mẫu demo bên trong vẫn là tiếng Việt (thương hiệu giả định). */
export function TemplatesPageView({ lang }: { lang: Locale }) {
  const dict = getSiteDict(lang);
  const page = dict.templatesPage;
  const templates = localizedTemplates(lang);
  const map = previews as Record<string, TemplatePreview>;
  // "{notice} … {link} …": phần liên kết tới trang Web & web app nằm giữa câu
  const [before, after] = fill(page.transparencyBody, { notice: dict.templatesPage.notice, link: "\u0000" }).split("\u0000");

  return (
    <>
      <PageTransition />
      <section data-surface="dark" aria-labelledby="thu-vien-title" className="ink relative pt-[calc(var(--header-h)+var(--section-y)*0.4)] pb-10">
        <div aria-hidden className="blueprint-grid pointer-events-none absolute inset-0" />
        <div className="container-page relative">
          <p className="label text-muted">{page.label}</p>
          <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-end">
            <SplitReveal as="h1" id="thu-vien-title" trigger="intro" className="text-hero font-semibold lg:col-span-7">
              <Lines lines={page.lines} />
            </SplitReveal>
            <div className="lg:col-span-5">
              <p className="text-lead text-muted">{page.lead}</p>
              <div className="mt-6 border-l-2 border-accent pl-4">
                <p className="label text-accent">{page.transparencyLabel}</p>
                <p className="mt-2 leading-relaxed text-muted">
                  {before}
                  <Link href={serviceHref(lang, "web")} className="text-fg underline underline-offset-4 hover:text-accent">
                    {page.transparencyLink}
                  </Link>
                  {after}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section data-surface="dark" aria-label={page.showroom} className="ink relative z-10">
        <GalleryRing templates={templates} previews={map} copy={dict.gallery} groups={dict.templateGroups} variant="page" />
      </section>

      <section data-surface="dark" aria-label={page.dossiers} className="ink relative z-10 pt-(--section-y) pb-(--section-y)">
        <div className="container-page">
          <p className="label mb-2 text-muted">{page.dossiersLabel}</p>
          <StyleProfiles templates={templates} previews={map} copy={page.profile} cursorOpen={dict.gallery.cursorOpen} />
          <div className="mt-20 flex flex-col items-start gap-6 border-t border-line pt-10 lg:flex-row lg:items-end lg:justify-between">
            <p className="text-statement font-medium">
              <Rich text={page.closing} />
            </p>
            <ButtonLink href={contactHref(lang)}>{page.closingCta}</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
