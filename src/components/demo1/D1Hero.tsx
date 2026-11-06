"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { d1, d1ProjectHref } from "@/content/demo1";
import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/motion";

import { AsciiMobius } from "./ascii/AsciiMobius";
import { D1Button } from "./D1Button";
import { ArrowRight } from "./icons";

/**
 * Màn đầu /demo1 (toàn màn hình, chữ và nút hiện ngay):
 * - tiêu đề "đổi chữ": vế xám bị gạch (nét gạch tự vẽ khi vào trang), vế đậm thay vào;
 * - logo Möbius dựng bằng ký tự, tự lắp khi vào trang;
 * - cuộn xuống: khung tối của logo nở ra phủ kín màn đầu (cánh cửa sang phần "Cách làm" nền tối); chữ đổi sang tông sáng khi đã bị phủ.
 *   Chỉ là lớp nền: không JS / giảm chuyển động thì không có, chữ vẫn đọc bình thường;
 * - chân màn: hàng metadata "Dự án tiêu biểu" tự đổi qua 7 dự án thật.
 */
export function D1Hero() {
  const { hero, cta } = d1;
  const sectionRef = useRef<HTMLElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const tileRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const portal = portalRef.current;
      const tile = tileRef.current;
      if (!section || !portal || !tile) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.anyMotion, () => {
        let rect = { top: 0, right: 0, bottom: 0, left: 0 };
        const measure = () => {
          const s = section.getBoundingClientRect();
          const t = tile.getBoundingClientRect();
          rect = { top: t.top - s.top, left: t.left - s.left, right: s.right - t.right, bottom: s.bottom - t.bottom };
        };
        measure();
        const apply = (progress: number) => {
          const e = gsap.parseEase("power2.inOut")(Math.min(1, Math.max(0, (progress - 0.02) / 0.5)));
          const k = 1 - e;
          portal.style.clipPath = `inset(${(rect.top * k).toFixed(1)}px ${(rect.right * k).toFixed(1)}px ${(rect.bottom * k).toFixed(1)}px ${(rect.left * k).toFixed(1)}px round ${(4 * k).toFixed(1)}px)`;
          portal.style.opacity = progress > 0.001 ? "1" : "0";
          if (e > 0.62) section.dataset.d1Tone = "dark";
          else delete section.dataset.d1Tone;
        };
        const trigger = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom top",
          // onRefresh chạy ngay lúc tạo (trước khi biến được gán) nên dùng tham số self
          onRefresh: (self) => {
            measure();
            apply(self.progress);
          },
          onUpdate: (self) => apply(self.progress),
        });
        apply(0);
        return () => {
          trigger.kill();
          portal.style.clipPath = "";
          portal.style.opacity = "";
          delete section.dataset.d1Tone;
        };
      });
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="mo-dau" data-d1-map="Mở đầu" aria-labelledby="d1-hero-title" className="d1-hero">
      <div ref={portalRef} aria-hidden className="d1-hero-portal" />
      <div className="d1-wrap d1-hero-inner">
        <div className="d1-grid flex-1 items-center gap-y-10">
          <div className="col-span-12 lg:col-span-7">
            <h1 id="d1-hero-title" className="d1-display">
              <span className="d1-struck">
                <span>{hero.struck}</span>
              </span>
              <span className="block">{hero.title}</span>
            </h1>
            <p className="d1-lead mt-8 max-w-[34rem] text-muted">{hero.lead}</p>
            <div className="mt-9 flex flex-wrap gap-2">
              <D1Button href={cta.href}>{cta.label}</D1Button>
              <D1Button href="#du-an" variant="soft" icon={false}>
                {hero.work}
              </D1Button>
            </div>
          </div>
          <div ref={tileRef} className="col-span-12 sm:col-span-8 sm:col-start-3 lg:col-span-5 lg:col-start-8">
            <AsciiMobius text={hero.markText} label={hero.markLabel} />
          </div>
        </div>
        <D1Featured />
      </div>
    </section>
  );
}

/** Hàng metadata kiểu Komma ở chân màn đầu: dự án tiêu biểu tự đổi mỗi ~4,5 giây (dừng khi rê chuột, khi khuất, khi giảm chuyển động) */
function D1Featured() {
  const { hero, work } = d1;
  const items = work.items;
  const [index, setIndex] = useState(0);
  const rowRef = useRef<HTMLDivElement>(null);
  const paused = useRef(false);

  useEffect(() => {
    if (window.matchMedia(MQ.reduced).matches) return;
    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    if (rowRef.current) io.observe(rowRef.current);
    const timer = window.setInterval(() => {
      if (!visible || paused.current || document.hidden) return;
      setIndex((i) => (i + 1) % items.length);
    }, 4500);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, [items.length]);

  const project = items[index];
  return (
    <div
      ref={rowRef}
      className="d1-featured"
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
    >
      <span className="d1-label">{hero.featured}</span>
      <span key={project.slug} className="d1-featured-name">
        {project.name}
      </span>
      <span key={`${project.slug}-type`} className="d1-featured-type max-md:hidden">
        {project.type}
      </span>
      <Link href={d1ProjectHref(project.slug)} className="d1-featured-link">
        {hero.featuredCta}
        <span className="sr-only"> {project.name}</span>
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}
