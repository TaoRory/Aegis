import type { Variant } from "@/config/space";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AiDemo } from "@/components/space/demos/AiDemo";
import { CalendarDemo } from "@/components/space/demos/CalendarDemo";
import { OpsDemo } from "@/components/space/demos/OpsDemo";
import { Panel } from "@/components/space/Panel";
import { PanelSkeleton } from "@/components/space/PanelParts";
import { hasLocale, servicesWithDemo } from "@/config/space";
import { demoContent } from "@/content/demos";
import type { ServiceId } from "@/content/types";
import { resolveLang, type LangParams } from "@/components/space/views/lib";

type Params = Promise<{ lang: string; id: string }>;

export function generateStaticParams() {
  return servicesWithDemo.map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, id } = await params;
  if (!hasLocale(lang) || !(servicesWithDemo as readonly string[]).includes(id)) return {};
  return { title: demoContent[lang][id as "ai" | "software" | "marketing"].title };
}

export function DemoView({ params, variant = "neutral" }: { params: Params; variant?: Variant }) {
  return (
    <Suspense fallback={<PanelSkeleton label="…" />}>
      <Demo params={params} variant={variant} />
    </Suspense>
  );
}

/** Demo minh họa của một dịch vụ (AI, phần mềm quản trị, marketing). Luôn kèm nhãn "demo minh họa, dữ liệu giả định". */
async function Demo({ params, variant }: { params: Params; variant: Variant }) {
  const { id } = await params;
  const { lang, dict, href } = await resolveLang(params as LangParams, variant);
  if (!(servicesWithDemo as readonly string[]).includes(id)) notFound();
  const sid = id as Exclude<ServiceId, "web">;
  const content = demoContent[lang][sid as "ai" | "software" | "marketing"];
  const service = dict.services.find((s) => s.id === sid);

  return (
    <Panel zone={sid} eyebrow={`${dict.servicesPage.demo} · ${service?.shortTitle}`} title={content.title} closeHref={href(`services/${sid}`)}>
      <p data-panel-in className="space-demo-badge label">
        {dict.ui.demoBadge}
      </p>
      <p data-panel-in className="mt-4 max-w-[36rem] leading-relaxed text-muted">
        {content.lead}
      </p>
      <div data-panel-in className="mt-6">
        {sid === "ai" && <AiDemo content={demoContent[lang].ai} />}
        {sid === "software" && <OpsDemo content={demoContent[lang].software} />}
        {sid === "marketing" && <CalendarDemo content={demoContent[lang].marketing} />}
      </div>
      <Link data-panel-in href={`${href("contact")}?dv=${sid}`} className="space-cta label" data-cursor="link">
        {dict.servicesPage.start} →
      </Link>
    </Panel>
  );
}
