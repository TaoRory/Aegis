import type { CSSProperties } from "react";

import { d3Href, type D3Dict } from "@/content/demo3";

import { AboutStatement } from "./AboutStatement";
import { AboutTeam } from "./AboutTeam";
import { AboutValues } from "./AboutValues";
import { PageHead } from "./D3Bits";
import { FinalCta } from "./D3Final";
import { Check } from "./D3Icons";
import { D3Btn } from "./D3Btn";
import { D3Shell } from "./D3Shell";
import { Rise } from "./fx/Rise";
import { SplitReveal } from "./fx/SplitReveal";

/**
 * Trang Giới thiệu. Mỗi phần một ý chuyển động:
 * - Câu tuyên bố: tô dần từng từ theo cuộn (AboutStatement).
 * - Tấm tối "Aegis bàn giao gì": danh sách bàn giao (nội dung có sẵn ở t.own) tự đánh dấu tick lần lượt khi tấm vào màn hình.
 * - Ba nguyên tắc: một khối Aqua trượt theo hàng đang đọc (AboutValues).
 * - Ban giám đốc: bốn thẻ chân dung trồi lên so le (AboutTeam), cuối trang trước lời mời.
 * Vấn đề / Sứ mệnh giữ nguyên, chỉ trồi lên so le.
 */
export function D3About({ t }: { t: D3Dict }) {
  const { about, own } = t;
  return (
    <D3Shell t={t}>
      <PageHead title={about.title} />
      <section className="d2-wrap d2-section-tight" aria-label={about.title}>
        <AboutStatement text={about.statement} />
        <dl className="d2-two-col d3-about-story">
          {about.story.map((item, i) => (
            <Rise key={item.label} index={i} className="d2-story-item">
              <dt className="d2-h3">{item.label}</dt>
              <dd className="mt-3 text-muted">{item.text}</dd>
            </Rise>
          ))}
        </dl>
      </section>

      <section className="d2-wrap d2-section-tight" aria-labelledby="d2-promise-title">
        <Rise kind="pop" className="d2-promise d3-promise" data-d2-tone="dark">
          <div>
            <h2 id="d2-promise-title" className="d2-small font-semibold text-muted">
              {about.promiseLabel}
            </h2>
            <SplitReveal as="p" className="d2-h2 d3-lines mt-4 max-w-[18em]">
              {about.promise}
            </SplitReveal>
            <D3Btn href={d3Href(t.lang, "/process")} className="mt-8">
              {about.processLink}
            </D3Btn>
          </div>
          <div className="d3-handed">
            <p id="d3-handed-title" className="d2-small font-semibold text-muted">
              {own.note}
            </p>
            <ul aria-labelledby="d3-handed-title">
              {own.items.map((item, i) => (
                <li key={item.name} style={{ "--i": i } as CSSProperties}>
                  <span className="d2-tick" aria-hidden>
                    <Check />
                  </span>
                  <span>{item.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </Rise>
      </section>

      <section className="d2-wrap d2-section" aria-labelledby="d2-values-title">
        <div className="d2-split">
          <SplitReveal as="h2" id="d2-values-title" className="d2-h2 d3-lines">
            {about.valuesLabel}
          </SplitReveal>
          <AboutValues items={about.values} />
        </div>
      </section>
      <AboutTeam t={t} />
      <FinalCta t={t} />
    </D3Shell>
  );
}
