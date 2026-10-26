import type { Metadata } from "next";
import Link from "next/link";

import { Panel } from "@/components/space/Panel";
import { SPACE_BASE } from "@/config/space";
import { servicesSection } from "@/content/about";
import { services } from "@/content/services";

export const metadata: Metadata = { title: "Bàn bản vẽ: dịch vụ" };

export default function ServicesPage() {
  return (
    <Panel zone="dich-vu" title="Bốn bản vẽ, *một nền móng.*" closeHref={SPACE_BASE}>
      <p data-panel-in className="mt-5 max-w-[34rem] leading-relaxed text-muted">
        {servicesSection.lead}
      </p>
      <ol className="space-sheets">
        {services.map((service, index) => (
          <li key={service.id} data-panel-in className="space-sheet" data-service={service.id}>
            <p className="label text-accent">
              BV-04.{index + 1} · {service.shortTitle}
            </p>
            <h2 className="mt-2 text-[1.5rem] leading-tight font-semibold">{service.title}</h2>
            <p className="mt-3 leading-relaxed text-muted">{service.summary}</p>
            <div className="space-sheet-cols">
              <div>
                <h3 className="label text-muted">Nhu cầu thường gặp</h3>
                <ul className="space-list">
                  {service.needs.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="label text-muted">Aegis hỗ trợ</h3>
                <ul className="space-list">
                  {service.scope.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-4 border-l-2 border-accent pl-3 leading-relaxed italic">{service.value}</p>
            <Link href={`${SPACE_BASE}/lien-he?dv=${service.id}`} className="space-cta label" data-cursor="link">
              Trao đổi về dịch vụ này →
            </Link>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
