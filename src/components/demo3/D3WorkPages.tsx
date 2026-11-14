import Image from "next/image";
import type { CSSProperties } from "react";

import { ArrowRight } from "@/components/demo1/icons";
import { d3Href, d3Projects, d3Stages, type D3Dict } from "@/content/demo3";
import systemsJson from "@/content/project-systems.json";
import { fill } from "@/lib/fill";

import { d3Host, d3Previews, PageHead } from "./D3Bits";
import { FinalCta } from "./D3Final";
import { D3Btn } from "./D3Btn";
import { D3Link } from "./D3Link";
import { D3Shell } from "./D3Shell";
import { Rise } from "./fx/Rise";
import { SplitReveal } from "./fx/SplitReveal";
import { WorkLongFrame } from "./WorkLongFrame";
import { WorkShot } from "./WorkShot";
import { WorkTile } from "./WorkTile";
import { WorkWall } from "./WorkWall";

/** Bảng màu đo từ website đang chạy (scripts/capture-project-systems.mjs) */
const systems = systemsJson as Record<string, { colors: { hex: string; role: string }[] }>;

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
      <FinalCta t={t} />
    </D3Shell>
  );
}

/**
 * Trang chi tiết dự án. Bảng phân cảnh:
 * - Sân khấu màu của dự án: tên hiện theo dòng, ảnh chụp "mở ra" từ thanh trình duyệt xuống rồi lắng lại (CSS, chạy từ khung hình đầu,
 *   ảnh không bao giờ bắt đầu ở trạng thái ẩn hẳn vì nó là phần tử lớn nhất màn đầu).
 * - Dữ kiện: từng dòng trồi lên theo thứ tự, chấm màu bật lần lượt.
 * - Ảnh toàn trang: cửa sổ tự cuộn, người xem tự đọc website (xem WorkLongFrame).
 * - Dự án kế tiếp: một "cánh cửa" mang màu và ảnh của dự án sau; rê chuột thì ảnh nhô lên, tên dịch sang, mũi tên chạy qua.
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
  const colors = systems[project.slug]?.colors ?? [];
  const alt = fill(t.work.shotAlt, { name: project.name });
  const x = t.x.work;
  let row = 0;
  return (
    <D3Shell t={t}>
      <div className="d2-wrap pt-[clamp(1.5rem,1rem+2vw,3rem)]">
        <p className="d2-small">
          <D3Link href={d3Href(t.lang, "/work")} className="d2-link">
            {t.work.all}
          </D3Link>
        </p>
        <header className="d2-feature d3-case-stage mt-5" data-ink={stage.ink} style={{ backgroundColor: stage.bg }}>
          <div className="d3-case-intro">
            <SplitReveal as="h1" trigger="load" className="d2-feature-name">
              {project.name}
            </SplitReveal>
            <p className="mt-4 max-w-[30rem]">{project.description}</p>
            <D3Btn href={project.url} tone="ink" external className="mt-7">
              {t.work.visit}
            </D3Btn>
          </div>
          {preview && <WorkShot slug={project.slug} cover={preview.cover} alt={alt} sizes="(min-width: 56rem) 52vw, 92vw" eager="high" />}
        </header>
      </div>

      <section className="d2-wrap d2-section-tight" aria-label={project.name}>
        <div className="d2-two-col">
          <dl className="d2-facts">
            <Rise index={row++}>
              <dt>{t.work.type}</dt>
              <dd>{project.type}</dd>
            </Rise>
            <Rise index={row++}>
              <dt>{t.work.category}</dt>
              <dd>{t.categories[project.category]}</dd>
            </Rise>
            <Rise index={row++}>
              <dt>{t.work.address}</dt>
              <dd>
                <a href={project.url} target="_blank" rel="noopener noreferrer" className="d2-link">
                  {d3Host(project.url)}
                </a>
              </dd>
            </Rise>
            {project.highlights && (
              <Rise index={row++}>
                <dt>{t.work.features}</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {project.highlights.map((item) => (
                    <span key={item} className="d2-chip">
                      {item}
                    </span>
                  ))}
                </dd>
              </Rise>
            )}
            {colors.length > 1 && (
              <Rise index={row++}>
                <dt>{t.work.palette}</dt>
                <dd>
                  <ul className="d2-swatches" aria-label={t.work.palette}>
                    {colors.map((color, i) => (
                      <li key={color.hex} style={{ "--i": i } as CSSProperties}>
                        <span style={{ backgroundColor: color.hex }} />
                        {color.hex}
                      </li>
                    ))}
                  </ul>
                  <p className="d2-small mt-2 text-muted">{t.work.paletteNote}</p>
                </dd>
              </Rise>
            )}
          </dl>
          {full && (
            <Rise as="figure" index={1} className="d3-long">
              <WorkLongFrame label={t.work.fullPage} hint={x.scrollHint} host={d3Host(project.url)}>
                <Image src={full.src} alt={alt} width={full.width} height={full.height} sizes="(min-width: 56rem) 44vw, 92vw" />
              </WorkLongFrame>
            </Rise>
          )}
        </div>
      </section>

      <section className="d2-wrap d2-section-tight" aria-label={t.work.next}>
        <Rise as={D3Link} kind="pop" href={d3Href(t.lang, `/work/${next.slug}`)} className="d2-next d3-next" data-ink={nextStage.ink} style={{ backgroundColor: nextStage.bg }}>
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
