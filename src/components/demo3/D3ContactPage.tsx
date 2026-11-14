import { ContactWizard } from "@/components/contact/ContactWizard";
import type { D3Dict } from "@/content/demo3";
import { isContactDeliveryConfigured } from "@/lib/contact/delivery";

import { D3Shell } from "./D3Shell";
import { SplitReveal } from "./fx/SplitReveal";

/**
 * Phiếu yêu cầu: dùng lại đúng form từng bước của trang chính (gửi thật qua src/lib/contact/delivery.ts, không giả lập thành công).
 * Chuyển động chỉ ở phần đầu trang: tiêu đề hiện theo dòng, câu dẫn trồi lên ngay sau (chữ luôn hiện).
 * Form giữ nguyên, không thêm hiệu ứng: đây là chỗ người ta làm việc, không phải chỗ trình diễn.
 */
export function D3ContactPage({ t }: { t: D3Dict }) {
  return (
    <D3Shell t={t}>
      <section aria-labelledby="d2-contact-title" className="d2-wrap d2-pagehead pb-(--d2-section)">
        <div className="d3-contact-head">
          <SplitReveal as="h1" id="d2-contact-title" trigger="load" className="d2-h2 max-w-[16em]">
            {t.contact.title}
          </SplitReveal>
          <p className="d2-lead">{t.contact.lead}</p>
        </div>
        <div className="mt-12">
          <ContactWizard isConfigured={isContactDeliveryConfigured()} lang={t.lang} sheetCode="" />
        </div>
      </section>
    </D3Shell>
  );
}
