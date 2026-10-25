import type { Metadata } from "next";

import { ContactWizard } from "@/components/contact/ContactWizard";
import { PageTransition } from "@/components/motion/PageTransition";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Lines } from "@/components/ui/Rich";
import { contactSection } from "@/content/about";
import { isContactDeliveryConfigured } from "@/lib/contact/delivery";

export const metadata: Metadata = {
  title: "Liên hệ",
  description:
    "Gửi phiếu yêu cầu cho Aegis: chọn hạng mục (AI, phần mềm quản trị, website – web app, marketing), trả lời vài câu ngắn, Aegis tư vấn giải pháp và liên hệ lại để triển khai.",
  alternates: { canonical: "/lien-he" },
};

export default function ContactPage() {
  return (
    <>
    <PageTransition />
    <section
      data-surface="dark"
      aria-labelledby="lien-he-title"
      className="ink relative min-h-svh pt-[calc(var(--header-h)+var(--section-y)*0.5)] pb-(--section-y)"
    >
      <div aria-hidden className="blueprint-grid pointer-events-none absolute inset-x-0 top-0 h-[70svh]" />
      <div className="container-page relative">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <p className="label text-muted">{contactSection.pageLabel}</p>
          <p className="label hidden text-muted sm:block">BV-06 — Bản vẽ của bạn</p>
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-end">
          <SplitReveal as="h1" id="lien-he-title" className="text-h2 font-semibold lg:col-span-8">
            <Lines lines={contactSection.pageLines} />
          </SplitReveal>
          <p className="max-w-[28rem] text-lead text-muted lg:col-span-4 lg:justify-self-end">{contactSection.pageLead}</p>
        </div>

        <div className="mt-16 lg:mt-24">
          <ContactWizard isConfigured={isContactDeliveryConfigured()} />
        </div>
      </div>
    </section>
    </>
  );
}
