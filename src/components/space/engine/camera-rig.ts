import type { ZoneId } from "@/config/space";
import { DOOR, JOURNAL, LAB, SHELF, SHOWROOM, CORE, DRAFT, labZ, showroomX } from "@/components/space/engine/layout";
import type { SceneManifest, } from "@/components/space/engine/types";
import type { Vec3 } from "@/components/space/engine/layout";

export interface Rig {
  pos: Vec3;
  target: Vec3;
  fov: number;
  /** Bề rộng (mét, tại mặt phẳng đích) cần nằm gọn trong phần khung còn trống */
  span?: number;
}

/**
 * Điểm nhìn của camera cho từng khu / mục con (bố cục màn ngang). Màn hẹp hoặc khi khung nội dung che bớt khung hình
 * thì camera lùi ra theo `pullback`. Chiều cao và hướng nhìn chọn để vật trưng bày (quay mặt về +z) luôn thấy chính diện.
 */
export function rigFor(zone: ZoneId, focus: string | null, manifest: SceneManifest): Rig {
  switch (zone) {
    case "trung-bay": {
      const index = focus ? manifest.projects.findIndex((p) => p.slug === focus) : -1;
      if (index >= 0) {
        const x = showroomX(index);
        return { pos: [x + 0.5, 2.2, SHOWROOM.z + 3.2], target: [x, SHOWROOM.y - 0.05, SHOWROOM.z], fov: 34 };
      }
      return { pos: [0, 8.4, 6.8], target: [0, 1.25, SHOWROOM.z], fov: 44, span: 17.6 };
    }
    case "thi-nghiem": {
      const index = focus ? manifest.lab.findIndex((l) => l.id === focus) : -1;
      if (index >= 0) return { pos: [LAB.x - 2.9, 2.6, labZ(index) + 3.0], target: [LAB.x, LAB.capY, labZ(index)], fov: 32 };
      return { pos: [LAB.x - 5.0, 6.4, 6.6], target: [LAB.x, 0.95, LAB.z], fov: 40 };
    }
    case "mau-giao-dien":
      return { pos: [SHELF.x, 4.7, 12.6], target: [SHELF.x, 1.2, SHELF.z], fov: 44 };
    case "dich-vu":
      return { pos: [DRAFT.x + 4.4, 5.6, DRAFT.z + 5.4], target: [DRAFT.x, 0.8, DRAFT.z], fov: 40 };
    case "ve-aegis":
      return { pos: [CORE.x, 4.4, 7.3], target: [CORE.x, 1.75, CORE.z], fov: 38 };
    case "nhat-ky":
      return { pos: [JOURNAL.x, 3.5, JOURNAL.z + 6.6], target: [JOURNAL.x, 0.85, JOURNAL.z], fov: 36 };
    case "lien-he":
      return { pos: [DOOR.x, 2.9, DOOR.z + 8.3], target: [DOOR.x, 1.2, DOOR.z], fov: 36 };
    default:
      return { pos: [0, 25, 28], target: [0, 0, 0.6], fov: 34 };
  }
}

/** Điểm nhìn mở màn: từ trên cao nhìn thẳng xuống mặt bằng */
export const INTRO_RIG: Rig = { pos: [0, 34, 0.12], target: [0, 0, 0.1], fov: 32 };

/**
 * Kéo camera lùi khỏi mục tiêu khi vùng nhìn thấy được hẹp (điện thoại dọc, khung nội dung chiếm một nửa).
 * `effAspect` = chiều rộng / chiều cao của phần còn trống.
 */
export function pullback(effAspect: number): number {
  return effAspect < 1.25 ? 1 + (1.25 - effAspect) * 1.15 : 1;
}

/**
 * Hệ số lùi để `span` mét nằm gọn trong phần khung còn trống (`freeW` px của khung `height` px), tính từ khoảng cách
 * gốc `dist` và góc nhìn dọc `fov`. Giới hạn trần để màn hẹp không lùi xa tới mức vật thể thành chấm.
 */
export function fitPullback(span: number, dist: number, fov: number, freeW: number, height: number): number {
  const visible = 2 * dist * Math.tan((fov * Math.PI) / 360) * (freeW / height);
  return Math.min(2.3, Math.max(1, span / visible));
}
