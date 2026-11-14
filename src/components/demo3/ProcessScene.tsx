"use client";

import { useEffect, useRef, useState, type CSSProperties, type Dispatch, type MouseEvent, type ReactNode, type SetStateAction } from "react";

import { EASE, gsap, MQ, ScrollTrigger, scrollToTarget, useGSAP } from "@/lib/motion";

export type ProcessSceneStep = {
  title: string;
  text: string;
  /** Chữ của chip "thuộc gói nào" (nguyên văn từ nội dung) */
  plans: string;
  /** Tên ngắn của bước trên thanh ray */
  stop: string;
  kind: string;
  /** Bước này có trong từng gói hay không, cùng thứ tự với `plans` của cảnh */
  included: boolean[];
  /** Mô hình minh hoạ đã dựng sẵn ở server (StepMock) */
  mock: ReactNode;
};

export type ProcessSceneLabels = {
  railCaption: string;
  planHeader: string;
  step: string;
  included: string;
  notIncluded: string;
};

/**
 * Cảnh cuộn của trang Quy trình: năm bước nằm trên một đường ray chạy ngang khi cuộn dọc.
 * Ý duy nhất của cảnh: "dự án đi qua năm chặng, mỗi chặng thuộc những gói nào". Thanh ray phía trên là bản đồ của đường đi đó
 * (bảng bước × gói); khối Aqua trượt theo đúng vị trí cuộn, và mô hình minh hoạ của chặng đang đứng "chạy" một lần rồi giữ nguyên.
 *
 * Ba chế độ, cùng một HTML:
 * - Máy tính có chuyển động (MQ.desktopMotion): CSS xếp thẻ thành hàng ngang ngay từ lần vẽ đầu (dưới html[data-motion="on"]),
 *   JS chỉ bật ghim (data-live) và kéo hàng thẻ. Ghim bằng position: sticky nên không đổi DOM, đoạn chuyển sang phần sau không giật.
 * - JS chưa chạy / lỗi trên máy tính: hàng thẻ vẫn kéo ngang được bằng cuộn gốc của trình duyệt.
 * - Điện thoại, giảm chuyển động, không JS: danh sách dọc, mọi chữ hiện sẵn; thanh ray là bảng tĩnh, số bước là liên kết neo.
 */
