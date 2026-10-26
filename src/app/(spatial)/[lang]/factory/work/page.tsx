import type { Metadata } from "next";
import { Suspense } from "react";

import { Panel } from "@/components/space/Panel";
import { PanelSkeleton } from "@/components/space/PanelParts";
import { ProjectCards } from "@/components/space/ProjectCards";
import type { ServiceId } from "@/content/types";
import { resolveLang, titleFor, type LangParams } from "../_lib";

export async function generateMetadata({ params }: { params: LangParams }): Promise<Metadata> {
  return titleFor(params, (d) => d.ui.zones.work.name);
}

export default function WorkPage({ params }: { params: LangParams }) {
  return (
    <Suspense fallback={<PanelSkeleton label="…" />}>
      <Work params={params} />
    </Suspense>
  );
}

async function Work({ params }: { params: LangParams }) {
  const { dict, href } = await resolveLang(params);
  const serviceName = (id: ServiceId) => dict.services.find((s) => s.id === id)?.shortTitle ?? id;
  return (
    <Panel zone="work" title={dict.work.title} closeHref={href()}>
      <p data-panel-in className="mt-5 max-w-[34rem] leading-relaxed text-muted">
        {dict.work.lead}
      </p>
      <ProjectCards projects={dict.projects} href={(slug) => href(`work/${slug}`)} label={dict.ui.product.label} view={dict.work.view} serviceName={serviceName} />
    </Panel>
  );
}
