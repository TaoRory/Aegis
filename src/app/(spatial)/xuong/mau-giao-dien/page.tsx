import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Panel } from "@/components/space/Panel";
import { SPACE_BASE } from "@/config/space";
import { spaceCopy } from "@/content/space";
import previews from "@/content/template-previews.json";
import { templateNotice, templates } from "@/content/templates";
import type { ProjectPreviews } from "@/content/types";

export const metadata: Metadata = { title: "Kệ mẫu" };

export default function ShelfPage() {
  const map = previews as ProjectPreviews;
  return (
    <Panel zone="mau-giao-dien" title="Tám style, *tám ngành.*" closeHref={SPACE_BASE}>
      <p data-panel-in className="mt-5 max-w-[34rem] leading-relaxed text-muted">
        {spaceCopy.zones["mau-giao-dien"].lead}
      </p>
      <p data-panel-in className="label mt-5 border-l-2 border-accent pl-3 leading-relaxed text-muted">
        {templateNotice}
      </p>
      <ol className="space-cards">
        {templates.map((template, index) => {
          const cover = map[template.slug]?.cover;
          return (
            <li key={template.slug} data-panel-in>
              {/* Mở mẫu demo sẵn có (rời khỏi Xưởng); thanh demo của mẫu có đường quay lại */}
              <Link href={`/mau-giao-dien/${template.slug}`} className="space-card" data-cursor="view" data-cursor-label="Mở mẫu">
                {cover && <Image src={cover.src} width={cover.width} height={cover.height} alt="" sizes="(min-width: 64rem) 20rem, 45vw" className="space-card-img" />}
                <span className="label text-accent">
                  STYLE /{String(index + 1).padStart(2, "0")} · {template.industry}
                </span>
                <span className="space-card-name">{template.name}</span>
                <span className="text-[0.9rem] leading-relaxed text-muted">{template.signature}</span>
                <span className="flex gap-1.5" role="img" aria-label="Bảng màu của style">
                  {template.palette.map((color) => (
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
