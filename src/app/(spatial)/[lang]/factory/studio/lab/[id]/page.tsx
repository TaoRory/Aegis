import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { LabFrame } from "@/components/space/lab/LabFrame";
import { Panel } from "@/components/space/Panel";
import { PanelSkeleton } from "@/components/space/PanelParts";
import { hasLocale } from "@/config/space";
import { getFactoryDict } from "@/content/factory";
import { labItems } from "@/content/lab";
import { resolveLang, type LangParams } from "../../../_lib";

type Params = Promise<{ lang: string; id: string }>;

export function generateStaticParams() {
  return labItems.map((item) => ({ id: item.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, id } = await params;
  if (!hasLocale(lang)) return {};
  const item = getFactoryDict(lang).lab.find((i) => i.id === id);
  return item ? { title: item.name, description: item.tagline } : {};
}

/** Phần đọc params nằm trong Suspense để điều hướng tới trang này vẫn "tức thì" */
export default function LabItemPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<PanelSkeleton label="…" />}>
      <LabItem params={params} />
    </Suspense>
  );
}

async function LabItem({ params }: { params: Params }) {
  const { id } = await params;
  const { dict, href } = await resolveLang(params as LangParams);
  const list = dict.lab;
  const index = list.findIndex((i) => i.id === id);
  if (index < 0) notFound();
  const item = list[index];
  const prev = list[index - 1];
  const next = list[index + 1];

  return (
    <Panel
      zone="studio"
      eyebrow={`${dict.ui.lab.label} /${item.index}`}
      title={item.name}
      closeHref={href("studio")}
      step={{ index: index + 1, total: list.length }}
      prev={prev && { href: href(`studio/lab/${prev.id}`), label: prev.name }}
      next={next && { href: href(`studio/lab/${next.id}`), label: next.name }}
    >
      <p data-panel-in className="mt-5 max-w-[36rem] leading-relaxed text-muted">
        {item.description}
      </p>
      <LabFrame item={item} />
    </Panel>
  );
}
