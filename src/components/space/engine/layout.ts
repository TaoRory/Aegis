import { CORE_RADIUS, HALL, roomByZone } from "@/components/space/plan";

/** Toạ độ các vật trưng bày, suy từ plan.ts (mét) */

/** Sảnh dự án: 7 màn hình xếp trên một cung quanh lõi, quay mặt vào tâm */
export const SHOWROOM = { y: 1.45, w: 1.7, h: 1.06, count: 7 } as const;

export interface Slot {
  x: number;
  z: number;
  /** Góc quay quanh trục y để mặt phẳng (pháp tuyến +z) hướng vào tâm */
  yaw: number;
  /** Pháp tuyến đơn vị trong mặt phẳng xz, hướng ra phía người xem (vào tâm) */
  nx: number;
  nz: number;
}

export function hallSlot(i: number): Slot {
  const a = HALL.a0 + ((HALL.a1 - HALL.a0) * i) / (SHOWROOM.count - 1);
  return { x: Math.sin(a) * HALL.r, z: -Math.cos(a) * HALL.r, yaw: -a, nx: -Math.sin(a), nz: Math.cos(a) };
}

/** Băng chuyền mẫu giao diện: 8 khung quanh một trụ xoay chậm, quay mặt ra ngoài */
const studio = roomByZone.studio;
export const CAROUSEL = { x: studio.x, z: studio.z, r: 2.55, y: 1.25, w: 1.5, h: 0.94, count: 8 } as const;

export const CORE = { x: 0, z: 0, holoY: 2.1, radius: CORE_RADIUS } as const;

/** Cổng liên hệ: bệ phóng tròn với khung cửa nhìn về phía lõi */
const gate = roomByZone.contact;
export const DOOR = { x: gate.x, z: gate.z, r: gate.r } as const;

export type Vec3 = [number, number, number];
