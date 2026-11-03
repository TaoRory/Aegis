"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { AegisMark } from "@/components/brand/AegisLogo";
import { SectionContent, type Quote } from "@/components/showroom/Sections";
import type { RoomEngine } from "@/components/showroom/engine/room-engine";
import { showroom, type SectionId } from "@/content/showroom";
import { MQ } from "@/lib/motion";

/**
 * Studio Aegis (/demo): căn phòng 3D giới thiệu Website & App và Digital Marketing.
 *  - 3D: kéo để nhìn quanh, bấm kim cương / đồ vật / mục 01–05 ở đáy → camera bay tới, khung nội dung mở ra (Esc để đóng).
 *  - Bản phẳng: khi không có WebGL2 hoặc người dùng chọn; cùng nội dung, trang cuộn thường. Server luôn render bản phẳng
 *    (chữ có trong HTML), client quyết định chế độ rồi mới hiện; trong lúc chờ, màn khởi động che (chỉ khi có JS).
 * Khu đang mở ghi vào #hash (link chia sẻ được, nút Back đóng khung).
 */

const MODE_KEY = "aegis-showroom-mode";
const SECTIONS = showroom.sections;
const ids = SECTIONS.map((x) => x.id);
const isSection = (v: string): v is SectionId => (ids as string[]).includes(v);

type Mode = "pending" | "3d" | "flat";

function decideMode(): { mode: Mode; auto: boolean } {
  try {
    if (localStorage.getItem(MODE_KEY) === "flat") return { mode: "flat", auto: false };
  } catch {}
  if (document.documentElement.dataset.quality === "low") return { mode: "flat", auto: false };
  try {
    if (!document.createElement("canvas").getContext("webgl2")) return { mode: "flat", auto: true };
  } catch {
    return { mode: "flat", auto: true };
  }
  return { mode: "3d", auto: false };
}

