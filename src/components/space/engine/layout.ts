import { roomByZone } from "@/components/space/plan";

/** Toạ độ các vật trưng bày, suy từ plan.ts (mét) */

const work = roomByZone.work;
const studio = roomByZone.studio;
const gate = roomByZone.contact;

/** Gallery: 7 màn hình đứng thành hàng trước tường bắc, quay mặt về phía nam (+z) */
export const SHOWROOM = { z: work.z - work.d / 2 + 0.9, y: 1.5, x0: -6.15, step: 2.05, w: 1.7, h: 1.06 } as const;
/** Studio, nửa phải: bàn dài với 4 viên nang xếp theo trục x */
export const LAB = { x: 0.6, z: studio.z + 0.15, capX0: -1.35, capStep: 0.9, capY: 1.3 } as const;
/** Studio, nửa trái: 8 khung mẫu treo trên tường bắc (2 hàng × 4), quay mặt về phía nam */
export const SHELF = { z: studio.z - studio.d / 2 + 0.12, x: -5.5, dx: 1.95, w: 1.6, h: 1.0, yTop: 1.72, yBottom: 0.58, cols: 4 } as const;
export const CORE = { x: 0, z: 0, holoY: 1.85, holoScale: 1.45 } as const;
/** Cổng liên hệ: khung cửa dựa tường bắc của khu Gate */
export const DOOR = { x: gate.x, z: gate.z - gate.d / 2 + 0.05 } as const;

export const showroomX = (i: number) => SHOWROOM.x0 + i * SHOWROOM.step;
export const labX = (i: number) => LAB.x + LAB.capX0 + i * LAB.capStep;
export const shelfX = (i: number) => SHELF.x + ((i % SHELF.cols) - (SHELF.cols - 1) / 2) * SHELF.dx;
export const shelfY = (i: number) => (i < SHELF.cols ? SHELF.yTop : SHELF.yBottom);

export type Vec3 = [number, number, number];
