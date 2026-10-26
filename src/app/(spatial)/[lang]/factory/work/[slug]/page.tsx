import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Panel } from "@/components/space/Panel";
import { DeviceStage, PanelSkeleton, SpecTable } from "@/components/space/PanelParts";
import { hasLocale } from "@/config/space";
import { getFactoryDict } from "@/content/factory";
import previews from "@/content/project-previews.json";
import { projects } from "@/content/projects";
import type { ProjectPreviews } from "@/content/types";
import { resolveLang, type LangParams } from "../../_lib";

type Params = Promise<{ lang: string; slug: string }>;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const project = getFactoryDict(lang).projects.find((p) => p.slug === slug);
  return project ? { title: project.name, description: project.description } : {};
}

function displayUrl(url: string) {
  const { host, pathname } = new URL(url);
  return (host.replace(/^www\./, "") + pathname).replace(/\/$/, "");
}

/** Phần đọc params nằm trong Suspense để điều hướng tới trang này vẫn "tức thì" (khung chờ hiện ngay) */
export default function ProjectDossierPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<PanelSkeleton label="…" />}>
      <ProjectDossier params={params} />
    </Suspense>
  );
}

async function ProjectDossier({ params }: { params: Params }) {
  const { slug } = await params;
  const { dict, href } = await resolveLang(params as LangParams);
  const list = dict.projects;
  const index = list.findIndex((p) => p.slug === slug);
  if (index < 0) notFound();
  const project = list[index];
  const prev = list[index - 1];
  const next = list[index + 1];
  const full = (previews as ProjectPreviews)[project.slug]?.full;
  const copy = dict.work;

  const rows = [
    { label: copy.specType, value: project.type },
    { label: copy.specGroup, value: dict.categories[project.category] },
    {
      label: copy.specService,
      value: (
        <span className="flex flex-wrap gap-x-3">
          {project.services.map((id) => (
            <Link key={id} href={href(`services/${id}`)} className="space-step" data-cursor="link">
              {dict.services.find((s) => s.id === id)?.shortTitle} →
            </Link>
          ))}
        </span>
      ),
    },
    { label: copy.specAddress, value: displayUrl(project.url) },
    ...(project.highlights?.length
      ? [{ label: copy.specFeatures, value: <ul className="space-list">{project.highlights.map((h) => <li key={h}>{h}</li>)}</ul> }]
      : []),
  ];

  return (
    <Panel
      zone="work"
      eyebrow={`${dict.ui.product.label} /${String(index + 1).padStart(2, "0")} · ${project.type.toUpperCase()}`}
      title={project.name}
      closeHref={href("work")}
      step={{ index: index + 1, total: list.length }}
      prev={prev && { href: href(`work/${prev.slug}`), label: prev.name }}
      next={next && { href: href(`work/${next.slug}`), label: next.name }}
    >
      <p data-panel-in className="mt-5 max-w-[36rem] leading-relaxed text-muted">
        {project.description}
      </p>
      <SpecTable rows={rows} />
      <a data-panel-in href={project.url} target="_blank" rel="noopener noreferrer" className="space-cta label" data-cursor="link">
        {copy.open}
      </a>
      {full && <DeviceStage full={full} alt={project.name} shot={dict.ui.product.shot} fullShot={dict.ui.product.fullShot} />}
    </Panel>
  );
}
