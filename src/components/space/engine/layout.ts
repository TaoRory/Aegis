/**
 * Hằng số bố cục 3D của Xưởng (mét). Dùng chung cho builder, camera rig và hotspot để mọi thứ khớp nhau.
 * Quy ước: các vật trưng bày dựa vào TƯỜNG BẮC của từng phòng (z nhỏ) và quay mặt về phía nam (+z), nơi camera đứng.
 */

export const SHOWROOM = { z: -6.55, y: 1.55, x0: -7.2, step: 2.4, w: 1.9, h: 1.19 } as const;
export const LAB = { x: 7.5, z: 0, capZ0: -1.35, capStep: 0.9, capY: 1.3 } as const;
export const SHELF = { z: 3.12, x: -5.5, dx: 1.95, w: 1.6, h: 1.0, yTop: 1.72, yBottom: 0.58, cols: 4 } as const;
export const DRAFT = { x: -7.5, z: 0.4, topY: 0.9 } as const;
export const CORE = { x: 0, z: 0, holoY: 1.85, holoScale: 1.45 } as const;
export const JOURNAL = { x: 3.5, z: 4.25 } as const;
export const DOOR = { x: 8.25, z: 3.15 } as const;

export const showroomX = (i: number) => SHOWROOM.x0 + i * SHOWROOM.step;
export const labZ = (i: number) => LAB.capZ0 + i * LAB.capStep;
export const shelfX = (i: number) => SHELF.x + ((i % SHELF.cols) - (SHELF.cols - 1) / 2) * SHELF.dx;
export const shelfY = (i: number) => (i < SHELF.cols ? SHELF.yTop : SHELF.yBottom);

export type Vec3 = [number, number, number];
