import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

import { ArrowRight } from "@/components/demo1/icons";
import { d3Href, d3Projects, d3Stages, type D3Dict } from "@/content/demo3";
import galleryJson from "@/content/project-gallery.json";
import systemsJson from "@/content/project-systems.json";
import { fill } from "@/lib/fill";

import { BrandWall } from "./BrandWall";
import { d3Host, d3Previews, PageHead } from "./D3Bits";
import { FinalCta } from "./D3Final";
import { D3Link } from "./D3Link";
import { D3Shell } from "./D3Shell";
import { ArrowSwap } from "./HomeArrowSwap";
import { Rise } from "./fx/Rise";
import { SplitReveal } from "./fx/SplitReveal";
import { WorkLongFrame } from "./WorkLongFrame";
import { WorkShot } from "./WorkShot";
import { WorkTile } from "./WorkTile";
import { WorkWall } from "./WorkWall";

/** Bảng màu đo từ website đang chạy (scripts/capture-project-systems.mjs) */
const systems = systemsJson as Record<string, { colors: { hex: string; role: string }[] }>;

/** Ảnh chụp thêm từ website đang chạy cho trang dự án (scripts/capture-gallery.mjs) */
type GalleryShot = { src: string; width: number; height: number };
const gallery = galleryJson as Record<string, { desktop?: GalleryShot[]; mobile?: GalleryShot[] }>;

/**
 * Trang dự án. Bảng phân cảnh:
 * - Tường ba cột: ô trồi lên so le theo cột (T1); khi cuộn, cột ngắn trôi chậm hơn cột dài (T2, chỉ máy tính, xem WorkWall);
 *   rê chuột vào ô thì khung ảnh nhấc + nghiêng và ảnh toàn trang tự cuộn trong khung (T3, xem WorkTile).
 * - Điện thoại: một cột dọc theo đúng thứ tự dự án, không parallax.
 */
export function D3Work({ t }: { t: D3Dict }) {
  const projects = d3Projects(t.lang).map((project, order) => ({ project, order }));
  const columns = [0, 1, 2].map((c) => projects.filter(({ order }) => order % 3 === c));
  return (
    <D3Shell t={t}>
      <PageHead title={t.work.title} lead={t.work.lead} />
      <section className="d2-wrap pb-(--d2-section)" aria-label={t.work.title}>
        <WorkWall>
          {columns.map((column, c) => (
            <div key={c} className="d2-wall-col">
              {column.map(({ project, order }, r) => {
                const stage = d3Stages[project.slug];
                const preview = d3Previews[project.slug];
                if (!preview) return null;
                return (
                  <WorkTile
                    key={project.slug}
                    href={d3Href(t.lang, `/work/${project.slug}`)}
                    slug={project.slug}
                    name={project.name}
                    type={project.type}
                    viewLabel={t.work.view}
                    bg={stage.bg}
                    ink={stage.ink}
                    cover={preview.cover}
                    full={preview.full}
                    column={c}
                    order={order}
                    eager={r === 0}
                  />
                );
              })}
            </div>
          ))}
        </WorkWall>
      </section>
      <BrandWall t={t} />
      <FinalCta t={t} />
    </D3Shell>
  );
}

/** Khối chữ hai cột của trang dự án: tiêu đề bên trái, nội dung bên phải (kiểu trang dự án của các studio) */
function CaseBlock({ title, id, children }: { title: string; id: string; children: ReactNode }) {
  return (
    <section className="d2-wrap d3-cs-block" aria-labelledby={id}>
      <Rise as="h2" id={id} className="d3-cs-block-title">
        {title}
      </Rise>
      <Rise index={1} className="d3-cs-block-body">
        {children}
      </Rise>
    </section>
  );
}

