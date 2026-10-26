import { spaceCopy } from "@/content/space";
import type { SpaceMode } from "@/components/space/space-store";

export const SPACE_MODE_KEY = "aegis-space-mode";

export interface ModeDecision {
  mode: SpaceMode;
  /** Thông báo hiển thị khi tự chuyển sang bản phẳng; null nếu do người dùng chọn hoặc đang 3D */
  reason: string | null;
}

/**
 * Chọn 3D hay bản phẳng khi vào Xưởng. Bản phẳng khi: người dùng đã chọn bản phẳng, chất lượng thấp trong Cài đặt,
 * thiết bị báo tiết kiệm dữ liệu / ít RAM, hoặc không có WebGL2. Chỉ trường hợp tự động mới kèm thông báo.
 */
export function detectMode(): ModeDecision {
  const root = document.documentElement;
  try {
    if (localStorage.getItem(SPACE_MODE_KEY) === "flat") return { mode: "flat", reason: null };
  } catch {
    /* bỏ qua: coi như chưa chọn */
  }
  if (root.dataset.quality === "low") return { mode: "flat", reason: null };
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData || (nav.deviceMemory !== undefined && nav.deviceMemory <= 2)) return { mode: "flat", reason: spaceCopy.hud.flatNotice };
  try {
    const probe = document.createElement("canvas");
    if (!probe.getContext("webgl2")) return { mode: "flat", reason: spaceCopy.hud.flatNotice };
  } catch {
    return { mode: "flat", reason: spaceCopy.hud.flatNotice };
  }
  return { mode: "3d", reason: null };
}

export function rememberMode(mode: SpaceMode) {
  try {
    if (mode === "flat") localStorage.setItem(SPACE_MODE_KEY, "flat");
    else localStorage.removeItem(SPACE_MODE_KEY);
  } catch {
    /* bỏ qua */
  }
}
