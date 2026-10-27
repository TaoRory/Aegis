import type { ZoneId } from "@/config/space";

/**
 * Mặt bằng "Aegis Forge" (đơn vị: mét; x sang phải, z hướng về phía người xem / cổng nam).
 * Nguồn hình học duy nhất: bản phẳng SVG (FlatMap) và các builder 3D đều đọc file này.
 *
 *            ╭──────── Sảnh dự án (cung 7 tủ kính) ────────╮
 *     [Trạm AI]                                  [Trạm Phần mềm]
 *                      ◎  Lõi năng lượng
 *     [Trạm Web]                                 [Trạm Marketing]
 *          ( Băng chuyền mẫu )                 ( Bệ phóng liên hệ )
 *
 * Bốn trạm dịch vụ cùng hình, cùng cỡ, đối xứng qua lõi: không trạm nào "trước" trạm nào.
 */

export type RoomZone = Exclude<ZoneId, "hub">;
export type RoomShape = "circle" | "octagon" | "arc";

export interface Room {
  zone: RoomZone;
  /** Tâm (cung: tâm của đường tròn chứa cung) */
  x: number;
  z: number;
  shape: RoomShape;
  /** Bán kính (cung: bán kính đường tâm của dải) */
  r: number;
  /** Cung: góc bắt đầu / kết thúc, tính từ trục -z (lệch sang +x là góc dương) */
  a0?: number;
  a1?: number;
}

export const CORE_RADIUS = 3.6;
export const HALL = { r: 14, a0: -0.82, a1: 0.82, band: 1.5 } as const;
const BAY = { r: 2.9, dx: 8.2, dz: 5.4 } as const;

export const rooms: readonly Room[] = [
  { zone: "about", x: 0, z: 0, shape: "circle", r: CORE_RADIUS },
  { zone: "ai", x: -BAY.dx, z: -BAY.dz, shape: "octagon", r: BAY.r },
  { zone: "software", x: BAY.dx, z: -BAY.dz, shape: "octagon", r: BAY.r },
  { zone: "web", x: -BAY.dx, z: BAY.dz, shape: "octagon", r: BAY.r },
  { zone: "marketing", x: BAY.dx, z: BAY.dz, shape: "octagon", r: BAY.r },
  { zone: "work", x: 0, z: 0, shape: "arc", r: HALL.r, a0: HALL.a0, a1: HALL.a1 },
  { zone: "studio", x: -6.8, z: 13.6, shape: "circle", r: 3.9 },
  { zone: "contact", x: 6.8, z: 13.6, shape: "circle", r: 3.0 },
] as const;

export const roomByZone = Object.fromEntries(rooms.map((r) => [r.zone, r])) as Record<RoomZone, Room>;

/** Điểm trên đường viền của một khu (dùng chung cho nét mặt bằng 3D, dòng xung và bản phẳng): vòng khép kín hoặc dải cung */
export function outlinePoints(room: Room, inset = 0): [number, number][] {
  const pts: [number, number][] = [];
  if (room.shape === "arc") {
    const a0 = room.a0 ?? 0;
    const a1 = room.a1 ?? 0;
    const n = 56;
    const inner = room.r - HALL.band + inset;
    const outer = room.r + HALL.band - inset;
    for (let i = 0; i <= n; i++) {
      const a = a0 + ((a1 - a0) * i) / n;
      pts.push([room.x + Math.sin(a) * outer, room.z - Math.cos(a) * outer]);
    }
    for (let i = n; i >= 0; i--) {
      const a = a0 + ((a1 - a0) * i) / n;
      pts.push([room.x + Math.sin(a) * inner, room.z - Math.cos(a) * inner]);
    }
    pts.push(pts[0]);
    return pts;
  }
  const sides = room.shape === "octagon" ? 8 : 72;
  const phase = room.shape === "octagon" ? Math.PI / 8 : 0;
  const rad = room.r - inset;
  for (let i = 0; i <= sides; i++) {
    const a = phase + (i / sides) * Math.PI * 2;
    pts.push([room.x + Math.cos(a) * rad, room.z + Math.sin(a) * rad]);
  }
  return pts;
}

/**
 * Dòng năng lượng nối mọi khu về lõi (đoạn thẳng từ mép lõi tới mép khu).
 * "Mọi thứ đi qua nền móng": khi chuyển khu, xung sáng chạy từ khu cũ về lõi rồi tới khu mới.
 */
export interface Link {
  zone: RoomZone;
  points: [number, number][];
}

export const links: readonly Link[] = rooms
  .filter((r) => r.zone !== "about")
  .map((r) => {
    const isArc = r.shape === "arc";
    const cx = isArc ? 0 : r.x;
    const cz = isArc ? -1 : r.z;
    const len = Math.hypot(cx, cz);
    const dx = cx / len;
    const dz = cz / len;
    const start = CORE_RADIUS + 0.15;
    const end = isArc ? r.r - HALL.band - 0.2 : len - r.r - 0.25;
    return { zone: r.zone, points: [[dx * start, dz * start], [dx * end, dz * end]] as [number, number][] };
  });

/** Khung bao toàn bộ mặt bằng (có lề) dùng làm viewBox của SVG */
export const planBounds = { x: -18.4, z: -17.6, w: 36.8, d: 38.4 } as const;

/** Số vật trưng bày (để các builder và FlatMap thống nhất) */
export const counts = { projects: 7, templates: 8 } as const;