export function ProcessScene({ label, steps, plans, labels }: { label: string; steps: ProcessSceneStep[]; plans: string[]; labels: ProcessSceneLabels }) {
  const rootRef = useRef<HTMLElement>(null);
  /** Vị trí cuộn dọc ứng với từng bước khi đang ghim; null = không ghim */
  const scrollYOfRef = useRef<((index: number) => number) | null>(null);
  /** Bước đang đứng khi ghim; -1 = không ghim (danh sách dọc) */
  const [active, setActive] = useState(-1);
  /** Thẻ đã chạm mép dưới màn hình: thẻ trồi lên (chỉ ở danh sách dọc) */
  const [entered, setEntered] = useState<boolean[]>(() => steps.map(() => false));
  /** Thẻ đã vào tầm mắt: mô hình minh hoạ được phép chạy */
  const [seen, setSeen] = useState<boolean[]>(() => steps.map(() => false));
  const live = active >= 0;

  useGSAP(
    () => {
      const root = rootRef.current;
      const pin = root?.querySelector<HTMLElement>(".d3-proc-pin");
      const view = root?.querySelector<HTMLElement>(".d3-proc-view");
      const track = root?.querySelector<HTMLElement>(".d3-proc-track");
      const band = root?.querySelector<HTMLElement>(".d3-proc-band");
      if (!root || !pin || !view || !track || !band) return;
      const cards = gsap.utils.toArray<HTMLElement>(".d3-proc-card", root);
      const mm = gsap.matchMedia();

      mm.add(MQ.desktopMotion, () => {
        let distance = 0;
        /** Tiến độ (0 → 1) mà tại đó từng thẻ đứng đúng chỗ. Chặng cuối ngắn hơn vì thẻ cuối dừng sát mép phải */
        let stops: number[] = [];
        let current = -1;

        const measure = () => {
          distance = Math.max(0, track.offsetWidth - view.clientWidth);
          const first = cards[0]?.offsetLeft ?? 0;
          stops = cards.map((card) => (distance ? Math.min(1, (card.offsetLeft - first) / distance) : 0));
          // Chiều cao đoạn ghim tính trong CSS từ quãng chạy ngang này
          root.style.setProperty("--proc-travel", `${Math.round(distance)}px`);
        };

        // Bật ghim trước khi đo: lúc này vùng nhìn hết cuộn ngang gốc, hàng thẻ do transform điều khiển
        root.dataset.live = "true";
        view.scrollLeft = 0;
        measure();
        if (!distance) {
          delete root.dataset.live;
          root.style.removeProperty("--proc-travel");
          return;
        }

        const paint = (progress: number) => {
          let i = 0;
          while (i < stops.length - 2 && progress > stops[i + 1]) i += 1;
          const span = stops[i + 1] - stops[i] || 1;
          // u: vị trí tính theo "số bước" (0 → n − 1), để khối Aqua trên ray đi đều giữa các cột dù các chặng dài ngắn khác nhau
          const u = gsap.utils.clamp(0, stops.length - 1, i + (progress - stops[i]) / span);
          // Ghi thẳng lên khối Aqua (không ghi lên gốc cảnh): biến đổi mỗi khung hình, đặt ở gốc sẽ bắt cả cảnh tính lại kiểu
          band.style.setProperty("--proc-u", u.toFixed(4));
          const next = Math.round(u);
          if (next !== current) {
            current = next;
            setActive(next);
          }
        };

        const tween = gsap.to(track, {
          x: () => -distance,
          ease: EASE.scrub,
          // Đọc tiến độ của chính tween (đã làm mượt) chứ không phải vị trí cuộn thô, để ray và thẻ luôn khớp nhau
          onUpdate(this: gsap.core.Tween) {
            paint(this.progress());
          },
          scrollTrigger: {
            trigger: root,
            // Phần ghim dính ngay dưới header, nên đoạn chạy bắt đầu khi đỉnh cảnh chạm mép dưới header
            start: () => `top ${parseFloat(getComputedStyle(pin).top) || 0}px`,
            end: "bottom bottom",
            scrub: 0.5,
            invalidateOnRefresh: true,
            onRefresh: (self) => paint(self.animation?.progress() ?? self.progress),
          },
        });
        paint(tween.progress());

        const trigger = tween.scrollTrigger;
        scrollYOfRef.current = (index) => (trigger ? trigger.start + (trigger.end - trigger.start) * (stops[index] ?? 0) : window.scrollY);

        // Đổi kích thước: đo lại quãng chạy TRƯỚC khi ScrollTrigger tính lại vị trí
        ScrollTrigger.addEventListener("refreshInit", measure);
        // Chiều cao trang vừa đổi (data-live): các trigger phía dưới cần đo lại
        ScrollTrigger.refresh();

        return () => {
          ScrollTrigger.removeEventListener("refreshInit", measure);
          scrollYOfRef.current = null;
          delete root.dataset.live;
          root.style.removeProperty("--proc-travel");
          band.style.removeProperty("--proc-u");
          setActive(-1);
        };
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  // Hai mốc cho mỗi thẻ: vừa ló vào màn hình (trồi lên) và đỉnh thẻ đã qua 60% chiều cao màn hình (mô hình mới được chạy, để người xem kịp thấy).
  // Không dùng <Rise> cho thẻ: CSS của Rise không nằm trong @layer nên luôn thắng kiểu của cảnh, thẻ ở hàng ngang sẽ bị đẩy lệch 3rem.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>(".d3-proc-card"));
    if (typeof IntersectionObserver === "undefined") {
      const timer = window.setTimeout(() => {
        setEntered((prev) => prev.map(() => true));
        setSeen((prev) => prev.map(() => true));
      }, 0);
      return () => window.clearTimeout(timer);
    }
    const watch = (rootMargin: string, mark: Dispatch<SetStateAction<boolean[]>>) => {
      const observer = new IntersectionObserver(
        (entries) => {
          const hits = entries.filter((entry) => entry.isIntersecting).map((entry) => cards.indexOf(entry.target as HTMLElement));
          if (!hits.length) return;
          hits.forEach((index) => observer.unobserve(cards[index]));
          mark((prev) => prev.map((value, index) => value || hits.includes(index)));
        },
        { rootMargin },
      );
      cards.forEach((card) => observer.observe(card));
      return observer;
    };
    const observers = [watch("0px 0px -6% 0px", setEntered), watch("0px 0px -40% 0px", setSeen)];
    return () => observers.forEach((observer) => observer.disconnect());
  }, []);

  const stateOf = (index: number) => (!live ? undefined : index < active ? "done" : index === active ? "active" : "next");

  const goTo = (event: MouseEvent<HTMLAnchorElement>, index: number) => {
    const scrollYOf = scrollYOfRef.current;
    // Không ghim: để liên kết neo (#d3-step-n) chạy như thường
    if (!scrollYOf) return;
    event.preventDefault();
    // Lenis (anchors: true) nghe click ở window và sẽ cuộn tới thẻ <li>, trong khi lúc ghim đích đúng là một mốc trong đoạn cuộn
    event.stopPropagation();
    scrollToTarget(scrollYOf(index));
  };

  return (
    <section ref={rootRef} className="d3-proc" aria-label={label}>
      <div className="d3-proc-pin">
        <div className="d2-wrap">
          <div className="d3-proc-rail" role="table" aria-label={labels.railCaption} style={{ "--proc-n": steps.length } as CSSProperties}>
            <span className="d3-proc-band" aria-hidden />
            <div className="d3-proc-row d3-proc-stops" role="row">
              <span role="columnheader" className="d3-proc-corner">
                {labels.planHeader}
              </span>
              {steps.map((step, index) => (
                <span key={step.kind} role="columnheader" data-state={stateOf(index)}>
                  <a href={`#d3-step-${index + 1}`} aria-current={index === active ? "step" : undefined} onClick={(event) => goTo(event, index)}>
                    <span className="kit-sr-only">{labels.step} </span>
                    <b>{index + 1}</b>
                    <span className="d3-proc-stop-name">{step.stop}</span>
                  </a>
                </span>
              ))}
            </div>
            {plans.map((plan, p) => (
              <div key={plan} className="d3-proc-row d3-proc-lane" role="row" data-on={live ? steps[active]?.included[p] : undefined}>
                <span role="rowheader">
                  <span className="d3-proc-plan">{plan}</span>
                </span>
                {steps.map((step, index) => (
                  <span
                    key={step.kind}
                    role="cell"
                    data-has={step.included[p]}
                    data-link={step.included[p] && steps[index + 1]?.included[p] ? "true" : undefined}
                    data-active={index === active ? "true" : undefined}
                  >
                    <i aria-hidden />
                    <span className="kit-sr-only">{step.included[p] ? labels.included : labels.notIncluded}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="d3-proc-view">
          <ol className="d3-proc-track">
            {steps.map((step, index) => (
              <li
                key={step.kind}
                id={`d3-step-${index + 1}`}
                className="d3-proc-card"
                data-state={stateOf(index)}
                data-entered={entered[index] ? "" : undefined}
                // Khi ghim: bước đã qua giữ trạng thái "xong", bước chưa tới còn chờ. Danh sách dọc: chạy khi thẻ vào tầm mắt
                data-play={seen[index] && (!live || index <= active) ? "" : undefined}
              >
                <div className="d2-step-text d3-proc-text">
                  <span className="d2-step-no" aria-hidden>
                    {index + 1}
                  </span>
                  <h2 className="d3-proc-title">{step.title}</h2>
                  <p>{step.text}</p>
                  <span className="d2-chip">{step.plans}</span>
                </div>
                <div className="d2-step-stage d3-proc-stage" data-mock={step.kind} aria-hidden>
                  {step.mock}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
