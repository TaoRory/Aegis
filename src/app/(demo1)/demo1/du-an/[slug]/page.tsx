import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { D1Button } from "@/components/demo1/D1Button";
import { ArrowRight } from "@/components/demo1/icons";
import previews from "@/content/project-previews.json";
import { D1_BASE, d1, d1ContactHref, d1ProjectHref } from "@/content/demo1";
import type { ProjectPreviews } from "@/content/types";
import { fill } from "@/lib/fill";

type Params = Promise<{ slug: string }>;

const projects = d1.work.items;
const pv = previews as ProjectPreviews;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: `${project.name} — Dự án`,
    description: project.description,
    robots: { index: false, follow: false },
  };
}

function domainOf(url: string) {
  return new URL(url).host.replace(/^www\./, "");
}

/**
 * Trang một dự án /demo1/du-an/[slug] (kiểu case study tối giản): tên cỡ lớn, hàng thông tin, ảnh trang chủ thật,
 * mô tả + tính năng đã xác nhận ở cột trái (dính khi cuộn), ảnh chụp toàn trang ở cột phải, rồi dự án tiếp theo.
 * Chỉ dùng dữ kiện trong projects.ts: không thêm năm, khách hàng, số liệu hay công nghệ.
 */
export default async function Demo1ProjectPage({ params }: { params: Params }) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index < 0) notFound();
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];
  const preview = pv[project.slug];
  const nextPreview = pv[next.slug];
  const copy = d1.project;
  const serviceNames = project.services.map((id) => d1.services.items.find((s) => s.id === id)?.shortTitle).filter(Boolean);

  return (
    <article aria-labelledby="d1-case-title">
      <header className="d1-wrap pt-[clamp(2rem,1.2rem+3vw,4.5rem)]">
        <Link href={`${D1_BASE}#du-an`} className="d1-label text-muted transition-colors hover:text-fg">
          ← {copy.all}
        </Link>
        <h1 id="d1-case-title" className="d1-case-title mt-8 lg:mt-10">
          {project.name}
        </h1>
        <dl className="d1-meta mt-10 lg:mt-14">
          <div>
            <dt className="d1-label text-muted">{copy.type}</dt>
            <dd className="mt-1.5">{project.type}</dd>
          </div>
          <div>
            <dt className="d1-label text-muted">{copy.category}</dt>
            <dd className="mt-1.5">{d1.work.categoryLabel[project.category]}</dd>
          </div>
          <div>
            <dt className="d1-label text-muted">{copy.service}</dt>
            <dd className="mt-1.5">{serviceNames.join(", ")}</dd>
          </div>
          <div>
            <dt className="d1-label text-muted">{copy.site}</dt>
            <dd className="mt-1.5">
              <a href={project.url} target="_blank" rel="noopener noreferrer" className="d1-link">
                {domainOf(project.url)}
              </a>
            </dd>
          </div>
        </dl>
      </header>

      {preview && (
        <div className="d1-wrap mt-10 lg:mt-14">
          <div className="d1-plate">
            <div className="d1-frame">
              <div className="d1-frame-bar">
                <span className="d1-label">{domainOf(project.url)}</span>
              </div>
              <Image
                src={preview.cover.src}
                width={preview.cover.width}
                height={preview.cover.height}
                alt={fill(copy.shotAlt, { name: project.name })}
                sizes="(min-width: 104rem) 88rem, 88vw"
                priority
                className="block h-auto w-full"
              />
            </div>
          </div>
        </div>
      )}

      <div className="d1-wrap d1-section d1-grid gap-y-12">
        <div className="col-span-12 self-start lg:sticky lg:top-[calc(var(--d1-header)+2rem)] lg:col-span-5">
          <p className="d1-side">{copy.description}</p>
          <p className="d1-lead mt-6">{project.description}</p>
          {project.highlights && project.highlights.length > 0 && (
            <div className="mt-10">
              <h2 className="d1-label mb-3 text-muted">{copy.highlights}</h2>
              <ul className="d1-bullets max-w-[28rem] text-[0.9375rem]">
                {project.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-10 flex flex-wrap gap-2">
            <D1Button href={project.url}>{copy.visit}</D1Button>
            <D1Button href={d1ContactHref("web")} variant="soft">
              {copy.similar}
            </D1Button>
          </div>
        </div>
        {preview?.full && (
          <figure className="col-span-12 lg:col-span-6 lg:col-start-7">
            <figcaption className="d1-label mb-3 text-muted">{copy.fullPage}</figcaption>
            <div className="d1-longshot">
              <Image
                src={preview.full.src}
                width={preview.full.width}
                height={preview.full.height}
                alt={fill(copy.fullAlt, { name: project.name })}
                sizes="(min-width: 64rem) 46vw, 92vw"
              />
            </div>
          </figure>
        )}
      </div>

      <nav aria-label={copy.next} className="border-t border-line">
        <Link href={d1ProjectHref(next.slug)} className="d1-wrap d1-grid group items-center gap-y-6 py-[clamp(3rem,2rem+4vw,6rem)]">
          <div className="col-span-12 lg:col-span-7">
            <p className="d1-label text-muted">{copy.next}</p>
            <p className="d1-h2 mt-4 flex items-center gap-4">
              {next.name}
              <ArrowRight className="size-[0.6em] transition-transform duration-500 group-hover:translate-x-2" />
            </p>
            <p className="mt-2 text-muted">{next.type}</p>
          </div>
          {nextPreview && (
            <div className="col-span-12 sm:col-span-6 lg:col-span-4 lg:col-start-9">
              <div className="d1-plate">
                <div className="d1-frame">
                  <Image
                    src={nextPreview.cover.src}
                    width={nextPreview.cover.width}
                    height={nextPreview.cover.height}
                    alt=""
                    sizes="(min-width: 64rem) 30vw, 90vw"
                    className="block h-auto w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </Link>
      </nav>
    </article>
  );
}
