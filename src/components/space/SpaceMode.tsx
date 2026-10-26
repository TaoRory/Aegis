"use client";

import { useFactory } from "@/components/space/factory-context";
import { setSpaceMode } from "@/components/space/SceneCanvas";
import { useSpace } from "@/components/space/useSpace";

/**
 * Nút đổi Bản 3D / Bản phẳng (phím B nằm ở SpaceKeys). Lựa chọn "phẳng" của người dùng được nhớ (localStorage),
 * chọn lại 3D thì bỏ nhớ.
 */
export function SpaceMode({ className = "space-home label" }: { className?: string }) {
  const mode = useSpace("mode");
  const { ui } = useFactory();
  return (
    <button type="button" className={className} aria-pressed={mode === "3d"} onClick={() => setSpaceMode(mode === "3d" ? "flat" : "3d")}>
      {mode === "3d" ? ui.hud.flat : ui.hud.threeD}
    </button>
  );
}

/** Thông báo khi Xưởng tự chuyển sang bản phẳng (thiếu WebGL2, máy yếu, saveData…) */
export function SpaceNotice() {
  const reason = useSpace("flatReason");
  if (!reason) return null;
  return (
    <p role="status" className="space-notice label">
      {reason}
    </p>
  );
}
