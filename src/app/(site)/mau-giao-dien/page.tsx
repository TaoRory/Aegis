import type { Metadata } from "next";

import Link from "next/link";

import { SplitReveal } from "@/components/motion/SplitReveal";
import type { TemplatePreview } from "@/components/templates/TemplateCard";
import { StyleIndex, StyleProfiles } from "@/components/templates/TemplateGallery";
import { ButtonLink } from "@/components/ui/Button";
import { Lines } from "@/components/ui/Rich";
import { templatesSection } from "@/content/about";
import previews from "@/content/template-previews.json";
import { templateNotice, templates } from "@/content/templates";

export const metadata: Metadata = {
  title: "Thư viện style giao diện",
  description: `${templates.length} style giao diện Aegis có thể thiết kế và xây dựng: ${templates.map((t) => `${t.name} (${t.industry.toLowerCase()})`).join(", ")}. ${templateNotice}`,
};

export default function TemplatesPage() {
  return (
    <>
      <section data-surface="dark" aria-labelledby="thu-vien-title" className="ink relative pt-[calc(var(--header-h)+var(--section-y)*0.6)] pb-16">
        <div aria-hidden className="blueprint-grid pointer-events-none absolute inset-0" />
        <div className="container-page relative">
          <p className="label text-muted">{templatesSection.pageLabel}</p>
          <SplitReveal as="h1" id="thu-vien-title" trigger="intro" className="mt-6 text-hero font-semibold">
            <Lines lines={templatesSection.pageLines} />
          </SplitReveal>
          <div className="mt-12 grid gap-8 border-t border-line pt-8 lg:grid-cols-12">
            <p className="text-lead text-muted lg:col-span-6">{templatesSection.lead}</p>
            <div className="border-l-2 border-accent pl-4 lg:col-span-5 lg:col-start-8">
              <p className="label text-accent">Lưu ý minh bạch</p>
              <p className="mt-2 leading-relaxed text-muted">
                {templateNotice} Dự án thực tế Aegis đã thực hiện nằm ở mục{" "}
                <Link href="/#du-an" className="text-fg underline underline-offset-4 hover:text-accent">
                  Dự án
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      <section data-surface="dark" aria-label="Mục lục style" className="ink relative z-10 pb-16">
        <div className="container-page">
          <p className="label mb-6 text-muted">Mục lục · chọn một style để xem hồ sơ</p>
          <StyleIndex templates={templates} previews={previews as Record<string, TemplatePreview>} />
        </div>
      </section>

      <section data-surface="dark" aria-label="Hồ sơ từng style" className="ink relative z-10 pb-(--section-y)">
        <div className="container-page">
          <StyleProfiles templates={templates} previews={previews as Record<string, TemplatePreview>} />
          <div className="mt-20 flex flex-col items-start gap-6 border-t border-line pt-10 lg:flex-row lg:items-end lg:justify-between">
            <p className="text-statement font-medium">
              Chưa thấy đúng thứ <em>bạn cần?</em>
            </p>
            <ButtonLink href="/#lien-he">Trao đổi nhu cầu riêng</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
