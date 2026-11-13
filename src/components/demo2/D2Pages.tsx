import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { ContactWizard } from "@/components/contact/ContactWizard";
import { D1Wordmark } from "@/components/demo1/D1Wordmark";
import { ArrowRight, ArrowUpRight, Plus } from "@/components/demo1/icons";
import { d2Contact, d2Href, d2PlanLayers, d2Projects, d2ServiceLayer, d2Stages, type D2Dict, type D2Plan, type D2ServiceId } from "@/content/demo2";
import systemsJson from "@/content/project-systems.json";
import { isContactDeliveryConfigured } from "@/lib/contact/delivery";
import { d2Date, d2Post, d2Posts, type Block, type Inline } from "@/lib/demo2-blog";
import { fill } from "@/lib/fill";

import { D2Asset } from "./D2Asset";
import { Checks, d2Host, d2Previews, FinalCta, LayerMock, PageHead, Shot, StepMock } from "./D2Bits";
import { D2Carousel } from "./D2Carousel";
import { D2Handover } from "./D2Handover";
import { D2Header } from "./D2Header";
import { D2Story } from "./D2Story";

const systems = systemsJson as Record<string, { colors: { hex: string; role: string }[] }>;

/** Metadata chung của các trang /demo2: bản chờ duyệt nên không lập chỉ mục */
export const d2Meta = (title: string, description: string): Metadata => ({
  title: { absolute: title },
  description,
  robots: { index: false, follow: false },
});

/* ------------------------------------------------------------------ Vỏ */

export function D2Shell({ t, children }: { t: D2Dict; children: ReactNode }) {
  return (
    <div lang={t.lang} className="contents">
      <a href="#d2-main" className="d2-skip">
        {t.chrome.skip}
      </a>
      <D2Header t={t} />
      <main id="d2-main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <D2Footer t={t} />
    </div>
  );
}

