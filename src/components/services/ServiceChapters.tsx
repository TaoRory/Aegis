"use client";

import { useRef, useState, type CSSProperties } from "react";
import Link from "next/link";

import { stageStore } from "@/components/webgl/stage-store";
import { serviceHref } from "@/config/routes";
import type { Locale } from "@/config/space";
import type { SiteDict } from "@/content/site";
import type { Service } from "@/content/types";
import { cn } from "@/lib/cn";
import { getLenis, gsap, MQ, ScrollTrigger, scrollToTarget, useGSAP } from "@/lib/motion";

export function ServiceChapters({ services, lang, copy }: { services: Service[]; lang: Locale; copy: SiteDict["chapters"] }) {
  const ref = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  /** Điện thoại: chi tiết từng dịch vụ gập lại, bấm để mở (máy tính luôn hiện đủ) */
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
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
        const last = services.length - 1;
        // Mỗi chương chiếm một đoạn cuộn ngắn; dừng cuộn là tự "hút" tới chương gần nhất THEO CHIỀU đang cuộn,
        // nên chỉ một nấc lăn chuột là hình và chữ cùng sang dịch vụ kế tiếp
        let settleTimer = 0;
        let snapping = false;
        let direction = 1;
        let previous = 0;

        const st = ScrollTrigger.create({
          trigger: root,
          start: "top top",
          end: () => `+=${window.innerHeight * last * 0.8}`,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate(self) {
            const segment = self.progress * last;
            // Hình morph liên tục theo tiến độ (cùng nhịp với chữ đổi), không còn "giữ hình rồi mới đổi"
            stageStore.setServicePhase(segment);
            setActive(Math.min(last, Math.round(segment)));
            if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`;
            if (snapping) return;
            if (Math.abs(self.progress - previous) > 1e-4) direction = self.progress > previous ? 1 : -1;
            previous = self.progress;
            window.clearTimeout(settleTimer);
            settleTimer = window.setTimeout(settle, 130);
          },
        });

        const goTo = (index: number) => {
          const y = st.start + (index / last) * (st.end - st.start);
          snapping = true;
          window.setTimeout(() => (snapping = false), 1300); // chốt an toàn nếu onComplete không tới
          const lenis = getLenis();
          if (lenis) {
            lenis.scrollTo(y, {
              duration: 0.85,
              easing: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
              force: true,
              onComplete: () => {
                snapping = false;
                previous = st.progress;
              },
            });
          } else scrollToTarget(y);
        };

        function settle() {
          if (snapping || !st.isActive) return;
          const segment = st.progress * last;
          const target = direction > 0 ? Math.ceil(segment - 0.03) : Math.floor(segment + 0.03);
          if (Math.abs(segment - target) < 0.03) return;
          goTo(Math.max(0, Math.min(last, target)));
        }

        // Lăn chuột trong đoạn ghim: MỘT cử chỉ = một dịch vụ, chuyển ngay (không chờ Lenis làm mượt rồi mới hút).
        // Cử chỉ mới = khoảng lặng > 150 ms giữa hai sự kiện lăn, để quán tính của chuột/trackpad không nhảy thêm chương.
        // Ở chương đầu mà lăn lên, hoặc chương cuối mà lăn xuống, thì để trang cuộn bình thường ra khỏi đoạn ghim.
        let lastWheelAt = 0;
        const onWheel = (event: WheelEvent) => {
          const dir = Math.sign(event.deltaY);
          if (!st.isActive || !dir) return;
          const segment = st.progress * last;
          if ((dir > 0 && segment >= last - 0.02) || (dir < 0 && segment <= 0.02)) return;
          event.preventDefault();
          event.stopImmediatePropagation();
          const now = performance.now();
          const freshGesture = now - lastWheelAt > 150;
          lastWheelAt = now;
          if (snapping || !freshGesture) return;
          direction = dir;
          window.clearTimeout(settleTimer);
          goTo(Math.max(0, Math.min(last, dir > 0 ? Math.floor(segment + 0.02) + 1 : Math.ceil(segment - 0.02) - 1)));
        };
        window.addEventListener("wheel", onWheel, { passive: false, capture: true });

        // Liên kết tới từng dịch vụ (hero, footer): cuộn tới đúng chương bên trong đoạn ghim
        const onClick = (event: MouseEvent) => {
          const link = (event.target as Element).closest<HTMLAnchorElement>('a[href*="#dich-vu-"]');
          if (!link || new URL(link.href).pathname !== window.location.pathname) return;
          const hash = `#${link.href.split("#")[1]}`;
          const index = chapters.findIndex((c) => `#${c.id}` === hash);
          if (index < 0) return;
          event.preventDefault();
          event.stopPropagation();
          goTo(index);
          history.pushState(null, "", hash);
        };
        document.addEventListener("click", onClick, true);

        return () => {
          window.clearTimeout(settleTimer);
          window.removeEventListener("wheel", onWheel, true);
          document.removeEventListener("click", onClick, true);
          delete root.dataset.mode;
          stageStore.setServicePhase(0);
        };
      });

      // Mobile / giảm chuyển động: chương xếp dọc; chương nào vào giữa màn hình thì hạt morph sang hình đó
      mm.add("(max-width: 63.99rem), (max-height: 39.99rem), (prefers-reduced-motion: reduce)", () => {
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
              <article aria-labelledby={`dich-vu-${service.id}-title`} data-num={pad(index + 1)} className="lg:max-w-[47rem]">
                <p className="label flex items-center gap-3 text-muted">
                  <span className="text-accent">BV-{pad(index + 1)}</span>
                  <span aria-hidden className="h-px w-10 bg-line-strong" />
                  {copy.sheet} {pad(index + 1)} / {pad(services.length)}
                </p>
                <h3 id={`dich-vu-${service.id}-title`} className="mt-6 text-h3 font-semibold">
                  {service.title}
                </h3>
                <p className="mt-5 max-w-[42rem] text-lead text-muted">{service.summary}</p>

                <button
                  type="button"
                  className="service-more-toggle label"
                  aria-expanded={!!expanded[service.id]}
                  aria-controls={`dich-vu-${service.id}-chi-tiet`}
                  onClick={() => setExpanded((e) => ({ ...e, [service.id]: !e[service.id] }))}
                >
                  <span>{expanded[service.id] ? copy.less : copy.more}</span>
                  <span aria-hidden className="service-more-icon" />
                </button>

                <div id={`dich-vu-${service.id}-chi-tiet`} data-open={!!expanded[service.id]} className="service-more-body">
                <div className="mt-9 grid gap-8 border-t border-line pt-7 sm:grid-cols-2">
                  <div>
                    <h4 className="label text-muted">{copy.needs}</h4>
                    <ul className="mt-4 space-y-3 text-[1.1rem] leading-relaxed text-muted">
                      {service.needs.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span aria-hidden className="mt-[0.6em] h-px w-3 shrink-0 bg-line-strong" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="label text-muted">{copy.scope}</h4>
                    <ul className="mt-4 space-y-3 text-[1.1rem] leading-relaxed">
                      {service.scope.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span aria-hidden className="font-mono text-accent">+</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <p className="mt-8 font-serif text-[clamp(1.35rem,1.1rem+0.9vw,2rem)] leading-snug italic">
                  “{service.value}”
                </p>
                </div>

                <Link href={serviceHref(lang, service.id)} className="btn-link service-explore">
                  <span className="roll">
                    <span className="roll-a">{copy.explore}</span>
                    <span className="roll-b" aria-hidden>
                      {copy.explore}
                    </span>
                  </span>
                  <span aria-hidden className="btn-arrow">
                    →
                  </span>
                </Link>
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
