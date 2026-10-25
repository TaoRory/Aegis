import { ViewTransition, type ReactNode } from "react";

import { MorphCleanup } from "@/components/motion/MorphCleanup";
import { PageTransition } from "@/components/motion/PageTransition";
import previews from "@/content/template-previews.json";
import { getTemplate } from "@/content/templates";
import { DemoBar } from "@/templates/_kit/DemoBar";
import { DemoClosing } from "@/templates/_kit/DemoClosing";

/**
 * Khung chung của một trang mẫu: biến font của mẫu + nội dung mẫu + màn kết + thanh demo.
 * Route chỉ cần: export const metadata = demoMetadata(SLUG); export default () => <DemoShell slug={SLUG} fonts={…}><Comp /></DemoShell>
 *
 * .morph-target: lớp ảnh bìa phủ toàn màn hình, chỉ hiện khi vào từ thư viện (html[data-morph-from]); thẻ 3D trong thư viện
 * "phóng" thành nó (cặp ViewTransition cùng name), rồi nó mờ đi để lộ trang mẫu thật. Mở trực tiếp thì ẩn hoàn toàn.
 */
export function DemoShell({ slug, fonts, children }: { slug: string; fonts: string; children: ReactNode }) {
  const { template, index, next } = getTemplate(slug);
  const cover = (previews as Record<string, { cover: { src: string } }>)[slug]?.cover.src;
  return (
    <div className={fonts}>
      <PageTransition />
      {cover && (
        <>
          {/* Chỉ hiện khi cờ trỏ đúng mẫu này (cờ cũ của mẫu khác không làm lớp phủ nhảy ra) */}
          <style>{`@media (prefers-reduced-motion: no-preference){html[data-morph-from="${slug}"] .morph-target{visibility:visible;animation:morph-out .7s ease 1s forwards}}`}</style>
          <ViewTransition name={`tpl-${slug}`} share="aegis-morph" default="none">
            <div aria-hidden className="morph-target" style={{ backgroundImage: `url(${cover})` }} />
          </ViewTransition>
        </>
      )}
      <MorphCleanup />
      {children}
      <DemoClosing template={template} next={next} />
      <DemoBar template={template} index={index} />
    </div>
  );
}
