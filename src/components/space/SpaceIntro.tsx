"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { engineRef } from "@/components/space/engine-ref";
import { useFactory } from "@/components/space/factory-context";
import { spaceStore } from "@/components/space/space-store";
import { useSpace } from "@/components/space/useSpace";

const WORD = "AEGIS";
const REF = 400; // cỡ chữ tham chiếu để đo (px)

interface Layout {
  vw: number;
  vh: number;
  fs: number;
  x: number;
  y: number;
  /** Điểm phóng to: khối đặc ở đỉnh chữ A, ngay trên lỗ tam giác (là ô cửa nên phóng vào sẽ thấy xưởng lớn dần) */
  ax: number;
  ay: number;
  /** Hệ số phóng to cuối cùng */
  zoom: number;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/**
 * Đo chữ AEGIS (font thật của thương hiệu) và tìm khối đặc ở đỉnh chữ A bằng cách quét một cột điểm ảnh ở giữa chữ:
 * từ trên xuống là đỉnh chữ (đặc), lỗ tam giác (trống), thanh ngang (đặc), khe giữa hai chân (trống). Điểm phóng to là giữa đoạn đặc đầu tiên.
 */
function measure(textEl: SVGTextElement, vw: number, vh: number): Layout {
  const style = getComputedStyle(textEl);
  const canvas = document.createElement("canvas");
  canvas.width = REF * 1.6;
  canvas.height = REF * 1.4;
  const g = canvas.getContext("2d", { willReadFrequently: true })!;
  g.font = `${style.fontWeight} ${REF}px ${style.fontFamily}`;
  const full = g.measureText(WORD);
  const fs = Math.min((vw * 0.9 * REF) / full.width, (vh * 0.52 * REF) / (REF * 0.72));
  const scale = fs / REF;
  const width = full.width * scale;
  const x = (vw - width) / 2;
  const y = vh * 0.5 + 0.36 * fs; // đường cơ sở: chữ hoa nằm giữa màn hình theo chiều dọc

  // Quét chữ A
  const baseline = REF * 1.05;
  const left = 20;
  g.fillStyle = "#fff";
  g.fillText("A", left, baseline);
  const m = g.measureText("A");
  const cx = Math.round(left + (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2);
  const top = Math.max(0, Math.floor(baseline - m.actualBoundingBoxAscent) - 2);
  const data = g.getImageData(cx, top, 1, Math.ceil(baseline - top) + 4).data;
  let state = 0; // 0: trước đỉnh chữ, 1: trong đỉnh chữ, 2: trong lỗ
  let firstSolid = -1;
  let holeStart = -1;
  for (let i = 0; i < data.length / 4; i++) {
    const solid = data[i * 4 + 3] > 128;
    if (state === 0 && solid) {
      state = 1;
      firstSolid = i;
    } else if (state === 1 && !solid) {
      holeStart = i;
      break;
    }
  }
  const apexMid = firstSolid >= 0 && holeStart > firstSolid ? top + (firstSolid + holeStart) / 2 : baseline - REF * 0.62;
  const ax = x + ((cx - left) / REF) * fs;
  const ay = y - ((baseline - apexMid) / REF) * fs;
  const zoom = 14;
  return { vw, vh, fs, x, y, ax, ay, zoom };
}

/**
 * Intro AEGIS: chữ AEGIS rất lớn là các ô cửa nhìn vào cảnh 3D đang chạy phía sau (lõi năng lượng ở xa). Người dùng cuộn
 * (bánh xe, vuốt, phím ↓ / Space) thì lớp phủ phóng to quanh lỗ giữa chữ A cho tới khi lỗ phủ kín màn hình, trong lúc camera
 * lùi lên và các trạm dựng lên từ sàn (engine.setIntroProgress). Chỉ hiện lần đầu vào trang tổng quan trong phiên;
 * có nút "Bỏ qua". Khi cảnh 3D chưa sẵn sàng, chữ được tô dải màu kèm vạch tiến độ thật.
 */
export function SpaceIntro() {
  const { ui } = useFactory();
  const ready3d = useSpace("ready");
  const progress = useSpace("bootProgress");
  const rootRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const zoomRef = useRef<SVGGElement>(null);
  const outlineRef = useRef<SVGTextElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [gone, setGone] = useState(false);
  const state = useRef({ target: 0, shown: 0, ready: false, done: false });
  const layoutRef = useRef<Layout | null>(null);

  // Sẵn sàng khi engine đã dựng xong, hoặc không có engine (bản phẳng / không WebGL)
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const noEngine = mounted && progress < 0;
  const ready = ready3d || noEngine;
  useEffect(() => {
    state.current.ready = ready;
  }, [ready]);

  // Đo chữ sau khi font tải xong; đo lại khi đổi kích thước cửa sổ
  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.spaceBoot !== "playing") return;
    spaceStore.set("bootPhase", "playing");
    root.dataset.introLive = "on";
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

  // Áp tiến độ p lên lớp phủ và lên engine
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
    engineRef.current?.setIntroProgress(p);
  };

