"use client";

import { useEffect, useRef, useState } from "react";

import type { D3Dict } from "@/content/demo3";
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
 * Kịch bản cuộn: mốc i "tới nơi" ở tiến độ REACH[i]. Mốc ra mắt có sẵn từ đầu (cả hai đường bắt đầu như nhau);
 * bốn mốc sau cách đều; sau mốc cuối còn một quãng nghỉ (0.88 → 1) để đọc xong trước khi cảnh nhả ghim.
 */
const REACH = POINTS.map((_, index) => index * 0.22);

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Tỉ lệ chiều dài đường (0–1) tại hoành độ x: toạ độ x tăng đều dọc đường nên tìm nhị phân là đủ */
function fractionAtX(path: SVGPathElement, total: number, x: number) {
  let lo = 0;
  let hi = total;
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    if (path.getPointAtLength(mid).x < x) lo = mid;
    else hi = mid;
  }
  return hi / total;
}

/**
 * "Website đứng yên, tài sản lớn lên": một biểu đồ ý tưởng (không phải số liệu) với hai đường và năm mốc.
 * Máy tính, không giảm chuyển động: phần này ghim lại trong lúc cuộn và chạy như một cảnh có nhịp:
 *   đầu đường "tài sản" chạm chấm nào thì chấm đó nháy một lần, mốc tương ứng ở cột trái lên dẫn (khối Aqua quét sau tên mốc,
 *   vạch tiến độ chạy dưới dòng), tên mốc hiện cạnh chấm; cuộn tiếp thì đường vẽ sang mốc kế.
 * Mọi chữ luôn hiện sẵn. Điện thoại / giảm chuyển động / không JS: biểu đồ vẽ sẵn đầy đủ, năm mốc hiện bình thường.
 */
export function D3Story({ t }: { t: D3Dict }) {
  const { story } = t.home;
  const rootRef = useRef<HTMLElement>(null);
  const assetRef = useRef<SVGPathElement>(null);
  const [live, setLive] = useState(false);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const root = rootRef.current;
      const asset = assetRef.current;
      if (!root || !asset) return;
      const mm = gsap.matchMedia();
      mm.add(PIN_MQ, () => {
        // Đo một lần: mỗi chấm nằm ở bao nhiêu phần chiều dài đường, để đầu đường chạm chấm đúng lúc mốc được tô sáng
        const total = asset.getTotalLength();
        const at = POINTS.map(([x], index) => (index === POINTS.length - 1 ? 1 : fractionAtX(asset, total, x)));
        const last = POINTS.length - 1;

        const update = (progress: number) => {
          let reached = 0;
          for (let i = 1; i <= last; i++) if (progress >= REACH[i]) reached = i;
          // Giữa hai mốc: đường vẽ tuyến tính theo cuộn từ chấm này sang chấm kế; sau mốc cuối: quãng nghỉ
          const from = REACH[reached];
          const to = reached < last ? REACH[reached + 1] : 1;
          const local = clamp01((progress - from) / (to - from));
          const line = reached < last ? at[reached] + (at[reached + 1] - at[reached]) * local : 1;
          root.style.setProperty("--line", line.toFixed(4));
          root.style.setProperty("--step", local.toFixed(4));
          setActive(reached);
        };

        setLive(true);
        const trigger = ScrollTrigger.create({
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => update(self.progress),
          // Chiều cao phần này đổi sau khi bật chế độ ghim: đo lại xong thì cập nhật ngay
          onRefresh: (self) => update(self.progress),
        });
        update(trigger.progress);
        return () => {
          trigger.kill();
          root.style.removeProperty("--line");
          root.style.removeProperty("--step");
          setLive(false);
        };
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  // Bật / tắt chế độ ghim làm đổi chiều cao trang: đo lại mọi ScrollTrigger sau khi React đã vẽ xong bố cục mới
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [live]);

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
                    <h3 className="d2-h3">
                      <span className="d3-mile-title">{item.title}</span>
                    </h3>
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
              <path ref={assetRef} d={ASSET} pathLength={1} className="d2-chart-asset" />
              {POINTS.map(([x, y], index) => (
                <g key={index} className="d2-chart-dot" data-on={!live || index <= active} data-lead={live && index === active}>
                  {/* Vòng nháy một lần khi đầu đường chạm chấm (chỉ ở chế độ ghim) */}
                  <circle cx={x} cy={y} r={13} className="d3-dot-ring" />
                  <circle cx={x} cy={y} r={13} />
                  <text x={x} y={y + 4.5} textAnchor="middle">
                    {index + 1}
                  </text>
                  {/* Tên mốc cạnh chấm đang dẫn: nối biểu đồ với danh sách bên trái (trang trí, danh sách đã có đủ chữ) */}
                  <text x={x - 24} y={y - 18} textAnchor="end" className="d3-dot-label" aria-hidden>
                    {story.milestones[index].title.replace(/\.$/, "")}
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
