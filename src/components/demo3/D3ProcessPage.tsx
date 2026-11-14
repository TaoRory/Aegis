import type { D3Dict } from "@/content/demo3";

import { PageHead, StepMock } from "./D3Bits";
import { FinalCta } from "./D3Final";
import { D3Handover } from "./D3Handover";
import { D3Shell } from "./D3Shell";
import { Rise } from "./fx/Rise";

function Steps({ t }: { t: D3Dict }) {
  return (
    <ol className="d2-steps">
      {t.process.steps.map((step, index) => (
        <Rise as="li" key={step.title} className="d2-step">
          <div className="d2-step-text">
            <span className="d2-step-no" aria-hidden>
              {index + 1}
            </span>
            <h2 className="d2-h3">{step.title}</h2>
            <p>{step.text}</p>
            <span className="d2-chip">{step.plans}</span>
          </div>
          <div className="d2-step-stage" aria-hidden>
            <StepMock t={t} kind={step.mock} />
          </div>
        </Rise>
      ))}
    </ol>
  );
}

export function D3Process({ t }: { t: D3Dict }) {
  return (
    <D3Shell t={t}>
      <PageHead title={t.process.title} lead={t.process.lead} />
      <section className="d2-wrap" aria-label={t.process.title}>
        <Steps t={t} />
      </section>
      <section aria-labelledby="d2-own-title" className="d2-wrap d2-section">
        <div className="d2-split">
          <div>
            <h2 id="d2-own-title" className="d2-h2">
              {t.own.title}
            </h2>
            <p className="d2-lead mt-4">{t.own.lead}</p>
          </div>
          <D3Handover t={t} />
        </div>
      </section>
      <FinalCta t={t} />
    </D3Shell>
  );
}
