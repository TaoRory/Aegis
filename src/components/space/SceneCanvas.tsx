"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { detectMode, rememberMode } from "@/components/space/capability";
import { engineRef } from "@/components/space/engine-ref";
import type { SceneManifest } from "@/components/space/engine/types";
import { useFactory } from "@/components/space/factory-context";
import { hrefForId } from "@/components/space/hotspot-data";
import { rooms } from "@/components/space/plan";
import { hasZone, type Variant } from "@/config/space";
import { spaceStore } from "@/components/space/space-store";
import { useSpace } from "@/components/space/useSpace";
import type { FactoryUi } from "@/content/factory/types";
import previews from "@/content/project-previews.json";
import { projects } from "@/content/projects";
import templatePreviews from "@/content/template-previews.json";
import { templates } from "@/content/templates";
import { MQ } from "@/lib/motion";

type Previews = Record<string, { cover: { src: string } }>;

function buildManifest(ui: FactoryUi, variant: Variant): SceneManifest {
  const p = previews as Previews;
  const t = templatePreviews as Previews;
  return {
    showcase: variant === "web",
    projects: projects.map((x) => ({ slug: x.slug, name: x.name, cover: p[x.slug]?.cover.src ?? "" })),
    templates: templates.map((x) => ({ slug: x.slug, name: x.name, cover: t[x.slug]?.cover.src ?? "", stage: x.stage, accent: x.palette[2] ?? x.stageInk })),
    zones: Object.fromEntries(rooms.filter((r) => hasZone(r.zone, variant)).map((r) => [r.zone, { name: ui.zones[r.zone].name, tag: ui.zones[r.zone].tag }])) as SceneManifest["zones"],
  };
}

/** Khoảng chừa cho khung nội dung / HUD, tính theo CSS của space.css (px) */
/** Chiều cao sheet ở nấc "nhô" và vùng thanh điều hướng dưới đáy (rem), khớp space.css */
const PEEK_REM = 6;
const NAV_REM = 4.6;

function computeInsets() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const insets = { left: 0, right: 0, top: 56, bottom: 72 };
  // Route cũ được Next giữ ẩn (display: none) nên phải bỏ qua phần tử không hiển thị
  const visible = (selector: string) => [...document.querySelectorAll<HTMLElement>(selector)].find((el) => el.getClientRects().length > 0) ?? null;
  const panel = visible(".space-panel");
  const hub = visible(".space-hub");
  const desktop = vw >= 1024;
  if (panel) {
    if (desktop) insets.right = vw - panel.getBoundingClientRect().left;
    else {
      // Chiều cao theo nấc (không đo trực tiếp: sheet đang chạy transition chiều cao khi đổi nấc)
      const snap = panel.dataset.snap;
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const height = snap === "peek" ? PEEK_REM * rem : snap === "low" ? vh * 0.3 : snap === "full" ? vh - 136 : vh * 0.52;
      insets.bottom = height + NAV_REM * rem;
    }
  } else if (hub && document.documentElement.dataset.spaceLive !== "on") {
    const rect = hub.getBoundingClientRect();
    if (desktop) insets.left = rect.right;
    else insets.bottom = vh - rect.top;
  }
  return insets;
}

/**
 * Cầu nối React ↔ engine 3D: chọn chế độ (3D / bản phẳng), tải engine lười sau khi trang rảnh, gắn canvas vào host,
 * đồng bộ route → camera, khung nội dung → độ lệch tâm, paused → tạm dừng. Engine là singleton nên đổi route không dựng lại.
 */
