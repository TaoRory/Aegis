import Image from "next/image";

import { ArrowRight, ArrowUpRight } from "@/components/demo1/icons";
import { d3Href, d3Projects, d3Stages, type D3Dict } from "@/content/demo3";
import systemsJson from "@/content/project-systems.json";
import { fill } from "@/lib/fill";

import { d3Host, d3Previews, PageHead, Shot } from "./D3Bits";
import { FinalCta } from "./D3Final";
import { D3Link } from "./D3Link";
import { D3Shell } from "./D3Shell";
import { Rise } from "./fx/Rise";

/** Bảng màu đo từ website đang chạy (scripts/capture-project-systems.mjs) */
const systems = systemsJson as Record<string, { colors: { hex: string; role: string }[] }>;

export function D3Work({ t }: { t: D3Dict }) {
  const projects = d3Projects(t.lang);
  const columns = [0, 1, 2].map((c) => projects.filter((_, i) => i % 3 === c));
  return (
    <D3Shell t={t}>
      <PageHead title={t.work.title} lead={t.work.lead} />
      <section className="d2-wrap pb-(--d2-section)" aria-label={t.work.title}>
        <div className="d2-wall">
          {columns.map((column, c) => (
            <div key={c} className="d2-wall-col">
              {column.map((project, r) => {
                const stage = d3Stages[project.slug];
                return (
                  <Rise as={D3Link} kind="pop" key={project.slug} href={d3Href(t.lang, `/work/${project.slug}`)} className="d2-tile" data-ink={stage.ink} style={{ backgroundColor: stage.bg }}>
                    <Shot project={project} alt="" sizes="(min-width: 48rem) 30vw, 92vw" priority={r === 0} />
                    <span className="d2-tile-meta">
                      <span>
                        {project.name}
                        <span className="sr-only">, {t.work.view}</span>
                      </span>
                      <span>{project.type}</span>
                    </span>
                  </Rise>
                );
              })}
            </div>
          ))}
        </div>
      </section>
      <FinalCta t={t} />
    </D3Shell>
  );
}

export function D3Case({ t, slug }: { t: D3Dict; slug: string }) {
  const projects = d3Projects(t.lang);
  const index = projects.findIndex((project) => project.slug === slug);
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];
  const stage = d3Stages[project.slug];
  const full = d3Previews[project.slug]?.full;
  const colors = systems[project.slug]?.colors ?? [];
  const alt = fill(t.work.shotAlt, { name: project.name });
  return (
    <D3Shell t={t}>
      <div className="d2-wrap pt-[clamp(1.5rem,1rem+2vw,3rem)]">
        <p className="d2-small">
          <D3Link href={d3Href(t.lang, "/work")} className="d2-link">
            {t.work.all}
          </D3Link>
        </p>
        <header className="d2-feature mt-5" data-ink={stage.ink} style={{ backgroundColor: stage.bg }}>
          <div>
            <h1 className="d2-feature-name">{project.name}</h1>
            <p className="mt-4 max-w-[30rem]">{project.description}</p>
            <a href={project.url} target="_blank" rel="noopener noreferrer" className="d2-btn d2-btn-ink mt-7">
              {t.work.visit}
              <ArrowUpRight />
            </a>
          </div>
          <Shot project={project} alt={alt} sizes="(min-width: 56rem) 52vw, 92vw" priority />
        </header>
      </div>

      <section className="d2-wrap d2-section-tight" aria-label={project.name}>
        <div className="d2-two-col">
          <dl className="d2-facts">
            <div>
              <dt>{t.work.type}</dt>
              <dd>{project.type}</dd>
            </div>
            <div>
              <dt>{t.work.category}</dt>
              <dd>{t.categories[project.category]}</dd>
            </div>
            <div>
              <dt>{t.work.address}</dt>
              <dd>
                <a href={project.url} target="_blank" rel="noopener noreferrer" className="d2-link">
                  {d3Host(project.url)}
                </a>
              </dd>
            </div>
            {project.highlights && (
              <div>
                <dt>{t.work.features}</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {project.highlights.map((item) => (
                    <span key={item} className="d2-chip">
                      {item}
                    </span>
                  ))}
                </dd>
              </div>
            )}
            {colors.length > 1 && (
              <div>
                <dt>{t.work.palette}</dt>
                <dd>
                  <ul className="d2-swatches" aria-label={t.work.palette}>
                    {colors.map((color) => (
                      <li key={color.hex}>
                        <span style={{ backgroundColor: color.hex }} />
                        {color.hex}
                      </li>
                    ))}
                  </ul>
                  <p className="d2-small mt-2 text-muted">{t.work.paletteNote}</p>
                </dd>
              </div>
            )}
          </dl>
          {full && (
            <figure className="d2-long">
              <figcaption className="d2-small font-semibold text-muted">{t.work.fullPage}</figcaption>
              <div tabIndex={0} role="group" aria-label={t.work.fullPage}>
                <Image src={full.src} alt={alt} width={full.width} height={full.height} sizes="(min-width: 56rem) 44vw, 92vw" />
              </div>
            </figure>
          )}
        </div>
      </section>

      <section className="d2-wrap d2-section-tight" aria-label={t.work.next}>
        <Rise as={D3Link} kind="pop" href={d3Href(t.lang, `/work/${next.slug}`)} className="d2-next" data-ink={d3Stages[next.slug].ink} style={{ backgroundColor: d3Stages[next.slug].bg }}>
          <span className="d2-small font-semibold">{t.work.next}</span>
          <span className="d2-feature-name">
            {next.name}
            <ArrowRight />
          </span>
        </Rise>
      </section>
      <FinalCta t={t} />
    </D3Shell>
  );
}
