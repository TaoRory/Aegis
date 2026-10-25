"use client";

import { useRef, useState, type CSSProperties } from "react";

import { SelectServiceLink } from "@/components/services/SelectServiceLink";
import { stageStore } from "@/components/webgl/stage-store";
import type { Service } from "@/content/types";
import { cn } from "@/lib/cn";
import { gsap, MQ, ScrollTrigger, scrollToTarget, useGSAP } from "@/lib/motion";

/** Mỗi chương giữ hình một lúc rồi mới morph sang hình kế tiếp (ở 30% cuối của chương) */
function phaseFromProgress(progress: number, count: number) {
  const seg = Math.min(progress * count, count - 0.0001);
  const index = Math.floor(seg);
  const local = seg - index;
  const t = index < count - 1 ? Math.min(1, Math.max(0, (local - 0.7) / 0.3)) : 0;
  return index + t * t * (3 - 2 * t);
}

export function ServiceChapters({ services }: { services: Service[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const pad = (n: number) => String(n).padStart(2, "0");

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const chapters = [...root.querySelectorAll<HTMLElement>("[data-chapter-index]")];
      const mm = gsap.matchMedia();

      // Desktop: ghim sân khấu, chương thay nhau theo tiến độ cuộn
      mm.add(MQ.desktopMotion, () => {
        root.dataset.mode = "pinned";
        const st = ScrollTrigger.create({
          trigger: root,
          start: "top top",
          end: () => `+=${window.innerHeight * services.length * 0.95}`,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate(self) {
            stageStore.setServicePhase(phaseFromProgress(self.progress, services.length));
            setActive(Math.min(services.length - 1, Math.floor(self.progress * services.length)));
            if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`;
          },
        });

        // Liên kết tới từng dịch vụ (hero, footer): cuộn tới đúng chương bên trong đoạn ghim
        const onClick = (event: MouseEvent) => {
          const link = (event.target as Element).closest<HTMLAnchorElement>('a[href*="#dich-vu-"]');
          if (!link || new URL(link.href).pathname !== window.location.pathname) return;
          const hash = `#${link.href.split("#")[1]}`;
          const index = chapters.findIndex((c) => `#${c.id}` === hash);
          if (index < 0) return;
          event.preventDefault();
          event.stopPropagation();
          scrollToTarget(st.start + ((index + 0.3) / services.length) * (st.end - st.start));
          history.pushState(null, "", hash);
        };
        document.addEventListener("click", onClick, true);

        return () => {
          document.removeEventListener("click", onClick, true);
          delete root.dataset.mode;
          stageStore.setServicePhase(0);
        };
      });

      // Mobile / giảm chuyển động: chương xếp dọc; chương nào vào giữa màn hình thì hạt morph sang hình đó
      mm.add(`not ${MQ.desktopMotion}`, () => {
        const reduced = window.matchMedia(MQ.reduced).matches;
        const proxy = { phase: stageStore.servicePhase };
        const triggers = chapters.map((chapter, index) =>
          ScrollTrigger.create({
            trigger: chapter,
            start: "top 60%",
            end: "bottom 60%",
            onToggle(self) {
              if (!self.isActive) return;
              setActive(index);
              if (reduced) stageStore.setServicePhase(index);
              else gsap.to(proxy, { phase: index, duration: 1.4, ease: "power2.inOut", overwrite: true, onUpdate: () => stageStore.setServicePhase(proxy.phase) });
            },
          }),
        );
        return () => triggers.forEach((t) => t.kill());
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="service-stage relative">
      <div className="container-page service-stage-inner">
        <ol className="service-chapters">
          {services.map((service, index) => (
            <li
              key={service.id}
              id={`dich-vu-${service.id}`}
              data-chapter-index={index}
              data-active={index === active ? "true" : "false"}
              className="service-chapter"
              style={{ "--i": index } as CSSProperties}
            >
              <article aria-labelledby={`dich-vu-${service.id}-title`} className="lg:max-w-[46rem]">
                <p className="label flex items-center gap-3 text-muted">
                  <span className="text-accent">BV-{pad(index + 1)}</span>
                  <span aria-hidden className="h-px w-10 bg-line-strong" />
                  Bản vẽ số {pad(index + 1)} / {pad(services.length)}
                </p>
                <h3 id={`dich-vu-${service.id}-title`} className="mt-6 text-h3 font-semibold">
                  {service.title}
                </h3>
                <p className="mt-5 max-w-[36rem] text-lead text-muted">{service.summary}</p>

                <div className="mt-9 grid gap-8 border-t border-line pt-7 sm:grid-cols-2">
                  <div>
                    <h4 className="label text-muted">Nhu cầu thường gặp</h4>
                    <ul className="mt-4 space-y-3 text-[0.95rem] leading-relaxed text-muted">
                      {service.needs.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span aria-hidden className="mt-[0.6em] h-px w-3 shrink-0 bg-line-strong" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="label text-muted">Aegis hỗ trợ</h4>
                    <ul className="mt-4 space-y-3 text-[0.95rem] leading-relaxed">
                      {service.scope.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span aria-hidden className="font-mono text-accent">+</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <p className="mt-8 font-serif text-[clamp(1.2rem,1rem+0.7vw,1.6rem)] leading-snug italic">
                  “{service.value}”
                </p>

                <SelectServiceLink serviceId={service.id} className="btn-link mt-8 text-fg">
                  <span className="roll">
                    <span className="roll-a">Trao đổi về dịch vụ này</span>
                    <span className="roll-b" aria-hidden>
                      Trao đổi về dịch vụ này
                    </span>
                  </span>
                  <span aria-hidden className="btn-arrow">
                    →
                  </span>
                </SelectServiceLink>
              </article>
            </li>
          ))}
        </ol>

        <div aria-hidden className="service-rail">
          <ul className="label grid gap-2 text-muted">
            {services.map((service, index) => (
              <li key={service.id} className={cn("flex items-center gap-3 transition-colors duration-300", index === active && "text-fg")}>
                <span className={cn("transition-colors", index === active ? "text-accent" : "")}>{pad(index + 1)}</span>
                {service.shortTitle}
              </li>
            ))}
          </ul>
          <span className="service-rail-track mt-5 block h-px w-full bg-line">
            <span ref={barRef} className="block h-px w-full origin-left bg-accent" style={{ transform: "scaleX(0)" }} />
          </span>
        </div>
      </div>
    </div>
  );
}
