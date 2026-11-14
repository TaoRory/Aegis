import { ArrowRight } from "@/components/demo1/icons";
import { d3Href, type D3Dict } from "@/content/demo3";

import { PageHead } from "./D3Bits";
import { FinalCta } from "./D3Final";
import { D3Link } from "./D3Link";
import { D3Shell } from "./D3Shell";
import { Rise } from "./fx/Rise";

export function D3About({ t }: { t: D3Dict }) {
  const { about } = t;
  return (
    <D3Shell t={t}>
      <PageHead title={about.title} />
      <section className="d2-wrap d2-section-tight" aria-label={about.title}>
        <p className="d2-statement max-w-[22em]">{about.statement}</p>
        <dl className="d2-two-col mt-12">
          {about.story.map((item) => (
            <Rise key={item.label} className="d2-story-item">
              <dt className="d2-h3">{item.label}</dt>
              <dd className="mt-3 text-muted">{item.text}</dd>
            </Rise>
          ))}
        </dl>
      </section>

      <section className="d2-wrap d2-section-tight" aria-labelledby="d2-promise-title">
        <Rise kind="pop" className="d2-promise" data-d2-tone="dark">
          <h2 id="d2-promise-title" className="d2-small font-semibold text-muted">
            {about.promiseLabel}
          </h2>
          <p className="d2-h2 mt-4 max-w-[18em]">{about.promise}</p>
          <D3Link href={d3Href(t.lang, "/process")} className="d2-btn d2-btn-primary mt-8">
            {about.processLink}
            <ArrowRight />
          </D3Link>
        </Rise>
      </section>

      <section className="d2-wrap d2-section" aria-labelledby="d2-values-title">
        <div className="d2-split">
          <h2 id="d2-values-title" className="d2-h2">
            {about.valuesLabel}
          </h2>
          <dl className="d2-values">
            {about.values.map((value) => (
              <Rise key={value.title}>
                <dt className="d2-h3">{value.title}</dt>
                <dd className="mt-2 text-muted">{value.description}</dd>
              </Rise>
            ))}
          </dl>
        </div>
      </section>
      <FinalCta t={t} />
    </D3Shell>
  );
}
