import { SplitReveal } from "@/components/motion/SplitReveal";
import { ProjectIndex } from "@/components/projects/ProjectIndex";
import { ButtonLink } from "@/components/ui/Button";
import { Lines } from "@/components/ui/Rich";
import { serviceHref } from "@/config/routes";
import type { Locale } from "@/config/space";
import previews from "@/content/project-previews.json";
import { getSiteDict } from "@/content/site";
import type { ProjectPreviews } from "@/content/types";

const FEATURED = ["vidi26", "handle-vietnam", "integritas-vu-legal", "tedx-vinuniversity-2026"];

/** Dự án tiêu biểu trên trang chủ: 4 dự án thật (cùng danh sách kiểu bản vẽ của trang Web), link sang toàn bộ dự án */
export function FeaturedProjects({ lang }: { lang: Locale }) {
  const { homeProjects: copy, projects, projectIndex } = getSiteDict(lang);
  const items = FEATURED.map((slug) => projects.find((p) => p.slug === slug)!).filter(Boolean);
  return (
    <section id="du-an-tieu-bieu" data-surface="dark" data-chapter={copy.chapter} aria-labelledby="du-an-tieu-bieu-title" className="ink relative z-10 section-y">
      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="label text-muted">{copy.label}</p>
            <SplitReveal as="h2" id="du-an-tieu-bieu-title" className="mt-6 text-h2 font-semibold">
              <Lines lines={copy.lines} />
            </SplitReveal>
          </div>
          <p className="max-w-[26rem] text-lead text-muted lg:col-span-4 lg:justify-self-end">{copy.lead}</p>
        </div>
        <div className="mt-16 lg:mt-24">
          <ProjectIndex projects={items} previews={previews as ProjectPreviews} categories={[]} copy={projectIndex} />
        </div>
        <div className="mt-12">
          <ButtonLink href={`${serviceHref(lang, "web")}#du-an`} variant="outline">
            {copy.all}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
