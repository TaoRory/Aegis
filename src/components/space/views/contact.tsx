import type { Variant } from "@/config/space";
import type { Metadata } from "next";
import { Suspense } from "react";

import { ContactWizard } from "@/components/contact/ContactWizard";
import { Panel } from "@/components/space/Panel";
import { PanelSkeleton } from "@/components/space/PanelParts";
import { isContactDeliveryConfigured } from "@/lib/contact/delivery";
import { resolveLang, titleFor, type LangParams } from "@/components/space/views/lib";

export async function generateMetadata({ params }: { params: LangParams }): Promise<Metadata> {
  return titleFor(params, (d) => d.ui.zones.contact.name);
}

export function ContactView({ params, variant = "neutral" }: { params: LangParams; variant?: Variant }) {
  return (
    <Suspense fallback={<PanelSkeleton label="…" />}>
      <Contact params={params} variant={variant} />
    </Suspense>
  );
}

async function Contact({ params, variant }: { params: LangParams; variant: Variant }) {
  const { lang, dict, href } = await resolveLang(params, variant);
  return (
    <Panel zone="contact" title={dict.contact.title} closeHref={href()}>
      <p data-panel-in className="mt-5 max-w-[34rem] leading-relaxed text-muted">
        {dict.contact.lead}
      </p>
      <div data-panel-in className="mt-8">
        <ContactWizard isConfigured={isContactDeliveryConfigured()} scrollMode="element" sheetCode="" lang={lang} />
      </div>
    </Panel>
  );
}
