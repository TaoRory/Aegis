import type { Metadata } from "next";

import { Panel } from "@/components/space/Panel";
import { Rich } from "@/components/ui/Rich";
import { SPACE_BASE } from "@/config/space";
import { about, process, values } from "@/content/about";

export const metadata: Metadata = { title: "Lõi nền móng: về Aegis" };

export default function AboutPage() {
  return (
    <Panel zone="ve-aegis" title="Lõi *nền móng.*" closeHref={SPACE_BASE}>
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
        {about.valuesLabel}
      </h2>
      <ol className="space-sheets">
        {values.map((value, index) => (
          <li key={value.title} data-panel-in className="space-sheet">
            <p className="label text-muted">0{index + 1}</p>
            <h3 className="mt-1 text-[1.4rem] font-semibold">{value.title}</h3>
            <p className="mt-2 leading-relaxed text-muted">{value.description}</p>
          </li>
        ))}
      </ol>

      <h2 data-panel-in className="label mt-10 text-accent">
        {process.label}
      </h2>
      <ol className="space-sheets">
        {process.steps.map((step, index) => (
          <li key={step.title} data-panel-in className="space-sheet">
            <p className="label text-muted">Bước 0{index + 1}</p>
            <h3 className="mt-1 text-[1.25rem] font-semibold">{step.title}</h3>
            <p className="mt-2 leading-relaxed text-muted">{step.description}</p>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
