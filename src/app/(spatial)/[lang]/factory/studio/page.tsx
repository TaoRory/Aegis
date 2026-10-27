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

/** Thư viện mẫu: tám style giao diện dẫn tới các website mẫu chạy thật (demo, thương hiệu giả định) */
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
      <h2 data-panel-in className="label mt-8 text-accent">
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
    </Panel>
  );
}
