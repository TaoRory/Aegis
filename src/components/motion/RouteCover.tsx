"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import { AegisMarkPaths } from "@/components/brand/AegisLogo";
import { MARK_CENTER, MARK_CORE, MARK_OUTER, MARK_SEGMENTS, MARK_VIEWBOX } from "@/components/brand/mark-data";
import { coverCopy } from "@/content/site/cover";
import { gsap, MQ } from "@/lib/motion";

/**
 * Màn chuyển trang "vẽ bản vẽ": bấm link nội bộ thì một tấm nền Deep Ink Teal phủ từ dưới lên, lưới cột và đường dẫn ngang dọc kẻ ra,
 * rồi dựng HÌNH HỌC & LƯỚI của logo (mục Geometry & Grid trong guideline): vòng tròn, lục giác, trục và đường chéo dựng hình, viền 8 mảnh
 * dải Möbius được vẽ nét theo nét, cuối cùng biểu tượng đủ màu hiện lên; đồng hồ % chạy; trang mới tải xong thì tấm phủ cuộn lên trên.
 * Đặt trong layout gốc (tồn tại xuyên suốt mọi route) nên chạy được cả khi đổi ngôn ngữ hay vào Factory.
 *
 * Cách hoạt động: bắt click ở pha capture của document, chặn điều hướng mặc định của next/link (Link bỏ qua khi event đã bị preventDefault,
 * nhưng onClick của chính link như đóng menu vẫn chạy), chạy nửa đầu hiệu ứng rồi mới router.push; thấy URL đổi thì chờ nét vẽ xong và mở màn.
 * Không áp dụng cho: giảm chuyển động, link ngoài / cùng trang / mở tab mới, điều hướng trong Factory (camera tự bay), mở mẫu từ thư viện
 * (có hiệu ứng ảnh phóng riêng), nút Back/Forward của trình duyệt (không chặn được trước khi đổi trang).
 */
const LABEL = "AEGIS · GEOMETRY & GRID";

/**
 * Hình dựng (construction) quanh biểu tượng, theo toạ độ ảnh emblem (xem mark-data.ts): lục giác ngoài chưa bo (kéo ngang 1.05 như
 * logo), vòng tròn ngoại tiếp, vòng tròn qua lõi, trục đứng/ngang và hai đường chéo 30° qua tâm, chấm ở 6 đỉnh.
 */
const C = MARK_CENTER;
const HEX = Array.from({ length: 6 }, (_, i) => {
  const a = (i * Math.PI) / 3;
  return [C.x + 516 * 1.05 * Math.sin(a), C.y - 516 * Math.cos(a)] as const;
});
const GEO = {
  circles: [560, 400, 215],
  hex: `M${HEX.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}Z`,
  lines: [0, 30, 90, 150].map((deg) => {
    const a = (deg * Math.PI) / 180;
    const r = 700;
    return `M${(C.x - r * Math.cos(a)).toFixed(1)} ${(C.y - r * Math.sin(a)).toFixed(1)}L${(C.x + r * Math.cos(a)).toFixed(1)} ${(C.y + r * Math.sin(a)).toFixed(1)}`;
  }),
};
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/·×-";
const COLS = 12;
const FAILSAFE_MS = 6000;

