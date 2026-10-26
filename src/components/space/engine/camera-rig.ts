import type { ZoneId } from "@/config/space";
import { DOOR, JOURNAL, LAB, SHELF, SHOWROOM, CORE, DRAFT, labZ, showroomX } from "@/components/space/engine/layout";
import type { SceneManifest, } from "@/components/space/engine/types";
import type { Vec3 } from "@/components/space/engine/layout";

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

/**
 * Điểm nhìn của camera cho từng khu / mục con (bố cục màn ngang). Màn hẹp hoặc khi khung nội dung che bớt khung hình
 * thì camera lùi ra theo `pullback`. Chiều cao và hướng nhìn chọn để vật trưng bày (quay mặt về +z) luôn thấy chính diện.
 */
export function rigFor(zone: ZoneId, focus: string | null, manifest: SceneManifest, phone = false): Rig {
  if (phone) {
    const rig = phoneRig(zone, focus, manifest);
    if (rig) return rig;
  }
  switch (zone) {
    case "trung-bay": {
      const index = focus ? manifest.projects.findIndex((p) => p.slug === focus) : -1;
      if (index >= 0) {
        const x = showroomX(index);
        // Góc nhìn đủ cao để khi lùi ra (màn hẹp) vẫn nhìn qua đỉnh tường phòng kế bên (cao 2,4 m)
      return { pos: [x + 0.5, 3.2, SHOWROOM.z + 3.0], target: [x, SHOWROOM.y - 0.05, SHOWROOM.z], fov: 34, span: 2.8, spanV: 2.0 };
      }
      return { pos: [0, 8.4, 6.8], target: [0, 1.25, SHOWROOM.z], fov: 44, span: 17.6, spanV: 4.4 };
    }
    case "thi-nghiem": {
      const index = focus ? manifest.lab.findIndex((l) => l.id === focus) : -1;
      if (index >= 0) return { pos: [LAB.x - 2.9, 2.6, labZ(index) + 3.0], target: [LAB.x, LAB.capY, labZ(index)], fov: 32, span: 2.4, spanV: 2.4 };
      return { pos: [LAB.x - 5.0, 6.4, 6.6], target: [LAB.x, 0.95, LAB.z], fov: 40, span: 5.8, spanV: 3.6 };
    }
    case "mau-giao-dien":
      return { pos: [SHELF.x, 4.7, 12.6], target: [SHELF.x, 1.2, SHELF.z], fov: 44, span: 8.8, spanV: 3.6 };
    case "dich-vu":
      return { pos: [DRAFT.x + 4.4, 5.6, DRAFT.z + 5.4], target: [DRAFT.x, 0.8, DRAFT.z], fov: 40, span: 5.4, spanV: 3.4 };
    case "ve-aegis":
      return { pos: [CORE.x, 4.4, 7.3], target: [CORE.x, 1.75, CORE.z], fov: 38, span: 6, spanV: 4.8 };
    case "nhat-ky":
      return { pos: [JOURNAL.x, 3.5, JOURNAL.z + 6.6], target: [JOURNAL.x, 0.85, JOURNAL.z], fov: 36, span: 3.8, spanV: 3 };
    case "lien-he":
      return { pos: [DOOR.x, 2.9, DOOR.z + 8.3], target: [DOOR.x, 1.2, DOOR.z], fov: 36, span: 3.4, spanV: 3.4 };
    default:
      return { pos: [0, 25, 28], target: [0, 0, 0.6], fov: 34, span: 19, spanV: 14 };
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
 * Trả về undefined thì dùng điểm nhìn chung (đã có span để tự lùi vừa khung).
 */
function phoneRig(zone: ZoneId, focus: string | null, manifest: SceneManifest): Rig | undefined {
  switch (zone) {
    case "hub":
      return { pos: [0, 11.5, 15.5], target: [0, 0, 0.8], fov: 50, drift: 0.32 };
    case "trung-bay": {
      const index = focus ? manifest.projects.findIndex((p) => p.slug === focus) : -1;
      if (index >= 0) {
        const x = showroomX(index);
        // Camera phải ở trên đỉnh tường phía nam (cao 2,4 m) hoặc nằm trong phòng, nếu không tường phòng kế bên che mất màn
        return { pos: [x + 0.4, 3.1, SHOWROOM.z + 2.5], target: [x, SHOWROOM.y - 0.05, SHOWROOM.z], fov: 44, span: 2.1, spanV: 1.4, drift: 0.05 };
      }
      return { pos: [0, 4.6, SHOWROOM.z + 5.9], target: [0, 1.25, SHOWROOM.z], fov: 50, pan: [5.6, 0, 0], drift: 0.08 };
    }
    case "thi-nghiem": {
      const index = focus ? manifest.lab.findIndex((l) => l.id === focus) : -1;
      // Nhìn từ phía tây (qua tường thấp 1 m của phòng lab), không đứng sau các tường bắc 2,4 m của dãy phòng phía nam
      if (index >= 0) return { pos: [LAB.x - 2.7, 2.3, labZ(index) + 0.4], target: [LAB.x, LAB.capY - 0.05, labZ(index)], fov: 40, span: 1.7, spanV: 1.9, drift: 0.06 };
      return { pos: [LAB.x - 4.3, 2.6, LAB.z + 0.5], target: [LAB.x, 1.2, LAB.z], fov: 50, pan: [0, 0, 1.3], drift: 0.14 };
    }
    case "mau-giao-dien":
      return { pos: [SHELF.x, 2.6, SHELF.z + 6.2], target: [SHELF.x, 1.2, SHELF.z], fov: 50, pan: [3.2, 0, 0], drift: 0.06 };
    default:
      return undefined;
  }
}
