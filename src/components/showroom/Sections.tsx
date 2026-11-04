"use client";

import Image from "next/image";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { ContactWizard } from "@/components/contact/ContactWizard";
import previews from "@/content/project-previews.json";
import { showroom, type PackageId, type SectionId } from "@/content/showroom";

/**
 * Nội dung từng khu của Studio Aegis, dùng chung cho màn hình 3D (variant "screen": chữ to, chia tab, mở ra là thấy ngay
 * nội dung chính) và bản phẳng (variant "flat": mọi tab hiện nối tiếp). Chữ luôn nằm trong HTML.
 * `onQuote`: khách bấm "Nhận báo giá" ở một gói → nơi gọi mở khu Liên hệ với dịch vụ + lời nhắn đã điền sẵn.
 */

export interface Quote {
  service: "web" | "marketing";
  note: string;
}

export type Variant = "screen" | "flat";

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

/** Tab trong màn hình 3D (role tablist, phím mũi tên); bản phẳng thì hiện tất cả nối tiếp, mỗi phần một tiêu đề */
function Tabbed({ variant, label, items }: { variant: Variant; label: string; items: { id: string; label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(items[0].id);
  const base = useId();
  const listRef = useRef<HTMLDivElement>(null);
  if (variant === "flat") {
    return (
      <>
        {items.map((item) => (
          <section key={item.id} className="sr-flat-part" aria-label={item.label}>
            <h3 className="sr-subtitle">{item.label}</h3>
            {item.content}
          </section>
        ))}
      </>
    );
  }
  const onKey = (event: KeyboardEvent) => {
    const i = items.findIndex((x) => x.id === active);
    const next = event.key === "ArrowRight" ? i + 1 : event.key === "ArrowLeft" ? i - 1 : event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    const id = items[(next + items.length) % items.length].id;
    setActive(id);
    listRef.current?.querySelector<HTMLElement>(`[data-tab="${id}"]`)?.focus();
  };
  return (
    <div className="sr-tabs">
      <div ref={listRef} role="tablist" aria-label={label} className="sr-tablist" onKeyDown={onKey}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`${base}-t-${item.id}`}
            data-tab={item.id}
            aria-selected={item.id === active}
            aria-controls={`${base}-p-${item.id}`}
            tabIndex={item.id === active ? 0 : -1}
            onClick={() => setActive(item.id)}
            data-cursor="link"
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item) => (
        <div key={item.id} role="tabpanel" id={`${base}-p-${item.id}`} aria-labelledby={`${base}-t-${item.id}`} hidden={item.id !== active} className="sr-tabpanel" data-panel={item.id}>
          {item.content}
        </div>
      ))}
    </div>
  );
}

function Steps({ steps }: { steps: { title: string; description: string }[] }) {
  return (
    <ol className="sr-steps">
      {steps.map((step, i) => (
        <li key={step.title}>
          <span className="label text-accent">0{i + 1}</span>
          <strong>{step.title}</strong>
          <span>{step.description}</span>
        </li>
      ))}
    </ol>
  );
}

