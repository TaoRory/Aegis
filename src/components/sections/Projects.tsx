import { SplitReveal } from "@/components/motion/SplitReveal";
import { ProjectIndex } from "@/components/projects/ProjectIndex";
import { Lines } from "@/components/ui/Rich";
import type { Locale } from "@/config/space";
import previews from "@/content/project-previews.json";
import { getSiteDict } from "@/content/site";
import type { ProjectPreviews } from "@/content/types";

/** Dự án đã thực hiện: chỉ nằm ở trang Web & web app, nơi khách đã quan tâm tới website */
export function Projects({ lang }: { lang: Locale }) {
  const { webPage, projects, projectCategories, projectIndex } = getSiteDict(lang);
  const copy = webPage.projects;
  return (
    <section
      id="du-an"
      data-surface="dark"
      data-chapter={copy.chapter}
      aria-labelledby="du-an-title"
      className="ink relative z-10 section-y"
    >
      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="label text-muted">{copy.label}</p>
            <SplitReveal as="h2" id="du-an-title" className="mt-6 text-h2 font-semibold">
              <Lines lines={copy.lines} />
            </SplitReveal>
          </div>
          <p className="max-w-[26rem] text-lead text-muted lg:col-span-4 lg:justify-self-end">{copy.lead}</p>
        </div>
        <div className="mt-16 lg:mt-24">
          <ProjectIndex projects={projects} previews={previews as ProjectPreviews} categories={projectCategories} copy={projectIndex} />
        </div>
      </div>
    </section>
  );
}
