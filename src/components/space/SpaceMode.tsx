"use client";

import { useEffect } from "react";

import { setSpaceMode } from "@/components/space/SceneCanvas";
import { spaceStore } from "@/components/space/space-store";
import { useSpace } from "@/components/space/useSpace";
import { spaceCopy } from "@/content/space";

/**
 * Nút đổi Bản 3D / Bản phẳng (và phím B) + thông báo khi Xưởng tự chuyển sang bản phẳng.
 * Lựa chọn "phẳng" của người dùng được nhớ (localStorage), chọn lại 3D thì bỏ nhớ.
 */
export function SpaceMode() {
  const mode = useSpace("mode");
  const reason = useSpace("flatReason");

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.key.toLowerCase() !== "b") return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true'], main, [role='dialog']")) return;
      setSpaceMode(spaceStore.get().mode === "3d" ? "flat" : "3d");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button type="button" className="space-home label" aria-pressed={mode === "3d"} onClick={() => setSpaceMode(mode === "3d" ? "flat" : "3d")}>
        {mode === "3d" ? spaceCopy.hud.flat : spaceCopy.hud.threeD}
      </button>
      {reason && (
        <p role="status" className="space-notice label">
          {reason}
        </p>
      )}
    </>
  );
}