export function WebSection({ onQuote, variant }: { onQuote: (q: Quote) => void; variant: Variant }) {
  const w = s.web;
  const t = s.tabs.web;
  const packages = (
    <>
      <p className="sr-muted">{w.packagesLead}</p>
      <div className="sr-packages">
        {w.packages.map((pkg) => (
          <article key={pkg.id} className="sr-package" data-pkg={pkg.id}>
            <p className="label text-accent">{pkg.model}</p>
            <h3 className="sr-package-name">{pkg.name}</h3>
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
    </>
  );
  const estate = (
    <>
      <p className="sr-lead">{w.estate.lead}</p>
      <dl className="sr-estate">
        {w.estate.points.map((p, i) => (
          <div key={p.term} className="sr-estate-item">
            <span aria-hidden className="label text-accent">
              0{i + 1}
            </span>
            <dt>{p.term}</dt>
            <dd>{p.text}</dd>
          </div>
        ))}
      </dl>
    </>
  );
  const compare = (
    <>
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
    </>
  );
  return (
    <div className="sr-body" data-section="web">
      <Heading index="01 · Website & App" title={w.estate.heading} />
      <Tabbed
        variant={variant}
        label="Website & App"
        items={[
          { id: "packages", label: t.packages, content: packages },
          { id: "estate", label: t.estate, content: estate },
          { id: "compare", label: t.compare, content: compare },
          { id: "process", label: t.process, content: <Steps steps={w.process} /> },
        ]}
      />
    </div>
  );
}

export function ProjectsSection() {
  const p = s.projects;
  const pv = previews as Previews;
  return (
    <div className="sr-body" data-section="projects">
      <Heading index="02 · Dự án" title={p.title} lead={p.lead} />
      <ul className="sr-projects">
        {p.items.map((item) => {
          const cover = pv[item.slug]?.cover;
          return (
            <li key={item.slug} className="sr-project">
              <a href={item.url} target="_blank" rel="noopener noreferrer" data-cursor="link">
                {cover && <Image src={cover.src} width={cover.width} height={cover.height} alt={`Ảnh chụp trang chủ website ${item.name}`} sizes="(max-width: 64rem) 90vw, 320px" className="sr-project-img" />}
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

export function MarketingSection({ onQuote, variant }: { onQuote: (q: Quote) => void; variant: Variant }) {
  const m = s.marketing;
  const t = s.tabs.marketing;
  const cta = (
    <button type="button" className="sr-cta" onClick={() => onQuote({ service: "marketing", note: m.quoteNote })} data-cursor="link">
      {m.cta} <span aria-hidden>→</span>
    </button>
  );
  const scope = (
    <>
      <div className="sr-two">
        <div className="sr-card">
          <h3 className="sr-card-title">{m.scopeHeading}</h3>
          <ul className="sr-list">
            {m.scope.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
        <div className="sr-card">
          <h3 className="sr-card-title">{m.needsHeading}</h3>
          <ul className="sr-list">
            {m.needs.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      </div>
      {variant === "screen" && cta}
    </>
  );
  const link = (
    <>
      <aside className="sr-note">
        <p className="label text-accent">{m.link.heading}</p>
        <p>{m.link.text}</p>
      </aside>
      {cta}
    </>
  );
  return (
    <div className="sr-body" data-section="marketing">
      <Heading index="03 · Digital Marketing" title={m.title} lead={m.summary} />
      <Tabbed
        variant={variant}
        label="Digital Marketing"
        items={[
          { id: "scope", label: t.scope, content: scope },
          { id: "approach", label: t.approach, content: <Steps steps={m.approach.steps} /> },
          { id: "link", label: t.link, content: link },
        ]}
      />
    </div>
  );
}

export function AboutSection() {
  const a = s.about;
  return (
    <div className="sr-body" data-section="about">
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
    <div className="sr-body" data-section="contact">
      <Heading index="05 · Liên hệ" title={s.contact.title} lead={s.contact.lead} />
      <ContactWizard key={quote?.note ?? "none"} isConfigured={isConfigured} scrollMode={scrollMode} sheetCode="" lang="vi" presetService={quote?.service} presetMessage={quote?.note} />
    </div>
  );
}

export function SectionContent({ id, isConfigured, quote, onQuote, variant }: { id: SectionId; isConfigured: boolean; quote: Quote | null; onQuote: (q: Quote) => void; variant: Variant }) {
  switch (id) {
    case "web":
      return <WebSection onQuote={onQuote} variant={variant} />;
    case "projects":
      return <ProjectsSection />;
    case "marketing":
      return <MarketingSection onQuote={onQuote} variant={variant} />;
    case "about":
      return <AboutSection />;
    case "contact":
      return <ContactSection isConfigured={isConfigured} quote={quote} scrollMode={variant === "screen" ? "element" : "window"} />;
  }
}

export type { PackageId };
