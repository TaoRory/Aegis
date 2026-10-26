"use client";

import { Suspense, useEffect, type ReactNode } from "react";

import { FlatMap } from "@/components/space/FlatMap";
import { Hotspots } from "@/components/space/Hotspots";
import { RouteSync } from "@/components/space/RouteSync";
import { DragHint } from "@/components/space/DragHint";
import { SceneCanvas } from "@/components/space/SceneCanvas";
import { SpaceBoot } from "@/components/space/SpaceBoot";
import { SpaceHud } from "@/components/space/SpaceHud";
import { SpaceKeys } from "@/components/space/SpaceKeys";
import { getLenis } from "@/lib/motion";

/**
 * Vỏ cố định của Xưởng Aegis: nằm ở layout (route group (spatial)/factory) nên KHÔNG bị dựng lại khi đổi khu.
 * - Đặt html[data-space="on"] (khóa cuộn cửa sổ) và dừng Lenis: nội dung cuộn trong từng Panel bằng cuộn gốc.
 * - Lớp dưới: lưới bản vẽ + mặt bằng phẳng (SVG). Lớp trên: HUD. Giữa: <main> chứa Panel của trang hiện tại.
 * - Server và lần render đầu của client giống hệt nhau (bản phẳng, khu mặc định) → không lệch hydration.
 */
export function SpaceShell({ children }: { children: ReactNode }) {
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
    <div className="space-root" data-surface="dark">
      <Suspense fallback={null}>
        <RouteSync />
      </Suspense>
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
      <SpaceBoot />
    </div>
  );
}
