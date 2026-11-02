"use client";

import { useEffect, useRef, useState } from "react";

import { AegisMarkPaths, AegisWordmark } from "@/components/brand/AegisLogo";
import { MARK_CORE, MARK_VIEWBOX } from "@/components/brand/mark-data";
import { assembleMark } from "@/components/brand/mark-motion";
import { clamp01, smooth } from "@/components/intro/aegis-mask";
import { useSite } from "@/components/layout/SiteLang";
import { getLenis, gsap, INTRO_DONE_EVENT } from "@/lib/motion";

const SESSION_KEY = "aegis-intro";
const VB = MARK_VIEWBOX.split(" ").map(Number);

/** Các phần tử phía sau lớp phủ intro cần tạm inert: header, footer, và các anh em của intro trong <main> */
function frozenBehindIntro(intro: HTMLElement | null): HTMLElement[] {
  const out: HTMLElement[] = [];
  document.querySelectorAll<HTMLElement>("header, footer, .header-cta").forEach((n) => out.push(n));
  const main = document.getElementById("noi-dung");
  if (main) for (const child of main.children) if (child !== intro && child instanceof HTMLElement) out.push(child);
  return out;
}

type Layout = {
  vw: number;
  vh: number;
  /** đơn vị toạ độ logo → px màn hình */
  k: number;
  /** vị trí (px) của gốc toạ độ logo */
  ox: number;
  oy: number;
  /** tâm lõi (px) = điểm phóng to */
  cx: number;
  cy: number;
  /** hệ số phóng tối đa để lõi phủ kín màn hình */
  zoom: number;
  /** mép dưới logo (px), để đặt chữ AEGIS */
  bottom: number;
};

/** Hình chữ nhật phủ màn hình trừ lục giác lõi (toạ độ màn hình) */
function coverPath(l: Layout) {
  const core = MARK_CORE.points.map(([x, y]) => `${(l.ox + x * l.k).toFixed(1)} ${(l.oy + y * l.k).toFixed(1)}`).join("L");
  return `M0 0H${l.vw}V${l.vh}H0Z M${core}Z`;
}

function measure(vw: number, vh: number): Layout {
  const height = Math.min(vh * 0.44, vw * 0.62, 470);
  const k = height / VB[3];
  const width = VB[2] * k;
  const ox = (vw - width) / 2 - VB[0] * k;
  const oy = vh * 0.43 - height / 2 - VB[1] * k;
  const cx = ox + MARK_CORE.centroid.x * k;
  const cy = oy + MARK_CORE.centroid.y * k;
  // bán kính nội tiếp của lõi (khoảng cách nhỏ nhất từ tâm tới các cạnh) và khoảng cách xa nhất tới góc màn hình
  const pts = MARK_CORE.points.map(([x, y]) => [ox + x * k, oy + y * k]);
  let inner = Infinity;
  for (let i = 0; i < pts.length; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[(i + 1) % pts.length];
    inner = Math.min(inner, Math.abs((bx - ax) * (ay - cy) - (ax - cx) * (by - ay)) / Math.hypot(bx - ax, by - ay));
  }
  const far = Math.max(...[[0, 0], [vw, 0], [0, vh], [vw, vh]].map(([x, y]) => Math.hypot(x - cx, y - cy)));
  return { vw, vh, k, ox, oy, cx, cy, zoom: (far / inner) * 1.06, bottom: oy + (VB[1] + VB[3]) * k };
}

/**
 * Màn mở đầu của trang chính: logo AEGIS tự lắp ráp (motion identity: một dải sáng → xoắn → khép thành lục giác), dưới là chữ AEGIS
 * và Build / Deploy / Scale. Người dùng cuộn (bánh xe, vuốt, phím ↓ / Space) thì cả lớp phủ phóng to quanh LÕI MỞ của logo cho tới
 * khi lõi phủ kín màn hình và lộ ra trang chủ phía sau; có nút "Bỏ qua".
 * Chỉ hiển thị khi <html data-intro="playing"> (script đầu trang đặt: trang chủ, lần đầu trong phiên, không giảm chuyển động).
 * Hạt hero và chữ hero bắt đầu dựng khi lớp phủ đã phóng được một đoạn (sự kiện INTRO_DONE_EVENT), để ô cửa không trống.
 */
