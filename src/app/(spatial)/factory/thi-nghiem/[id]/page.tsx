import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { LabFrame } from "@/components/space/lab/LabFrame";
import { Panel } from "@/components/space/Panel";
import { PanelSkeleton } from "@/components/space/PanelParts";
import { SPACE_BASE } from "@/config/space";
import { labItems } from "@/content/lab";
import { spaceCopy } from "@/content/space";

type Params = { id: string };

export function generateStaticParams() {
  return labItems.map((item) => ({ id: item.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const item = labItems.find((i) => i.id === id);
  return item ? { title: `${item.name} — nguyên mẫu`, description: item.tagline } : {};
}

/** Phần đọc params nằm trong Suspense để điều hướng tới trang này vẫn "tức thì" */
export default function LabItemPage({ params }: { params: Promise<Params> }) {
  return (
    <Suspense fallback={<PanelSkeleton label="Đang tải nguyên mẫu" />}>
      <LabItem params={params} />
    </Suspense>
  );
}

async function LabItem({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const index = labItems.findIndex((i) => i.id === id);
  if (index < 0) notFound();
  const item = labItems[index];
  const prev = labItems[index - 1];
  const next = labItems[index + 1];

  return (
    <Panel
      zone="thi-nghiem"
      eyebrow={`${spaceCopy.lab.label} /${item.index}`}
      title={item.name}
      closeHref={`${SPACE_BASE}/thi-nghiem`}
      prev={prev && { href: `${SPACE_BASE}/thi-nghiem/${prev.id}`, label: prev.name }}
      next={next && { href: `${SPACE_BASE}/thi-nghiem/${next.id}`, label: next.name }}
    >
      <p data-panel-in className="mt-5 max-w-[36rem] leading-relaxed text-muted">
        {item.description}
      </p>
      <LabFrame item={item} />
    </Panel>
  );
}
