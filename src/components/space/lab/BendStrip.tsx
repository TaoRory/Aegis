"use client";

import Image from "next/image";

import { DragSlider } from "@/components/fx/DragSlider";
import previews from "@/content/template-previews.json";
import { templates } from "@/content/templates";
import type { ProjectPreviews } from "@/content/types";

/**
 * Thí nghiệm 04: dải ngang kéo được có quán tính (DragSlider bend) với tám style mẫu.
 * Kéo nhanh thì các thẻ nâng lên và xoay thành cung; thả ra thì phẳng lại.
 */
export default function BendStrip() {
  const map = previews as ProjectPreviews;
  return (
    <div className="space-lab-fill">
      <DragSlider label="Tám style mẫu" bend className="w-full" trackClassName="gap-4 px-6 py-12">
        {templates.map((template) => {
          const cover = map[template.slug]?.cover;
          return (
            <figure key={template.slug} className="w-56 shrink-0">
              {cover && <Image src={cover.src} width={cover.width} height={cover.height} alt="" draggable={false} sizes="14rem" className="aspect-[16/10] w-full border border-line-strong object-cover object-top" />}
              <figcaption className="label mt-2 text-muted">{template.name}</figcaption>
            </figure>
          );
        })}
      </DragSlider>
    </div>
  );
}
