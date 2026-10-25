import type { ReactNode } from "react";

import { getTemplate } from "@/content/templates";
import { DemoBar } from "@/templates/_kit/DemoBar";
import { DemoClosing } from "@/templates/_kit/DemoClosing";

/**
 * Khung chung của một trang mẫu: biến font của mẫu + nội dung mẫu + màn kết + thanh demo.
 * Route chỉ cần: export const metadata = demoMetadata(SLUG); export default () => <DemoShell slug={SLUG} fonts={…}><Comp /></DemoShell>
 */
export function DemoShell({ slug, fonts, children }: { slug: string; fonts: string; children: ReactNode }) {
  const { template, index, next } = getTemplate(slug);
  return (
    <div className={fonts}>
      {children}
      <DemoClosing template={template} next={next} />
      <DemoBar template={template} index={index} />
    </div>
  );
}
