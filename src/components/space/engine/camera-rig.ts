import { isServiceZone, type ZoneId } from "@/config/space";
import { CAROUSEL, CORE, DOOR, hallSlot, SHOWROOM } from "@/components/space/engine/layout";
import type { Vec3 } from "@/components/space/engine/layout";
import type { SceneManifest } from "@/components/space/engine/types";
import { HALL, roomByZone } from "@/components/space/plan";

export interface Rig {
  pos: Vec3;
  target: Vec3;
  fov: number;
  /** Bề rộng và chiều cao (mét, tại mặt phẳng đích) cần nằm gọn trong phần khung còn trống */
  span?: number;
  spanV?: number;
}

/**
 * Điểm nhìn mặc định của camera cho từng khu / mục con (bố cục màn ngang). Người dùng tự xoay / zoom / dịch được từ đó (OrbitControls);
 * màn hẹp hoặc khi khung nội dung che bớt khung hình thì camera lùi ra theo `span` / `pullback`.
 * Camera luôn đứng phía lõi hoặc phía nam và đủ cao để vượt giàn, vách (2,4–3,4 m) của các khu phía trước.
 */
export function rigFor(zone: ZoneId, focus: string | null, manifest: SceneManifest, phone = false): Rig {
  const k = phone ? 0.82 : 1; // điện thoại: áp sát hơn
  if (isServiceZone(zone)) {
    // Bốn trạm: cùng một công thức góc nhìn (ngang hàng), nhìn từ phía nam, hơi lệch về phía lõi để thấy dòng năng lượng nối vào
    const r = roomByZone[zone];
    const toward = r.x > 0 ? -1 : 1;
    return { pos: [r.x + toward * 1.6 * k, 6.4 * k + 0.4, r.z + 7.2 * k], target: [r.x, 1.5, r.z - 0.2], fov: phone ? 48 : 40, span: phone ? 8.6 : 9.6, spanV: 6 };
  }
  switch (zone) {
    case "work": {
      const index = focus ? manifest.projects.findIndex((p) => p.slug === focus) : -1;
      if (index >= 0) {
        const s = hallSlot(index);
        const side = phone ? 0.3 : 0.55;
        const dist = phone ? 2.9 : 3.3;
        return {
          pos: [s.x + s.nx * dist - s.nz * side, 2.5, s.z + s.nz * dist + s.nx * side],
          target: [s.x, SHOWROOM.y - 0.05, s.z],
          fov: phone ? 42 : 34,
          span: phone ? 2.1 : 2.3,
          spanV: 1.5,
        };
      }
      // Từ phía lõi nhìn ra cung 7 màn hình
      return { pos: [0, 11, 5.5], target: [0, 1.6, -HALL.r + 1], fov: phone ? 56 : 46, span: 25, spanV: 8 };
    }
    case "studio": {
      const s = roomByZone.studio;
      return { pos: [s.x + 1.2, phone ? 6.2 : 7.2, s.z - 8.8], target: [s.x, CAROUSEL.y, s.z], fov: phone ? 48 : 40, span: 9.6, spanV: 5 };
    }
    case "about":
      return { pos: [0, 5.8, 11], target: [0, CORE.holoY - 0.3, 0], fov: phone ? 48 : 40, span: 8.6, spanV: 7.2 };
    case "contact":
      return { pos: [DOOR.x - 0.8, phone ? 5.4 : 6.2, DOOR.z - 7.6], target: [DOOR.x, 1.3, DOOR.z + 0.6], fov: phone ? 48 : 40, span: 7.6, spanV: 5 };
    default:
      return { pos: [0, 31, 34], target: [0, 0, 1.2], fov: 35, span: 40, spanV: 26 };
  }
}

/** Điểm nhìn mở màn: từ trên cao nhìn thẳng xuống mặt bằng */
export const INTRO_RIG: Rig = { pos: [0, 52, 0.12], target: [0, 0, 1], fov: 34 };

/**
 * Kéo camera lùi khỏi mục tiêu khi vùng nhìn thấy được hẹp (điện thoại dọc, khung nội dung chiếm một nửa).
 * `effAspect` = chiều rộng / chiều cao của phần còn trống.
 */
export function pullback(effAspect: number): number {
  return effAspect < 1.25 ? 1 + (1.25 - effAspect) * 1.15 : 1;
}

/**
 * Hệ số lùi để `span` mét nằm gọn trong phần khung còn trống (`freePx` px theo một chiều, của khung `height` px), tính từ
 * khoảng cách gốc `dist` và góc nhìn dọc `fov`. Giới hạn trần để màn hẹp không lùi xa tới mức vật thể thành chấm.
 */
export function fitPullback(span: number, dist: number, fov: number, freePx: number, height: number): number {
  const visible = 2 * dist * Math.tan((fov * Math.PI) / 360) * (freePx / height);
  return Math.min(2.6, Math.max(1, span / visible));
}