export function SceneCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const mode = useSpace("mode");
  const paused = useSpace("paused");
  const zone = useSpace("zone");
  const focus = useSpace("focus");
  const { ui, variant } = useFactory();
  // Bản ghi mới nhất của chữ giao diện và bản Factory, đọc trong callback của engine (không làm effect chạy lại)
  const uiRef = useRef(ui);
  const variantRef = useRef(variant);
  useEffect(() => {
    uiRef.current = ui;
    variantRef.current = variant;
  }, [ui, variant]);

  // 1) Chọn chế độ khi mount
  useEffect(() => {
    const decision = detectMode(uiRef.current.hud.flatNotice);
    spaceStore.set("flatReason", decision.reason);
    spaceStore.set("mode", decision.mode);
    if (decision.mode === "3d") spaceStore.set("bootProgress", 0);
    else spaceStore.set("bootProgress", -1);
  }, []);

  // 2) Dựng / gắn engine khi ở chế độ 3D
  useEffect(() => {
    const host = hostRef.current;
    if (mode !== "3d" || !host) return;
    let cancelled = false;
    let observer: MutationObserver | null = null;
    let onResize: (() => void) | null = null;
    const root = document.documentElement;

    const attach = async () => {
      engineRef.cancelDispose();
      // Engine còn lại từ bản Factory khác (trung tính ↔ web): bỏ đi và dựng lại cho đúng các khu của bản này
      const stale = engineRef.current;
      if (stale && !stale.isDisposed && stale.showcase !== (variantRef.current === "web")) {
        stale.dispose();
        engineRef.set(null);
        engineRef.setCreating(null);
      }
      try {
        if (!engineRef.current || engineRef.current.isDisposed) {
          if (!engineRef.creating) {
            const creating = import("@/components/space/engine/space-engine").then(({ SpaceEngine }) =>
              SpaceEngine.create({
                manifest: buildManifest(uiRef.current, variantRef.current),
                mobile: window.innerWidth < 768,
                reduced: window.matchMedia(MQ.reduced).matches,
                onProgress: (p) => spaceStore.set("bootProgress", p),
                onHover: (id) => spaceStore.set("hover", id),
                onDrag: () => spaceStore.set("dragged", true),
                onPick: (id) => {
                  const el = document.querySelector<HTMLElement>(`[data-hotspot="${id}"]`);
                  if (el) el.click();
                  else {
                    const href = hrefForId(id, uiRef.current.lang, variantRef.current);
                    if (href) router.push(href);
                  }
                },
                onContextLost: () => {
                  spaceStore.set("flatReason", uiRef.current.hud.contextLost);
                  spaceStore.set("mode", "flat");
                },
              }),
            );
            engineRef.setCreating(creating);
          }
          const engine = await engineRef.creating!;
          engineRef.set(engine);
        }
      } catch {
        engineRef.setCreating(null);
        if (!cancelled) {
          spaceStore.set("flatReason", uiRef.current.hud.noWebgl);
          spaceStore.set("mode", "flat");
        }
        return;
      }
      const engine = engineRef.current;
      if (cancelled || !engine) return;
      engine.attach(host);
      const { zone: z, focus: f } = spaceStore.get();
      engine.setInsets(computeInsets());
      engine.setRoute(z, f, true);
      spaceStore.set("ready", true);

      const start = () => {
        if (cancelled) return;
        root.dataset.spaceLive = "on";
        engine.setInsets(computeInsets()); // thẻ tổng quan đã ẩn khi 3D lên sóng: bỏ khoảng chừa của nó
        if (engine.hasPlayedIntro) {
          // Gắn lại engine đã chạy (đổi 3D/phẳng, quay lại từ trang mẫu): bỏ qua màn mở đầu
          spaceStore.set("staged", true);
          return;
        }
        const afterIntro = () => {
          spaceStore.set("staged", true);
          // Rảnh rồi mới nạp ảnh các mẫu giao diện (8 ảnh), để không tranh băng thông với phần khởi động
          window.setTimeout(() => void engine.loadShelf(), 2500);
        };
        if (root.dataset.spaceBoot === "playing") {
          // Intro AEGIS: cảnh đã chạy phía sau các ô chữ; SpaceIntro điều khiển tiến độ bằng thao tác cuộn rồi báo bootPhase = done
          engine.beginIntroScrub();
          const unsub = spaceStore.subscribe(() => {
            if (spaceStore.get().bootPhase === "done") {
              unsub();
              engine.finishIntroScrub();
              afterIntro();
            }
          });
          return;
        }
        // Link sâu (không có intro): mở đầu ngắn để nội dung không phải chờ
        engine.playIntro(true, afterIntro);
      };
      start();

      // Khung nội dung xuất hiện / đổi nấc → tính lại độ lệch tâm
      const main = document.getElementById("noi-dung");
      if (main) {
        observer = new MutationObserver(() => engine.setInsets(computeInsets()));
        observer.observe(main, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-snap"] });
      }
      onResize = () => engine.setInsets(computeInsets());
      window.addEventListener("resize", onResize);

      if (new URLSearchParams(window.location.search).has("debug-space")) {
        (window as unknown as { __aegisSpace: unknown }).__aegisSpace = { info: () => engine.debugInfo(), engine };
      }
    };
    void attach();

    return () => {
      cancelled = true;
      observer?.disconnect();
      if (onResize) window.removeEventListener("resize", onResize);
      delete root.dataset.spaceLive;
      spaceStore.set("ready", false);
      spaceStore.set("staged", false);
      engineRef.current?.detach();
      engineRef.scheduleDispose(30000);
    };
  }, [mode, router]);

  // 3) Route → camera
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setInsets(computeInsets(), false); // khung nội dung của route mới đã hiển thị: cập nhật chỗ chừa trước khi bay
    engine.setRoute(zone, focus, false);
  }, [zone, focus]);

  // 4) Tạm dừng
  useEffect(() => {
    engineRef.current?.setPaused(paused);
  }, [paused]);

  return <div ref={hostRef} aria-hidden className="space-canvas-host" />;
}

/** Người dùng đổi 3D ↔ bản phẳng bằng nút / phím B */
export function setSpaceMode(next: "flat" | "3d") {
  rememberMode(next);
  spaceStore.set("flatReason", null);
  spaceStore.set("mode", next);
  spaceStore.set("bootProgress", next === "3d" ? 0 : -1);
}