function D2Footer({ t }: { t: D2Dict }) {
  return (
    <footer className="d2-footer">
      <div className="d2-footer-slab" data-d2-tone="dark">
        <div className="d2-wrap">
          <div className="d2-footer-grid">
            <p className="d2-h3 max-w-[18rem]">{t.footer.tagline}</p>
            <div>
              <h3>{t.footer.services}</h3>
              <ul>
                {t.services.items.map((service) => (
                  <li key={service.id}>
                    <Link href={d2Href(t.lang, `/services/${service.id}`)}>{service.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>{t.footer.company}</h3>
              <ul>
                {t.nav.slice(1).map((item) => (
                  <li key={item.path}>
                    <Link href={d2Href(t.lang, item.path)}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>{t.footer.other}</h3>
              <ul>
                <li>
                  <Link href={d2Contact(t.lang)}>{t.cta}</Link>
                </li>
                <li>
                  <Link href="/demo1">{t.footer.demo1}</Link>
                </li>
                <li>
                  <Link href="/">{t.footer.current}</Link>
                </li>
              </ul>
            </div>
          </div>
          <D1Wordmark className="d2-wordmark" title="Aegis" />
          <div className="d2-footer-base">
            <span>{t.footer.rights}</span>
            <span>BUILD / DEPLOY / SCALE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ Khối dùng lại */

function PlanLadder({ t }: { t: D2Dict }) {
  return (
    <div className="d2-plans">
      {t.plans.items.map((plan) => (
        <article key={plan.id} id={`plan-${plan.id}`} className="d2-plan" data-plan={plan.id} data-d2-tone={plan.id === "amplify" ? "dark" : undefined}>
          <div>
            <h2 className="d2-plan-name">{plan.name}</h2>
            <p className="d2-plan-line">{plan.line}</p>
            <dl>
              <div>
                <dt>{t.plans.bestFor}</dt>
                <dd>{plan.bestFor}</dd>
              </div>
              <div>
                <dt>{t.plans.axis}</dt>
                <dd>{plan.stay}</dd>
              </div>
            </dl>
          </div>
          <div className="d2-plan-card">
            <h3>{t.plans.includes}</h3>
            <Checks items={plan.includes} />
            <Link href={d2Contact(t.lang)} className="d2-btn d2-btn-ink">
              {plan.cta}
              <ArrowRight />
            </Link>
            <p className="d2-small">{t.plans.quoteNote}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function Steps({ t }: { t: D2Dict }) {
  return (
    <ol className="d2-steps">
      {t.process.steps.map((step, index) => (
        <li key={step.title} className="d2-step">
          <div className="d2-step-text">
            <span className="d2-step-no" aria-hidden>
              {index + 1}
            </span>
            <h2 className="d2-h3">{step.title}</h2>
            <p>{step.text}</p>
            <span className="d2-chip">{step.plans}</span>
          </div>
          <div className="d2-step-stage" aria-hidden>
            <StepMock t={t} kind={step.mock} />
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Ba gói thu gọn (trang chủ): ba bề mặt, mỗi ô dẫn tới gói tương ứng ở trang Plans */
function PlanTeaser({ t, plan }: { t: D2Dict; plan: D2Plan }) {
  return (
    <Link href={d2Href(t.lang, `/plans#plan-${plan.id}`)} className="d2-teaser" data-plan={plan.id} data-d2-tone={plan.id === "amplify" ? "dark" : undefined}>
      <span className="d2-teaser-name">
        {plan.name}
        <ArrowRight />
      </span>
      <span className="d2-teaser-line">{plan.line}</span>
      <span className="d2-teaser-layers">
        {d2PlanLayers[plan.id].map((layer) => (
          <span key={layer} className="d2-chip">
            {plan.id === "amplify" && layer === "site" ? t.home.landing : t.home.layers[layer].name}
          </span>
        ))}
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------ Trang chủ */

export function D2Home({ t }: { t: D2Dict }) {
  const { home } = t;
  const projects = d2Projects(t.lang);
  const posts = d2Posts(t.lang).slice(0, 3);

  return (
    <D2Shell t={t}>
      {/* 1. Màn đầu: lời chào hàng + tài sản bốn lớp (đổi theo gói) */}
      <section id="top" aria-labelledby="d2-hero-title" className="d2-wrap d2-hero">
        <h1 id="d2-hero-title" className="d2-display max-w-[15em]">
          {home.h1[0]} <span className="d2-mark">{home.h1[1]}</span>
        </h1>
        <div className="d2-hero-row">
          <p className="d2-lead">{home.lead}</p>
          <div className="d2-hero-actions">
            <Link href={d2Contact(t.lang)} className="d2-btn d2-btn-primary">
              {t.cta}
              <ArrowRight />
            </Link>
            <Link href={d2Href(t.lang, "/plans")} className="d2-btn d2-btn-line">
              {home.secondary}
            </Link>
          </div>
        </div>
        <D2Asset t={t} />
      </section>

      {/* 2. Website đứng yên, tài sản lớn lên (ghim khi cuộn trên máy tính) */}
      <D2Story t={t} />

      {/* 3. Bốn lớp dịch vụ: danh mục chữ lớn, mỗi dòng dẫn tới trang riêng */}
      <section aria-labelledby="d2-svc-title" className="d2-wrap d2-section">
        <div className="d2-split-head">
          <h2 id="d2-svc-title" className="d2-h2">
            {home.servicesTitle}
          </h2>
          <p className="d2-lead">{home.servicesLead}</p>
        </div>
        <ul className="d2-svc-index">
          {t.services.items.map((service) => (
            <li key={service.id}>
              <Link href={d2Href(t.lang, `/services/${service.id}`)}>
                <span className="d2-svc-name">{service.name}</span>
                <span className="d2-svc-line">{service.line}</span>
                <span className="d2-chip">{service.plans}</span>
                <ArrowRight />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 4. Ba gói, thu gọn */}
      <section aria-labelledby="d2-plans-title" className="d2-wrap d2-section-tight">
        <h2 id="d2-plans-title" className="d2-h2">
          {home.plansTitle}
        </h2>
        <div className="d2-teasers">
          {t.plans.items.map((plan) => (
            <PlanTeaser key={plan.id} t={t} plan={plan} />
          ))}
        </div>
        <p className="mt-6">
          <Link href={d2Href(t.lang, "/plans")} className="d2-link font-semibold">
            {home.plansLink}
          </Link>
        </p>
      </section>

      {/* 5. Dự án: băng chuyền ngang */}
      <section aria-labelledby="d2-work-title" className="d2-section">
        <div className="d2-wrap d2-split-head">
          <h2 id="d2-work-title" className="d2-h2">
            {home.workTitle}
          </h2>
          <p className="d2-lead">{t.work.lead}</p>
        </div>
        <D2Carousel label={home.workTitle} prev={t.chrome.prev} next={t.chrome.next}>
          {projects.map((project) => {
            const stage = d2Stages[project.slug];
            return (
              <Link key={project.slug} href={d2Href(t.lang, `/work/${project.slug}`)} className="d2-tile" data-ink={stage.ink} style={{ backgroundColor: stage.bg }}>
                <Shot project={project} alt="" sizes="(min-width: 48rem) 42vw, 80vw" />
                <span className="d2-tile-meta">
                  <span>{project.name}</span>
                  <span>{project.type}</span>
                </span>
              </Link>
            );
          })}
        </D2Carousel>
        <p className="d2-wrap mt-6">
          <Link href={d2Href(t.lang, "/work")} className="d2-link font-semibold">
            {home.workLink}
          </Link>
        </p>
      </section>

      {/* 6. Blog: chỉ hiện khi đã có bài */}
      {posts.length > 0 && (
        <section aria-labelledby="d2-blog-title" className="d2-wrap d2-section-tight">
          <h2 id="d2-blog-title" className="d2-h2">
            {home.blogTitle}
          </h2>
          <PostList t={t} posts={posts} />
          <p className="mt-6">
            <Link href={d2Href(t.lang, "/blog")} className="d2-link font-semibold">
              {home.blogLink}
            </Link>
          </p>
        </section>
      )}

      <FinalCta t={t} />
    </D2Shell>
  );
}

/* ------------------------------------------------------------------ Dịch vụ */

const SERVICE_STAGE: Record<D2ServiceId, string> = { web: "cloud", growth: "aqua", social: "ink", ai: "white" };

export function D2Services({ t }: { t: D2Dict }) {
  const { services } = t;
  return (
    <D2Shell t={t}>
      <PageHead title={services.title} lead={services.lead} />
      <section className="d2-wrap d2-section-tight" aria-label={services.title}>
        <ul className="d2-svc-rows">
          {services.items.map((service) => (
            <li key={service.id} className="d2-svc-row">
              <div className="d2-svc-stage" data-stage={SERVICE_STAGE[service.id]} aria-hidden>
                <div className="d2-layer" data-on="true" data-static="true">
                  <div className="d2-layer-head">
                    <span>{t.home.layers[d2ServiceLayer[service.id]].name}</span>
                  </div>
                  <LayerMock t={t} layer={d2ServiceLayer[service.id]} />
                </div>
              </div>
              <div className="d2-svc-copy">
                <h2 className="d2-h2">{service.name}</h2>
                <p className="mt-4 text-muted">{service.lead}</p>
                <p className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="d2-small font-semibold text-muted">{services.includedIn}</span>
                  <span className="d2-chip">{service.plans}</span>
                </p>
                <Link href={d2Href(t.lang, `/services/${service.id}`)} className="d2-btn d2-btn-line mt-7">
                  {services.open}: {service.name}
                  <ArrowRight />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <FinalCta t={t} />
    </D2Shell>
  );
}

export function D2Service({ t, id }: { t: D2Dict; id: D2ServiceId }) {
  const { services } = t;
  const service = services.items.find((item) => item.id === id)!;
  const layer = d2ServiceLayer[id];
  return (
    <D2Shell t={t}>
      <header className="d2-wrap d2-pagehead d2-svc-head">
        <div>
          <p className="d2-small">
            <Link href={d2Href(t.lang, "/services")} className="d2-link">
              {t.chrome.allServices}
            </Link>
          </p>
          <h1 className="d2-display mt-5">{service.name}</h1>
          <p className="d2-lead mt-6">{service.lead}</p>
          <div className="d2-hero-actions">
            <Link href={d2Contact(t.lang)} className="d2-btn d2-btn-primary">
              {t.cta}
              <ArrowRight />
            </Link>
            <Link href={d2Href(t.lang, "/plans")} className="d2-btn d2-btn-line">
              {t.home.secondary}
            </Link>
          </div>
        </div>
        <div className="d2-svc-stage" data-stage={SERVICE_STAGE[id]} aria-hidden>
          <div className="d2-layer" data-on="true" data-static="true">
            <div className="d2-layer-head">
              <span>{t.home.layers[layer].name}</span>
              <span className="d2-chip">{t.chrome.illustration}</span>
            </div>
            <LayerMock t={t} layer={layer} />
          </div>
        </div>
      </header>

      <section className="d2-wrap d2-section-tight" aria-label={service.name}>
        <div className="d2-two-col">
          <div>
            <h2 className="d2-h3">{services.whatWeDo}</h2>
            <Checks items={service.scope} />
          </div>
          <div>
            <h2 className="d2-h3">{services.goodFit}</h2>
            <ul className="d2-rows">
              {service.fit.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-7 flex flex-wrap items-center gap-2">
              <span className="d2-small font-semibold text-muted">{services.includedIn}</span>
              <span className="d2-chip">{service.plans}</span>
            </p>
            {service.note && <p className="d2-note mt-5">{service.note}</p>}
          </div>
        </div>
      </section>

      <section className="d2-wrap d2-section-tight" aria-labelledby="d2-others-title">
        <h2 id="d2-others-title" className="d2-h3">
          {services.others}
        </h2>
        <ul className="d2-svc-index mt-5">
          {services.items
            .filter((item) => item.id !== id)
            .map((item) => (
              <li key={item.id}>
                <Link href={d2Href(t.lang, `/services/${item.id}`)}>
                  <span className="d2-svc-name">{item.name}</span>
                  <span className="d2-svc-line">{item.line}</span>
                  <span className="d2-chip">{item.plans}</span>
                  <ArrowRight />
                </Link>
              </li>
            ))}
        </ul>
      </section>
      <FinalCta t={t} />
    </D2Shell>
  );
}

/* ------------------------------------------------------------------ Các gói */

export function D2Plans({ t }: { t: D2Dict }) {
  return (
    <D2Shell t={t}>
      <PageHead title={t.plans.title} lead={t.plans.lead} />
      <section className="d2-wrap" aria-label={t.plans.title}>
        <PlanLadder t={t} />
      </section>

      <section aria-labelledby="d2-fit-title" className="d2-wrap d2-section">
        <h2 id="d2-fit-title" className="d2-h2">
          {t.plans.fitTitle}
        </h2>
        <div className="d2-cases">
          {t.plans.cases.map((item) => (
            <div key={item.quote} className="d2-case">
              <p className="d2-case-quote">{item.quote}</p>
              <div>
                <p>{item.answer}</p>
                {item.note && <p className="d2-chip mt-3">{item.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="d2-compare-title" className="d2-wrap d2-section-tight">
        <h2 id="d2-compare-title" className="d2-h2">
          {t.compare.title}
        </h2>
        <p className="d2-lead mt-4">{t.compare.lead}</p>
        <div className="d2-compare" tabIndex={0} role="region" aria-labelledby="d2-compare-title">
          <table>
            <thead>
              <tr>
                <td />
                {t.compare.cols.map((col, i) => (
                  <th key={col} scope="col" className={i === 2 ? "d2-col-us" : undefined}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {t.compare.rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {row.cells.map((cell, i) => (
                    <td key={i} className={i === 2 ? "d2-col-us" : undefined}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="faq" aria-labelledby="d2-faq-title" className="d2-wrap d2-section">
        <div className="d2-split">
          <h2 id="d2-faq-title" className="d2-h2">
            {t.faq.title}
          </h2>
          <div className="d2-faq">
            {t.faq.items.map((item) => (
              <details key={item.q} name="d2-faq">
                <summary>
                  {item.q}
                  <Plus />
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <FinalCta t={t} />
    </D2Shell>
  );
}

/* ------------------------------------------------------------------ Dự án */

export function D2Work({ t }: { t: D2Dict }) {
  const projects = d2Projects(t.lang);
  const columns = [0, 1, 2].map((c) => projects.filter((_, i) => i % 3 === c));
  return (
    <D2Shell t={t}>
      <PageHead title={t.work.title} lead={t.work.lead} />
      <section className="d2-wrap pb-(--d2-section)" aria-label={t.work.title}>
        <div className="d2-wall">
          {columns.map((column, c) => (
            <div key={c} className="d2-wall-col">
              {column.map((project, r) => {
                const stage = d2Stages[project.slug];
                return (
                  <Link key={project.slug} href={d2Href(t.lang, `/work/${project.slug}`)} className="d2-tile" data-ink={stage.ink} style={{ backgroundColor: stage.bg }}>
                    <Shot project={project} alt="" sizes="(min-width: 48rem) 30vw, 92vw" priority={r === 0} />
                    <span className="d2-tile-meta">
                      <span>
                        {project.name}
                        <span className="sr-only">, {t.work.view}</span>
                      </span>
                      <span>{project.type}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </section>
      <FinalCta t={t} />
    </D2Shell>
  );
}

export function D2Case({ t, slug }: { t: D2Dict; slug: string }) {
  const projects = d2Projects(t.lang);
  const index = projects.findIndex((project) => project.slug === slug);
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];
  const stage = d2Stages[project.slug];
  const full = d2Previews[project.slug]?.full;
  const colors = systems[project.slug]?.colors ?? [];
  const alt = fill(t.work.shotAlt, { name: project.name });
  return (
    <D2Shell t={t}>
      <div className="d2-wrap pt-[clamp(1.5rem,1rem+2vw,3rem)]">
        <p className="d2-small">
          <Link href={d2Href(t.lang, "/work")} className="d2-link">
            {t.work.all}
          </Link>
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
                  {d2Host(project.url)}
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
        <Link href={d2Href(t.lang, `/work/${next.slug}`)} className="d2-next" data-ink={d2Stages[next.slug].ink} style={{ backgroundColor: d2Stages[next.slug].bg }}>
          <span className="d2-small font-semibold">{t.work.next}</span>
          <span className="d2-feature-name">
            {next.name}
            <ArrowRight />
          </span>
        </Link>
      </section>
      <FinalCta t={t} />
    </D2Shell>
  );
}

/* ------------------------------------------------------------------ Quy trình, giới thiệu */

export function D2Process({ t }: { t: D2Dict }) {
  return (
    <D2Shell t={t}>
      <PageHead title={t.process.title} lead={t.process.lead} />
      <section className="d2-wrap" aria-label={t.process.title}>
        <Steps t={t} />
      </section>
      <section aria-labelledby="d2-own-title" className="d2-wrap d2-section">
        <div className="d2-split">
          <div>
            <h2 id="d2-own-title" className="d2-h2">
              {t.own.title}
            </h2>
            <p className="d2-lead mt-4">{t.own.lead}</p>
          </div>
          <D2Handover t={t} />
        </div>
      </section>
      <FinalCta t={t} />
    </D2Shell>
  );
}

export function D2About({ t }: { t: D2Dict }) {
  const { about } = t;
  return (
    <D2Shell t={t}>
      <PageHead title={about.title} />
      <section className="d2-wrap d2-section-tight" aria-label={about.title}>
        <p className="d2-statement max-w-[22em]">{about.statement}</p>
        <dl className="d2-two-col mt-12">
          {about.story.map((item) => (
            <div key={item.label} className="d2-story-item">
              <dt className="d2-h3">{item.label}</dt>
              <dd className="mt-3 text-muted">{item.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="d2-wrap d2-section-tight" aria-labelledby="d2-promise-title">
        <div className="d2-promise" data-d2-tone="dark">
          <h2 id="d2-promise-title" className="d2-small font-semibold text-muted">
            {about.promiseLabel}
          </h2>
          <p className="d2-h2 mt-4 max-w-[18em]">{about.promise}</p>
          <Link href={d2Href(t.lang, "/process")} className="d2-btn d2-btn-primary mt-8">
            {about.processLink}
            <ArrowRight />
          </Link>
        </div>
      </section>

      <section className="d2-wrap d2-section" aria-labelledby="d2-values-title">
        <div className="d2-split">
          <h2 id="d2-values-title" className="d2-h2">
            {about.valuesLabel}
          </h2>
          <dl className="d2-values">
            {about.values.map((value) => (
              <div key={value.title}>
                <dt className="d2-h3">{value.title}</dt>
                <dd className="mt-2 text-muted">{value.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <FinalCta t={t} />
    </D2Shell>
  );
}

/* ------------------------------------------------------------------ Blog */

function PostList({ t, posts }: { t: D2Dict; posts: ReturnType<typeof d2Posts> }) {
  return (
    <ul className="d2-posts">
      {posts.map((post) => (
        <li key={post.slug}>
          <Link href={d2Href(t.lang, `/blog/${post.slug}`)}>
            <span className="d2-small text-muted">
              {d2Date(t.lang, post.date)} · {post.minutes} {t.blog.minutes}
            </span>
            <span className="d2-post-title">{post.title}</span>
            <span className="text-muted">{post.excerpt}</span>
            <span className="d2-post-tags">
              {post.tags.map((tag) => (
                <span key={tag} className="d2-chip">
                  {tag}
                </span>
              ))}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function D2Blog({ t }: { t: D2Dict }) {
  const posts = d2Posts(t.lang);
  return (
    <D2Shell t={t}>
      <PageHead title={t.blog.title} lead={t.blog.lead} />
      <section className="d2-wrap d2-section-tight pb-(--d2-section)" aria-label={t.blog.title}>
        {posts.length > 0 ? (
          <PostList t={t} posts={posts} />
        ) : (
          <div className="d2-empty">
            <div>
              <h2 className="d2-h2">{t.blog.empty}</h2>
              <p className="mt-4 max-w-[30rem] text-muted">{t.blog.emptyLine}</p>
              <div className="d2-hero-actions">
                <Link href={d2Href(t.lang, "/work")} className="d2-btn d2-btn-ink">
                  {t.final.work}
                  <ArrowRight />
                </Link>
                <Link href={d2Href(t.lang, "/plans")} className="d2-btn d2-btn-line">
                  {t.home.secondary}
                </Link>
              </div>
            </div>
            <div>
              <h3 className="d2-small font-semibold text-muted">{t.blog.topicsLabel}</h3>
              <ul className="d2-rows mt-2">
                {t.blog.topics.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>
    </D2Shell>
  );
}

const renderInline = (parts: Inline[]) =>
  parts.map((part, i) => {
    if (typeof part === "string") return part;
    if (part.kind !== "link") {
      const Tag = part.kind;
      return <Tag key={i}>{part.text}</Tag>;
    }
    const external = /^https?:\/\//.test(part.href);
    return (
      <a key={i} href={part.href} className="d2-link" {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {part.text}
      </a>
    );
  });

function renderBlock(block: Block, i: number) {
  switch (block.kind) {
    case "h2":
      return <h2 key={i}>{renderInline(block.inline)}</h2>;
    case "h3":
      return <h3 key={i}>{renderInline(block.inline)}</h3>;
    case "quote":
      return <blockquote key={i}>{renderInline(block.inline)}</blockquote>;
    case "code":
      return (
        <pre key={i} tabIndex={0}>
          <code>{block.text}</code>
        </pre>
      );
    case "ul":
    case "ol": {
      const List = block.kind;
      return (
        <List key={i}>
          {block.items.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </List>
      );
    }
    default:
      return <p key={i}>{renderInline(block.inline)}</p>;
  }
}

export function D2Article({ t, slug }: { t: D2Dict; slug: string }) {
  const post = d2Post(t.lang, slug);
  if (!post) return null;
  return (
    <D2Shell t={t}>
      <article className="d2-wrap d2-article">
        <p className="d2-small">
          <Link href={d2Href(t.lang, "/blog")} className="d2-link">
            {t.blog.back}
          </Link>
        </p>
        <h1 className="d2-h2 mt-5">{post.title}</h1>
        <p className="d2-small mt-4 text-muted">
          {d2Date(t.lang, post.date)} · {post.minutes} {t.blog.minutes}
        </p>
        <div className="d2-prose">{post.blocks.map(renderBlock)}</div>
      </article>
      <FinalCta t={t} />
    </D2Shell>
  );
}

/* ------------------------------------------------------------------ Liên hệ */

/** Phiếu yêu cầu: dùng lại đúng form từng bước của trang chính (gửi thật qua src/lib/contact/delivery.ts, không giả lập thành công) */
export function D2ContactPage({ t }: { t: D2Dict }) {
  return (
    <D2Shell t={t}>
      <section aria-labelledby="d2-contact-title" className="d2-wrap d2-pagehead pb-(--d2-section)">
        <h1 id="d2-contact-title" className="d2-h2 max-w-[16em]">
          {t.contact.title}
        </h1>
        <p className="d2-lead mt-4">{t.contact.lead}</p>
        <div className="mt-12">
          <ContactWizard isConfigured={isContactDeliveryConfigured()} lang={t.lang} sheetCode="" />
        </div>
      </section>
    </D2Shell>
  );
}