export function Showroom({ isConfigured, covers, emblem }: { isConfigured: boolean; covers: string[]; emblem: string }) {
  const [mode, setMode] = useState<Mode>("pending");
  const [autoFlat, setAutoFlat] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [entered, setEntered] = useState(false);
  const [section, setSection] = useState<SectionId | null>(null);
  const [hover, setHover] = useState<SectionId | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const hotspotsRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<RoomEngine | null>(null);
  const sectionRef = useRef<SectionId | null>(null);

  // Chọn chế độ sau khi mount (không đọc được WebGL lúc render server)
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const d = decideMode();
      setMode(d.mode);
      setAutoFlat(d.auto);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  /** Mở / đóng một khu; ghi #hash để chia sẻ được và để nút Back đóng khung */
  const open = useCallback((id: SectionId | null, push = true) => {
    sectionRef.current = id;
    setSection(id);
    setMenuOpen(false);
    engineRef.current?.focus(id);
    if (push) {
      const url = id ? `#${id}` : window.location.pathname;
      if (id) history.pushState({ showroom: id }, "", url);
      else history.pushState({ showroom: null }, "", url);
    }
  }, []);

  // Dựng engine khi chế độ là 3D
  useEffect(() => {
    if (mode !== "3d" || !hostRef.current) return;
    let engine: RoomEngine | null = null;
    let cancelled = false;
    const phone = !window.matchMedia("(min-width: 64rem)").matches;
    const reduced = window.matchMedia(MQ.reduced).matches;
    void import("@/components/showroom/engine/room-engine").then(({ RoomEngine }) => {
      if (cancelled || !hostRef.current) return;
      try {
        engine = new RoomEngine(hostRef.current, {
          phone,
          reduced,
          covers,
          emblem,
          onProgress: setProgress,
          onReady: () => setReady(true),
          onPick: (id) => open(id),
          onHover: setHover,
        });
      } catch (error) {
        console.warn("Studio 3D không khởi tạo được, chuyển sang bản phẳng", error);
        setMode("flat");
        setAutoFlat(true);
        return;
      }
      engineRef.current = engine;
      if (process.env.NODE_ENV !== "production" || window.location.search.includes("debug-room")) {
        (window as unknown as { __aegisRoom?: RoomEngine }).__aegisRoom = engine;
      }
    });
    return () => {
      cancelled = true;
      engine?.dispose();
      engineRef.current = null;
    };
  }, [mode, covers, emblem, open]);

  // Đăng ký phần tử kim cương với engine
  useEffect(() => {
    const engine = engineRef.current;
    const nav = hotspotsRef.current;
    if (!engine || !nav) return;
    const map = new Map<SectionId, HTMLElement>();
    nav.querySelectorAll<HTMLElement>("[data-hotspot]").forEach((el) => map.set(el.dataset.hotspot as SectionId, el));
    engine.setHotspots(map);
  }, [ready, entered]);

  // Khung nội dung che một phần màn hình: báo engine để dịch khung hình
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (!section || !panelRef.current) {
      engine.setInsets(0, 0);
      return;
    }
    const measure = () => {
      const r = panelRef.current?.getBoundingClientRect();
      if (!r) return;
      const desktop = window.matchMedia("(min-width: 64rem)").matches;
      engine.setInsets(desktop ? window.innerWidth - r.left : 0, desktop ? 0 : window.innerHeight - r.top);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [section, ready]);

  // Vào trang có #hash → mở thẳng khu đó sau khi vào studio; Back / Forward của trình duyệt đóng / mở khung
  useEffect(() => {
    const fromHash = () => {
      const h = decodeURIComponent(window.location.hash.slice(1));
      return isSection(h) ? h : null;
    };
    const onPop = () => open(fromHash(), false);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [open]);

  /** Vào studio; địa chỉ có #khu thì mở thẳng khu đó */
  const enter = () => {
    setEntered(true);
    const h = decodeURIComponent(window.location.hash.slice(1));
    if (isSection(h)) open(h, false);
  };

  // Esc đóng khung; mở khung thì đưa focus vào khung
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && sectionRef.current) open(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  useEffect(() => {
    if (section) panelRef.current?.querySelector<HTMLElement>("[data-panel-title]")?.focus({ preventScroll: true });
  }, [section]);

  const onQuote = useCallback(
    (q: Quote) => {
      setQuote(q);
      if (mode === "3d") open("contact");
      else document.getElementById("khu-contact")?.scrollIntoView({ behavior: "smooth" });
    },
    [mode, open],
  );

  const useFlat = () => {
    try {
      localStorage.setItem(MODE_KEY, "flat");
    } catch {}
    setMode("flat");
    setAutoFlat(false);
  };
  const useRoom = () => {
    try {
      localStorage.removeItem(MODE_KEY);
    } catch {}
    setEntered(false);
    setReady(false);
    setProgress(0);
    setMode("3d");
  };

  const current = SECTIONS.find((x) => x.id === section) ?? null;
  const is3d = mode === "3d";

  return (
    <div className="showroom" data-surface="light" data-mode={mode} data-entered={entered || undefined} data-lenis-prevent={is3d || undefined}>
      <h1 className={is3d ? "sr-only" : "sr-flat-title"}>{showroom.hero.title}</h1>

      {is3d && (
        <>
          <div ref={hostRef} className="showroom-stage" aria-hidden />

          {/* Kim cương: là <button> thật (bàn phím, trình đọc màn hình); engine đặt vị trí mỗi khung hình */}
          <div ref={hotspotsRef} className="showroom-hotspots" aria-label={showroom.chrome.nav} role="group" hidden={!entered}>
            {SECTIONS.map((x) => (
              <button
                key={x.id}
                type="button"
                data-hotspot={x.id}
                data-hover={hover === x.id || undefined}
                className="showroom-hotspot"
                onClick={() => open(x.id)}
                data-cursor="link"
              >
                <span aria-hidden className="showroom-diamond" />
                <span className="showroom-hotspot-label">
                  <span className="label">{x.index}</span> {x.label}
                </span>
              </button>
            ))}
          </div>

          <div className="showroom-brand" hidden={!entered}>
            <AegisMark small className="showroom-brand-mark" />
            <span>
              <strong>{showroom.brand.name}</strong>
              <span className="label">{showroom.brand.line}</span>
            </span>
          </div>

          <nav className="showroom-nav" aria-label={showroom.chrome.nav} hidden={!entered}>
            {SECTIONS.map((x) => (
              <button key={x.id} type="button" aria-current={section === x.id || undefined} onClick={() => open(section === x.id ? null : x.id)} data-cursor="link">
                <span className="label">{x.index}</span> {x.label}
              </button>
            ))}
          </nav>

          <div className="showroom-top" hidden={!entered}>
            <button type="button" className="showroom-menu-btn" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)} data-cursor="link">
              <AegisMark small className="showroom-menu-mark" />
              <span className="sr-only">{showroom.chrome.menu}</span>
            </button>
            {menuOpen && (
              <div className="showroom-menu">
                <Link href="/">{showroom.chrome.home} →</Link>
                <button type="button" onClick={useFlat}>
                  {showroom.chrome.flat}
                </button>
                <p className="label">{showroom.chrome.demoNote}</p>
              </div>
            )}
          </div>

          {entered && !section && <p className="showroom-hint label">{showroom.boot.hint}</p>}

          {/* Khung nội dung (cửa sổ nổi bên phải; điện thoại: bottom sheet) */}
          {current && (
            <section ref={panelRef} className="showroom-panel" aria-labelledby="showroom-panel-title" data-section={current.id}>
              <div className="showroom-panel-bar">
                <span aria-hidden className="showroom-dots">
                  <i />
                  <i />
                  <i />
                </span>
                <p id="showroom-panel-title" className="label" tabIndex={-1} data-panel-title>
                  {current.index} · {current.label}
                </p>
                <button type="button" className="showroom-close" onClick={() => open(null)} aria-label={showroom.chrome.close} data-cursor="link">
                  ×
                </button>
              </div>
              <div className="showroom-panel-scroll" data-panel-scroll data-lenis-prevent>
                <SectionContent id={current.id} isConfigured={isConfigured} quote={quote} onQuote={onQuote} scrollMode="element" />
              </div>
            </section>
          )}
        </>
      )}

      {/* Màn khởi động (chỉ 3D); trước khi chọn chế độ cũng che trang để không chớp bản phẳng */}
      {(mode === "pending" || (is3d && !entered)) && (
        <div className="showroom-boot" role="status" aria-live="polite">
          <AegisMark className="showroom-boot-mark" />
          <p className="label">
            {showroom.boot.label} {Math.round(progress * 100)}%
          </p>
          <span className="showroom-boot-bar" aria-hidden>
            <span style={{ transform: `scaleX(${Math.max(0.04, progress)})` }} />
          </span>
          <button type="button" className="sr-cta showroom-enter" disabled={!ready} onClick={enter} data-cursor="link">
            {showroom.boot.enter} <span aria-hidden>→</span>
          </button>
          <button type="button" className="showroom-boot-skip label" onClick={useFlat}>
            {showroom.chrome.flat}
          </button>
        </div>
      )}

      {/* Bản phẳng: luôn có trong HTML server-render; ẩn khi đang 3D */}
      {!is3d && (
        <div className="showroom-flat">
          {autoFlat && <p className="sr-note sr-flat-notice">{showroom.chrome.flatNotice}</p>}
          <header className="sr-flat-hero">
            <AegisMark className="sr-flat-mark" />
            <p className="sr-lead">{showroom.hero.lead}</p>
            <nav aria-label={showroom.chrome.nav} className="sr-flat-nav">
              {SECTIONS.map((x) => (
                <a key={x.id} href={`#khu-${x.id}`}>
                  <span className="label">{x.index}</span> {x.label}
                </a>
              ))}
            </nav>
            <div className="sr-flat-links">
              <Link href="/">← {showroom.chrome.home}</Link>
              <button type="button" onClick={useRoom}>
                {showroom.chrome.room}
              </button>
            </div>
          </header>
          {SECTIONS.map((x) => (
            <section key={x.id} id={`khu-${x.id}`} className="sr-flat-section" aria-label={x.label}>
              <SectionContent id={x.id} isConfigured={isConfigured} quote={quote} onQuote={onQuote} scrollMode="window" />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
