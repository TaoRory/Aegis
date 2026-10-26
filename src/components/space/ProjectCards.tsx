import Image from "next/image";
import Link from "next/link";

import previews from "@/content/project-previews.json";
import type { Project, ProjectPreviews } from "@/content/types";

/** Thẻ dự án (ảnh trang, tên, loại, nhãn dịch vụ): dùng ở Gallery và trong khu dịch vụ Web */
export function ProjectCards({
  projects,
  href,
  label,
  view,
  serviceName,
}: {
  projects: Project[];
  href: (slug: string) => string;
  /** Nhãn mono trước số thứ tự, ví dụ "DỰ ÁN" */
  label: string;
  view: string;
  serviceName: (id: Project["services"][number]) => string;
}) {
  const map = previews as ProjectPreviews;
  return (
    <ol className="space-cards">
      {projects.map((project, index) => {
        const cover = map[project.slug]?.cover;
        return (
          <li key={project.slug} data-panel-in>
            <Link href={href(project.slug)} className="space-card" data-cursor="view" data-cursor-label={view}>
              {cover && <Image src={cover.src} width={cover.width} height={cover.height} alt="" sizes="(min-width: 64rem) 20rem, 45vw" className="space-card-img" />}
              <span className="label text-accent">
                {label} /{String(index + 1).padStart(2, "0")}
              </span>
              <span className="space-card-name">{project.name}</span>
              <span className="label text-muted">
                {project.type} · {project.services.map(serviceName).join(", ")}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
