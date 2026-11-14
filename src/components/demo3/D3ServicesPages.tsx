import { ArrowRight } from "@/components/demo1/icons";
import { d3Contact, d3Href, d3ServiceLayer, type D3Dict, type D3ServiceId } from "@/content/demo3";

import { LayerMock, PageHead } from "./D3Bits";
import { FinalCta } from "./D3Final";
import { Check } from "./D3Icons";
import { D3Btn } from "./D3Btn";
import { D3Link } from "./D3Link";
import { D3Shell } from "./D3Shell";
import { Rise } from "./fx/Rise";
import { SplitReveal } from "./fx/SplitReveal";
import { ServicesStage } from "./ServicesStage";

/** Màu sân khấu của từng dịch vụ: bốn tông khác nhau của bảng màu Aegis (kiểu ở demo2.css và services.css) */
const SERVICE_STAGE: Record<D3ServiceId, string> = { web: "cloud", growth: "aqua", social: "ink", ai: "teal" };

/** Thẻ mô hình minh hoạ của một dịch vụ, đặt trên sân khấu có chiều sâu (ServicesStage) */
function ServiceMock({ t, id, label = false }: { t: D3Dict; id: D3ServiceId; label?: boolean }) {
  const layer = d3ServiceLayer[id];
  return (
    <ServicesStage tone={SERVICE_STAGE[id]}>
      <div className="d2-layer" data-on="true" data-static="true">
        <div className="d2-layer-head">
          <span>{t.home.layers[layer].name}</span>
          {label && <span className="d2-chip">{t.chrome.illustration}</span>}
        </div>
        <LayerMock t={t} layer={layer} />
      </div>
    </ServicesStage>
  );
}

/**
 * Trang danh mục dịch vụ: bốn hàng so le trái / phải. Mỗi hàng là một "host" của sân khấu:
 * rê chuột vào hàng thì chồng lớp xoè thêm, thẻ nhô lên, mô hình chạy một lượt (không phần tử nào đổi kích thước).
 */
export function D3Services({ t }: { t: D3Dict }) {
  const { services } = t;
  return (
    <D3Shell t={t}>
      <PageHead title={services.title} lead={services.lead} />
      <section className="d2-wrap d2-section-tight" aria-label={services.title}>
        <ul className="d2-svc-rows">
          {services.items.map((service) => (
            <Rise as="li" key={service.id} className="d2-svc-row d3-svc-row" data-stage-host="">
              <ServiceMock t={t} id={service.id} />
              <div className="d2-svc-copy">
                <SplitReveal as="h2" className="d2-h2 d3-lines">
                  {service.name}
                </SplitReveal>
                <p className="mt-4 text-muted">{service.lead}</p>
                <p className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="d2-small font-semibold text-muted">{services.includedIn}</span>
                  <span className="d2-chip">{service.plans}</span>
                </p>
                <D3Btn href={d3Href(t.lang, `/services/${service.id}`)} tone="line" arrow className="mt-7">
                  {`${services.open}: ${service.name}`}
                </D3Btn>
              </div>
            </Rise>
          ))}
        </ul>
      </section>
      <FinalCta t={t} />
    </D3Shell>
  );
}

/**
 * Trang chi tiết một dịch vụ.
 * Màn đầu: tiêu đề hiện theo dòng, câu dẫn và nút trồi lên so le, sân khấu mô hình phóng nhẹ vào rồi chồng lớp xoè ra.
 * Hai danh sách trồi lên theo thứ tự đọc; danh mục "dịch vụ khác" có tên cuộn và mũi tên chạy xuyên khi rê chuột.
 * `key` theo dịch vụ: đổi qua lại giữa các trang chi tiết thì dựng lại từ đầu (SplitReveal cần nội dung tĩnh).
 */
export function D3Service({ t, id }: { t: D3Dict; id: D3ServiceId }) {
  const { services } = t;
  const service = services.items.find((item) => item.id === id)!;
  return (
    <D3Shell t={t}>
      <header key={`head-${id}`} className="d2-wrap d2-pagehead d2-svc-head d3-svc-hero">
        <div>
          <p className="d2-small">
            <D3Link href={d3Href(t.lang, "/services")} className="d2-link">
              {t.chrome.allServices}
            </D3Link>
          </p>
          <SplitReveal as="h1" trigger="load" className="d2-display d3-lines mt-5">
            {service.name}
          </SplitReveal>
          <Rise as="p" index={1} className="d2-lead mt-6">
            {service.lead}
          </Rise>
          <Rise index={2} className="d2-hero-actions">
            <D3Btn href={d3Contact(t.lang)}>{t.cta}</D3Btn>
            <D3Btn href={d3Href(t.lang, "/plans")} tone="line">
              {t.home.secondary}
            </D3Btn>
          </Rise>
        </div>
        <Rise kind="pop" index={1} data-stage-host="">
          <ServiceMock t={t} id={id} label />
        </Rise>
      </header>

      <section key={`body-${id}`} className="d2-wrap d2-section-tight" aria-label={service.name}>
        <div className="d2-two-col">
          <div>
            <h2 className="d2-h3">{services.whatWeDo}</h2>
            <ul className="d2-checks d3-checks">
              {service.scope.map((item, i) => (
                <Rise as="li" key={item} index={i}>
                  <Check />
                  <span>{item}</span>
                </Rise>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="d2-h3">{services.goodFit}</h2>
            <ul className="d2-rows d3-fit">
              {service.fit.map((item, i) => (
                <Rise as="li" key={item} index={i + 1}>
                  {item}
                </Rise>
              ))}
            </ul>
            <Rise as="p" index={service.fit.length + 1} className="mt-7 flex flex-wrap items-center gap-2">
              <span className="d2-small font-semibold text-muted">{services.includedIn}</span>
              <span className="d2-chip">{service.plans}</span>
            </Rise>
            {service.note && (
              <Rise as="p" index={service.fit.length + 2} className="d2-note mt-5">
                {service.note}
              </Rise>
            )}
          </div>
        </div>
      </section>

      <section key={`others-${id}`} className="d2-wrap d2-section-tight" aria-labelledby="d2-others-title">
        <h2 id="d2-others-title" className="d2-h3">
          {services.others}
        </h2>
        <ul className="d2-svc-index d3-svc-others mt-5">
          {services.items
            .filter((item) => item.id !== id)
            .map((item, i) => (
              <Rise as="li" key={item.id} index={i}>
                <D3Link href={d3Href(t.lang, `/services/${item.id}`)}>
                  <span className="d2-svc-name d3-roll">
                    <span>{item.name}</span>
                    <span aria-hidden>{item.name}</span>
                  </span>
                  <span className="d2-svc-line">{item.line}</span>
                  <span className="d2-chip">{item.plans}</span>
                  <span className="d3-arrow-pass" aria-hidden>
                    <ArrowRight />
                    <ArrowRight />
                  </span>
                </D3Link>
              </Rise>
            ))}
        </ul>
      </section>
      <FinalCta t={t} />
    </D3Shell>
  );
}
