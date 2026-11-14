import { ArrowRight } from "@/components/demo1/icons";
import { d3Contact, d3Href, d3ServiceLayer, type D3Dict, type D3ServiceId } from "@/content/demo3";

import { Checks, LayerMock, PageHead } from "./D3Bits";
import { FinalCta } from "./D3Final";
import { D3Link } from "./D3Link";
import { D3Shell } from "./D3Shell";
import { Rise } from "./fx/Rise";

const SERVICE_STAGE: Record<D3ServiceId, string> = { web: "cloud", growth: "aqua", social: "ink", ai: "white" };

export function D3Services({ t }: { t: D3Dict }) {
  const { services } = t;
  return (
    <D3Shell t={t}>
      <PageHead title={services.title} lead={services.lead} />
      <section className="d2-wrap d2-section-tight" aria-label={services.title}>
        <ul className="d2-svc-rows">
          {services.items.map((service) => (
            <Rise as="li" key={service.id} className="d2-svc-row">
              <div className="d2-svc-stage" data-stage={SERVICE_STAGE[service.id]} aria-hidden>
                <div className="d2-layer" data-on="true" data-static="true">
                  <div className="d2-layer-head">
                    <span>{t.home.layers[d3ServiceLayer[service.id]].name}</span>
                  </div>
                  <LayerMock t={t} layer={d3ServiceLayer[service.id]} />
                </div>
              </div>
              <div className="d2-svc-copy">
                <h2 className="d2-h2">{service.name}</h2>
                <p className="mt-4 text-muted">{service.lead}</p>
                <p className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="d2-small font-semibold text-muted">{services.includedIn}</span>
                  <span className="d2-chip">{service.plans}</span>
                </p>
                <D3Link href={d3Href(t.lang, `/services/${service.id}`)} className="d2-btn d2-btn-line mt-7">
                  {services.open}: {service.name}
                  <ArrowRight />
                </D3Link>
              </div>
            </Rise>
          ))}
        </ul>
      </section>
      <FinalCta t={t} />
    </D3Shell>
  );
}

export function D3Service({ t, id }: { t: D3Dict; id: D3ServiceId }) {
  const { services } = t;
  const service = services.items.find((item) => item.id === id)!;
  const layer = d3ServiceLayer[id];
  return (
    <D3Shell t={t}>
      <header className="d2-wrap d2-pagehead d2-svc-head">
        <div>
          <p className="d2-small">
            <D3Link href={d3Href(t.lang, "/services")} className="d2-link">
              {t.chrome.allServices}
            </D3Link>
          </p>
          <h1 className="d2-display mt-5">{service.name}</h1>
          <p className="d2-lead mt-6">{service.lead}</p>
          <div className="d2-hero-actions">
            <D3Link href={d3Contact(t.lang)} className="d2-btn d2-btn-primary">
              {t.cta}
              <ArrowRight />
            </D3Link>
            <D3Link href={d3Href(t.lang, "/plans")} className="d2-btn d2-btn-line">
              {t.home.secondary}
            </D3Link>
          </div>
        </div>
        <div className="d2-svc-stage" data-stage={SERVICE_STAGE[id]} aria-hidden>
          <div className="d2-layer" data-on="true" data-static="true">
            <div className="d2-layer-head">
              <span>{t.home.layers[layer].name}</span>
              <span className="d2-chip">{t.chrome.illustration}</span>
            </div>
            <LayerMock t={t} layer={layer} />
          </div>
        </div>
      </header>

      <section className="d2-wrap d2-section-tight" aria-label={service.name}>
        <div className="d2-two-col">
          <div>
            <h2 className="d2-h3">{services.whatWeDo}</h2>
            <Checks items={service.scope} />
          </div>
          <div>
            <h2 className="d2-h3">{services.goodFit}</h2>
            <ul className="d2-rows">
              {service.fit.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-7 flex flex-wrap items-center gap-2">
              <span className="d2-small font-semibold text-muted">{services.includedIn}</span>
              <span className="d2-chip">{service.plans}</span>
            </p>
            {service.note && <p className="d2-note mt-5">{service.note}</p>}
          </div>
        </div>
      </section>

      <section className="d2-wrap d2-section-tight" aria-labelledby="d2-others-title">
        <h2 id="d2-others-title" className="d2-h3">
          {services.others}
        </h2>
        <ul className="d2-svc-index mt-5">
          {services.items
            .filter((item) => item.id !== id)
            .map((item) => (
              <li key={item.id}>
                <D3Link href={d3Href(t.lang, `/services/${item.id}`)}>
                  <span className="d2-svc-name">{item.name}</span>
                  <span className="d2-svc-line">{item.line}</span>
                  <span className="d2-chip">{item.plans}</span>
                  <ArrowRight />
                </D3Link>
              </li>
            ))}
        </ul>
      </section>
      <FinalCta t={t} />
    </D3Shell>
  );
}
