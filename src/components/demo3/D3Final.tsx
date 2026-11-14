import { d3Contact, d3Href, type D3Dict } from "@/content/demo3";

import { D3Link } from "./D3Link";
import { FinalStage } from "./FinalStage";
import { Rise } from "./fx/Rise";
import { SplitReveal } from "./fx/SplitReveal";
import { ArrowSwap } from "./HomeArrowSwap";

/**
 * Lời mời cuối trang (có ở mọi trang): MỘT tấm tối lồng trong lề trang, nền "bó sợi" màu Aegis phía sau (FinalStage),
 * tiêu đề hiện theo dòng, hai ô lớn trồi lên so le (xem dự án / nhận báo giá). Ô báo giá là ô chính: teal đặc.
 */
export function FinalCta({ t }: { t: D3Dict }) {
  return (
    <section aria-labelledby="d2-final-title" className="d3-final">
      <FinalStage labels={t.x.shell.final}>
        <div className="d2-wrap d3-final-inner">
          <SplitReveal as="h2" id="d2-final-title" className="d2-display">
            {t.final.title}
          </SplitReveal>
          <div className="d2-final">
            <Rise as={D3Link} kind="pop" href={d3Href(t.lang, "/work")}>
              <span className="d2-final-title">
                {t.final.work}
                <ArrowSwap />
              </span>
              <p className="text-muted">{t.final.workLine}</p>
            </Rise>
            <Rise as={D3Link} kind="pop" index={1} href={d3Contact(t.lang)}>
              <span className="d2-final-title">
                {t.final.call}
                <ArrowSwap />
              </span>
              <p>{t.final.callLine}</p>
            </Rise>
          </div>
        </div>
      </FinalStage>
    </section>
  );
}