/** Ảnh chụp màn hình máy tính trong khung trình duyệt mảnh (gallery) */
function DeskShot({ shot, alt, host }: { shot: GalleryShot; alt: string; host: string }) {
  return (
    <figure className="d3-cs-desk">
      <div className="d2-shot-bar" aria-hidden>
        <i />
        <i />
        <i />
        <span>{host}</span>
      </div>
      <Image src={shot.src} alt={alt} width={shot.width} height={shot.height} sizes="(min-width: 56rem) 46vw, 92vw" />
    </figure>
  );
}

/**
 * Trang chi tiết dự án (case study), bố cục theo trang dự án của các studio: ảnh là chính, chữ ngắn và rõ.
 * Chỉ ghi điều đã xác nhận (projects.ts + content/demo3/work.ts › cases); ảnh là ảnh chụp website đang chạy (scripts/capture-gallery.mjs).
 * - Đầu trang: tên lớn, loại dự án, ba cột Industry / Client / Services, nút xem website.
 * - Ảnh chính tràn ngang trên nền màu của dự án (ảnh bìa bay từ ô dự án sang, xem WorkShot).
 * - Tổng quan (hai cột) → cặp ảnh màn hình máy tính → Những gì đã xây (hai cột) → dải điện thoại trên nền màu dự án
 *   → Hệ thống thiết kế (hai cột) → toàn bộ website trong khung tự cuộn → dự án kế tiếp.
 */
