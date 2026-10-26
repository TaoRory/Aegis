"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { detectMode, rememberMode } from "@/components/space/capability";
import { engineRef } from "@/components/space/engine-ref";
import type { SceneManifest } from "@/components/space/engine/types";
import { hrefForId } from "@/components/space/hotspot-data";
import { spaceStore } from "@/components/space/space-store";
import { useSpace } from "@/components/space/useSpace";
import { labItems } from "@/content/lab";
import previews from "@/content/project-previews.json";
import { projects } from "@/content/projects";
import { services } from "@/content/services";
import templatePreviews from "@/content/template-previews.json";
import { templates } from "@/content/templates";
import { MQ } from "@/lib/motion";

type Previews = Record<string, { cover: { src: string } }>;

function buildManifest(): SceneManifest {
  const p = previews as Previews;
  const t = templatePreviews as Previews;
  return {
    projects: projects.map((x) => ({ slug: x.slug, name: x.name, cover: p[x.slug]?.cover.src ?? "" })),
    templates: templates.map((x) => ({ slug: x.slug, name: x.name, cover: t[x.slug]?.cover.src ?? "", stage: x.stage, accent: x.palette[2] ?? x.stageInk })),
    lab: labItems.map((x) => ({ id: x.id, name: x.name })),
    services: services.map((x) => ({ id: x.id, shortTitle: x.shortTitle })),
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
  } else if (hub) {
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

  // 1) Chọn chế độ khi mount
  useEffect(() => {
    const decision = detectMode();
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
      try {
        if (!engineRef.current || engineRef.current.isDisposed) {
          if (!engineRef.creating) {
            const creating = import("@/components/space/engine/space-engine").then(({ SpaceEngine }) =>
              SpaceEngine.create({
                manifest: buildManifest(),
                mobile: window.innerWidth < 768,
                reduced: window.matchMedia(MQ.reduced).matches,
                onProgress: (p) => spaceStore.set("bootProgress", p),
                onHover: (id) => spaceStore.set("hover", id),
                onDrag: () => spaceStore.set("dragged", true),
                onPick: (id) => {
                  const el = document.querySelector<HTMLElement>(`[data-hotspot="${id}"]`);
                  if (el) el.click();
                  else {
                    const href = hrefForId(id);
                    if (href) router.push(href);
                  }
                },
                onContextLost: () => {
                  spaceStore.set("flatReason", "Trình duyệt vừa mất bối cảnh đồ họa, Xưởng chuyển sang bản phẳng.");
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
          spaceStore.set("flatReason", "Không dựng được cảnh 3D trên thiết bị này, Xưởng đang hiển thị bản phẳng.");
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
        if (engine.hasPlayedIntro) {
          // Gắn lại engine đã chạy (đổi 3D/phẳng, quay lại từ trang mẫu): bỏ qua màn mở đầu
          spaceStore.set("staged", true);
          return;
        }
        // Link sâu (không có màn khởi động): mở đầu ngắn hơn để nội dung không phải chờ
        engine.playIntro(root.dataset.spaceBoot !== "playing", () => {
          spaceStore.set("staged", true);
          // Rảnh rồi mới nạp ảnh kệ mẫu (8 ảnh), để không tranh băng thông với phần khởi động
          window.setTimeout(() => void engine.loadShelf(), 2500);
        });
      };
      if (root.dataset.spaceBoot === "playing") {
        const unsub = spaceStore.subscribe(() => {
          if (spaceStore.get().bootPhase === "done") {
            unsub();
            start();
          }
        });
      } else start();

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
