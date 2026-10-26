import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Panel } from "@/components/space/Panel";
import { DeviceStage, PanelSkeleton, SpecTable } from "@/components/space/PanelParts";
import { SPACE_BASE } from "@/config/space";
import { spaceCopy } from "@/content/space";
import previews from "@/content/project-previews.json";
import { projectCategories, projects } from "@/content/projects";
import type { ProjectPreviews } from "@/content/types";

type Params = { slug: string };

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  return project ? { title: project.name, description: project.description } : {};
}

function displayUrl(url: string) {
  const { host, pathname } = new URL(url);
  return (host.replace(/^www\./, "") + pathname).replace(/\/$/, "");
}

/** Phần đọc params nằm trong Suspense để điều hướng tới trang này vẫn "tức thì" (khung chờ hiện ngay) */
export default function ProjectDossierPage({ params }: { params: Promise<Params> }) {
  return (
    <Suspense fallback={<PanelSkeleton label="Đang tải hồ sơ sản phẩm" />}>
      <ProjectDossier params={params} />
    </Suspense>
  );
}

async function ProjectDossier({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index < 0) notFound();
  const project = projects[index];
  const prev = projects[index - 1];
  const next = projects[index + 1];
  const full = (previews as ProjectPreviews)[project.slug]?.full;
  const category = projectCategories.find((c) => c.id === project.category)?.label ?? project.category;
  const copy = spaceCopy.product;

  const rows = [
    { label: copy.specType, value: project.type },
    { label: copy.specGroup, value: category },
    { label: copy.specAddress, value: displayUrl(project.url) },
    ...(project.highlights?.length
      ? [{ label: copy.specFeatures, value: <ul className="space-list">{project.highlights.map((h) => <li key={h}>{h}</li>)}</ul> }]
      : []),
  ];

  return (
    <Panel
      zone="trung-bay"
      eyebrow={`${copy.label} /${String(index + 1).padStart(2, "0")} · ${project.type.toUpperCase()}`}
      title={project.name}
      closeHref={`${SPACE_BASE}/trung-bay`}
      step={{ index: index + 1, total: projects.length }}
      prev={prev && { href: `${SPACE_BASE}/trung-bay/${prev.slug}`, label: prev.name }}
      next={next && { href: `${SPACE_BASE}/trung-bay/${next.slug}`, label: next.name }}
    >
      <p data-panel-in className="mt-5 max-w-[36rem] leading-relaxed text-muted">
        {project.description}
      </p>
      <SpecTable rows={rows} />
      <a data-panel-in href={project.url} target="_blank" rel="noopener noreferrer" className="space-cta label" data-cursor="link">
        {copy.open}
        <span className="sr-only"> (mở trong tab mới)</span>
      </a>
      {full && <DeviceStage full={full} alt={`Ảnh chụp toàn trang website ${project.name}`} />}
    </Panel>
  );
}
