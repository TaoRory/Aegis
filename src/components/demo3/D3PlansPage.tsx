import { ArrowRight, Plus } from "@/components/demo1/icons";
import { d3Contact, type D3Dict } from "@/content/demo3";

import { Checks, PageHead } from "./D3Bits";
import { FinalCta } from "./D3Final";
import { D3Link } from "./D3Link";
import { D3Shell } from "./D3Shell";
import { Rise } from "./fx/Rise";

function PlanLadder({ t }: { t: D3Dict }) {
  return (
    <div className="d2-plans">
      {t.plans.items.map((plan) => (
        <Rise as="article" key={plan.id} id={`plan-${plan.id}`} className="d2-plan" data-plan={plan.id} data-d2-tone={plan.id === "amplify" ? "dark" : undefined}>
          <div>
            <h2 className="d2-plan-name">{plan.name}</h2>
            <p className="d2-plan-line">{plan.line}</p>
            <dl>
              <div>
                <dt>{t.plans.bestFor}</dt>
                <dd>{plan.bestFor}</dd>
              </div>
              <div>
                <dt>{t.plans.axis}</dt>
                <dd>{plan.stay}</dd>
              </div>
            </dl>
          </div>
          <div className="d2-plan-card">
            <h3>{t.plans.includes}</h3>
            <Checks items={plan.includes} />
            <D3Link href={d3Contact(t.lang)} className="d2-btn d2-btn-ink">
              {plan.cta}
              <ArrowRight />
            </D3Link>
            <p className="d2-small">{t.plans.quoteNote}</p>
          </div>
        </Rise>
      ))}
    </div>
  );
}

export function D3Plans({ t }: { t: D3Dict }) {
  return (
    <D3Shell t={t}>
      <PageHead title={t.plans.title} lead={t.plans.lead} />
      <section className="d2-wrap" aria-label={t.plans.title}>
        <PlanLadder t={t} />
      </section>

      <section aria-labelledby="d2-fit-title" className="d2-wrap d2-section">
        <h2 id="d2-fit-title" className="d2-h2">
          {t.plans.fitTitle}
        </h2>
        <div className="d2-cases">
          {t.plans.cases.map((item) => (
            <Rise key={item.quote} className="d2-case">
              <p className="d2-case-quote">{item.quote}</p>
              <div>
                <p>{item.answer}</p>
                {item.note && <p className="d2-chip mt-3">{item.note}</p>}
              </div>
            </Rise>
          ))}
        </div>
      </section>

      <section aria-labelledby="d2-compare-title" className="d2-wrap d2-section-tight">
        <h2 id="d2-compare-title" className="d2-h2">
          {t.compare.title}
        </h2>
        <p className="d2-lead mt-4">{t.compare.lead}</p>
        <Rise className="d2-compare" tabIndex={0} role="region" aria-labelledby="d2-compare-title">
          <table>
            <thead>
              <tr>
                <td />
                {t.compare.cols.map((col, i) => (
                  <th key={col} scope="col" className={i === 2 ? "d2-col-us" : undefined}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {t.compare.rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {row.cells.map((cell, i) => (
                    <td key={i} className={i === 2 ? "d2-col-us" : undefined}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Rise>
      </section>

      <section id="faq" aria-labelledby="d2-faq-title" className="d2-wrap d2-section">
        <div className="d2-split">
          <h2 id="d2-faq-title" className="d2-h2">
            {t.faq.title}
          </h2>
          <div className="d2-faq">
            {t.faq.items.map((item) => (
              <details key={item.q} name="d2-faq">
                <summary>
                  {item.q}
                  <Plus />
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <FinalCta t={t} />
    </D3Shell>
  );
}
