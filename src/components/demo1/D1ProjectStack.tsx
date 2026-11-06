"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";

import previews from "@/content/project-previews.json";
import { d1, d1ProjectHref } from "@/content/demo1";
import type { ProjectPreviews } from "@/content/types";
import { fill } from "@/lib/fill";
import { optimizedImageUrl } from "@/lib/image-url";

import { AsciiResolve } from "./ascii/AsciiResolve";
import { D1Button } from "./D1Button";
import { ArrowRight, ArrowUpRight } from "./icons";

const pad = (n: number) => String(n).padStart(2, "0");
const pv = previews as ProjectPreviews;
/** Số thẻ dựng phía sau thẻ trước (thẻ xa hơn không render để khỏi tải ảnh) */
const DEPTH = 3;

function domainOf(url: string) {
  return new URL(url).host.replace(/^www\./, "");
}

/**
 * Dự án kiểu "Featured Projects" của Komma: chồng thẻ 3D (CSS) bên trái, danh sách 7 tên bên phải.
 * Rê / chọn tên (hoặc nút trước–sau) thì thẻ tương ứng lật lên trước; thẻ trước hiện ảnh dưới dạng ký tự rồi rõ dần thành ảnh thật.
 * Mỗi thẻ và mỗi tên đều dẫn tới trang dự án riêng.
 */
export function D1ProjectStack() {
  const { work, project: copy } = d1;
  const items = work.items;
  const [active, setActive] = useState(0);
  const current = items[active];
  const go = (step: number) => setActive((i) => (i + step + items.length) % items.length);

  return (
    <section id="du-an" data-d1-map={work.label} aria-labelledby="du-an-title" className="d1-section">
      <div className="d1-wrap">
        <div className="d1-grid items-end gap-y-6">
          <h2 id="du-an-title" className="d1-h2 col-span-12 lg:col-span-7">
            {work.title}
            <span className="d1-count">{pad(items.length)}</span>
          </h2>
          <p className="col-span-12 max-w-[30rem] text-muted lg:col-span-4 lg:col-start-9">{work.lead}</p>
        </div>

        <div className="d1-grid mt-12 items-center gap-y-10 lg:mt-16">
          <div className="col-span-12 lg:col-span-7">
            <div className="d1-stack">
              {items.map((project, index) => {
                const offset = (index - active + items.length) % items.length;
                if (offset > DEPTH) return null;
                const preview = pv[project.slug];
                const front = offset === 0;
                return (
                  <Link
                    key={project.slug}
                    href={d1ProjectHref(project.slug)}
                    className="d1-stack-card"
                    data-offset={offset}
                    style={{ "--o": offset } as CSSProperties}
                    aria-hidden={!front}
                    tabIndex={front ? undefined : -1}
                  >
                    <div className="d1-frame">
                      <div className="d1-frame-bar">
                        <span className="d1-label">{domainOf(project.url)}</span>
                      </div>
                      <div className="d1-frame-view">
                        {preview && (
                          <Image
                            src={preview.cover.src}
                            width={preview.cover.width}
                            height={preview.cover.height}
                            alt={front ? fill(copy.shotAlt, { name: project.name }) : ""}
                            sizes="(min-width: 64rem) 52vw, 92vw"
                          />
                        )}
                        {front && preview && <AsciiResolve key={project.slug} src={optimizedImageUrl(preview.cover.src, 640)} text={d1.hero.markText} />}
                      </div>
                    </div>
                    {front && (
                      <>
                        <span className="d1-stack-tag">{project.name}</span>
                        <span className="d1-stack-hint">
                          {work.open}
                          <ArrowUpRight className="size-3.5" />
                        </span>
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
            <div className="d1-stack-controls">
              <button type="button" className="d1-round" aria-label={work.prev} onClick={() => go(-1)}>
                <ArrowRight className="size-4 rotate-180" />
              </button>
              <span className="d1-label tabular-nums" aria-live="polite">
                {pad(active + 1)} / {pad(items.length)}
              </span>
              <button type="button" className="d1-round" aria-label={work.next} onClick={() => go(1)}>
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 lg:col-start-9">
            <ul aria-label={work.list} className="d1-stack-list">
              {items.map((project, index) => (
                <li key={project.slug}>
                  <Link
                    href={d1ProjectHref(project.slug)}
                    aria-current={index === active ? "true" : undefined}
                    onPointerEnter={(event) => event.pointerType === "mouse" && setActive(index)}
                    onFocus={() => setActive(index)}
                  >
                    <span>{project.name}</span>
                    <span className="d1-label text-muted">{work.categoryLabel[project.category]}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <p className="d1-label text-accent">{current.type}</p>
              <p key={current.slug} className="d1-stack-desc mt-2 text-muted">
                {current.description}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <D1Button href={d1ProjectHref(current.slug)}>{work.view}</D1Button>
                <D1Button href="/mau-giao-dien" variant="soft" icon={false}>
                  {work.templates}
                </D1Button>
              </div>
              <p className="mt-3 text-[0.8125rem] text-muted">{work.templatesNote}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
