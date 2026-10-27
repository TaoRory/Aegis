"use client";

import { useEffect, useRef, useState, ViewTransition, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";

import type { TemplatePreview } from "@/components/templates/TemplateCard";
import { SmartLink } from "@/components/ui/SmartLink";
import { GalleryEngine, STEP, type GalleryCardState } from "@/components/webgl/gallery-engine";
import type { SiteDict } from "@/content/site/types";
import type { DemoTemplate, TemplateGroup } from "@/content/templates";
import { cn } from "@/lib/cn";
import { fill } from "@/lib/fill";
import { MQ } from "@/lib/motion";

/**
 * Thư viện style dạng "phòng trưng bày bản vẽ": các thẻ mẫu xếp trên một vòng cung 3D, xoay được.
 *
 * - Điều khiển: kéo chuột/ngón tay, lăn ngang (trackpad / Shift+lăn), phím ← → Home End Enter, nút ‹ ›, thước bên dưới, bấm thẻ bên cạnh.
 *   Lăn dọc vẫn cuộn trang bình thường.
 * - Rê chuột vào thẻ: ảnh trong thẻ tự cuộn xuống; thẻ nhô lên và sáng viền. Bấm thẻ giữa để mở mẫu (thẻ "phóng" thành trang mẫu).
 * - Lọc theo nhóm (chỉ bản trang đầy đủ): thẻ không khớp lùi vào trong và mờ đi.
 * - DOM là nguồn sự thật: danh sách <a> thật luôn nằm trong DOM (Tab, đọc màn hình, SEO). Canvas chỉ trang trí.
 * - Ba chế độ hiển thị (data-mode): "ssr" (chưa có JS: lưới thẻ tĩnh), "gl" (WebGL2), "css" (vòng 3D bằng CSS khi không có WebGL2,
 *   giảm chuyển động hoặc chất lượng thấp). Mọi chế độ dùng chung một bộ điều khiển.
 */

type Mode = "ssr" | "gl" | "css";
type Variant = "page" | "teaser";

interface Ctl {
  pos: number;
  target: number;
  speed: number;
  dragging: boolean;
  dragStartX: number;
  dragStartY: number;
  dragStartTarget: number;
  moved: number;
  /** Vị trí đích lúc bắt đầu một cử chỉ lăn: để một nấc lăn nhỏ vẫn sang được thẻ kế */
  gestureFrom: number | null;
  lastInput: number;
  hover: number;
  active: number;
  opening: boolean;
  visible: boolean;
  raw: number[];
  cards: GalleryCardState[];
}

const pad2 = (n: number) => String(n).padStart(2, "0");
const INDEX_KEY = "aegis-gallery-index";

/** Gỡ cờ "đang mở mẫu" (html[data-morph-from]); truyền slug để chỉ gỡ khi cờ còn đúng của lần mở đó */
function clearMorphFlag(slug?: string) {
  const root = document.documentElement;
  if (!slug || root.dataset.morphFrom === slug) delete root.dataset.morphFrom;
}

/** Click thường (không phải Ctrl/Cmd/Shift/Alt-click mở tab mới) */
const isPlainClick = (event: { button: number; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean }) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

export function GalleryRing({
  templates,
  previews,
  copy,
  groups,
  variant = "page",
  className,
}: {
  templates: DemoTemplate[];
  previews: Record<string, TemplatePreview>;
  /** Chữ giao diện của thư viện theo ngôn ngữ */
  copy: SiteDict["gallery"];
  /** Tên các nhóm lọc theo ngôn ngữ (khớp DemoTemplate.group) */
  groups: string[];
  variant?: Variant;
  className?: string;
}) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);
  const groupRef = useRef<TemplateGroup | "all">("all");
  const api = useRef<{ goTo: (i: number) => void; step: (d: number) => void; open: (i: number) => void } | null>(null);

  const [mode, setMode] = useState<Mode>("ssr");
  const [active, setActive] = useState(0);
  const [group, setGroup] = useState<TemplateGroup | "all">("all");
  const [morph, setMorph] = useState<{ slug: string; left: number; top: number; width: number; height: number; src: string } | null>(null);

  const N = templates.length;
  const hrefOf = (t: DemoTemplate) => `/mau-giao-dien/${t.slug}`;

  const chooseGroup = (next: TemplateGroup | "all") => {
    groupRef.current = next;
    setGroup(next);
    // Về thẻ gần nhất còn khớp bộ lọc
    api.current?.goTo(active);
  };

  useEffect(() => {
    const stage = stageRef.current;
    const host = hostRef.current;
    const root = rootRef.current;
    if (!stage || !host || !root) return;
    // Canvas tạo bằng tay (không để React quản) để có thể thay canvas mới khi trình duyệt làm mất WebGL context
    let canvas = document.createElement("canvas");

    const reduced = window.matchMedia(MQ.reduced).matches;
    const lowQuality = document.documentElement.dataset.quality === "low";
    // Về lại thư viện (Back, trang đã được giữ lại): dựng lại ở thẻ xem gần nhất, hoặc ?style=<số> nếu có
    let remembered = 0;
    try {
      remembered = Number(sessionStorage.getItem(INDEX_KEY)) || 0;
    } catch {}
    const fromUrl = new URLSearchParams(window.location.search).get("style");
    const start = Math.min(N - 1, Math.max(0, Math.round(Number(fromUrl ?? remembered) || 0)));
    // Trang có thể được giữ lại khi đi chỗ khác rồi hiện lại: dọn lớp phủ và cờ của lần mở trước
    setMorph(null);
    clearMorphFlag();
    const allowed = (i: number) => groupRef.current === "all" || templates[i].group === groupRef.current;
    const nearestAllowed = (t: number) => {
      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i < N; i++) {
        if (!allowed(i)) continue;
        const d = Math.abs(i - t);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      return best;
    };
    const stepAllowed = (from: number, dir: 1 | -1) => {
      for (let i = from + dir; i >= 0 && i < N; i += dir) if (allowed(i)) return i;
      return from;
    };

    const c: Ctl = {
      pos: start,
      target: start,
      speed: 0,
      dragging: false,
      dragStartX: 0,
      dragStartY: 0,
      dragStartTarget: 0,
      moved: 0,
      gestureFrom: null,
      lastInput: 0,
      hover: -1,
      active: start,
      opening: false,
      visible: false,
      raw: Array(N).fill(0),
      cards: Array.from({ length: N }, () => ({ focus: 0, scroll: 0, alpha: 1 })),
    };
    setActive(start);

    // ---- Khởi tạo WebGL2 (nếu được), nếu không dùng vòng 3D bằng CSS ----
    const sources = templates.map((t) => ({ src: previews[t.slug]?.full.src ?? "", color: t.stage }));
    const dprCap = window.matchMedia("(max-width: 47.99rem)").matches ? 1.25 : 1.75;
    let engine: GalleryEngine | null = null;
    let retryTimer = 0;
    let openTimer = 0;
    let attempts = 0;
    let lostCount = 0;
    let disposed = false;

    const place = () => {
      const cardW = Math.min(260, Math.max(140, stage.clientWidth * 0.2));
      root.style.setProperty("--g-card-w", `${cardW}px`);
      root.style.setProperty("--g-radius", `${cardW * 3.2}px`);
      engine?.resize(dprCap);
    };
    // Hoãn sang khung hình kế tiếp: đổi kích thước canvas ngay trong callback làm WebKit báo "ResizeObserver loop"
    let resizeRaf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(place);
    });
    ro.observe(stage);

    /** Tạo canvas + engine mới. Thất bại (ví dụ context bị mất ngay khi tạo) → thử lại vài lần rồi ở lại chế độ CSS */
    const boot = () => {
      if (disposed) return;
      ro.unobserve(canvas);
      canvas.remove();
      canvas = document.createElement("canvas");
      canvas.className = "gallery-canvas";
      canvas.setAttribute("aria-hidden", "true");
      canvas.dataset.cursor = "drag";
      canvas.dataset.cursorLabel = copy.cursorDrag;
      host.appendChild(canvas);
      try {
        engine = new GalleryEngine(canvas, sources);
      } catch (error) {
        engine = null;
        canvas.remove();
        if (attempts === 0) console.warn("[gallery] Chưa khởi tạo được WebGL2, tạm dùng vòng 3D bằng CSS rồi thử lại.", error);
        if (attempts++ < 3) retryTimer = window.setTimeout(boot, 400 * attempts);
        return;
      }
      engine.onLost = () => {
        engine?.destroy();
        engine = null;
        setMode("css");
        // GPU liên tục làm mất context: thử lại tối đa 2 lần rồi ở lại vòng 3D bằng CSS
        if (++lostCount > 2) return;
        attempts = 0;
        retryTimer = window.setTimeout(boot, 300);
      };
      ro.observe(canvas); // canvas chỉ có kích thước sau khi chế độ gl bật (display: block)
      setMode("gl");
      engine.resize(dprCap);
      void engine.loadTextures(c.active);
    };

    setMode("css");
    place();
    if (!reduced && !lowQuality) boot();

    const io = new IntersectionObserver(([entry]) => (c.visible = entry.isIntersecting));
    io.observe(stage);

    // ---- Điều khiển ----
    const touch = () => (c.lastInput = performance.now());
    const clampTarget = (t: number) => {
      const lo = stepAllowed(-1, 1);
      let hi = 0;
      for (let i = 0; i < N; i++) if (allowed(i)) hi = i;
      return Math.max(lo - 0.45, Math.min(hi + 0.45, t));
    };
    const goTo = (i: number) => {
      c.target = nearestAllowed(i);
      touch();
    };
    const stepBy = (dir: 1 | -1) => {
      c.target = stepAllowed(nearestAllowed(c.target), dir);
      touch();
    };

    const local = (event: { clientX: number; clientY: number }) => {
      const r = canvas.getBoundingClientRect();
      return { x: event.clientX - r.left, y: event.clientY - r.top };
    };
    const hitAt = (event: { clientX: number; clientY: number }) => {
      if (!engine) return -1;
      const p = local(event);
      return engine.hit(p.x, p.y, c.pos, c.cards);
    };

    const openIndex = (i: number) => {
      if (c.opening) return;
      const t = templates[i];
      const href = hrefOf(t);
      const preview = previews[t.slug];
      const rect = engine && !reduced ? engine.rect(i, c.pos, c.cards) : null;
      c.opening = true;
      try {
        sessionStorage.setItem(INDEX_KEY, String(i));
      } catch {}
      if (!rect || !preview) {
        router.push(href, { transitionTypes: ["aegis-forward"] });
        return;
      }
      const cb = canvas.getBoundingClientRect();
      document.documentElement.dataset.morphFrom = t.slug;
      setMorph({ slug: t.slug, left: cb.left + rect.x, top: cb.top + rect.y, width: rect.w, height: rect.h, src: preview.full.src });
      // Chờ lớp phủ được vẽ ra rồi mới điều hướng để View Transition chụp đúng trạng thái "cũ"
      requestAnimationFrame(() => requestAnimationFrame(() => router.push(href, { transitionTypes: ["aegis-open"] })));
      window.clearTimeout(openTimer);
      openTimer = window.setTimeout(() => {
        // Điều hướng không xảy ra (lỗi mạng…): trả thư viện về trạng thái ban đầu
        c.opening = false;
        setMorph(null);
        clearMorphFlag(t.slug);
      }, 6000);
    };

    const endDrag = (event: PointerEvent) => {
      c.dragging = false;
      if (stage.hasPointerCapture?.(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    };
    const onDown = (event: PointerEvent) => {
      if (event.button !== 0 || c.opening) return;
      c.moved = 0;
      // Nút / link của dock và bộ lọc không khởi động thao tác kéo (trừ thẻ chính là link ở chế độ CSS)
      if ((event.target as Element).closest("a, button") && engine) return;
      c.dragging = true;
      c.dragStartX = event.clientX;
      c.dragStartY = event.clientY;
      c.dragStartTarget = c.target;
      if (engine) stage.setPointerCapture?.(event.pointerId);
      touch();
    };
    // Vừa kéo xong thì nuốt click để không mở nhầm mẫu (chế độ CSS)
    const onClickCapture = (event: MouseEvent) => {
      if (c.moved > 6) {
        event.preventDefault();
        event.stopPropagation();
      }
      c.moved = 0;
    };
    const onMove = (event: PointerEvent) => {
      if (c.opening) return;
      if (c.dragging && event.pointerType === "mouse" && event.buttons === 0) endDrag(event); // nhả chuột ngoài cửa sổ
      if (c.dragging) {
        const dx = event.clientX - c.dragStartX;
        c.moved = Math.max(c.moved, Math.hypot(dx, event.clientY - c.dragStartY));
        const perCard = Math.max(90, stage.clientWidth * 0.13);
        c.target = clampTarget(c.dragStartTarget - dx / perCard);
        touch();
      }
      if (event.pointerType === "mouse") c.hover = hitAt(event);
    };
    const onUp = (event: PointerEvent) => {
      if (!c.dragging) return;
      endDrag(event);
      // Chỉ coi là "bấm" khi gần như không di chuyển (kéo dọc để cuộn trang trên điện thoại không được mở mẫu)
      if (c.moved < 6) {
        const hit = hitAt(event);
        if (hit >= 0 && allowed(hit)) {
          if (Math.abs(hit - c.pos) < 0.45) openIndex(hit);
          else goTo(hit);
        }
      }
      touch();
    };
    // Trình duyệt huỷ thao tác (cuộn trang, kéo-thả gốc, mất focus): chỉ dừng kéo, không phải một cú bấm
    const onCancel = (event: PointerEvent) => {
      if (c.dragging) endDrag(event);
      touch();
    };
    const onLeave = () => {
      c.hover = -1;
    };
    const onWheel = (event: WheelEvent) => {
      const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey;
      if (!horizontal || c.opening) return;
      event.preventDefault();
      // deltaMode: 0 = pixel, 1 = dòng (Firefox), 2 = trang
      const unit = event.deltaMode === 1 ? 33 : event.deltaMode === 2 ? 400 : 1;
      if (c.gestureFrom === null) c.gestureFrom = c.target;
      c.target = clampTarget(c.target + (event.deltaX || event.deltaY) * unit * 0.0032);
      touch();
    };
    const onKey = (event: KeyboardEvent) => {
      if (c.opening) return;
      if (event.key === "ArrowRight") stepBy(1);
      else if (event.key === "ArrowLeft") stepBy(-1);
      else if (event.key === "Home") goTo(0);
      else if (event.key === "End") goTo(N - 1);
      else if (event.key === "Enter" && event.target === stage) openIndex(nearestAllowed(c.pos));
      else return;
      event.preventDefault();
    };

    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    stage.addEventListener("pointerleave", onLeave);
    stage.addEventListener("click", onClickCapture, true);
    stage.addEventListener("wheel", onWheel, { passive: false });
    stage.addEventListener("keydown", onKey);
    api.current = { goTo, step: (d) => stepBy(d > 0 ? 1 : -1), open: openIndex };

    // ---- Vòng lặp ----
    let last = -1;
    let origin = 0;
    let raf = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (last < 0) {
        last = now;
        origin = now;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!c.visible || document.visibilityState !== "visible") return;

      if (!c.dragging && now - c.lastInput > 140) {
        // Một nấc lăn nhỏ (chưa tới nửa thẻ) vẫn sang thẻ kế theo hướng lăn
        if (c.gestureFrom !== null) {
          const d = c.target - c.gestureFrom;
          if (Math.abs(d) >= 0.12 && Math.abs(d) < 0.5) c.target = stepAllowed(nearestAllowed(c.gestureFrom), d > 0 ? 1 : -1);
          c.gestureFrom = null;
        }
        c.target = nearestAllowed(c.target);
      }
      const prev = c.pos;
      c.pos += (c.target - c.pos) * (1 - Math.exp(-dt * (reduced ? 30 : 6.2)));
      const v = (c.pos - prev) / Math.max(dt, 0.001);
      c.speed += (v - c.speed) * (1 - Math.exp(-dt * 10));

      for (let i = 0; i < N; i++) {
        const card = c.cards[i];
        const isAllowed = allowed(i);
        const hovering = c.hover === i && isAllowed && !c.dragging && Math.abs(i - c.pos) < 0.6;
        card.focus += ((hovering ? 1 : 0) - card.focus) * (1 - Math.exp(-dt * 9));
        card.alpha += ((isAllowed ? 1 : 0) - card.alpha) * (1 - Math.exp(-dt * 7));
        if (hovering) {
          const duration = engine ? Math.max(3.5, engine.scrollSpan(i) * 1.5) : 8;
          c.raw[i] = Math.min(1, c.raw[i] + dt / duration);
        } else c.raw[i] = Math.max(0, c.raw[i] - dt * 0.9);
        const r = c.raw[i];
        card.scroll = r * r * (3 - 2 * r);
      }

      const a = nearestAllowed(c.pos);
      if (a !== c.active) {
        c.active = a;
        setActive(a);
        try {
          sessionStorage.setItem(INDEX_KEY, String(a));
        } catch {}
      }

      // Nhãn con trỏ theo thẻ đang rê tới
      const label = c.hover >= 0 && allowed(c.hover) && Math.abs(c.hover - c.pos) < 0.6 ? copy.cursorOpen : copy.cursorDrag;
      if (canvas.dataset.cursorLabel !== label) canvas.dataset.cursorLabel = label;

      if (engine) {
        engine.render({ time: (now - origin) / 1000, pos: c.pos, speed: c.speed, cards: c.cards });
      } else {
        for (let i = 0; i < N; i++) {
          const li = cardRefs.current[i];
          if (!li) continue;
          const card = c.cards[i];
          const theta = ((i - c.pos) * STEP * 180) / Math.PI;
          const center = Math.exp(-(i - c.pos) * (i - c.pos) * 0.8);
          li.style.transform = `translate(-50%, -50%) translateZ(calc(var(--g-radius) * -1)) rotateY(${theta.toFixed(2)}deg) translateZ(var(--g-radius)) scale(${(0.88 + 0.12 * card.alpha + card.focus * 0.03).toFixed(3)})`;
          li.style.opacity = (Math.abs(theta) > 100 ? 0 : (0.25 + 0.75 * center) * (0.12 + 0.88 * card.alpha)).toFixed(3);
          li.style.setProperty("--g-scroll", card.scroll.toFixed(3));
          li.style.pointerEvents = Math.abs(theta) > 80 || card.alpha < 0.5 ? "none" : "";
        }
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      ro.disconnect();
      io.disconnect();
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      stage.removeEventListener("pointerleave", onLeave);
      stage.removeEventListener("click", onClickCapture, true);
      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("keydown", onKey);
      api.current = null;
      disposed = true;
      window.clearTimeout(retryTimer);
      window.clearTimeout(openTimer);
      engine?.destroy();
      engine = null;
      canvas.remove();
    };
    // templates / previews là hằng số của trang
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = templates[active];
  const countLabel = `${pad2(active + 1)} / ${pad2(N)}`;

  return (
    <div
      ref={rootRef}
      data-mode={mode}
      data-variant={variant}
      role="region"
      aria-roledescription="carousel"
      aria-label={copy.region}
      className={cn("gallery", className)}
    >
      <div
        ref={stageRef}
        tabIndex={0}
        aria-label={copy.stage}
        role="group"
        className="gallery-stage"
      >
        <div ref={hostRef} className="gallery-canvas-host" aria-hidden />

        <ul className="gallery-cards" aria-label={copy.list}>
          {templates.map((template, index) => {
            const preview = previews[template.slug];
            const hidden = group !== "all" && template.group !== group;
            return (
              <li
                key={template.slug}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                data-active={index === active ? "" : undefined}
                aria-hidden={hidden ? true : undefined}
                className="gallery-card"
                style={{ "--stage": template.stage, "--stage-ink": template.stageInk } as CSSProperties}
              >
                <SmartLink
                  href={hrefOf(template)}
                  navType="aegis-open"
                  tabIndex={hidden ? -1 : undefined}
                  data-cursor="view"
                  data-cursor-label={copy.cursorOpen}
                  className="gallery-card-link"
                  onFocus={() => api.current?.goTo(index)}
                  draggable={false}
                  onClick={(event) => {
                    // Chế độ WebGL: mở bằng hiệu ứng thẻ phóng ra; chế độ khác (và Ctrl/Cmd/Shift-click) để link điều hướng bình thường
                    if (mode === "gl" && isPlainClick(event)) {
                      event.preventDefault();
                      api.current?.open(index);
                    }
                  }}
                >
                  {preview && mode !== "gl" ? (
                    <span className="gallery-card-frame">
                      <Image
                        src={preview.full.src}
                        width={preview.full.width}
                        height={preview.full.height}
                        alt=""
                        draggable={false}
                        sizes="(min-width: 1024px) 20vw, 45vw"
                        className="gallery-card-img"
                      />
                    </span>
                  ) : null}
                  <span className="gallery-card-name">
                    <span className="label">/{pad2(index + 1)}</span> {template.name}
                    <span className="sr-only">
                      {" "}
                      {fill(copy.cardSr, { industry: template.industry, emotion: template.emotion, brand: template.brand })}
                    </span>
                  </span>
                </SmartLink>
              </li>
            );
          })}
        </ul>

        {variant === "page" && (
          <p className="gallery-hint label" aria-hidden>
            {copy.hint}
          </p>
        )}

        <div className="gallery-dock">
          <div className="gallery-info">
            <p className="label text-accent">
              {copy.style} /{pad2(active + 1)} · {current.industry}
            </p>
            <p className="gallery-name" aria-live="polite">
              {current.name}
            </p>
            <p className="gallery-sub">
              {current.emotion} · {current.signature}
            </p>
            <p className="label gallery-note">{fill(copy.note, { brand: current.brand })}</p>
          </div>
          <div className="gallery-actions">
            <button type="button" className="gallery-arrow" aria-label={copy.prev} onClick={() => api.current?.step(-1)} data-cursor="link">
              ←
            </button>
            <button type="button" className="gallery-arrow" aria-label={copy.next} onClick={() => api.current?.step(1)} data-cursor="link">
              →
            </button>
            <SmartLink
              href={hrefOf(current)}
              navType="aegis-open"
              className="btn btn-box h-12 bg-accent px-5 text-on-accent hover:bg-accent-strong"
              onClick={(event) => {
                if (mode === "gl" && isPlainClick(event)) {
                  event.preventDefault();
                  api.current?.open(active);
                }
              }}
            >
              <span className="roll">
                <span className="roll-a">{fill(copy.open, { name: current.name })}</span>
                <span className="roll-b" aria-hidden>
                  {fill(copy.open, { name: current.name })}
                </span>
              </span>
              <span aria-hidden className="btn-arrow">
                ↗
              </span>
            </SmartLink>
          </div>
        </div>

        {variant === "page" && (
          <div className="gallery-filters" role="group" aria-label={copy.filters}>
            {(["all", ...groups] as const).map((g) => (
              <button
                key={g}
                type="button"
                aria-pressed={group === g}
                className="gallery-chip label"
                onClick={() => chooseGroup(g)}
                data-cursor="link"
              >
                {g === "all" ? copy.all : g}
                <span aria-hidden className="gallery-chip-count">
                  {g === "all" ? N : templates.filter((t) => t.group === g).length}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="gallery-rule" aria-label={fill(copy.rule, { count: countLabel })}>
          <span className="label gallery-rule-label" aria-hidden>
            {countLabel}
          </span>
          <div className="gallery-ticks">
            {templates.map((template, index) => {
              const hidden = group !== "all" && template.group !== group;
              return (
                <button
                  key={template.slug}
                  type="button"
                  className="gallery-tick"
                  aria-label={fill(copy.tick, { n: index + 1, name: template.name })}
                  aria-current={index === active ? "true" : undefined}
                  data-off={hidden ? "" : undefined}
                  disabled={hidden}
                  onClick={() => api.current?.goTo(index)}
                />
              );
            })}
          </div>
        </div>
      </div>

      <p className="sr-only">{copy.notice}</p>

      {morph &&
        createPortal(
          <ViewTransition name={`tpl-${morph.slug}`} share="aegis-morph" default="none">
            <div
              aria-hidden
              className="gallery-morph"
              style={{ left: morph.left, top: morph.top, width: morph.width, height: morph.height, backgroundImage: `url(${morph.src})` }}
            />
          </ViewTransition>,
          document.body,
        )}
    </div>
  );
}
