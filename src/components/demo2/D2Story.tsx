"use client";

import { useRef, useState } from "react";

import type { D2Dict } from "@/content/demo2";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion";

/** Chỉ ghim khi màn hình đủ rộng và đủ cao để cả tiêu đề, năm mốc và biểu đồ nằm gọn trong một màn */
const PIN_MQ = "(min-width: 64rem) and (min-height: 42rem) and (prefers-reduced-motion: no-preference)";

/** Toạ độ 5 mốc trên đường "tài sản" (viewBox 600 × 380); đường "website bỏ đó" đi ngang sau mốc ra mắt */
const POINTS: [number, number][] = [
  [130, 262],
  [235, 226],
  [340, 176],
  [445, 122],
  [550, 62],
];
const ASSET = `M 30 318 C 70 300, 100 270, ${POINTS[0][0]} ${POINTS[0][1]} S 200 240, ${POINTS[1][0]} ${POINTS[1][1]} S 305 196, ${POINTS[2][0]} ${POINTS[2][1]} S 410 142, ${POINTS[3][0]} ${POINTS[3][1]} S 515 78, ${POINTS[4][0]} ${POINTS[4][1]}`;
const FLAT = `M 30 318 C 70 300, 100 270, ${POINTS[0][0]} ${POINTS[0][1]} C 230 262, 400 272, 560 284`;

/**
 * "Website đứng yên, tài sản lớn lên": một biểu đồ ý tưởng (không phải số liệu) với hai đường và năm mốc.
 * Máy tính, không giảm chuyển động: phần này ghim lại trong lúc cuộn, đường "tài sản" được vẽ dần và mốc đang tới được tô sáng.
 * Mọi chữ luôn hiện sẵn. Điện thoại / giảm chuyển động / không JS: biểu đồ vẽ sẵn đầy đủ, năm mốc hiện bình thường.
 */
export function D2Story({ t }: { t: D2Dict }) {
  const { story } = t.home;
  const rootRef = useRef<HTMLElement>(null);
  const [live, setLive] = useState(false);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(PIN_MQ, () => {
        setLive(true);
        const trigger = ScrollTrigger.create({
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            root.style.setProperty("--p", self.progress.toFixed(4));
            setActive(Math.min(POINTS.length - 1, Math.floor(self.progress * POINTS.length * 0.999)));
          },
        });
        root.style.setProperty("--p", trigger.progress.toFixed(4));
        return () => {
          trigger.kill();
          root.style.removeProperty("--p");
          setLive(false);
        };
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} aria-labelledby="d2-story-title" className="d2-story" data-live={live}>
      <div className="d2-story-pin">
        <div className="d2-wrap d2-story-grid">
          <div>
            <h2 id="d2-story-title" className="d2-h2 d2-two-tone max-w-[13em]">
              {story.ink} <span>{story.muted}</span>
            </h2>
            <ol className="d2-miles">
              {story.milestones.map((item, index) => (
                <li key={item.title} data-active={!live || index === active} data-done={live && index < active}>
                  <span className="d2-mile-no" aria-hidden>
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="d2-h3">{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <figure className="d2-chart">
            <svg viewBox="0 0 600 380" role="img" aria-label={`${story.flat} / ${story.asset}`}>
              <path d="M 30 30 V 340 H 580" className="d2-chart-axis" />
              <path d={FLAT} pathLength={1} className="d2-chart-flat" />
              <path d={ASSET} pathLength={1} className="d2-chart-asset" />
              {POINTS.map(([x, y], index) => (
                <g key={index} className="d2-chart-dot" data-on={!live || index <= active}>
                  <circle cx={x} cy={y} r={13} />
                  <text x={x} y={y + 4.5} textAnchor="middle">
                    {index + 1}
                  </text>
                </g>
              ))}
            </svg>
            <figcaption>
              <span className="d2-legend" data-kind="asset">
                {story.asset}
              </span>
              <span className="d2-legend" data-kind="flat">
                {story.flat}
              </span>
              <span className="d2-chart-note">{story.note}</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
