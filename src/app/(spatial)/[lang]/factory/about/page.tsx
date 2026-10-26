import type { Metadata } from "next";
import { Suspense } from "react";

import { Panel } from "@/components/space/Panel";
import { PanelSkeleton } from "@/components/space/PanelParts";
import { ServiceGrid } from "@/components/space/ServiceGrid";
import { Rich } from "@/components/ui/Rich";
import { resolveLang, titleFor, type LangParams } from "../_lib";

export async function generateMetadata({ params }: { params: LangParams }): Promise<Metadata> {
  return titleFor(params, (d) => d.ui.zones.about.name);
}

export default function AboutPage({ params }: { params: LangParams }) {
  return (
    <Suspense fallback={<PanelSkeleton label="…" />}>
      <About params={params} />
    </Suspense>
  );
}

async function About({ params }: { params: LangParams }) {
  const { dict, href } = await resolveLang(params);
  const { about } = dict;

  return (
    <Panel zone="about" title={about.title} closeHref={href()}>
      <p data-panel-in className="mt-5 text-[1.35rem] leading-snug font-medium">
        <Rich text={about.statement} />
      </p>
      <p data-panel-in className="mt-5 max-w-[36rem] leading-relaxed text-muted">
        {about.body}
      </p>
      <p data-panel-in className="mt-6 border-l-2 border-accent pl-3 leading-relaxed">
        <span className="label block text-muted">{about.promise.label}</span>
        <Rich text={about.promise.text} />
      </p>

      <h2 data-panel-in className="label mt-10 text-accent">
        {about.servicesLabel}
      </h2>
      <ServiceGrid services={dict.services} href={(id) => href(`services/${id}`)} compact />

      <h2 data-panel-in className="label mt-10 text-accent">
        {about.valuesLabel}
      </h2>
      <ul className="space-sheets">
        {about.values.map((value) => (
          <li key={value.title} data-panel-in className="space-sheet">
            <h3 className="text-[1.4rem] font-semibold">{value.title}</h3>
            <p className="mt-2 leading-relaxed text-muted">{value.description}</p>
          </li>
        ))}
      </ul>

      <h2 data-panel-in className="label mt-10 text-accent">
        {about.processLabel}
      </h2>
      <p data-panel-in className="mt-3 max-w-[36rem] leading-relaxed text-muted">
        {about.processLead}
      </p>
      <ol className="space-sheets">
        {about.process.map((step, index) => (
          <li key={step.title} data-panel-in className="space-sheet">
            <p className="label text-muted">{String(index + 1).padStart(2, "0")}</p>
            <h3 className="mt-1 text-[1.25rem] font-semibold">{step.title}</h3>
            <p className="mt-2 leading-relaxed text-muted">{step.description}</p>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
