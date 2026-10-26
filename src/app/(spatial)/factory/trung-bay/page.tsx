import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Panel } from "@/components/space/Panel";
import { SPACE_BASE } from "@/config/space";
import { spaceCopy } from "@/content/space";
import previews from "@/content/project-previews.json";
import { projects } from "@/content/projects";
import type { ProjectPreviews } from "@/content/types";

export const metadata: Metadata = { title: "Phòng trưng bày" };

export default function ShowroomPage() {
  const map = previews as ProjectPreviews;
  return (
    <Panel zone="trung-bay" title="Các dự án *đã thực hiện.*" closeHref={SPACE_BASE}>
      <p data-panel-in className="mt-5 max-w-[34rem] leading-relaxed text-muted">
        {spaceCopy.zones["trung-bay"].lead}
      </p>
      <ol className="space-cards">
        {projects.map((project, index) => {
          const cover = map[project.slug]?.cover;
          return (
            <li key={project.slug} data-panel-in>
              <Link href={`${SPACE_BASE}/trung-bay/${project.slug}`} className="space-card" data-cursor="view" data-cursor-label="Xem">
                {cover && (
                  <Image src={cover.src} width={cover.width} height={cover.height} alt="" sizes="(min-width: 64rem) 20rem, 45vw" className="space-card-img" />
                )}
                <span className="label text-accent">
                  {spaceCopy.product.label} /{String(index + 1).padStart(2, "0")}
                </span>
                <span className="space-card-name">{project.name}</span>
                <span className="label text-muted">{project.type}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}
