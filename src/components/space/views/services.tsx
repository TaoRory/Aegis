import type { Variant } from "@/config/space";
import type { Metadata } from "next";
import { Suspense } from "react";

import { Panel } from "@/components/space/Panel";
import { PanelSkeleton } from "@/components/space/PanelParts";
import { ServiceGrid } from "@/components/space/ServiceGrid";
import { resolveLang, titleFor, type LangParams } from "@/components/space/views/lib";

export async function generateMetadata({ params }: { params: LangParams }): Promise<Metadata> {
  return titleFor(params, (d) => d.ui.hud.servicesNav);
}

export function ServicesView({ params, variant = "neutral" }: { params: LangParams; variant?: Variant }) {
  return (
    <Suspense fallback={<PanelSkeleton label="…" />}>
      <Services params={params} variant={variant} />
    </Suspense>
  );
}

/** Bốn dịch vụ cạnh nhau, cùng cỡ: cánh cửa vào bốn khu dịch vụ */
async function Services({ params, variant }: { params: LangParams; variant: Variant }) {
  const { dict, href } = await resolveLang(params, variant);
  return (
    <Panel zone="hub" eyebrow={dict.ui.hud.servicesNav} title={dict.servicesPage.title} closeHref={href()}>
      <p data-panel-in className="mt-5 max-w-[36rem] leading-relaxed text-muted">
        {dict.servicesPage.lead}
      </p>
      <ServiceGrid services={dict.services} href={(id) => href(`services/${id}`)} />
    </Panel>
  );
}
