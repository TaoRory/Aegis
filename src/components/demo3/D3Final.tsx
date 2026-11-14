import { ArrowRight } from "@/components/demo1/icons";
import { d3Contact, d3Href, type D3Dict } from "@/content/demo3";

import { D3Link } from "./D3Link";
import { Rise } from "./fx/Rise";

/** Lời mời cuối trang: hai ô lớn (xem dự án / nhận báo giá) */
export function FinalCta({ t }: { t: D3Dict }) {
  return (
    <section aria-labelledby="d2-final-title" className="d2-wrap d2-section-tight pb-(--d2-section)">
      <h2 id="d2-final-title" className="d2-display">
        {t.final.title}
      </h2>
      <div className="d2-final">
        <Rise as={D3Link} kind="pop" href={d3Href(t.lang, "/work")}>
          <span className="d2-final-title">
            {t.final.work}
            <ArrowRight />
          </span>
          <p className="text-muted">{t.final.workLine}</p>
        </Rise>
        <Rise as={D3Link} kind="pop" index={1} href={d3Contact(t.lang)}>
          <span className="d2-final-title">
            {t.final.call}
            <ArrowRight />
          </span>
          <p>{t.final.callLine}</p>
        </Rise>
      </div>
    </section>
  );
}
