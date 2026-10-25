"use client";

import { useRef, type CSSProperties } from "react";

import { SplitReveal } from "@/components/motion/SplitReveal";
import { Lines } from "@/components/ui/Rich";
import { process } from "@/content/about";
import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/motion";

const SVG_H = 64;
const BASE_Y = 52;
const RISE = 10;

/**
 * Dựng đường bậc thang kiểu bản vẽ trên track: đi ngang rồi nâng một bậc tại mỗi bước
 * (gợi hình nền móng xếp tầng), kèm vạch kích thước và nút vuông. Trả về phần tử path cần "vẽ".
 */
function buildStairs(svg: SVGSVGElement, track: HTMLElement, steps: HTMLElement[]) {
  const width = track.scrollWidth;
  const xs = steps.map((step) => step.offsetLeft);
  const ys = xs.map((_, i) => BASE_Y - RISE * (i + 1));
  let d = `M0 ${BASE_Y}`;
  xs.forEach((x, i) => (d += ` H${x} V${ys[i]}`));
  d += ` H${width}`;
  const ticks = xs.map((x, i) => `M${x} ${ys[i] - 8} V${BASE_Y + 6}`).join(" ");
  const nodes = xs.map((x, i) => `<rect class="node" x="${x - 4}" y="${ys[i] - 4}" width="8" height="8" />`).join("");
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(SVG_H));
  svg.setAttribute("viewBox", `0 0 ${width} ${SVG_H}`);
  svg.innerHTML =
    `<path class="tick" d="${ticks}" fill="none" stroke-width="1" />` +
    `<path class="path-base" d="${d}" fill="none" stroke-width="1" />` +
    `<path class="path-draw" d="${d}" fill="none" stroke-width="1.5" />` +
    nodes +
    `<text class="dim" x="${width}" y="${BASE_Y + 22}" text-anchor="end">${String(steps.length).padStart(2, "0")} BƯỚC</text>`;
  const draw = svg.querySelector<SVGPathElement>(".path-draw")!;
  const length = draw.getTotalLength();
  draw.style.strokeDasharray = String(length);
  return { draw, length, nodes: [...svg.querySelectorAll<SVGRectElement>(".node")] };
}

export function Process() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = ref.current;
      if (!section) return;
      const track = section.querySelector<HTMLElement>("[data-track]");
      const line = section.querySelector<HTMLElement>("[data-line]");
      const steps = [...section.querySelectorAll<HTMLElement>("[data-step]")];
      if (!track || !line) return;
      const mm = gsap.matchMedia();

      const markSteps = (progress: number) =>
        steps.forEach((step, i) => {
          step.dataset.reached = progress >= i / steps.length + 0.02 ? "true" : "false";
        });

      // Desktop: ghim, track chạy ngang, đường bậc thang được vẽ dần
      mm.add(MQ.desktopMotion, () => {
        section.dataset.mode = "track";
        const svg = section.querySelector<SVGSVGElement>("[data-path]");
        if (!svg) return;
        let stairs = buildStairs(svg, track, steps);
        const draw = { progress: 0 };
        const paint = () => {
          stairs.draw.style.strokeDashoffset = String(stairs.length * (1 - draw.progress));
          stairs.nodes.forEach((node, i) => (node.dataset.reached = steps[i].dataset.reached));
        };
        const rebuild = () => {
          stairs = buildStairs(svg, track, steps);
          paint();
        };
        ScrollTrigger.addEventListener("refresh", rebuild);

        // Quãng chạy ngang = độ rộng track trừ độ rộng khung chứa (track có width: max-content)
        const distance = () => Math.max(0, track.scrollWidth - (track.parentElement?.clientWidth ?? window.innerWidth));
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance() + window.innerHeight * 0.6}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => markSteps(self.progress),
          },
        });
        tl.to(track, { x: () => -distance(), ease: "none" }, 0).to(draw, { progress: 1, ease: "none", onUpdate: paint }, 0);
        return () => {
          ScrollTrigger.removeEventListener("refresh", rebuild);
          svg.innerHTML = "";
          delete section.dataset.mode;
        };
      });

      // Mobile: đường kẻ dọc theo cuộn
      mm.add(MQ.mobileMotion, () => {
        gsap.fromTo(
          line,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: track, start: "top 70%", end: "bottom 70%", scrub: true, onUpdate: (self) => markSteps(self.progress) },
          },
        );
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      id="cach-lam-viec"
      data-chapter="Cách làm việc"
      aria-labelledby="cach-lam-viec-title"
      data-surface="light"
      className="process paper relative z-10 overflow-hidden"
    >
      <div className="process-inner container-page flex flex-col py-(--section-y)">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="label text-muted">{process.label}</p>
            <SplitReveal as="h2" id="cach-lam-viec-title" className="mt-6 text-h2 font-semibold">
              <Lines lines={process.lines} />
            </SplitReveal>
          </div>
          <p className="max-w-[26rem] text-lead text-muted lg:col-span-4 lg:justify-self-end">{process.lead}</p>
        </div>

        <div className="process-track-wrap relative mt-16 lg:mt-20">
          <ol data-track className="process-track relative">
            <span aria-hidden className="process-line-base" />
            <span aria-hidden data-line className="process-line" />
            <svg aria-hidden data-path className="process-svg" />
            {process.steps.map((step, index) => (
              <li key={step.title} data-step data-reached="true" className="process-step" style={{ "--i": index } as CSSProperties}>
                <span aria-hidden className="process-node" />
                <span aria-hidden className="process-num">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-6 text-h3 font-semibold">{step.title}</h3>
                <p className="mt-4 max-w-[24rem] leading-relaxed text-muted">{step.description}</p>
              </li>
            ))}
            <li aria-hidden className="process-end label text-muted">
              <span className="text-accent">↳</span> Vận hành ổn định
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
