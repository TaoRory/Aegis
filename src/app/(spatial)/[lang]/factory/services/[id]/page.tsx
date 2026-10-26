import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Panel } from "@/components/space/Panel";
import { PanelSkeleton } from "@/components/space/PanelParts";
import { ProjectCards } from "@/components/space/ProjectCards";
import { ServiceGrid } from "@/components/space/ServiceGrid";
import { hasLocale, serviceIds, servicesWithDemo } from "@/config/space";
import { getFactoryDict } from "@/content/factory";
import type { ServiceId } from "@/content/types";
import { resolveLang, type LangParams } from "../../_lib";

type Params = Promise<{ lang: string; id: string }>;

export function generateStaticParams() {
  return serviceIds.map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, id } = await params;
  if (!hasLocale(lang)) return {};
  const service = getFactoryDict(lang).services.find((s) => s.id === id);
  return service ? { title: service.title, description: service.summary } : {};
}

export default function ServicePage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<PanelSkeleton label="…" />}>
      <ServicePavilion params={params} />
    </Suspense>
  );
}

/**
 * Một khu dịch vụ. Cả bốn khu dùng cùng cấu trúc (ngang hàng): tóm tắt, nhu cầu thường gặp, phạm vi hỗ trợ, giá trị,
 * bằng chứng (dự án thật nếu có), demo minh họa (nếu chưa có dự án công bố), nút trao đổi, rồi ba dịch vụ còn lại.
 * Trước/sau đi vòng tròn: không có dịch vụ "đầu" hay "cuối".
 */
async function ServicePavilion({ params }: { params: Params }) {
  const { id } = await params;
  const { dict, href } = await resolveLang(params as LangParams);
  const index = dict.services.findIndex((s) => s.id === id);
  if (index < 0) notFound();
  const service = dict.services[index];
  const sid = service.id as ServiceId;
  const copy = dict.servicesPage;
  const n = dict.services.length;
  const prev = dict.services[(index + n - 1) % n];
  const next = dict.services[(index + 1) % n];
  const proof = dict.projects.filter((p) => p.services.includes(sid));
  const hasDemo = servicesWithDemo.includes(sid);
  const serviceName = (sidOf: ServiceId) => dict.services.find((s) => s.id === sidOf)?.shortTitle ?? sidOf;

  return (
    <Panel
      zone={sid}
      eyebrow={service.shortTitle}
      title={service.title}
      closeHref={href()}
      prev={{ href: href(`services/${prev.id}`), label: prev.shortTitle }}
      next={{ href: href(`services/${next.id}`), label: next.shortTitle }}
    >
      <p data-panel-in className="mt-5 max-w-[36rem] text-[1.15rem] leading-relaxed">
        {service.summary}
      </p>

      <div data-panel-in className="space-sheet-cols mt-8">
        <section>
          <h2 className="label text-muted">{copy.needs}</h2>
          <ul className="space-list">
            {service.needs.map((need) => (
              <li key={need}>{need}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="label text-muted">{copy.scope}</h2>
          <ul className="space-list">
            {service.scope.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
      <p data-panel-in className="mt-6 border-l-2 border-accent pl-3 leading-relaxed italic">
        <span className="label block text-muted not-italic">{copy.value}</span>
        {service.value}
      </p>
      <Link data-panel-in href={`${href("contact")}?dv=${sid}`} className="space-cta label" data-cursor="link">
        {copy.start} →
      </Link>

      {hasDemo && (
        <section data-panel-in className="space-demo-card">
          <p className="label text-accent">{copy.demo}</p>
          <p className="mt-2 leading-relaxed text-muted">{copy.demoLead}</p>
          <p className="label mt-3 text-subtle">{dict.ui.demoBadge}</p>
          <Link href={href(`services/${sid}/demo`)} className="space-cta label" data-cursor="link">
            {copy.demoCta} →
          </Link>
        </section>
      )}

      <h2 data-panel-in className="label mt-10 text-accent">
        {copy.proof}
      </h2>
      {proof.length > 0 ? (
        <ProjectCards projects={proof} href={(slug) => href(`work/${slug}`)} label={dict.ui.product.label} view={dict.work.view} serviceName={serviceName} />
      ) : (
        <p data-panel-in className="mt-3 max-w-[36rem] leading-relaxed text-muted">
          {copy.noProof}
        </p>
      )}
      {sid === "web" && (
        <Link data-panel-in href={href("studio")} className="space-step label mt-6 inline-flex">
          {copy.studioLink} →
        </Link>
      )}

      <h2 data-panel-in className="label mt-10 text-accent">
        {copy.others}
      </h2>
      <ServiceGrid services={dict.services} href={(other) => href(`services/${other}`)} exclude={sid} compact />
    </Panel>
  );
}
