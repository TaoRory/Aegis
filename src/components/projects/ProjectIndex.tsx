"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { flushSync } from "react-dom";

import { TextScramble } from "@/components/fx/TextScramble";
import type { SiteDict } from "@/content/site/types";
import type { Project, ProjectCategory, ProjectPreviews } from "@/content/types";
import { cn } from "@/lib/cn";
import { fill } from "@/lib/fill";
import { gsap, MQ } from "@/lib/motion";

type Filter = ProjectCategory | "all";

interface ProjectIndexProps {
  projects: Project[];
  previews: ProjectPreviews;
  categories: { id: Filter; label: string }[];
  copy: SiteDict["projectIndex"];
}

function displayUrl(url: string) {
  const { host, pathname } = new URL(url);
  return (host.replace(/^www\./, "") + pathname).replace(/\/$/, "");
}

/**
 * Danh mục công trình dạng index: mỗi dòng là tên dự án cỡ lớn.
 * Thiết bị có chuột: ảnh xem trước bay theo con trỏ, các dòng khác mờ đi.
 * Cảm ứng: ảnh hiển thị ngay trong dòng.
 */
export function ProjectIndex({ projects, previews, categories, copy }: ProjectIndexProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [hovered, setHovered] = useState<string | null>(null);
  const [previewReady, setPreviewReady] = useState(false);
  /** Chỉ gán view-transition-name cho các dòng trong lúc lọc, để không lẫn vào hiệu ứng chuyển trang */
  const [naming, setNaming] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  /** Đặt ảnh nổi theo tọa độ con trỏ; `immediate` dùng khi vừa đi vào dòng (tránh ảnh bay từ vị trí cũ) */
  const moveFloat = useRef<(x: number, y: number, immediate?: boolean) => void>(() => {});

  const visible = filter === "all" ? projects : projects.filter((p) => p.category === filter);
  const countFor = (id: Filter) => (id === "all" ? projects.length : projects.filter((p) => p.category === id).length);

  const changeFilter = (next: Filter) => {
    if (next === filter) return;
    const animate = "startViewTransition" in document && window.matchMedia(MQ.anyMotion).matches;
    if (animate) {
      flushSync(() => setNaming(true));
      const transition = document.startViewTransition(() => flushSync(() => setFilter(next)));
      void transition.finished.finally(() => setNaming(false));
    } else setFilter(next);
  };

  // Ảnh nổi theo con trỏ (chỉ thiết bị có chuột, có chuyển động)
  useEffect(() => {
    const list = listRef.current;
    const float = floatRef.current;
    if (!list || !float || !window.matchMedia(`${MQ.fineHover} and ${MQ.anyMotion}`).matches) return;

    // Chỉ tải ảnh xem trước khi danh mục sắp vào màn hình
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setPreviewReady(true);
        io.disconnect();
      }
    }, { rootMargin: "50% 0px" });
    io.observe(list);

    const xTo = gsap.quickTo(float, "x", { duration: 0.65, ease: "power3" });
    const yTo = gsap.quickTo(float, "y", { duration: 0.65, ease: "power3" });
    const rTo = gsap.quickTo(float, "rotation", { duration: 0.8, ease: "power3" });
    const skewTo = gsap.quickTo(float, "skewX", { duration: 0.5, ease: "power3" });
    let lastX = 0;
    let visible = false;
    let skewTimer = 0;
    moveFloat.current = (x, y, immediate) => {
      if (immediate && !visible) gsap.set(float, { x, y, rotation: 0 });
      visible = true;
      xTo(x);
      yTo(y);
      rTo(Math.max(-8, Math.min(8, (x - lastX) * 0.4)));
      // Ảnh vặn nhẹ theo hướng kéo rồi hồi về (cảm giác "chất lỏng")
      skewTo(Math.max(-14, Math.min(14, (x - lastX) * -0.5)));
      window.clearTimeout(skewTimer);
      skewTimer = window.setTimeout(() => skewTo(0), 90);
      lastX = x;
    };
    const onMove = (event: PointerEvent) => moveFloat.current(event.clientX, event.clientY);
    const onLeave = () => {
      visible = false;
    };
    list.addEventListener("pointermove", onMove);
    list.addEventListener("pointerleave", onLeave);
    return () => {
      io.disconnect();
      window.clearTimeout(skewTimer);
      list.removeEventListener("pointermove", onMove);
      list.removeEventListener("pointerleave", onLeave);
      moveFloat.current = () => {};
    };
  }, []);

  return (
    <div>
      <div className="flex flex-col gap-6 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label={copy.filter} className="no-scrollbar -mx-(--gutter) flex gap-2 overflow-x-auto px-(--gutter) pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          {categories.map((category) => {
            const selected = category.id === filter;
            return (
              <button
                key={category.id}
                type="button"
                aria-pressed={selected}
                onClick={() => changeFilter(category.id)}
                className={cn(
                  "label inline-flex h-10 shrink-0 items-center gap-2 rounded-sm border px-3.5 transition-colors duration-200 sm:h-9",
                  selected ? "border-fg bg-fg text-bg" : "border-line-strong text-muted hover:border-fg hover:text-fg",
                )}
              >
                {category.label}
                <sup className="tabular-nums">{String(countFor(category.id)).padStart(2, "0")}</sup>
              </button>
            );
          })}
        </div>
        <p className="label text-muted" aria-live="polite">
          {fill(copy.showing, { n: String(visible.length).padStart(2, "0"), total: String(projects.length).padStart(2, "0") })}
        </p>
      </div>

      <p aria-hidden className="project-swipe-hint label text-muted">
        {copy.swipe} <span>→</span>
      </p>

      <ul
        ref={listRef}
        className={cn("project-index", hovered && "is-hovering")}
        onPointerLeave={() => setHovered(null)}
      >
        {visible.map((project) => {
          const index = projects.indexOf(project);
          const preview = previews[project.slug];
          return (
            <li
              key={project.slug}
              data-project={project.slug}
              className={cn("project-row", hovered === project.slug && "is-active")}
              style={naming ? { viewTransitionName: `project-${project.slug}` } : undefined}
              onPointerEnter={(event) => {
                moveFloat.current(event.clientX, event.clientY, true);
                setHovered(project.slug);
              }}
            >
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="view"
                data-cursor-label={copy.cursor}
                className="project-link grid gap-x-6 gap-y-3 py-7 max-lg:flex max-lg:flex-col max-lg:gap-0 max-lg:py-0 lg:grid-cols-12 lg:items-baseline lg:py-9"
              >
                <span className="label text-muted lg:col-span-1">{String(index + 1).padStart(2, "0")}</span>
                <span className="project-name text-[clamp(2rem,1.2rem+3.6vw,5rem)] leading-[1.02] font-semibold tracking-[-0.04em] lg:col-span-6">
                  <TextScramble text={project.name} trigger="parent" />
                </span>
                <span className="lg:col-span-4">
                  <span className="label text-accent">{project.type}</span>
                  <span className="mt-2 block text-[0.95rem] leading-relaxed text-muted">{project.description}</span>
                  {project.highlights && (
                    <span className="label mt-3 flex flex-wrap gap-x-4 gap-y-1 text-muted">
                      {project.highlights.map((h) => (
                        <span key={h}>
                          <span className="text-accent">+</span> {h}
                        </span>
                      ))}
                    </span>
                  )}
                </span>
                <span className="label flex items-center gap-2 text-muted lg:col-span-1 lg:justify-self-end">
                  <span className="hidden xl:inline">{displayUrl(project.url).split("/")[0]}</span>
                  <span aria-hidden className="project-arrow text-lg text-fg">
                    ↗
                  </span>
                  <span className="sr-only">{fill(copy.open, { name: project.name })}</span>
                </span>

                {/* Ảnh trong dòng: chỉ hiện trên thiết bị cảm ứng / không có hover */}
                {preview && (
                  <span className="project-inline-media relative aspect-[16/10] overflow-hidden lg:col-span-12">
                    <Image
                      src={preview.cover.src}
                      width={preview.cover.width}
                      height={preview.cover.height}
                      alt={fill(copy.shotAlt, { name: project.name })}
                      sizes="100vw"
                      className="size-full object-cover object-top"
                    />
                  </span>
                )}
              </a>
            </li>
          );
        })}
      </ul>

      {/* Ảnh nổi theo con trỏ (desktop) */}
      <div ref={floatRef} aria-hidden className={cn("project-float", hovered && "is-visible")}>
        <div className="project-float-inner">
          {previewReady &&
            projects.map((project) => {
              const preview = previews[project.slug];
              if (!preview) return null;
              return (
                <Image
                  key={project.slug}
                  src={preview.cover.src}
                  width={preview.cover.width}
                  height={preview.cover.height}
                  alt=""
                  sizes="420px"
                  loading="eager"
                  className={cn("project-float-img", hovered === project.slug && "is-current")}
                />
              );
            })}
          <span className="project-float-label label">{hovered ? displayUrl(projects.find((p) => p.slug === hovered)?.url ?? "") : ""}</span>
        </div>
      </div>
    </div>
  );
}
