"use client";

import { Suspense, useEffect, type ReactNode } from "react";

import type { Variant } from "@/config/space";
import type { FactoryUi } from "@/content/factory/types";

import { FactoryProvider } from "@/components/space/factory-context";
import { FlatMap } from "@/components/space/FlatMap";
import { Hotspots } from "@/components/space/Hotspots";
import { RouteSync } from "@/components/space/RouteSync";
import { DragHint } from "@/components/space/DragHint";
import { SceneCanvas } from "@/components/space/SceneCanvas";
import { SpaceHud } from "@/components/space/SpaceHud";
import { SpaceIntro } from "@/components/space/SpaceIntro";
import { SpaceKeys } from "@/components/space/SpaceKeys";
import { getLenis } from "@/lib/motion";

/**
 * Vỏ cố định của Xưởng Aegis: nằm ở layout (route group (spatial)/[lang]/factory) nên KHÔNG bị dựng lại khi đổi khu.
 * - Đặt html[data-space="on"] (khóa cuộn cửa sổ) và dừng Lenis: nội dung cuộn trong từng Panel bằng cuộn gốc.
 * - Lớp dưới: lưới bản vẽ + mặt bằng phẳng (SVG). Lớp trên: HUD. Giữa: <main> chứa Panel của trang hiện tại.
 * - Server và lần render đầu của client giống hệt nhau (bản phẳng, khu mặc định) → không lệch hydration.
 */
export function SpaceShell({ ui, variant, children }: { ui: FactoryUi; variant: Variant; children: ReactNode }) {
  // Ngôn ngữ của trang: root layout của site là tiếng Việt; Factory tiếng Anh đặt lại html[lang] (script đầu trang
  // làm việc này từ khung hình đầu, ở đây đồng bộ khi chuyển ngôn ngữ phía client)
  useEffect(() => {
    const root = document.documentElement;
    root.lang = ui.lang;
    return () => {
      root.lang = "vi";
    };
  }, [ui.lang]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.space = "on";
    getLenis()?.stop();
    return () => {
      delete root.dataset.space;
      delete root.dataset.spaceBoot;
      getLenis()?.start();
    };
  }, []);

  return (
    <FactoryProvider ui={ui} variant={variant}>
    <div className="space-root" data-surface="dark" lang={ui.lang}>
      <Suspense fallback={null}>
        <RouteSync />
      </Suspense>
      <a
        href="#noi-dung"
        className="label fixed top-3 left-3 z-[100] -translate-y-24 bg-accent px-4 py-3 text-on-accent transition-transform focus:translate-y-0"
      >
        {ui.skip}
      </a>
      <div aria-hidden className="blueprint-grid space-grid" />
      <FlatMap />
      <SceneCanvas />
      <Hotspots />
      <DragHint />
      <SpaceHud />
      <SpaceKeys />
      <main id="noi-dung" tabIndex={-1} className="space-main">
        {children}
      </main>
      <SpaceIntro />
    </div>
    </FactoryProvider>
  );
}
