import type { Variant } from "@/config/space";
import type { Metadata } from "next";
import { Suspense } from "react";

import { Panel } from "@/components/space/Panel";
import { PanelSkeleton } from "@/components/space/PanelParts";
import { ProjectCards } from "@/components/space/ProjectCards";
import type { ServiceId } from "@/content/types";
import { resolveLang, titleFor, type LangParams } from "@/components/space/views/lib";

export async function generateMetadata({ params }: { params: LangParams }): Promise<Metadata> {
  return titleFor(params, (d) => d.ui.zones.work.name);
}

export function WorkView({ params, variant = "neutral" }: { params: LangParams; variant?: Variant }) {
  return (
    <Suspense fallback={<PanelSkeleton label="…" />}>
      <Work params={params} variant={variant} />
    </Suspense>
  );
}

async function Work({ params, variant }: { params: LangParams; variant: Variant }) {
  const { dict, href } = await resolveLang(params, variant);
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
