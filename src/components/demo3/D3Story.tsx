"use client";

import { useEffect, useRef, useState } from "react";

import type { D3Dict } from "@/content/demo3";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion";

import { StoryFlow } from "./StoryFlow";
import { StoryNetwork } from "./StoryNetwork";

type D3Path = "site" | "marketing";

/** Chỉ ghim khi màn hình đủ rộng và đủ cao để cả tiêu đề, năm mốc và cảnh 3D nằm gọn trong một màn */
const PIN_MQ = "(min-width: 64rem) and (min-height: 42rem) and (prefers-reduced-motion: no-preference)";

/** Năm mốc chia đều tiến độ cuộn; mốc i bắt đầu ở i × 0,2 */
const SLOT = 0.2;
const PATHS: D3Path[] = ["site", "marketing"];

/**
 * "Làm một lần rồi để đó thì phai, tài sản thì lớn lên": cột trái là năm mốc, cột phải là một cảnh SVG riêng cho từng lối vào.
 * - Bắt đầu từ website (Own · Grow): "Dòng khách đổ về" (StoryFlow).
 * - Chỉ marketing (Amplify): "Mạng lưới lan toả" (StoryNetwork).
 * Đổi lối thì danh sách mốc, cảnh và chú thích đổi theo.
 *
 * Máy tính, không giảm chuyển động: phần này ghim lại; JS chỉ ghi tiến độ cuộn --p (0 → 1) lên section, CSS của cảnh tự tính
 * thứ gì hiện ở mốc nào (`--at` của từng phần tử) và lưới / vòng khán giả lấp tới đâu; vòng lặp hạt đọc tiến độ qua `progress`.
 * Không ghim (điện thoại, giảm chuyển động, không JS): không có --p → cảnh đầy đủ.
 */
export function D3Story({ t }: { t: D3Dict }) {
  const { story } = t.home;
  const copy = t.x.home.story;
  const chart = t.x.home.chart;
  const rootRef = useRef<HTMLElement>(null);
  const [live, setLive] = useState(false);
  const [active, setActive] = useState(0);
  const [path, setPath] = useState<D3Path>("site");
  /** Tiến độ cuộn cho vòng lặp hạt của hai cảnh (1 = cảnh đầy đủ khi không ghim) */
  const progress = useRef(1);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(PIN_MQ, () => {
        const update = (value: number) => {
          progress.current = value;
          root.style.setProperty("--p", value.toFixed(4));
          root.style.setProperty("--step", ((value % SLOT) / SLOT).toFixed(4));
          setActive(Math.min(4, Math.floor(value / SLOT + 1e-6)));
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
          progress.current = 1;
          root.style.removeProperty("--p");
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

  const milestones = path === "site" ? story.milestones : copy.paths.marketing.milestones;
  const titles = story.milestones.map((item) => item.title.replace(/\.$/, ""));
  const flat = copy.paths[path].flat;

  return (
    <section ref={rootRef} aria-labelledby="d2-story-title" className="d2-story d3-story" data-live={live}>
      <div className="d2-story-pin">
        <div className="d2-wrap d2-story-grid">
          <div>
            <h2 id="d2-story-title" className="d2-h2 d2-two-tone max-w-[13em]">
              {copy.ink} <span>{story.muted}</span>
            </h2>
            <div className="d3-paths" role="group" aria-label={copy.tabsLabel}>
              {PATHS.map((id) => (
                <button key={id} type="button" className="d3-path" aria-pressed={path === id} onClick={() => setPath(id)}>
                  <span className="d3-path-name">{copy.paths[id].tab}</span>
                  <span className="d3-path-plans">{copy.paths[id].plans}</span>
                </button>
              ))}
            </div>
            <ol className="d2-miles" aria-live="polite">
              {milestones.map((item, index) => (
                <li key={`${path}-${item.title}`} data-active={!live || index === active} data-done={live && index < active}>
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

          <figure className="d3-story-scene" role="img" aria-label={`${story.asset} / ${flat}. ${story.note}`} data-path={path}>
            <p className="d3-fx-kicker" aria-hidden>
              {chart.kicker}
            </p>
            {path === "site" ? (
              <StoryFlow
                progress={progress}
                labels={{ growth: chart.growth, site: chart.site, owned: chart.owned, sources: [titles[2], titles[3], titles[4]], customers: chart.customers, pause: chart.pause, play: chart.play }}
              />
            ) : (
              <StoryNetwork
                progress={progress}
                labels={{ brand: chart.brand, channels: chart.channels, landing: chart.landing, reach: chart.reach, pause: chart.pause, play: chart.play }}
              />
            )}
            <p className="d3-fx-legend" aria-hidden>
              <span data-kind="flat">{flat}</span>
              <span data-kind="asset">{story.asset}</span>
            </p>
            <figcaption className="d2-chart-note">{story.note}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