export function SiteIntro() {
  const { intro } = useSite();
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<SVGGElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [gone, setGone] = useState(false);
  const layoutRef = useRef<Layout | null>(null);
  const assembly = useRef<gsap.core.Timeline | null>(null);
  const state = useRef({ target: 0, shown: 0, done: false, announced: false });

  const ready = layout !== null;

  // Đo bố cục; đo lại khi đổi kích thước cửa sổ
  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.intro !== "playing") return;
    root.dataset.introLive = "on";
    getLenis()?.stop();
    window.scrollTo(0, 0);
    // Khoá focus vào lớp phủ: mọi thứ phía sau tạm inert, focus đặt sẵn ở nút Bỏ qua. Không inert chính <main> vì intro nằm trong đó.
    const frozen = frozenBehindIntro(rootRef.current);
    frozen.forEach((n) => (n.inert = true));
    rootRef.current?.querySelector<HTMLButtonElement>(".site-intro-skip")?.focus({ preventScroll: true });
    const run = () => {
      const next = measure(window.innerWidth, window.innerHeight);
      layoutRef.current = next;
      setLayout(next);
    };
    run();
    window.addEventListener("resize", run);
    return () => {
      delete root.dataset.introLive;
      frozen.forEach((n) => (n.inert = false));
      window.removeEventListener("resize", run);
    };
  }, []);

  // Motion identity: chạy một lần khi đã có bố cục
  useEffect(() => {
    const svg = svgRef.current;
    if (!ready || !svg || assembly.current) return;
    const tl = assembleMark(svg);
    const brand = brandRef.current;
    if (brand) {
      const letters = brand.querySelectorAll("[data-letter]");
      gsap.set(letters, { y: 26 });
      tl.to(letters, { opacity: 1, y: 0, duration: 0.7, ease: "expo.out", stagger: 0.06 }, 1.05);
      tl.to(brand.querySelector(".site-intro-tagline"), { opacity: 1, duration: 0.6 }, 1.45);
    }
    if (hintRef.current) tl.from(hintRef.current, { opacity: 0, duration: 0.5 }, 1.7);
    assembly.current = tl;
  }, [ready]);

  const apply = (p: number) => {
    const l = layoutRef.current;
    const g = zoomRef.current;
    if (l && g) {
      const t = clamp01(p / 0.85);
      const s = Math.pow(l.zoom, Math.pow(t, 1.6));
      g.setAttribute("transform", `translate(${l.cx} ${l.cy}) scale(${s}) translate(${-l.cx} ${-l.cy})`);
    }
    if (brandRef.current) brandRef.current.style.opacity = String(1 - clamp01(p * 4));
    if (hintRef.current) hintRef.current.style.opacity = String(1 - clamp01(p * 10));
    if (rootRef.current) rootRef.current.style.opacity = String(1 - smooth(0.72, 0.96, p));
    const st = state.current;
    if (!st.announced && p > 0.3) {
      st.announced = true;
      window.dispatchEvent(new Event(INTRO_DONE_EVENT));
    }
  };

  const finish = () => {
    const st = state.current;
    if (st.done) return;
    st.done = true;
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    const root = document.documentElement;
    delete root.dataset.intro;
    frozenBehindIntro(rootRef.current).forEach((n) => (n.inert = false));
    getLenis()?.start();
    if (!st.announced) window.dispatchEvent(new Event(INTRO_DONE_EVENT));
    setGone(true);
  };

  // Đầu vào cuộn: bánh xe, vuốt, phím
  useEffect(() => {
    const el = rootRef.current;
    if (!el || document.documentElement.dataset.intro !== "playing") return;
    const st = state.current;
    // Làm mượt bằng thời gian thật (không dùng gsap.to): trên máy chậm, gsap giới hạn bước thời gian nên cảnh sẽ trôi rất chậm
    let raf = 0;
    let last = 0;
    let rate = 7;
    const step = (now: number) => {
      const dt = Math.min(0.25, (now - last) / 1000);
      last = now;
      st.shown += (st.target - st.shown) * (1 - Math.exp(-dt * rate));
      if (Math.abs(st.target - st.shown) < 0.002) st.shown = st.target;
      apply(st.shown);
      if (st.shown >= 0.999) {
        finish();
        return;
      }
      raf = st.shown === st.target ? 0 : requestAnimationFrame(step);
    };
    const go = (target: number, speed = 7) => {
      // Cuộn khi logo chưa lắp xong: hoàn tất ngay để không phóng một logo dở dang
      assembly.current?.progress(1);
      st.target = clamp01(target);
      rate = speed;
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(step);
      }
    };
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (!layoutRef.current || st.done) return;
      const unit = event.deltaMode === 1 ? 40 : 1;
      go(st.target + (event.deltaY * unit) / 1200);
    };
    let lastY = 0;
    const onTouchStart = (event: TouchEvent) => {
      lastY = event.touches[0].clientY;
    };
    const onTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      if (!layoutRef.current || st.done) return;
      const y = event.touches[0].clientY;
      go(st.target + (lastY - y) / 500, 9);
      lastY = y;
    };
    const onKey = (event: KeyboardEvent) => {
      if (st.done || !layoutRef.current) return;
      // Space/Enter trên nút Bỏ qua là bấm nút, không phải cuộn
      if ((event.target as HTMLElement | null)?.closest("button, a")) return;
      if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") go(st.target + 0.2);
      else if (event.key === "ArrowUp" || event.key === "PageUp") go(st.target - 0.2);
      else if (event.key === "End") go(1, 4);
      else if (event.key === "Home") go(0);
      else return;
      event.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);
    (el as HTMLElement & { _skip?: () => void })._skip = () => go(1, 4);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf);
    };
    // apply / finish chỉ đọc ref nên không cần nằm trong deps
  }, []);

  if (gone) return null;
  const l = layout;
  const markTransform = l ? `translate(${l.ox} ${l.oy}) scale(${l.k})` : undefined;
  return (
    <div ref={rootRef} className="site-intro" data-ready={ready} role="status" aria-label={intro.label}>
      {l && (
        <svg ref={svgRef} className="site-intro-svg" width="100%" height="100%" viewBox={`0 0 ${l.vw} ${l.vh}`} aria-hidden>
          <g ref={zoomRef}>
            {/* Lớp phủ khoét đúng lõi mở của logo (evenodd: chữ nhật trừ lục giác lõi, không dùng <mask> vì Chrome vẽ lặp lỗ khi
                trong cùng SVG có phần tử đang animate). Phóng to quanh lõi thì lỗ lớn dần tới khi lộ trọn trang. */}
            <path d={coverPath(l)} fillRule="evenodd" className="site-intro-cover" />
            <g transform={markTransform}>
              <AegisMarkPaths variant="glass" idPrefix="site-intro" />
            </g>
          </g>
        </svg>
      )}
      {l && (
        <div ref={brandRef} className="site-intro-brand" style={{ top: l.bottom + Math.min(56, l.vh * 0.05) }}>
          <AegisWordmark />
          <p className="site-intro-tagline label">{intro.tagline}</p>
        </div>
      )}
      <div className="site-intro-ui">
        <p ref={hintRef} className="site-intro-hint label">
          <span className="site-intro-hint-mouse">{intro.hint}</span>
          <span className="site-intro-hint-touch">{intro.hintTouch}</span>
          <span aria-hidden className="site-intro-arrow">
            ↓
          </span>
        </p>
        <button type="button" className="site-intro-skip label" onClick={() => (rootRef.current as (HTMLDivElement & { _skip?: () => void }) | null)?._skip?.()}>
          {intro.skip}
        </button>
      </div>
    </div>
  );
}