export function D3Case({ t, slug }: { t: D3Dict; slug: string }) {
  const projects = d3Projects(t.lang);
  const index = projects.findIndex((project) => project.slug === slug);
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];
  const stage = d3Stages[project.slug];
  const nextStage = d3Stages[next.slug];
  const preview = d3Previews[project.slug];
  const nextCover = d3Previews[next.slug]?.cover;
  const full = preview?.full;
  const shots = gallery[project.slug];
  const colors = systems[project.slug]?.colors ?? [];
  const alt = fill(t.work.shotAlt, { name: project.name });
  const x = t.x.work;
  const story = (x.cases as Record<string, CaseStory | undefined>)[project.slug];
  const host = d3Host(project.url);
  return (
    <D3Shell t={t}>
      {/* Đầu trang */}
      <header className="d2-wrap d3-cs-head">
        <p className="d2-small">
          <D3Link href={d3Href(t.lang, "/work")} className="d2-link">
            {t.work.all}
          </D3Link>
        </p>
        <SplitReveal as="h1" trigger="load" className="d3-cs-title">
          {project.name}
        </SplitReveal>
        <p className="d3-cs-type">{project.type}</p>
        <div className="d3-cs-meta">
          <dl>
            <div>
              <dt>{x.case.industry}</dt>
              <dd>{t.categories[project.category]}</dd>
            </div>
            {story && (
              <div>
                <dt>{x.case.client}</dt>
                <dd>{story.client}</dd>
              </div>
            )}
            {story && (
              <div>
                <dt>{x.case.services}</dt>
                <dd>{story.services.join(" · ")}</dd>
              </div>
            )}
          </dl>
          <a href={project.url} target="_blank" rel="noopener noreferrer" className="d3-cs-visit">
            <span className="kit-roll">
              <span>{t.work.visit}</span>
              <span aria-hidden>{t.work.visit}</span>
            </span>
            <ArrowSwap dir="out" />
          </a>
        </div>
      </header>

      {/* Ảnh chính trên nền màu của dự án */}
      {preview && (
        <div className="d2-wrap">
          <div className="d3-cs-hero" data-ink={stage.ink} style={{ backgroundColor: stage.bg }}>
            <WorkShot slug={project.slug} cover={preview.cover} alt={alt} sizes="(min-width: 80rem) 72rem, 92vw" eager="high" />
          </div>
        </div>
      )}

      <CaseBlock title={x.case.overview} id="d3-cs-overview">
        <p className="d3-cs-lead">{project.description}</p>
        {story?.links && (
          <p className="d3-cs-links">
            {story.links.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="d2-link font-semibold">
                {link.label} ↗
              </a>
            ))}
          </p>
        )}
      </CaseBlock>

      {/* Cặp ảnh màn hình máy tính */}
      {shots?.desktop?.length ? (
        <div className="d2-wrap d3-cs-pair">
          {shots.desktop.map((shot, i) => (
            <Rise key={shot.src} index={i} kind="pop">
              <DeskShot shot={shot} alt={alt} host={host} />
            </Rise>
          ))}
        </div>
      ) : null}

      {story && (
        <CaseBlock title={x.case.built} id="d3-cs-built">
          <ol className="d3-cs-built">
            {story.built.map((item, i) => (
              <li key={item.title}>
                <span className="d3-cs-built-no" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </CaseBlock>
      )}

      {/* Dải điện thoại trên nền màu của dự án */}
      {shots?.mobile?.length ? (
        <div className="d2-wrap">
          <Rise kind="pop" className="d3-cs-phones" data-ink={stage.ink} style={{ backgroundColor: stage.bg }}>
            <p className="d3-cs-phones-label">{x.case.mobile}</p>
            <div className="d3-cs-phones-row">
              {shots.mobile.map((shot) => (
                <figure key={shot.src} className="d3-cs-phone">
                  <Image src={shot.src} alt={alt} width={shot.width} height={shot.height} sizes="(min-width: 56rem) 18rem, 42vw" />
                </figure>
              ))}
            </div>
          </Rise>
        </div>
      ) : null}

      {colors.length > 1 && (
        <CaseBlock title={x.case.system} id="d3-cs-system">
          <ul className="d3-swatch-bars d3-case-system" aria-label={t.work.palette}>
            {colors.map((color, i) => (
              <li key={color.hex} style={{ "--i": i, "--c": color.hex } as CSSProperties}>
                <span aria-hidden />
                <code>{color.hex}</code>
              </li>
            ))}
          </ul>
          <p className="d2-small mt-3 text-muted">{t.work.paletteNote}</p>
        </CaseBlock>
      )}

      {/* Toàn bộ website trong khung tự cuộn */}
      {full && (
        <section className="d2-wrap d3-cs-full" aria-labelledby="d3-cs-full-title">
          <Rise as="h2" id="d3-cs-full-title" className="d3-cs-block-title">
            {x.case.screens}
          </Rise>
          <Rise as="figure" index={1} className="d3-long">
            <WorkLongFrame label={t.work.fullPage} hint={x.scrollHint} host={host}>
              <Image src={full.src} alt={alt} width={full.width} height={full.height} sizes="(min-width: 56rem) 52rem, 92vw" />
            </WorkLongFrame>
          </Rise>
        </section>
      )}

      <section className="d2-wrap d2-section-tight" aria-label={t.work.next}>
        <Rise as={D3Link} kind="pop" href={d3Href(t.lang, `/work/${next.slug}`)} className="d2-next d3-next" data-cursor="view" data-ink={nextStage.ink} style={{ backgroundColor: nextStage.bg }}>
          <div className="d3-next-text">
            <span className="d2-small font-semibold">{t.work.next}</span>
            <span className="d2-feature-name">
              <span className="d3-next-name">{next.name}</span>
              <span className="d3-next-arrow" aria-hidden>
                <ArrowRight />
                <ArrowRight />
              </span>
            </span>
          </div>
          {nextCover && (
            <div className="d3-next-door" aria-hidden>
              <WorkShot slug={next.slug} cover={nextCover} alt="" sizes="(min-width: 48rem) 26rem, 92vw" share={false} />
            </div>
          )}
        </Rise>
      </section>
      <FinalCta t={t} />
    </D3Shell>
  );
}

/** Phần mở rộng của một dự án (content/demo3/work.ts › cases) */
type CaseStory = { client: string; services: string[]; built: { title: string; text: string }[]; links?: { label: string; href: string }[] };
