import { isServiceZone, type ZoneId } from "@/config/space";
import { DOOR, LAB, SHELF, SHOWROOM, CORE, labX, showroomX } from "@/components/space/engine/layout";
import type { Vec3 } from "@/components/space/engine/layout";
import type { SceneManifest } from "@/components/space/engine/types";
import { roomByZone } from "@/components/space/plan";

export interface Rig {
  pos: Vec3;
  target: Vec3;
  fov: number;
  /** Bề rộng và chiều cao (mét, tại mặt phẳng đích) cần nằm gọn trong phần khung còn trống */
  span?: number;
  spanV?: number;
  /** Điện thoại: biên độ lắc yaw (rad) khi nhàn rỗi, làm cảnh "thở" */
  drift?: number;
  /** Điện thoại: camera trượt qua lại theo vector này (mét) khi nhàn rỗi, để khám phá cả dãy vật thể */
  pan?: Vec3;
}

const studio = roomByZone.studio;

/**
 * Điểm nhìn của camera cho từng khu / mục con (bố cục màn ngang). Màn hẹp hoặc khi khung nội dung che bớt khung hình
 * thì camera lùi ra theo `pullback` / `span`. Mọi vật trưng bày quay mặt về phía nam (+z) nên camera luôn đứng phía nam
 * và đủ cao để vượt đỉnh tường lưng (2,4 m) của dãy khu phía trước.
 */
export function rigFor(zone: ZoneId, focus: string | null, manifest: SceneManifest, phone = false): Rig {
  if (phone) {
    const rig = phoneRig(zone, focus, manifest);
    if (rig) return rig;
  }
  if (isServiceZone(zone)) {
    // Bốn khu dịch vụ: cùng một công thức góc nhìn (ngang hàng). Nhìn chéo từ trên cao (~47°) để vượt đỉnh tường lưng
    // 2,4 m của Studio phía nam, lệch nhẹ về phía lõi để thấy dòng năng lượng nối vào
    const r = roomByZone[zone];
    const toward = r.x > 0 ? -1 : 1;
    return { pos: [r.x + toward * 1.4, 7.4, r.z + 5.4], target: [r.x, 1.3, r.z - 0.1], fov: 40, span: 9.4, spanV: 5.8 };
  }
  switch (zone) {
    case "work": {
      const index = focus ? manifest.projects.findIndex((p) => p.slug === focus) : -1;
      if (index >= 0) {
        const x = showroomX(index);
        return { pos: [x + 0.5, 2.7, SHOWROOM.z + 3.2], target: [x, SHOWROOM.y - 0.05, SHOWROOM.z], fov: 34, span: 2.2, spanV: 1.6 };
      }
      return { pos: [0, 6.4, SHOWROOM.z + 8.6], target: [0, 1.2, SHOWROOM.z], fov: 44, span: 15, spanV: 4.2 };
    }
    case "studio": {
      const index = focus ? manifest.lab.findIndex((l) => l.id === focus) : -1;
      if (index >= 0) return { pos: [labX(index) + 0.4, 2.5, LAB.z + 3.0], target: [labX(index), LAB.capY, LAB.z], fov: 34, span: 2, spanV: 2.1 };
      return { pos: [studio.x, 4.6, studio.z + 8.4], target: [studio.x, 1.1, SHELF.z + 0.6], fov: 42, span: 12.8, spanV: 4 };
    }
    case "about":
      return { pos: [CORE.x, 4.6, 7.6], target: [CORE.x, 1.8, CORE.z], fov: 40, span: 6.4, spanV: 5 };
    case "contact":
      return { pos: [DOOR.x - 0.4, 3.0, DOOR.z + 8.0], target: [DOOR.x, 1.2, DOOR.z], fov: 36, span: 3.6, spanV: 3.4 };
    default:
      return { pos: [0, 28, 31], target: [0, 0, 0.4], fov: 34, span: 24, spanV: 22 };
  }
}

/** Điểm nhìn mở màn: từ trên cao nhìn thẳng xuống mặt bằng */
export const INTRO_RIG: Rig = { pos: [0, 40, 0.12], target: [0, 0, 0.1], fov: 34 };

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

/**
 * Điểm nhìn riêng cho điện thoại dọc: cảnh chiếm gần cả màn hình nên camera ÁP SÁT vật thể (như đứng trong xưởng),
 * thay vì lùi ra xem cả sa bàn. Hub và các dãy vật thể có `drift`/`pan` để tự trôi nhẹ khi người dùng chưa chạm.
 */
function phoneRig(zone: ZoneId, focus: string | null, manifest: SceneManifest): Rig | undefined {
  if (isServiceZone(zone)) {
    const r = roomByZone[zone];
    const toward = r.x > 0 ? -1 : 1;
    return { pos: [r.x + toward * 0.9, 6.6, r.z + 4.4], target: [r.x, 1.5, r.z], fov: 50, span: 6.4, spanV: 5, drift: 0.12 };
  }
  switch (zone) {
    case "hub":
      return { pos: [0, 14, 18], target: [0, 0, 0.8], fov: 52, drift: 0.32 };
    case "work": {
      const index = focus ? manifest.projects.findIndex((p) => p.slug === focus) : -1;
      if (index >= 0) {
        const x = showroomX(index);
        return { pos: [x + 0.4, 3.0, SHOWROOM.z + 2.5], target: [x, SHOWROOM.y - 0.05, SHOWROOM.z], fov: 44, span: 1.95, spanV: 1.3, drift: 0.05 };
      }
      return { pos: [0, 4.6, SHOWROOM.z + 5.9], target: [0, 1.25, SHOWROOM.z], fov: 50, pan: [5.6, 0, 0], drift: 0.08 };
    }
    case "studio": {
      const index = focus ? manifest.lab.findIndex((l) => l.id === focus) : -1;
      if (index >= 0) return { pos: [labX(index) + 0.3, 2.3, LAB.z + 2.6], target: [labX(index), LAB.capY - 0.05, LAB.z], fov: 40, span: 1.7, spanV: 1.9, drift: 0.06 };
      return { pos: [studio.x, 3.6, studio.z + 6.6], target: [studio.x, 1.15, SHELF.z + 0.6], fov: 50, pan: [4.6, 0, 0], drift: 0.08 };
    }
    case "about":
      return { pos: [CORE.x, 4.2, 6.4], target: [CORE.x, 1.9, CORE.z], fov: 48, span: 4.6, spanV: 4.6, drift: 0.18 };
    default:
      return undefined;
  }
}
