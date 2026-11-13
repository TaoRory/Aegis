import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { D1Wordmark } from "@/components/demo1/D1Wordmark";
import { ArrowRight, ArrowUpRight, Plus } from "@/components/demo1/icons";
import { d2Contact, d2Home, d2Projects, d2Stages, type D2Dict } from "@/content/demo2";
import previewsJson from "@/content/project-previews.json";
import type { Project, ProjectPreviews } from "@/content/types";

import { D2Handover } from "./D2Handover";
import { D2Header } from "./D2Header";
import { Check } from "./D2Icons";

const previews = previewsJson as ProjectPreviews;
const host = (url: string) => new URL(url).host.replace(/^www\./, "");

/** Vỏ chung của mọi trang /demo2: header, nội dung, footer; `lang` đặt trên vỏ để chữ và dấu câu theo đúng ngôn ngữ */
export function D2Shell({ t, sub, children }: { t: D2Dict; sub?: string; children: ReactNode }) {
  return (
    <div lang={t.lang} className="d2-root contents">
      <a href="#d2-main" className="d2-skip">
        {t.chrome.skip}
      </a>
      <D2Header t={t} sub={sub} />
      <main id="d2-main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <D2Footer t={t} />
    </div>
  );
}

/** Ảnh chụp dự án thật trong khung trình duyệt mảnh */
function Shot({ project, alt, sizes, priority }: { project: Project; alt: string; sizes: string; priority?: boolean }) {
  const cover = previews[project.slug]?.cover;
  if (!cover) return null;
  return (
    <div className="d2-shot">
      <div className="d2-shot-bar" aria-hidden>
        <i />
        <i />
        <i />
      </div>
      <Image src={cover.src} alt={alt} width={cover.width} height={cover.height} sizes={sizes} priority={priority} />
    </div>
  );
}

/**
 * Trang chủ /demo2. Mỗi phần một kiểu bố cục:
 * hero (câu chào hàng + tường dự án) → vấn đề (câu hai sắc độ + hàng kẻ dòng) → ba gói (bậc thang ba bề mặt)
 * → bạn sở hữu gì (tiêu đề dính + danh sách bàn giao) → quy trình (hàng so le + mô hình minh hoạ) → dự án (một lớn + danh mục)
 * → so sánh (bảng) → câu hỏi (hai cột) → lời mời (hai ô lớn).
 */
