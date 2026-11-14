import { ArrowRight } from "@/components/demo1/icons";
import { d3Contact, type D3Dict, type D3Plan } from "@/content/demo3";

import { Checks, PageHead } from "./D3Bits";
import { FinalCta } from "./D3Final";
import { D3Btn } from "./D3Btn";
import { D3Link } from "./D3Link";
import { D3Shell } from "./D3Shell";
import { Rise } from "./fx/Rise";
import { SplitReveal } from "./fx/SplitReveal";
import { PlansCompare } from "./PlansCompare";
import { PlansFaq } from "./PlansFaq";
import { PlansStack } from "./PlansStack";

/**
 * Bảng phân cảnh của trang (mỗi phần một ý, chuyển động phải nói lên nội dung):
 * - Ba gói: thẻ xếp chồng khi cuộn. Grow nằm lên trên Own ("mọi thứ trong gói Own" + thêm), Amplify khép chồng.
 * - "Trường hợp nào giống bạn?": đường kẻ tự vẽ theo từng dòng; mỗi câu trả lời có viên màu của gói dẫn ngược về đúng thẻ.
 * - Bảng so sánh: cột Aegis là một khối liền, tự vẽ từ trên xuống khi cột vào màn hình.
 * - Câu hỏi: mở / đóng theo chiều cao, dấu cộng xoay thành dấu đóng.
 */

/** Một tấm gói. Tấm đầu nằm trong màn hình đầu nên trồi lên lúc tải; hai tấm sau tự trồi lên theo tay cuộn, không cần thêm. */
function PlanSlab({ t, plan, first }: { t: D3Dict; plan: D3Plan; first: boolean }) {
  const slab = { className: "d2-plan", "data-plan": plan.id, "data-d2-tone": plan.id === "amplify" ? "dark" : undefined };
  const content = (
    <>
      <div>
        <SplitReveal as="h2" className="d2-plan-name">
          {plan.name}
        </SplitReveal>
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
        <D3Btn href={d3Contact(t.lang)} tone="ink">
          {plan.cta}
        </D3Btn>
        <p className="d2-small">{t.plans.quoteNote}</p>
      </div>
    </>
  );
  return first ? (
    <Rise as="article" {...slab}>
      {content}
    </Rise>
  ) : (
    <article {...slab}>{content}</article>
  );
}

export function D3Plans({ t }: { t: D3Dict }) {
  const planName = (id: string) => t.plans.items.find((plan) => plan.id === id)?.name ?? id;

  return (
    <D3Shell t={t}>
      <PageHead title={t.plans.title} lead={t.plans.lead} />
      <section className="d2-wrap" aria-label={t.plans.title}>
        <PlansStack items={t.plans.items.map((plan, i) => ({ id: plan.id, node: <PlanSlab t={t} plan={plan} first={i === 0} /> }))} />
      </section>

      <section aria-labelledby="d2-fit-title" className="d2-wrap d2-section">
        <SplitReveal as="h2" id="d2-fit-title" className="d2-h2">
          {t.plans.fitTitle}
        </SplitReveal>
        <div className="d2-cases">
          {t.plans.cases.map((item, i) => {
            const links = t.x.plans.fit[i] ?? [];
            return (
              <Rise key={item.quote} index={i} className="d2-case">
                <p className="d2-case-quote">{item.quote}</p>
                <div>
                  <p>{item.answer}</p>
                  {item.note && <p className="d2-chip mt-3">{item.note}</p>}
                  {links.length > 0 && (
                    <p className="d3-plans-pills">
                      {links.map((id) => (
                        <D3Link key={id} href={`#plan-${id}`} className="d3-plans-pill" data-plan={id} aria-label={t.x.plans.seePlan.replace("{name}", planName(id))}>
                          {planName(id)}
                          <ArrowRight />
                        </D3Link>
                      ))}
                    </p>
                  )}
                </div>
              </Rise>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="d2-compare-title" className="d2-wrap d2-section-tight">
        <SplitReveal as="h2" id="d2-compare-title" className="d2-h2">
          {t.compare.title}
        </SplitReveal>
        <p className="d2-lead mt-4">{t.compare.lead}</p>
        <PlansCompare compare={t.compare} labelledBy="d2-compare-title" hint={t.x.plans.swipe} />
      </section>

      <section id="faq" aria-labelledby="d2-faq-title" className="d2-wrap d2-section">
        <div className="d2-split">
          <SplitReveal as="h2" id="d2-faq-title" className="d2-h2">
            {t.faq.title}
          </SplitReveal>
          <PlansFaq items={t.faq.items} />
        </div>
      </section>
      <FinalCta t={t} />
    </D3Shell>
  );
}
