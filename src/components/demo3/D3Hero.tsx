import { ArrowRight } from "@/components/demo1/icons";
import { d3Contact, d3Href, type D3Dict } from "@/content/demo3";

import { D3Asset } from "./D3Asset";
import { D3Link } from "./D3Link";

/** Màn đầu trang chủ /demo3: lời chào hàng + "tài sản số" bốn lớp đổi theo gói */
export function D3Hero({ t }: { t: D3Dict }) {
  const { home } = t;
  return (
    <section id="top" aria-labelledby="d2-hero-title" className="d2-wrap d2-hero">
      <h1 id="d2-hero-title" className="d2-display max-w-[15em]">
        {home.h1[0]} <span className="d2-mark">{home.h1[1]}</span>
      </h1>
      <div className="d2-hero-row">
        <p className="d2-lead">{home.lead}</p>
        <div className="d2-hero-actions">
          <D3Link href={d3Contact(t.lang)} className="d2-btn d2-btn-primary">
            {t.cta}
            <ArrowRight />
          </D3Link>
          <D3Link href={d3Href(t.lang, "/plans")} className="d2-btn d2-btn-line">
            {home.secondary}
          </D3Link>
        </div>
      </div>
      <D3Asset t={t} />
    </section>
  );
}
