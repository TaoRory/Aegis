import { SplitReveal } from "@/components/motion/SplitReveal";
import { ProjectIndex } from "@/components/projects/ProjectIndex";
import { Lines } from "@/components/ui/Rich";
import { projectsSection } from "@/content/about";
import previews from "@/content/project-previews.json";
import { projectCategories, projects } from "@/content/projects";
import type { ProjectPreviews } from "@/content/types";

export function Projects() {
  return (
    <section
      id="du-an"
      data-surface="dark"
      data-chapter="Dự án"
      aria-labelledby="du-an-title"
      className="ink relative z-10 section-y"
    >
      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="label text-muted">{projectsSection.label}</p>
            <SplitReveal as="h2" id="du-an-title" className="mt-6 text-h2 font-semibold">
              <Lines lines={projectsSection.lines} />
            </SplitReveal>
          </div>
          <p className="max-w-[26rem] text-lead text-muted lg:col-span-4 lg:justify-self-end">{projectsSection.lead}</p>
        </div>
        <div className="mt-16 lg:mt-24">
          <ProjectIndex projects={projects} previews={previews as ProjectPreviews} categories={projectCategories} />
        </div>
      </div>
    </section>
  );
}