/** Hiện chữ dần từ trái sang, vài ký tự phía trước nhảy ngẫu nhiên */
function scramble(el: HTMLElement, text: string, duration: number) {
  const state = { p: 0 };
  return gsap.to(state, {
    p: 1,
    duration,
    ease: "none",
    onUpdate() {
      const done = Math.floor(state.p * text.length);
      let out = text.slice(0, done);
      for (let i = done; i < Math.min(text.length, done + 3); i++) out += text[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      el.textContent = out;
    },
    onComplete() {
      el.textContent = text;
    },
  });
}

const inFactory = (path: string) => {
  const parts = path.split("/").filter(Boolean);
  const rest = parts[0] === "en" ? parts.slice(1) : parts;
  return rest[0] === "factory" || (rest[0] === "web" && rest[1] === "factory");
};

export function RouteCover() {
  const pathname = usePathname();
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const copy = coverCopy[pathname === "/en" || pathname.startsWith("/en/") ? "en" : "vi"];

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const q = <T extends Element>(selector: string) => root.querySelector<T>(selector)!;
    const qa = <T extends Element>(selector: string) => [...root.querySelectorAll<T>(selector)];
    const el = {
      cols: qa(".route-cover-cols span"),
      meta: qa(".route-cover-meta"),
      stage: q(".route-cover-stage"),
      guidesH: qa(".route-cover-guide-h"),
      guidesV: qa(".route-cover-guide-v"),
      box: q(".route-cover-box"),
      label: q<HTMLElement>(".route-cover-label"),
      geo: qa<SVGGeometryElement>(".route-cover-geo [data-geo]"),
      nodes: qa<SVGCircleElement>(".route-cover-geo [data-node]"),
      outlines: qa<SVGPathElement>(".route-cover-geo [data-outline]"),
      fill: q<SVGGElement>(".route-cover-geo [data-fill]"),

      to: q<HTMLElement>(".route-cover-to"),
      count: q<HTMLElement>(".route-cover-count"),
    };

    let busy = false;
    let timeline: gsap.core.Timeline | null = null;
    let raf = 0;
    let failsafe = 0;

    const live = root.parentElement?.querySelector<HTMLElement>(".route-cover-live") ?? null;
    const finish = () => {
      busy = false;
      root.dataset.active = "false";
      document.body.removeAttribute("aria-busy");
      if (live) live.textContent = "";
      gsap.set(root, { visibility: "hidden" });
    };

    /** Nửa đầu: phủ kín và vẽ chữ. onCovered gọi ngay khi tấm phủ che kín màn hình; resolve khi nét vẽ xong. */
    const cover = (to: string, onCovered: () => void) => {
      const n = { v: 0 };
      timeline?.kill();
      gsap.set(root, { visibility: "visible", clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(el.stage, { yPercent: 0, opacity: 1 });
      gsap.set(el.cols, { scaleY: 0, transformOrigin: "50% 100%" });
      gsap.set(el.meta, { opacity: 0 });
      gsap.set(el.guidesH, { scaleX: 0, transformOrigin: "0% 50%" });
      gsap.set(el.guidesV, { scaleY: 0, transformOrigin: "50% 0%" });
      gsap.set(el.box, { opacity: 0 });
      gsap.set([...el.geo, ...el.outlines], { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(el.nodes, { scale: 0, transformOrigin: "50% 50%" });
      gsap.set(el.fill, { opacity: 0 });
      el.label.textContent = "";
      el.to.textContent = "";
      el.count.textContent = "0%";
      return new Promise<void>((resolve) => {
        timeline = gsap
          .timeline({ onComplete: resolve })
          .to(root, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55, ease: "power4.inOut", onComplete: onCovered })
          .to(el.cols, { scaleY: 1, duration: 0.65, ease: "expo.inOut", stagger: 0.022 }, 0.1)
          .to(el.meta, { opacity: 1, duration: 0.3 }, 0.32)
          .add(scramble(el.to, to.toUpperCase(), 0.45), 0.36)
          .to(n, { v: 100, duration: 0.8, ease: "power2.inOut", onUpdate: () => (el.count.textContent = `${Math.round(n.v)}%`) }, 0.32)
          .to(el.guidesH, { scaleX: 1, duration: 0.55, ease: "expo.inOut", stagger: 0.05 }, 0.28)
          .to(el.guidesV, { scaleY: 1, duration: 0.55, ease: "expo.inOut", stagger: 0.05 }, 0.34)
          .to(el.box, { opacity: 1, duration: 0.25 }, 0.5)
          .add(scramble(el.label, LABEL, 0.35), 0.5)
          // Hình dựng kẻ ra trước, rồi viền 8 mảnh dải, cuối cùng biểu tượng đủ màu và viền sáng
          .to(el.geo, { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut", stagger: 0.035 }, 0.3)
          .to(el.nodes, { scale: 1, duration: 0.3, ease: "back.out(3)", stagger: 0.03 }, 0.62)
          .to(el.outlines, { strokeDashoffset: 0, duration: 0.55, ease: "power2.inOut", stagger: 0.04 }, 0.48)
          .to(el.fill, { opacity: 1, duration: 0.4, ease: "power1.out" }, 0.92);
      });
    };

    /** Nửa sau: vạch dẫn thu lại, chữ trôi lên, tấm phủ cuộn khỏi màn hình */
    const reveal = () => {
      timeline?.kill();
      timeline = gsap
        .timeline({ onComplete: finish })
        .to(el.guidesH, { scaleX: 0, transformOrigin: "100% 50%", duration: 0.45, ease: "expo.in" }, 0)
        .to(el.guidesV, { scaleY: 0, transformOrigin: "50% 100%", duration: 0.45, ease: "expo.in" }, 0)
        .to([el.box, ...el.meta], { opacity: 0, duration: 0.2 }, 0.1)
        .to(el.stage, { yPercent: -60, opacity: 0, duration: 0.55, ease: "power3.in" }, 0.1)
        .to(root, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.7, ease: "power4.inOut" }, 0.2);
    };

    const start = (url: URL) => {
      busy = true;
      root.dataset.active = "true";
      // Trình đọc màn hình: lớp phủ là aria-hidden nên báo bằng vùng live riêng + aria-busy
      document.body.setAttribute("aria-busy", "true");
      if (live) live.textContent = live.dataset.text ?? "";
      const from = location.pathname + location.search;
      let drawn = false;
      let arrived = false;
      const settle = () => {
        if (!drawn || !arrived) return;
        window.clearTimeout(failsafe);
        reveal();
      };
      // Chờ URL đổi (Next đã chuyển trang) rồi thêm hai khung hình cho trang mới vẽ xong
      const watch = () => {
        if (location.pathname + location.search !== from) {
          raf = requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              arrived = true;
              settle();
            }),
          );
          return;
        }
        raf = requestAnimationFrame(watch);
      };
      failsafe = window.setTimeout(() => {
        cancelAnimationFrame(raf);
        drawn = arrived = true;
        settle();
      }, FAILSAFE_MS);
      void cover(url.pathname, () => {
        router.push(url.pathname + url.search + url.hash, { transitionTypes: ["aegis-cover"] });
        raf = requestAnimationFrame(watch);
      }).then(() => {
        drawn = true;
        settle();
      });
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
      if (link.closest(".gallery, [data-no-cover]") || window.matchMedia(MQ.reduced).matches) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return; // cùng trang hoặc chỉ đổi #hash
      if (inFactory(location.pathname) && inFactory(url.pathname)) return;
      event.preventDefault();
      if (!busy) start(url);
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      timeline?.kill();
      cancelAnimationFrame(raf);
      window.clearTimeout(failsafe);
    };
  }, [router]);

  return (
    <>
      <p className="route-cover-live sr-only" aria-live="polite" data-text={copy.loading} />
    <div ref={rootRef} aria-hidden className="route-cover" data-active="false">
      <div className="route-cover-cols">
        {Array.from({ length: COLS }, (_, i) => (
          <span key={i} />
        ))}
      </div>
      <div className="route-cover-meta label">
        <span>
          {copy.plotting} <span className="route-cover-to" />
        </span>
        <span>{copy.rev}</span>
      </div>
      <div className="route-cover-stage">
        <span className="route-cover-guide route-cover-guide-h" style={{ top: 0 }} />
        <span className="route-cover-guide route-cover-guide-h" style={{ bottom: 0 }} />
        <span className="route-cover-guide route-cover-guide-v" style={{ left: 0 }} />
        <span className="route-cover-guide route-cover-guide-v" style={{ right: 0 }} />
        <div className="route-cover-box">
          <span className="route-cover-label label" />
        </div>
        <svg className="route-cover-geo" viewBox={MARK_VIEWBOX}>
          <g className="route-cover-construction">
            {GEO.circles.map((r) => (
              <circle key={r} data-geo cx={C.x} cy={C.y} r={r} pathLength={1} />
            ))}
            <path data-geo d={GEO.hex} pathLength={1} />
            {GEO.lines.map((d) => (
              <path key={d} data-geo d={d} pathLength={1} />
            ))}
            {HEX.map(([x, y]) => (
              <circle key={`${x}-${y}`} data-node cx={x} cy={y} r={7} className="route-cover-node" />
            ))}
          </g>
          <defs>
            <clipPath id="route-cover-outer">
              <path d={MARK_OUTER} />
            </clipPath>
          </defs>
          <g className="route-cover-outline">
            <path data-outline d={MARK_OUTER} pathLength={1} />
            <path data-outline d={MARK_CORE.d} pathLength={1} />
            {/* đường gấp giữa các mảnh: cắt theo viền ngoài vì path mảnh nở ra ngoài vài đơn vị */}
            <g clipPath="url(#route-cover-outer)">
              {MARK_SEGMENTS.map((seg) => (
                <path key={seg.id} data-outline d={seg.d} pathLength={1} />
              ))}
            </g>
          </g>
          <g data-fill>
            <AegisMarkPaths variant="glass" idPrefix="route-cover" small />
          </g>
        </svg>
      </div>
      <div className="route-cover-meta label">
        <span>{copy.tagline}</span>
        <span className="route-cover-count">0%</span>
      </div>
    </div>
    </>
  );
}
