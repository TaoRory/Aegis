"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { clamp01, measure, REF, smooth, WORD, type Layout } from "@/components/intro/aegis-mask";
import { buildCircuit, circlePath } from "@/components/intro/circuit";
import { useSite } from "@/components/layout/SiteLang";
import { getLenis, INTRO_DONE_EVENT } from "@/lib/motion";

const SESSION_KEY = "aegis-intro";

/** Các phần tử phía sau lớp phủ intro cần tạm inert: header, footer, và các anh em của intro trong <main> */
function frozenBehindIntro(intro: HTMLElement | null): HTMLElement[] {
  const out: HTMLElement[] = [];
  document.querySelectorAll<HTMLElement>("header, footer, .header-cta").forEach((n) => out.push(n));
  const main = document.getElementById("noi-dung");
  if (main) for (const child of main.children) if (child !== intro && child instanceof HTMLElement) out.push(child);
  return out;
}

/**
 * Lớp mạch điện nằm dưới mặt nạ: chỉ lộ ra trong các ô cửa chữ AEGIS, như bên trong một bản mạch. Đường mạch ngang / dọc / chéo 45°
 * có chân hàn và via, bus song song, chip có chân, xung sáng chạy dọc vài đường mạch; chip lớn ở đỉnh chữ A (điểm phóng to).
 * Chỉ có đường nét, không chữ số. Thuần trang trí.
 */
function CircuitBoard({ vw, vh, ax, ay }: { vw: number; vh: number; ax: number; ay: number }) {
  const board = useMemo(() => buildCircuit(vw, vh), [vw, vh]);
  return (
    <g aria-hidden className="site-intro-pcb">
      <rect x={0} y={0} width={vw} height={vh} className="site-intro-grid-fill" />
      <path d={board.buses} className="site-intro-pcb-bus" />
      <path d={board.traces} className="site-intro-pcb-trace" />
      {board.chips.map((chip) => (
        <g key={`${chip.x}-${chip.y}`}>
          <path d={chip.pins} className="site-intro-pcb-trace" />
          <rect x={chip.x} y={chip.y} width={chip.w} height={chip.h} className="site-intro-pcb-chip" />
          <circle cx={chip.x + 8} cy={chip.y + 8} r={2} className="site-intro-pcb-via" />
        </g>
      ))}
      <path d={circlePath(board.pads, vw < 640 ? 2.2 : 3.5)} className="site-intro-pcb-pad" />
      <path d={circlePath(board.vias, vw < 640 ? 1.3 : 2)} className="site-intro-pcb-via" />
      {board.pulses.map((pulse, k) => (
        <circle
          key={k}
          cx={pulse.x}
          cy={pulse.y}
          r={vw < 640 ? 1.8 : 2.8}
          className="site-intro-pcb-pulse"
          style={{ "--dx": `${pulse.dx}px`, "--dy": `${pulse.dy}px`, animationDuration: `${pulse.dur}s`, animationDelay: `${pulse.delay}s` } as CSSProperties}
        />
      ))}
      <circle cx={ax} cy={ay} r={18} className="site-intro-pcb-pad" />
      <circle cx={ax} cy={ay} r={7} className="site-intro-pcb-via" />
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
    // Khoá focus vào lớp phủ: mọi thứ phía sau (header, footer, các section cùng cấp với intro trong <main>) tạm inert,
    // focus đặt sẵn ở nút Bỏ qua. Không inert chính <main> vì intro nằm trong đó.
    const frozen = frozenBehindIntro(rootRef.current);
    frozen.forEach((n) => (n.inert = true));
    rootRef.current?.querySelector<HTMLButtonElement>(".site-intro-skip")?.focus({ preventScroll: true });
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
      frozen.forEach((n) => (n.inert = false));
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
          {l && <CircuitBoard vw={l.vw} vh={l.vh} ax={l.ax} ay={l.ay} />}
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
