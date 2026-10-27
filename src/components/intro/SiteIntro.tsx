"use client";

import { useEffect, useRef, useState } from "react";

import { clamp01, measure, REF, smooth, WORD, type Layout } from "@/components/intro/aegis-mask";
import { useSite } from "@/components/layout/SiteLang";
import { getLenis, INTRO_DONE_EVENT } from "@/lib/motion";

const SESSION_KEY = "aegis-intro";

const CELL = 96; // ô lưới lớn (px); lưới nhỏ chia mỗi ô làm 4
const RINGS = 24;
const RAYS = 24;

/**
 * Lớp lưới kỹ thuật nằm dưới mặt nạ: chỉ lộ ra trong các ô cửa chữ AEGIS. Lưới ô vuông mảnh, các vòng tròn đồng tâm và tia toả ra
 * từ điểm phóng to (đỉnh chữ A) như màn ngắm / radar, vạch quét xoay chậm. Chỉ có đường nét, không chữ số. Thuần trang trí.
 */
function TechGrid({ vw, vh, ax, ay }: { vw: number; vh: number; ax: number; ay: number }) {
  const lines: { key: string; x1: number; y1: number; x2: number; y2: number; major: boolean }[] = [];
  const step = CELL / 4;
  for (let x = 0, n = 0; x <= vw; x += step, n++) lines.push({ key: `v${n}`, x1: x, y1: 0, x2: x, y2: vh, major: n % 4 === 0 });
  for (let y = 0, n = 0; y <= vh; y += step, n++) lines.push({ key: `h${n}`, x1: 0, y1: y, x2: vw, y2: y, major: n % 4 === 0 });
  const reach = Math.hypot(Math.max(ax, vw - ax), Math.max(ay, vh - ay)) + 40;
  const crosses: { x: number; y: number }[] = [];
  for (let x = 0; x <= vw; x += CELL) for (let y = 0; y <= vh; y += CELL) crosses.push({ x, y });
  const sweep = `M ${ax} ${ay} L ${ax + reach} ${ay} A ${reach} ${reach} 0 0 0 ${ax + reach * Math.cos(-0.5)} ${ay + reach * Math.sin(-0.5)} Z`;
  return (
    <g aria-hidden className="site-intro-grid">
      <rect x={0} y={0} width={vw} height={vh} className="site-intro-grid-fill" />
      {lines.map(({ key, x1, y1, x2, y2, major }) => (
        <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} className={major ? "site-intro-grid-major" : "site-intro-grid-minor"} />
      ))}
      {Array.from({ length: RAYS }, (_, k) => {
        const a = (k / RAYS) * Math.PI * 2;
        return <line key={`r${k}`} x1={ax} y1={ay} x2={ax + Math.cos(a) * reach} y2={ay + Math.sin(a) * reach} className="site-intro-grid-ray" />;
      })}
      {Array.from({ length: RINGS }, (_, k) => (
        <circle key={`c${k}`} cx={ax} cy={ay} r={(k + 1) * 64} className={k % 4 === 3 ? "site-intro-grid-ring site-intro-grid-ring-strong" : "site-intro-grid-ring"} />
      ))}
      {crosses.map(({ x, y }) => (
        <path key={`${x}-${y}`} d={`M ${x - 4} ${y} H ${x + 4} M ${x} ${y - 4} V ${y + 4}`} className="site-intro-grid-cross" />
      ))}
      <g className="site-intro-sweep" style={{ transformOrigin: `${ax}px ${ay}px` }}>
        <path d={sweep} className="site-intro-sweep-wedge" />
        <line x1={ax} y1={ay} x2={ax + reach} y2={ay} className="site-intro-sweep-line" />
      </g>
      <circle cx={ax} cy={ay} r={5} className="site-intro-grid-core" />
    </g>
  );
}

