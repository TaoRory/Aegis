"use client";

import Image from "next/image";

import { ContactWizard } from "@/components/contact/ContactWizard";
import previews from "@/content/project-previews.json";
import { showroom, type PackageId, type SectionId } from "@/content/showroom";

/**
 * Nội dung từng khu của Studio Aegis. Dùng chung cho khung nội dung (cảnh 3D) và bản phẳng, nên chữ luôn nằm trong HTML.
 * `onQuote`: khách bấm "Nhận báo giá" ở một gói → nơi gọi mở khu Liên hệ với dịch vụ + lời nhắn đã điền sẵn.
 */

export interface Quote {
  service: "web" | "marketing";
  note: string;
}

const s = showroom;
type Previews = Record<string, { cover: { src: string; width: number; height: number } }>;

function Heading({ index, title, lead }: { index: string; title: string; lead?: string }) {
  return (
    <header className="sr-head">
      <p className="label text-accent">{index}</p>
      <h2 className="sr-title">{title}</h2>
      {lead && <p className="sr-lead">{lead}</p>}
    </header>
  );
}

export function WebSection({ onQuote }: { onQuote: (q: Quote) => void }) {
  const w = s.web;
  return (
    <div className="sr-body">
      <Heading index="01 · Website & App" title={w.estate.heading} lead={w.estate.lead} />
      <dl className="sr-estate">
        {w.estate.points.map((p) => (
          <div key={p.term} className="sr-estate-item">
            <dt>{p.term}</dt>
            <dd>{p.text}</dd>
          </div>
        ))}
      </dl>

      <h3 className="sr-subtitle">{w.packagesHeading}</h3>
      <p className="sr-muted">{w.packagesLead}</p>
      <div className="sr-packages">
        {w.packages.map((pkg) => (
          <article key={pkg.id} className="sr-package" data-pkg={pkg.id}>
            <p className="label text-accent">{pkg.model}</p>
            <h4 className="sr-package-name">{pkg.name}</h4>
            <p className="sr-package-tag">{pkg.tagline}</p>
            <ul className="sr-list">
              {pkg.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="sr-fit">
              <span className="label">Phù hợp</span> {pkg.fit}
            </p>
            <button type="button" className="sr-cta" onClick={() => onQuote({ service: "web", note: pkg.quoteNote })} data-cursor="link">
              {pkg.cta} <span aria-hidden>→</span>
            </button>
          </article>
        ))}
      </div>

      <h3 className="sr-subtitle">{w.compare.heading}</h3>
      <div className="sr-table-wrap">
        <table className="sr-table">
          <thead>
            <tr>
              <th scope="col">
                <span className="sr-only">Hạng mục</span>
              </th>
              {w.compare.columns.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {w.compare.rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {row.values.map((v, i) => (
                  <td key={i} data-yes={v}>
                    {v ? <span aria-label="Có">✓</span> : <span aria-label="Không">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="sr-muted">{w.priceNote}</p>

      <h3 className="sr-subtitle">{w.processHeading}</h3>
      <ol className="sr-steps">
        {w.process.map((step, i) => (
          <li key={step.title}>
            <span className="label text-accent">0{i + 1}</span>
            <strong>{step.title}</strong>
            <span>{step.description}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ProjectsSection() {
  const p = s.projects;
  const pv = previews as Previews;
  return (
    <div className="sr-body">
      <Heading index="02 · Dự án" title={p.title} lead={p.lead} />
      <ul className="sr-projects">
        {p.items.map((item) => {
          const cover = pv[item.slug]?.cover;
          return (
            <li key={item.slug} className="sr-project">
              <a href={item.url} target="_blank" rel="noopener noreferrer" data-cursor="link">
                {cover && <Image src={cover.src} width={cover.width} height={cover.height} alt={`Ảnh chụp trang chủ website ${item.name}`} sizes="(max-width: 64rem) 90vw, 300px" className="sr-project-img" />}
                <span className="sr-project-meta">
                  <span className="label">{item.type}</span>
                  <strong>{item.name}</strong>
                  {item.highlights && item.highlights.length > 0 && <span className="sr-project-tags">{item.highlights.join(" · ")}</span>}
                  <span className="sr-project-open">
                    {p.open} <span aria-hidden>↗</span>
                    <span className="sr-only"> (mở trong tab mới)</span>
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function MarketingSection({ onQuote }: { onQuote: (q: Quote) => void }) {
  const m = s.marketing;
  return (
    <div className="sr-body">
      <Heading index="03 · Digital Marketing" title={m.title} lead={m.summary} />
      <div className="sr-two">
        <div>
          <h3 className="sr-subtitle">{m.needsHeading}</h3>
          <ul className="sr-list">
            {m.needs.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="sr-subtitle">{m.scopeHeading}</h3>
          <ul className="sr-list">
            {m.scope.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      </div>
      <h3 className="sr-subtitle">{m.approach.heading}</h3>
      <ol className="sr-steps">
        {m.approach.steps.map((step, i) => (
          <li key={step.title}>
            <span className="label text-accent">0{i + 1}</span>
            <strong>{step.title}</strong>
            <span>{step.description}</span>
          </li>
        ))}
      </ol>
      <aside className="sr-note">
        <p className="label text-accent">{m.link.heading}</p>
        <p>{m.link.text}</p>
      </aside>
      <button type="button" className="sr-cta" onClick={() => onQuote({ service: "marketing", note: m.quoteNote })} data-cursor="link">
        {m.cta} <span aria-hidden>→</span>
      </button>
    </div>
  );
}

export function AboutSection() {
  const a = s.about;
  return (
    <div className="sr-body">
      <Heading index="04 · Về Aegis" title={a.title} lead={a.statement} />
      <ul className="sr-values">
        {a.values.map((v, i) => (
          <li key={v.title}>
            <span className="label text-accent">0{i + 1}</span>
            <strong>{v.title}</strong>
            <span>{v.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ContactSection({ isConfigured, quote, scrollMode }: { isConfigured: boolean; quote: Quote | null; scrollMode: "window" | "element" }) {
  return (
    <div className="sr-body">
      <Heading index="05 · Liên hệ" title={s.contact.title} lead={s.contact.lead} />
      <ContactWizard key={quote?.note ?? "none"} isConfigured={isConfigured} scrollMode={scrollMode} sheetCode="" lang="vi" presetService={quote?.service} presetMessage={quote?.note} />
    </div>
  );
}

export function SectionContent({ id, isConfigured, quote, onQuote, scrollMode }: { id: SectionId; isConfigured: boolean; quote: Quote | null; onQuote: (q: Quote) => void; scrollMode: "window" | "element" }) {
  switch (id) {
    case "web":
      return <WebSection onQuote={onQuote} />;
    case "projects":
      return <ProjectsSection />;
    case "marketing":
      return <MarketingSection onQuote={onQuote} />;
    case "about":
      return <AboutSection />;
    case "contact":
      return <ContactSection isConfigured={isConfigured} quote={quote} scrollMode={scrollMode} />;
  }
}

export type { PackageId };
