import type { Metadata } from "next";
import { Suspense } from "react";

import { ContactWizard } from "@/components/contact/ContactWizard";
import { Panel } from "@/components/space/Panel";
import { PanelSkeleton } from "@/components/space/PanelParts";
import { isContactDeliveryConfigured } from "@/lib/contact/delivery";
import { resolveLang, titleFor, type LangParams } from "../_lib";

export async function generateMetadata({ params }: { params: LangParams }): Promise<Metadata> {
  return titleFor(params, (d) => d.ui.zones.contact.name);
}

export default function FactoryContactPage({ params }: { params: LangParams }) {
  return (
    <Suspense fallback={<PanelSkeleton label="…" />}>
      <Contact params={params} />
    </Suspense>
  );
}

async function Contact({ params }: { params: LangParams }) {
  const { dict, href } = await resolveLang(params);
  return (
    <Panel zone="contact" title={dict.contact.title} closeHref={href()}>
      <p data-panel-in className="mt-5 max-w-[34rem] leading-relaxed text-muted">
        {dict.contact.lead}
      </p>
      <div data-panel-in className="mt-8">
        <ContactWizard isConfigured={isContactDeliveryConfigured()} scrollMode="element" sheetCode="" />
      </div>
    </Panel>
  );
}