/**
 * Màn mở đầu của trang chính (thay màn đếm số cũ): chữ AEGIS rất lớn là các ô cửa nhìn vào trang chủ phía sau. Người dùng cuộn
 * (bánh xe, vuốt, phím ↓ / Space) thì lớp phủ phóng to quanh khối đặc ở đỉnh chữ A cho tới khi lộ trọn trang; có nút "Bỏ qua".
 * Cùng mặt nạ và cách điều khiển với màn mở đầu của Factory (SpaceIntro), nhưng ở đây không có cảnh 3D phía sau.
 * Chỉ hiển thị khi <html data-intro="playing"> (script đầu trang đặt: trang chủ, lần đầu trong phiên, không giảm chuyển động).
 * Hạt hero và chữ hero bắt đầu dựng ngay khi lớp phủ đã phóng được một đoạn (sự kiện INTRO_DONE_EVENT), để ô cửa không trống.
 */
export function SiteIntro() {
  const { intro } = useSite();
  const rootRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const zoomRef = useRef<SVGGElement>(null);
  const outlineRef = useRef<SVGTextElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [gone, setGone] = useState(false);
  const layoutRef = useRef<Layout | null>(null);
  const state = useRef({ target: 0, shown: 0, done: false, announced: false });

  const ready = layout !== null;

  // Đo chữ sau khi font tải xong; đo lại khi đổi kích thước cửa sổ
  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.intro !== "playing") return;
    root.dataset.introLive = "on";
    getLenis()?.stop();
    window.scrollTo(0, 0);
    let cancelled = false;
    const run = () => {
      const el = textRef.current;
      if (!el || cancelled) return;
      const next = measure(el, window.innerWidth, window.innerHeight);
      layoutRef.current = next;
      setLayout(next);
    };
    void document.fonts.ready.then(run);
    window.addEventListener("resize", run);
    return () => {
      cancelled = true;
      delete root.dataset.introLive;
      window.removeEventListener("resize", run);
    };
  }, []);

  const apply = (p: number) => {
    const l = layoutRef.current;
    const g = zoomRef.current;
    if (l && g) {
      const t = clamp01(p / 0.85);
      const s = Math.pow(l.zoom, Math.pow(t, 1.5));
      g.setAttribute("transform", `translate(${l.ax} ${l.ay}) scale(${s}) translate(${-l.ax} ${-l.ay})`);
      if (outlineRef.current) outlineRef.current.style.opacity = String(1 - clamp01(t * 2.2));
    }
    if (rootRef.current) rootRef.current.style.opacity = String(1 - smooth(0.6, 0.9, p));
    if (hintRef.current) hintRef.current.style.opacity = String(1 - clamp01(p * 10));
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
  return (
    <div ref={rootRef} data-surface="dark" className="site-intro" data-ready={ready} role="status" aria-label={intro.label}>
      {/* Mặt nạ: nền phủ kín, chữ AEGIS khoét thành ô cửa nhìn vào trang chủ phía sau */}
      <svg className="site-intro-svg" width="100%" height="100%" viewBox={`0 0 ${l?.vw ?? 1} ${l?.vh ?? 1}`} aria-hidden>
        <defs>
          <mask id="site-intro-mask" maskUnits="userSpaceOnUse" x={0} y={0} width={l?.vw ?? 1} height={l?.vh ?? 1}>
            <rect x={0} y={0} width={l?.vw ?? 1} height={l?.vh ?? 1} fill="white" />
            <text ref={textRef} className="site-intro-text" x={l?.x ?? 0} y={l?.y ?? 0} fontSize={l?.fs ?? REF} fill="black">
              {WORD}
            </text>
          </mask>
        </defs>
        <g ref={zoomRef}>
          {l && <TechGrid vw={l.vw} vh={l.vh} ax={l.ax} ay={l.ay} />}
          <rect x={0} y={0} width={l?.vw ?? 1} height={l?.vh ?? 1} className="site-intro-cover" mask="url(#site-intro-mask)" />
          <text ref={outlineRef} className="site-intro-text site-intro-outline" x={l?.x ?? 0} y={l?.y ?? 0} fontSize={l?.fs ?? REF} fill="none">
            {WORD}
          </text>
        </g>
        {/* Trước khi đo xong: chữ tô màu accent để không có khoảng trống; đo xong thì mờ đi để lộ ô cửa */}
        <text className="site-intro-text site-intro-fill" x={l?.x ?? 0} y={l?.y ?? 0} fontSize={l?.fs ?? REF}>
          {WORD}
        </text>
      </svg>
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