  const finish = () => {
    const st = state.current;
    if (st.done) return;
    st.done = true;
    try {
      sessionStorage.setItem("aegis-factory-boot", "1");
    } catch {}
    delete document.documentElement.dataset.spaceBoot;
    spaceStore.set("bootPhase", "done");
    setGone(true);
  };

  // Đầu vào cuộn: bánh xe, vuốt, phím
  useEffect(() => {
    const el = rootRef.current;
    const root = document.documentElement;
    if (!el || root.dataset.spaceBoot !== "playing") return;
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
      if (!st.ready || st.done) return;
      const unit = event.deltaMode === 1 ? 40 : 1;
      go(st.target + (event.deltaY * unit) / 1500);
    };
    let lastY = 0;
    const onTouchStart = (event: TouchEvent) => {
      lastY = event.touches[0].clientY;
    };
    const onTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      if (!st.ready || st.done) return;
      const y = event.touches[0].clientY;
      go(st.target + (lastY - y) / 600, 9);
      lastY = y;
    };
    const onKey = (event: KeyboardEvent) => {
      if (st.done || !st.ready) return;
      if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") go(st.target + 0.18);
      else if (event.key === "ArrowUp" || event.key === "PageUp") go(st.target - 0.18);
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
    <div ref={rootRef} className="space-intro" data-ready={ready} data-live={l ? "true" : undefined} role="status" aria-label={ui.hud.bootLabel}>
      {/* Mặt nạ: nền tối phủ kín, chữ AEGIS khoét thành ô cửa nhìn vào cảnh 3D */}
      <svg className="space-intro-svg" width="100%" height="100%" viewBox={`0 0 ${l?.vw ?? 1} ${l?.vh ?? 1}`} aria-hidden>
        <defs>
          <mask id="space-intro-mask" maskUnits="userSpaceOnUse" x={0} y={0} width={l?.vw ?? 1} height={l?.vh ?? 1}>
            <rect x={0} y={0} width={l?.vw ?? 1} height={l?.vh ?? 1} fill="white" />
            <text ref={textRef} className="space-intro-text" x={l?.x ?? 0} y={l?.y ?? 0} fontSize={l?.fs ?? REF} fill="black">
              {WORD}
            </text>
          </mask>
          <linearGradient id="space-intro-fill" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" style={{ stopColor: "var(--accent)" }} />
            <stop offset="0.5" style={{ stopColor: "var(--accent-light, var(--accent))" }} />
            <stop offset="1" style={{ stopColor: "var(--accent)" }} />
          </linearGradient>
        </defs>
        <g ref={zoomRef}>
          <rect x={0} y={0} width={l?.vw ?? 1} height={l?.vh ?? 1} className="space-intro-cover" mask="url(#space-intro-mask)" />
          <text ref={outlineRef} className="space-intro-text space-intro-outline" x={l?.x ?? 0} y={l?.y ?? 0} fontSize={l?.fs ?? REF} fill="none">
            {WORD}
          </text>
        </g>
        {/* Trong lúc dựng cảnh: chữ tô dải màu; khi sẵn sàng mờ đi để lộ ô cửa */}
        <text className="space-intro-text space-intro-fill" x={l?.x ?? 0} y={l?.y ?? 0} fontSize={l?.fs ?? REF} fill="url(#space-intro-fill)">
          {WORD}
        </text>
      </svg>
      <div className="space-intro-ui">
        <div aria-hidden className="space-intro-meter" data-hidden={ready}>
          <span style={{ transform: `scaleX(${noEngine ? 1 : Math.max(0.04, progress)})` }} />
        </div>
        <p ref={hintRef} className="space-intro-hint label">
          {ready ? (
            <>
              <span className="space-intro-hint-mouse">{ui.intro.hint}</span>
              <span className="space-intro-hint-touch">{ui.intro.hintTouch}</span>
              <span aria-hidden className="space-intro-arrow">
                ↓
              </span>
            </>
          ) : (
            ui.intro.loading
          )}
        </p>
        <button type="button" className="space-intro-skip label" onClick={() => (rootRef.current as (HTMLDivElement & { _skip?: () => void }) | null)?._skip?.()}>
          {ui.intro.skip}
        </button>
      </div>
    </div>
  );
}
