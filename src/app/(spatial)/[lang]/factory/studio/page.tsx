import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { Panel } from "@/components/space/Panel";
import { PanelSkeleton } from "@/components/space/PanelParts";
import previews from "@/content/template-previews.json";
import { templates } from "@/content/templates";
import type { ProjectPreviews } from "@/content/types";
import { resolveLang, titleFor, type LangParams } from "../_lib";

export async function generateMetadata({ params }: { params: LangParams }): Promise<Metadata> {
  return titleFor(params, (d) => d.ui.zones.studio.name);
}

export default function StudioPage({ params }: { params: LangParams }) {
  return (
    <Suspense fallback={<PanelSkeleton label="…" />}>
      <Studio params={params} />
    </Suspense>
  );
}

/** Studio: thí nghiệm (nguyên mẫu chạy thật) · kệ tám mẫu giao diện · ghi chép về cách xưởng được dựng */
async function Studio({ params }: { params: LangParams }) {
  const { dict, href } = await resolveLang(params);
  const copy = dict.studio;
  const map = previews as ProjectPreviews;
  const palette = Object.fromEntries(templates.map((t) => [t.slug, t.palette]));

  return (
    <Panel zone="studio" title={copy.title} closeHref={href()}>
      <p data-panel-in className="mt-5 max-w-[34rem] leading-relaxed text-muted">
        {copy.lead}
      </p>

      <h2 data-panel-in className="label mt-10 text-accent">
        {copy.labTitle}
      </h2>
      <p data-panel-in className="mt-3 max-w-[34rem] leading-relaxed text-muted">
        {copy.labLead}
      </p>
      <ol className="space-cards">
        {dict.lab.map((item) => (
          <li key={item.id} data-panel-in>
            <Link href={href(`studio/lab/${item.id}`)} className="space-card" data-cursor="view" data-cursor-label={copy.labCta}>
              <span className="label text-accent">
                {dict.ui.lab.label} /{item.index}
              </span>
              <span className="space-card-name">{item.name}</span>
              <span className="text-[0.95rem] leading-relaxed text-muted">{item.tagline}</span>
            </Link>
          </li>
        ))}
      </ol>

      <h2 data-panel-in className="label mt-10 text-accent">
        {copy.shelfTitle}
      </h2>
      <p data-panel-in className="mt-3 max-w-[34rem] leading-relaxed text-muted">
        {copy.shelfLead}
      </p>
      <p data-panel-in className="label mt-4 border-l-2 border-accent pl-3 leading-relaxed text-muted">
        {copy.templateNotice}
      </p>
      <ol className="space-cards">
        {dict.templates.map((template) => {
          const cover = map[template.slug]?.cover;
          return (
            <li key={template.slug} data-panel-in>
              {/* Mở mẫu demo sẵn có (rời khỏi Factory); thanh demo của mẫu có đường quay lại */}
              <Link href={`/mau-giao-dien/${template.slug}`} className="space-card" data-cursor="view" data-cursor-label={copy.shelfCta}>
                {cover && <Image src={cover.src} width={cover.width} height={cover.height} alt="" sizes="(min-width: 64rem) 20rem, 45vw" className="space-card-img" />}
                <span className="label text-accent">
                  {template.name} · {template.industry}
                </span>
                <span className="text-[0.9rem] leading-relaxed text-muted">{template.signature}</span>
                <span className="flex gap-1.5" role="img" aria-label={copy.paletteLabel}>
                  {palette[template.slug]?.map((color) => (
                    <i key={color} className="size-3.5 rounded-full border border-line-strong" style={{ background: color }} />
                  ))}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <h2 data-panel-in className="label mt-10 text-accent">
        {copy.journalTitle}
      </h2>
      <p data-panel-in className="mt-3 max-w-[34rem] leading-relaxed text-muted">
        {copy.journalLead}
      </p>
      {dict.journal.length === 0 ? (
        <p data-panel-in className="mt-6 border-t border-line pt-6 text-muted">
          {copy.journalEmpty}
        </p>
      ) : (
        <ol className="space-sheets">
          {dict.journal.map((entry) => (
            <li key={entry.slug} data-panel-in className="space-sheet">
              <h3 className="text-[1.35rem] leading-tight font-semibold">{entry.title}</h3>
              {entry.body.map((paragraph) => (
                <p key={paragraph} className="mt-3 leading-relaxed text-muted">
                  {paragraph}
                </p>
              ))}
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
