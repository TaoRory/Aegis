import Image from "next/image";
import Link from "next/link";

import previews from "@/content/project-previews.json";
import templatePreviews from "@/content/template-previews.json";
import { d1, d1ProjectHref } from "@/content/demo1";
import { templates } from "@/content/templates";
import type { ProjectPreviews } from "@/content/types";
import { fill } from "@/lib/fill";

import { D1ProjectCard } from "./D1ProjectCard";
import { ArrowUpRight } from "./icons";

function domainOf(url: string) {
  return new URL(url).host.replace(/^www\./, "");
}

type TemplatePreviews = Record<string, { cover: { src: string; width: number; height: number } }>;

/**
 * Dự án: lưới 2 cột ảnh thật của 7 website đã bàn giao (mỗi thẻ mở trang dự án riêng),
 * ô thứ 8 dẫn sang thư viện mẫu giao diện và ghi rõ đó là mẫu demo, thương hiệu giả định.
 */
export function D1Work() {
  const copy = d1.work;
  const pv = previews as ProjectPreviews;
  const tp = templatePreviews as TemplatePreviews;
  const tplShots = templates.slice(0, 4).map((t) => ({ name: t.name, src: tp[t.slug]?.cover.src })).filter((t) => !!t.src);

  return (
    <section id="du-an" aria-labelledby="du-an-title" className="d1-section">
      <div className="d1-wrap">
        <div className="d1-grid items-end gap-y-6">
          <div className="col-span-12 lg:col-span-7">
            <h2 id="du-an-title" className="d1-h2">
              {copy.title}
              <span className="d1-count">{String(copy.items.length).padStart(2, "0")}</span>
            </h2>
          </div>
          <p className="col-span-12 max-w-[30rem] text-muted lg:col-span-4 lg:col-start-9">{copy.lead}</p>
        </div>

        <ul className="mt-12 grid gap-x-(--d1-gutter) gap-y-14 md:grid-cols-2 lg:mt-16">
          {copy.items.map((project) => {
            const preview = pv[project.slug];
            return (
              <li key={project.slug}>
                <D1ProjectCard
                  href={d1ProjectHref(project.slug)}
                  name={project.name}
                  type={project.type}
                  domain={domainOf(project.url)}
                  cover={preview?.cover}
                  full={preview?.full}
                  alt={fill(d1.project.shotAlt, { name: project.name })}
                />
              </li>
            );
          })}
          <li>
            <Link href="/mau-giao-dien" className="d1-card group">
              <div className="d1-plate">
                <div className="d1-tpl-grid">
                  {tplShots.map((t) => (
                    <Image key={t.name} src={t.src!} width={1200} height={750} alt="" sizes="(min-width: 48rem) 20vw, 44vw" />
                  ))}
                </div>
              </div>
              <div className="mt-4 flex items-start justify-between gap-6">
                <div>
                  <h3 className="flex items-center gap-2 text-[1.25rem] leading-tight font-medium tracking-[-0.018em]">
                    {copy.templates}
                    <ArrowUpRight className="d1-card-arrow" />
                  </h3>
                  <p className="mt-1 text-[0.9375rem] text-muted">{copy.templatesNote}</p>
                </div>
                <span className="d1-label pt-1 text-muted">Demo</span>
              </div>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
