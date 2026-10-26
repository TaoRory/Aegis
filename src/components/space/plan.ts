import type { ZoneId } from "@/config/space";

/**
 * Mặt bằng "Aegis Foundation" (đơn vị: mét; x sang phải, z hướng về phía người xem / cổng nam).
 * Nguồn hình học duy nhất: bản phẳng SVG (FlatMap) và các builder 3D đều đọc file này.
 *
 *              [ Gallery · Work ]
 *   [ AI ]                          [ Software ]
 *                 ( Core )
 *   [ Web ]                         [ Marketing ]
 *          [ Studio ]        [ Gate ]
 *
 * Bốn khu dịch vụ cùng kích thước, đối xứng qua lõi: không khu nào "trước" khu nào.
 */

export type RoomZone = Exclude<ZoneId, "hub">;

export interface Room {
  zone: RoomZone;
  /** Tâm */
  x: number;
  z: number;
  w: number;
  d: number;
  shape: "rect" | "circle";
}

export const CORE_RADIUS = 3.4;
const PAVILION = { w: 6, d: 5.4, dx: 7.6, dz: 4.4 } as const;

export const rooms: readonly Room[] = [
  { zone: "about", x: 0, z: 0, w: CORE_RADIUS * 2, d: CORE_RADIUS * 2, shape: "circle" },
  { zone: "ai", x: -PAVILION.dx, z: -PAVILION.dz, w: PAVILION.w, d: PAVILION.d, shape: "rect" },
  { zone: "software", x: PAVILION.dx, z: -PAVILION.dz, w: PAVILION.w, d: PAVILION.d, shape: "rect" },
  { zone: "web", x: -PAVILION.dx, z: PAVILION.dz, w: PAVILION.w, d: PAVILION.d, shape: "rect" },
  { zone: "marketing", x: PAVILION.dx, z: PAVILION.dz, w: PAVILION.w, d: PAVILION.d, shape: "rect" },
  { zone: "work", x: 0, z: -9.4, w: 15, d: 3.6, shape: "rect" },
  { zone: "studio", x: -3.2, z: 9.6, w: 12.6, d: 3.8, shape: "rect" },
  { zone: "contact", x: 6.6, z: 9.6, w: 5.2, d: 3.8, shape: "rect" },
] as const;

export const roomByZone = Object.fromEntries(rooms.map((r) => [r.zone, r])) as Record<RoomZone, Room>;

/**
 * Dòng năng lượng nối mọi khu về lõi (đường gấp khúc trên sàn, điểm đầu ở mép lõi, điểm cuối ở mép khu).
 * "Mọi thứ đi qua nền móng": khi chuyển khu, xung sáng chạy từ khu cũ về lõi rồi tới khu mới.
 */
export interface Link {
  zone: RoomZone;
  points: [number, number][];
}

export const links: readonly Link[] = [
  { zone: "work", points: [[0, -CORE_RADIUS], [0, -7.6]] },
  { zone: "ai", points: [[-2.5, -2.3], [-4.6, -3.6]] },
  { zone: "software", points: [[2.5, -2.3], [4.6, -3.6]] },
  { zone: "web", points: [[-2.5, 2.3], [-4.6, 3.6]] },
  { zone: "marketing", points: [[2.5, 2.3], [4.6, 3.6]] },
  { zone: "studio", points: [[-1.1, 3.22], [-1.6, 7.7]] },
  { zone: "contact", points: [[1.1, 3.22], [2.4, 6.0], [4.0, 8.4]] },
] as const;

/** Khung bao toàn bộ mặt bằng (có lề) dùng làm viewBox của SVG */
export const planBounds = { x: -11.6, z: -12.4, w: 23.2, d: 25 } as const;

/** Số vật trưng bày trong mỗi khu (để các builder và FlatMap thống nhất) */
export const counts = { projects: 7, lab: 4, templates: 8 } as const;
