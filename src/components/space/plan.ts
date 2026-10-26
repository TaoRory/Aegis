import type { ZoneId } from "@/config/space";

/**
 * Mặt bằng Xưởng (đơn vị: mét; x sang phải, z đi xuống trên bản vẽ = trục z trong 3D).
 * Nguồn hình học duy nhất: bản phẳng SVG (FlatMap) và các builder 3D (engine/builders) đều đọc file này.
 */

export interface Room {
  zone: Exclude<ZoneId, "hub">;
  /** Tâm phòng */
  x: number;
  z: number;
  w: number;
  d: number;
}

export const rooms: readonly Room[] = [
  { zone: "trung-bay", x: 0, z: -5.25, w: 20, d: 4.5 },
  { zone: "dich-vu", x: -7.5, z: 0, w: 5, d: 5 },
  { zone: "ve-aegis", x: 0, z: 0, w: 8, d: 5 },
  { zone: "thi-nghiem", x: 7.5, z: 0, w: 5, d: 5 },
  { zone: "mau-giao-dien", x: -5.5, z: 5.25, w: 9, d: 4.5 },
  { zone: "nhat-ky", x: 3.5, z: 5.25, w: 5, d: 4.5 },
  { zone: "lien-he", x: 8.25, z: 5.25, w: 3.5, d: 4.5 },
] as const;

export const roomByZone = Object.fromEntries(rooms.map((r) => [r.zone, r])) as Record<Room["zone"], Room>;

/** Khung bao toàn bộ mặt bằng (có lề) dùng làm viewBox của SVG */
export const planBounds = { x: -11, z: -8.6, w: 22, d: 17.2 } as const;

/** Số hình khối trưng bày trong mỗi phòng (để các builder và FlatMap thống nhất) */
export const counts = { projects: 7, lab: 4, templates: 8, services: 4 } as const;