export function D2Home({ t }: { t: D2Dict }) {
  const projects = d2Projects(t.lang);
  const contact = d2Contact(t.lang);
  const columns = [0, 1, 2].map((c) => projects.filter((_, i) => i % 3 === c));
  const [featured, ...rest] = projects;
  const featuredStage = d2Stages[featured.slug];

  return (
    <D2Shell t={t}>
      {/* 1. Hero */}
      <section id="top" aria-labelledby="d2-hero-title" className="d2-wrap d2-hero">
        <h1 id="d2-hero-title" className="d2-display max-w-[14em]">
          {t.hero.before} <span className="d2-mark">{t.hero.mark}</span>
          {t.hero.after}
        </h1>
        <p className="d2-lead mt-6">{t.hero.lead}</p>
        <div className="d2-hero-actions">
          <Link href={contact} className="d2-btn d2-btn-primary">
            {t.cta}
            <ArrowRight />
          </Link>
          <Link href="#plans" className="d2-btn d2-btn-line">
            {t.hero.secondary}
          </Link>
        </div>
        <div className="d2-wall" role="group" aria-label={t.hero.wallLabel}>
          {columns.map((column, c) => (
            <div key={c} className="d2-wall-col">
              {column.map((project, r) => {
                const stage = d2Stages[project.slug];
                return (
                  <a
                    key={project.slug}
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="d2-tile"
                    data-ink={stage.ink}
                    style={{ backgroundColor: stage.bg }}
                  >
                    <Shot project={project} alt="" sizes="(min-width: 48rem) 30vw, 78vw" priority={r === 0} />
                    <span className="d2-tile-meta">
                      <span>
                        {project.name}
                        <span className="sr-only">, {t.hero.visit}</span>
                      </span>
                      <span>{project.type}</span>
                    </span>
                  </a>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      {/* 2. Vấn đề */}
      <section aria-labelledby="d2-problem-title" className="d2-wrap d2-section">
        <h2 id="d2-problem-title" className="d2-display d2-two-tone max-w-[15em]">
          {t.problem.ink} <span>{t.problem.muted}</span>
        </h2>
        <div className="d2-cases">
          <p className="d2-small pt-4 font-semibold text-muted">{t.problem.ask}</p>
          {t.problem.items.map((item) => (
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

      {/* 3. Ba gói */}
      <section id="plans" aria-labelledby="d2-plans-title" className="d2-wrap d2-section-tight">
        <h2 id="d2-plans-title" className="d2-h2">
          {t.plans.title}
        </h2>
        <p className="d2-lead mt-4">{t.plans.lead}</p>
        <div className="d2-plans">
          {t.plans.items.map((plan) => (
            <article key={plan.id} id={`plan-${plan.id}`} className="d2-plan" data-plan={plan.id} data-d2-tone={plan.id === "amplify" ? "dark" : undefined}>
              <div>
                <h3 className="d2-plan-name">{plan.name}</h3>
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
                <h4>{t.plans.includes}</h4>
                <ul className="d2-checks">
                  {plan.includes.map((item) => (
                    <li key={item}>
                      <Check />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href={contact} className="d2-btn d2-btn-ink">
                  {plan.cta}
                  <ArrowRight />
                </Link>
                <p className="d2-small">{t.plans.quoteNote}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. Bạn sở hữu gì */}
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

      {/* 5. Quy trình */}
      <section id="process" aria-labelledby="d2-process-title" className="d2-wrap d2-section-tight">
        <h2 id="d2-process-title" className="d2-h2">
          {t.process.title}
        </h2>
        <p className="d2-lead mt-4">{t.process.lead}</p>
        <ol className="d2-steps">
          {t.process.steps.map((step, index) => (
            <li key={step.title} className="d2-step">
              <div className="d2-step-text">
                <span className="d2-step-no" aria-hidden>
                  {index + 1}
                </span>
                <h3 className="d2-h3">{step.title}</h3>
                <p>{step.text}</p>
                <span className="d2-chip">{step.plans}</span>
              </div>
              <div className="d2-step-stage" aria-hidden>
                <Mock t={t} kind={step.mock} />
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 6. Dự án */}
      <section id="work" aria-labelledby="d2-work-title" className="d2-wrap d2-section">
        <h2 id="d2-work-title" className="d2-h2">
          {t.work.title}
        </h2>
        <p className="d2-lead mt-4">{t.work.lead}</p>
        <div className="d2-feature" data-ink={featuredStage.ink} style={{ backgroundColor: featuredStage.bg }}>
          <div>
            <p className="d2-small font-semibold">{t.work.featured}</p>
            <h3 className="d2-feature-name mt-3">{featured.name}</h3>
            <p className="mt-4 max-w-[28rem]">{featured.description}</p>
            {featured.highlights && (
              <ul className="d2-feature-facts">
                {featured.highlights.map((item) => (
                  <li key={item} className="d2-chip">
                    {item}
                  </li>
                ))}
              </ul>
            )}
            <a href={featured.url} target="_blank" rel="noopener noreferrer" className="d2-btn d2-btn-ink mt-7">
              {t.work.visit}
              <ArrowUpRight />
            </a>
          </div>
          <a href={featured.url} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden>
            <Shot project={featured} alt="" sizes="(min-width: 56rem) 52vw, 92vw" />
          </a>
        </div>
        <h3 className="sr-only">{t.work.more}</h3>
        <ul className="d2-index">
          {rest.map((project) => (
            <li key={project.slug}>
              <a href={project.url} target="_blank" rel="noopener noreferrer">
                <span className="d2-dot" style={{ backgroundColor: d2Stages[project.slug].bg }} aria-hidden />
                <span className="d2-index-name">{project.name}</span>
                <span className="d2-index-type text-muted">
                  {project.type} · {host(project.url)}
                </span>
                <ArrowUpRight />
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* 7. So sánh */}
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

      {/* 8. Câu hỏi */}
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

      {/* 9. Lời mời cuối */}
      <section aria-labelledby="d2-final-title" className="d2-wrap d2-section-tight pb-(--d2-section)">
        <h2 id="d2-final-title" className="d2-display">
          {t.final.title}
        </h2>
        <div className="d2-final">
          <Link href="#work">
            <span className="d2-final-title">
              {t.final.work}
              <ArrowRight />
            </span>
            <p className="text-muted">{t.final.workLine}</p>
          </Link>
          <Link href={contact}>
            <span className="d2-final-title">
              {t.final.call}
              <ArrowRight />
            </span>
            <p>{t.final.callLine}</p>
          </Link>
        </div>
      </section>
    </D2Shell>
  );
}

/** Mô hình giao diện minh hoạ cho từng bước (HTML/CSS, có nhãn "Minh hoạ"; không chứa số liệu) */
function Mock({ t, kind }: { t: D2Dict; kind: D2Dict["process"]["steps"][number]["mock"] }) {
  const { mock, chrome, own } = t;
  const head = (title: string) => (
    <div className="d2-mock-head">
      <span>{title}</span>
      <span>{chrome.illustration}</span>
    </div>
  );
  if (kind === "brief") {
    return (
      <div className="d2-mock">
        {head(mock.brief.title)}
        {mock.brief.fields.map(([label, value]) => (
          <div key={label} className="d2-mock-field">
            <span>{label}</span>
            <span>{value}</span>
          </div>
        ))}
        <div className="d2-mock-chips">
          {mock.brief.chips.map((chip, i) => (
            <span key={chip} className="d2-pill" data-on={i === 0}>
              {chip}
            </span>
          ))}
        </div>
      </div>
    );
  }
  if (kind === "scope" || kind === "build") {
    const rows = mock[kind].rows;
    return (
      <div className="d2-mock">
        {head(mock[kind].title)}
        {rows.map(([label, state], i) => (
          <div key={label} className="d2-mock-row">
            <span>{label}</span>
            <span className="d2-pill" data-on={kind === "scope" || i === 0} data-soft={kind === "build" && i === 1}>
              {state}
            </span>
          </div>
        ))}
      </div>
    );
  }
  if (kind === "handover") {
    return (
      <div className="d2-mock">
        {head(mock.handover.title)}
        {own.items.map((item) => (
          <div key={item.name} className="d2-mock-row">
            <span>{item.name}</span>
            <span className="d2-tick size-5!">
              <Check />
            </span>
          </div>
        ))}
      </div>
    );
  }
  const pattern = ["soft", "", "true", "", "soft", "", "true", "true", "", "true", "true", "", "soft", "true", ""];
  return (
    <div className="d2-mock">
      {head(mock.grow.title)}
      <div className="d2-cal">
        <span />
        {mock.grow.days.map((day) => (
          <b key={day}>{day}</b>
        ))}
        {mock.grow.rows.map((row, r) => (
          <FragmentRow key={row} label={row} cells={pattern.slice(r * 5, r * 5 + 5)} />
        ))}
      </div>
    </div>
  );
}

function FragmentRow({ label, cells }: { label: string; cells: string[] }) {
  return (
    <>
      <span>{label}</span>
      {cells.map((on, i) => (
        <i key={i} data-on={on || undefined} />
      ))}
    </>
  );
}

function D2Footer({ t }: { t: D2Dict }) {
  const home = d2Home(t.lang);
  return (
    <footer className="d2-footer">
      <div className="d2-footer-slab" data-d2-tone="dark">
        <div className="d2-wrap">
          <div className="d2-footer-grid">
            <p className="d2-h3 max-w-[18rem]">{t.footer.tagline}</p>
            <div>
              <h3>{t.footer.plans}</h3>
              <ul>
                {t.plans.items.map((plan) => (
                  <li key={plan.id}>
                    <Link href={`${home}#plan-${plan.id}`}>{plan.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>{t.footer.pages}</h3>
              <ul>
                {t.nav.map((item) => (
                  <li key={item.id}>
                    <Link href={`${home}#${item.id}`}>{item.label}</Link>
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
