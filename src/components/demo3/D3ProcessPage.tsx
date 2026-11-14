import type { D3Dict } from "@/content/demo3";

import { PageHead, StepMock } from "./D3Bits";
import { FinalCta } from "./D3Final";
import { D3Handover } from "./D3Handover";
import { D3Shell } from "./D3Shell";
import { SplitReveal } from "./fx/SplitReveal";
import { ProcessScene, type ProcessSceneStep } from "./ProcessScene";

/**
 * Dữ liệu cho cảnh cuộn: chữ của từng bước + mô hình minh hoạ dựng sẵn ở server (cảnh là Client Component, chỉ nhận phần nó cần).
 * "Bước này thuộc gói nào" suy ra từ chính chuỗi `step.plans` của nội dung (có nhắc tên gói thì chỉ các gói đó, không nhắc tên nào
 * thì là mọi gói), để thanh ray không bao giờ nói khác với chip trên thẻ.
 */
function sceneSteps(t: D3Dict, planNames: string[]): ProcessSceneStep[] {
  return t.process.steps.map((step, index) => {
    const named = planNames.map((name) => step.plans.includes(name));
    return {
      title: step.title,
      text: step.text,
      plans: step.plans,
      stop: t.x.process.stops[index] ?? "",
      kind: step.mock,
      included: named.some(Boolean) ? named : planNames.map(() => true),
      mock: <StepMock t={t} kind={step.mock} />,
    };
  });
}

export function D3Process({ t }: { t: D3Dict }) {
  const planNames = t.plans.items.map((plan) => plan.name);
  return (
    <D3Shell t={t}>
      <PageHead title={t.process.title} lead={t.process.lead} />
      <ProcessScene label={t.process.title} steps={sceneSteps(t, planNames)} plans={planNames} labels={t.x.process} />
      <section aria-labelledby="d2-own-title" className="d2-wrap d2-section">
        <div className="d2-split">
          <div>
            <SplitReveal as="h2" id="d2-own-title" className="d2-h2 d3-lines">
              {t.own.title}
            </SplitReveal>
            <p className="d2-lead mt-4">{t.own.lead}</p>
          </div>
          <D3Handover t={t} />
        </div>
      </section>
      <FinalCta t={t} />
    </D3Shell>
  );
}
