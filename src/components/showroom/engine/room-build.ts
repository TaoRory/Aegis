import {
  CanvasTexture,
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  RepeatWrapping,
  SRGBColorSpace,
  TorusGeometry,
  type BufferGeometry,
  type Material,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

import { boxAt, mergeAll } from "@/components/space/engine/builders/merge";
import type { SectionId } from "@/content/showroom";

/**
 * Dựng "Studio Aegis": một phòng làm việc ban ngày KÍN (bốn vách + trần), tông sáng theo bảng màu brand (đọc từ CSS token, không có
 * mã màu ở đây trừ giá trị dự phòng). Người xem đứng giữa phòng, xoay quanh nhìn (room-engine). Các "Thợ Aegis" tí hon
 * (makers.ts) sống trên đồ đạc.
 *
 * Toạ độ (mét): x −3.4..3.4 (trái → phải), z −3.2..2.6 (vách sau ở z = −3.2, người xem nhìn về phía đó), y lên trên.
 * Mỗi khu có một MÀN HÌNH (máy tính, TV, bảng hiển thị, khung ảnh, laptop): bấm vào thì camera bay thẳng trước màn hình và
 * nội dung HTML hiện "trong" màn hình. Vật thể gắn `userData.section` để bắt rê/bấm chuột.
 */

export interface RoomPalette {
  ink: Color;
  inkRaised: Color;
  teal: Color;
  tealDeep: Color;
  aqua: Color;
  soft: Color;
  bright: Color;
  grey: Color;
  neutral: Color;
}

function token(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new Color(/^#[0-9a-f]{6}$/i.test(v) ? v : fallback);
}

export function readRoomPalette(): RoomPalette {
  return {
    ink: token("--palette-ink", "#071f1e"),
    inkRaised: token("--palette-ink-raised", "#062e30"),
    teal: token("--palette-teal", "#13b5a5"),
    tealDeep: token("--palette-teal-deep", "#0a7369"),
    aqua: token("--palette-aqua", "#84e4d6"),
    soft: token("--palette-soft", "#c9f8f0"),
    bright: token("--palette-bright", "#f5f7f6"),
    grey: token("--palette-grey", "#8b9ca1"),
    neutral: token("--palette-ink-neutral", "#0b0f14"),
  };
}

const css = (c: Color) => `#${c.getHexString()}`;
export const mix = (a: Color, b: Color, t: number) => a.clone().lerp(b, t);

export const ROOM = { x0: -3.4, x1: 3.4, z0: -3.2, z1: 2.6, h: 3.0 };
const R = ROOM;

const deskC = { x: 0.2, z: R.z0 + 0.65, w: 2.2, d: 1.05, top: 0.76 };
const sideC = { x: -2.5, z: R.z0 + 0.32, w: 1.6, d: 0.55, h: 0.62 };
const benchC = { x: -1.6, z: R.z1 - 0.3, w: 0.9, d: 0.42, h: 0.42 };
const tableC = { x: R.x1 - 0.62, z: -0.1, r: 0.44, top: 0.72 };
const windowC = { z0: -0.8, z1: 0.6, y0: 0.95, y1: 2.45 };

/**
 * Bố cục (dùng chung cho dựng phòng và lộ trình của Thợ Aegis). Người xem đứng GIỮA phòng nhìn về vách trước mặt (−z):
 * Digital Marketing (trái) · Website & App (giữa) · Dự án (phải) nằm cả trên vách này, nên mở trang là thấy ba khu chính.
 * Liên hệ ở vách phải, Về Aegis ở phía sau lưng (xoay lại là thấy); cửa sổ ở vách trái và vách phải.
 */
export const LAYOUT = {
  desk: deskC,
  monitor: { x: deskC.x, y: 1.27, z: deskC.z - 0.27, w: 1.2, h: 0.75 },
  keyboard: { x: deskC.x - 0.08, z: deskC.z + 0.25, w: 0.62, d: 0.2, top: 0.786 },
  house: { x: deskC.x + 0.6, z: deskC.z - 0.17 },
  pile: { x: deskC.x + 0.82, z: deskC.z + 0.31 },
  window: windowC,
  board: { x: 2.52, y: 1.7, w: 1.64, h: 1.45 },
  tv: { x: 2.52, y: 1.92, w: 1.0, h: 0.56 },
  ladder: { x: 1.5, baseZ: R.z0 + 0.94, topY: 1.08 },
  cardBox: { x: 2.3, z: R.z0 + 0.7 },
  sideboard: sideC,
  signage: { x: sideC.x - 0.3, y: 1.05, z: R.z0 + 0.22, w: 0.88, h: 0.66 },
  phone: { x: sideC.x + 0.55, z: sideC.z + 0.05 },
  speaker: { x: sideC.x + 1.15, z: R.z0 + 0.3, w: 0.36, h: 0.6 },
  emblem: { x: 0.2, y: 2.0, z: R.z1 },
  frame: { x: 0.2, z: R.z1 - 0.9, y: 1.06, w: 0.8, h: 0.6, yaw: Math.PI },
  bench: benchC,
  benchPlant: { x: benchC.x - 0.28 },
  table: tableC,
  laptop: { w: 0.5, h: 0.31, tilt: 0.2, yaw: -1.3 },
};

/** Điểm neo kim cương (toạ độ thế giới) của từng khu */
export const ANCHORS: Record<SectionId, [number, number, number]> = {
  web: [deskC.x, 1.8, deskC.z - 0.27],
  projects: [2.52, 2.5, R.z0 + 0.3],
  marketing: [sideC.x - 0.3, 1.6, R.z0 + 0.22],
  about: [0.2, 1.5, R.z1 - 0.9],
  contact: [tableC.x, 1.2, tableC.z],
};

export interface RoomScreen {
  id: SectionId;
  mesh: Mesh;
  canvas: HTMLCanvasElement;
  texture: CanvasTexture;
  /** kích thước thật của mặt màn hình (m) */
  w: number;
  h: number;
}

export interface BuiltRoom {
  root: Group;
  pickables: Mesh[];
  screens: Record<SectionId, RoomScreen>;
  /** Thẻ dự án trên bảng ghim: gắn ảnh khi tải xong */
  cards: Mesh[];
  /** Biểu tượng kính trên vách sau lưng */
  emblem: Mesh;
  /** Đèn LED viền bàn, quầng sáng: nhịp thở nhẹ */
  glows: MeshBasicMaterial[];
  dispose(): void;
}

export function buildRoom(p: RoomPalette, opts: { phone: boolean }): BuiltRoom {
  const L = LAYOUT;
  const root = new Group();
  const pickables: Mesh[] = [];
  const disposables: { dispose(): void }[] = [];
  const glows: MeshBasicMaterial[] = [];

  // Vật liệu dùng chung theo (màu, nhám, kim loại): ít vật liệu hơn = ít đổi trạng thái GPU
  const matCache = new Map<string, MeshStandardMaterial>();
  const std = (color: Color, roughness = 0.82, metalness = 0) => {
    const key = `${color.getHexString()}-${roughness}-${metalness}`;
    let m = matCache.get(key);
    if (!m) {
      m = new MeshStandardMaterial({ color, roughness, metalness });
      matCache.set(key, m);
      disposables.push(m);
    }
    return m;
  };
  const basic = (params: ConstructorParameters<typeof MeshBasicMaterial>[0]) => {
    const m = new MeshBasicMaterial(params);
    disposables.push(m);
    return m;
  };
  type Shadow = { cast?: boolean; receive?: boolean };
  /** Vật thể cần biến đổi / vật liệu riêng (màn hình, thẻ dự án, logo…): một mesh riêng */
  const own = (geometry: BufferGeometry, material: Material, section?: SectionId, shadow: Shadow = {}) => {
    const mesh = new Mesh(geometry, material);
    mesh.castShadow = !!shadow.cast && !opts.phone;
    mesh.receiveShadow = !!shadow.receive;
    if (section) {
      mesh.userData.section = section;
      pickables.push(mesh);
    }
    disposables.push(geometry);
    root.add(mesh);
    return mesh;
  };
  /** Vật thể tĩnh: gom theo (vật liệu, khu, bóng) rồi gộp thành một mesh ở cuối, tiết kiệm lệnh vẽ */
  const batches = new Map<string, { material: Material; section?: SectionId; shadow: Shadow; parts: BufferGeometry[] }>();
  const add = (geometry: BufferGeometry, material: Material, section?: SectionId, shadow: Shadow = {}) => {
    const key = `${material.uuid}|${section ?? ""}|${shadow.cast ? 1 : 0}${shadow.receive ? 1 : 0}`;
    const batch = batches.get(key) ?? { material, section, shadow, parts: [] };
    batch.parts.push(geometry);
    batches.set(key, batch);
  };
  const rbox = (w: number, h: number, d: number, x: number, y: number, z: number, r = 0.02) =>
    new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3)).translate(x, y, z);

  const inkMat = std(p.ink, 0.5, 0.1);
  const inkGloss = std(p.ink, 0.28, 0.25);
  const brightMat = std(p.bright, 0.55);
  const tealMat = std(p.teal, 0.45, 0.1);

  /** Màn hình phát sáng (canvas): luôn hướng về +z cục bộ */
  const screens = {} as Record<SectionId, RoomScreen>;
  const makeScreen = (id: SectionId, w: number, h: number, px: number) => {
    const canvas = document.createElement("canvas");
    canvas.width = px;
    canvas.height = Math.round((px * h) / w);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    disposables.push(texture);
    const mesh = own(new PlaneGeometry(w, h), basic({ map: texture, toneMapped: false }), id);
    screens[id] = { id, mesh, canvas, texture, w, h };
    return mesh;
  };

  const zc = (R.z0 + R.z1) / 2;
  const W = R.x1 - R.x0;
  const D = R.z1 - R.z0;

  // ---------- Sàn gỗ sáng, trần ----------
  const floorTex = plankTexture(mix(p.bright, p.grey, 0.14), mix(p.bright, p.grey, 0.42));
  floorTex.wrapS = floorTex.wrapT = RepeatWrapping;
  floorTex.repeat.set(2.4, 2);
  disposables.push(floorTex);
  const floor = new MeshStandardMaterial({ map: floorTex, roughness: 0.72 });
  disposables.push(floor);
  add(new PlaneGeometry(W, D).rotateX(-Math.PI / 2).translate(0, 0, zc), floor, undefined, { receive: true });
  add(new PlaneGeometry(W, D).rotateX(Math.PI / 2).translate(0, R.h, zc), basic({ color: mix(p.bright, p.soft, 0.12), toneMapped: false }));
  // hai dải đèn trần
  const lightStrip = basic({ color: p.soft, toneMapped: false });
  add(mergeAll([boxAt(2.6, 0.02, 0.16, 0.2, R.h - 0.01, -1.1), boxAt(2.6, 0.02, 0.16, 0.2, R.h - 0.01, 1.0)]), lightStrip);

  // ---------- Bốn vách (khối đặt ngoài phòng, mặt trong quay vào người xem) + cửa sổ ở vách trái và phải ----------
  const wall = std(p.bright, 0.95);
  const t = 0.14;
  const { z0: zw0, z1: zw1, y0: wy0, y1: wy1 } = windowC;
  const zwm = (zw0 + zw1) / 2;
  const sideWall = (cx: number) => [
    boxAt(t, R.h, zw0 - (R.z0 - t), cx, R.h / 2, (R.z0 - t + zw0) / 2),
    boxAt(t, R.h, R.z1 + t - zw1, cx, R.h / 2, (zw1 + R.z1 + t) / 2),
    boxAt(t, wy0, zw1 - zw0, cx, wy0 / 2, zwm),
    boxAt(t, R.h - wy1, zw1 - zw0, cx, (wy1 + R.h) / 2, zwm),
  ];
  add(
    mergeAll([
      boxAt(W + t * 2, R.h, t, 0, R.h / 2, R.z0 - t / 2),
      boxAt(W + t * 2, R.h, t, 0, R.h / 2, R.z1 + t / 2),
      ...sideWall(R.x0 - t / 2),
      ...sideWall(R.x1 + t / 2),
    ]),
    wall,
    undefined,
    { receive: true },
  );
  // mảng sơn Soft Aqua nửa dưới vách + chỉ teal mảnh + len chân tường
  const band = std(mix(p.soft, p.bright, 0.55), 0.92);
  const bandH = wy0;
  add(
    mergeAll([
      boxAt(W, bandH, 0.01, 0, bandH / 2, R.z0 + 0.006),
      boxAt(W, bandH, 0.01, 0, bandH / 2, R.z1 - 0.006),
      boxAt(0.01, bandH, D, R.x0 + 0.006, bandH / 2, zc),
      boxAt(0.01, bandH, D, R.x1 - 0.006, bandH / 2, zc),
    ]),
    band,
    undefined,
    { receive: true },
  );
  add(
    mergeAll([
      boxAt(W, 0.012, 0.012, 0, bandH + 0.006, R.z0 + 0.012),
      boxAt(W, 0.012, 0.012, 0, bandH + 0.006, R.z1 - 0.012),
      boxAt(0.012, 0.012, D, R.x0 + 0.012, bandH + 0.006, zc),
      boxAt(0.012, 0.012, D, R.x1 - 0.012, bandH + 0.006, zc),
    ]),
    tealMat,
  );
  add(
    mergeAll([
      boxAt(W, 0.07, 0.02, 0, 0.035, R.z0 + 0.012),
      boxAt(W, 0.07, 0.02, 0, 0.035, R.z1 - 0.012),
      boxAt(0.02, 0.07, D, R.x0 + 0.012, 0.035, zc),
      boxAt(0.02, 0.07, D, R.x1 - 0.012, 0.035, zc),
    ]),
    std(mix(p.soft, p.grey, 0.3), 0.8),
  );

  // cửa sổ: bầu trời sáng + chân trời thành phố, khung ink
  const sky = skyTexture(p);
  disposables.push(sky);
  const fw = 0.05;
  const midY = (wy0 + wy1) / 2;
  for (const side of [-1, 1] as const) {
    // side = −1: vách trái (mặt kính quay +x); +1: vách phải (mặt kính quay −x)
    const wallX = side < 0 ? R.x0 : R.x1;
    const glass = own(new PlaneGeometry(zw1 - zw0, wy1 - wy0), basic({ map: sky, toneMapped: false }));
    glass.position.set(wallX + side * (t - 0.01), midY, zwm);
    glass.rotation.y = -side * (Math.PI / 2);
    const fx = wallX + side * 0.04;
    add(
      mergeAll([
        boxAt(0.1, fw, zw1 - zw0 + fw * 2, fx, wy0, zwm),
        boxAt(0.1, fw, zw1 - zw0 + fw * 2, fx, wy1, zwm),
        boxAt(0.1, wy1 - wy0, fw, fx, midY, zw0),
        boxAt(0.1, wy1 - wy0, fw, fx, midY, zw1),
        boxAt(0.05, wy1 - wy0, 0.03, wallX + side * 0.02, midY, zwm),
        boxAt(0.22, 0.04, zw1 - zw0 + 0.3, wallX - side * 0.07, wy0 - 0.02, zwm),
      ]),
      inkMat,
    );
  }

  // thảm tròn giữa phòng (nơi người xem đứng): vòng teal mảnh
  add(new CylinderGeometry(1.45, 1.45, 0.012, 64).translate(0, 0.006, -0.55), std(mix(p.soft, p.bright, 0.35), 0.95), undefined, { receive: true });
  add(new TorusGeometry(1.4, 0.014, 6, 80).rotateX(Math.PI / 2).translate(0, 0.014, -0.55), tealMat);

  // ---------- 01 Website & App: bàn, màn hình lớn, bàn phím, ngôi nhà thu nhỏ đang xây ----------
  const { desk } = L;
  add(
    mergeAll([
      rbox(desk.w, 0.06, desk.d, desk.x, desk.top - 0.03, desk.z, 0.025),
      rbox(0.06, desk.top - 0.06, desk.d - 0.12, desk.x - desk.w / 2 + 0.09, (desk.top - 0.06) / 2, desk.z, 0.02),
      rbox(0.55, desk.top - 0.06, desk.d - 0.12, desk.x + desk.w / 2 - 0.33, (desk.top - 0.06) / 2, desk.z, 0.02),
      boxAt(desk.w - 0.24, 0.28, 0.03, desk.x, desk.top - 0.22, desk.z - desk.d / 2 + 0.08),
    ]),
    inkMat,
    "web",
    { cast: true, receive: true },
  );
  const led = basic({ color: p.teal, toneMapped: false });
  glows.push(led);
  add(boxAt(desk.w - 0.05, 0.012, 0.012, desk.x, desk.top - 0.052, desk.z + desk.d / 2 + 0.002), led);
  add(
    mergeAll([
      boxAt(0.2, 0.02, 0.02, desk.x + desk.w / 2 - 0.33, 0.58, desk.z + desk.d / 2 - 0.05),
      boxAt(0.2, 0.02, 0.02, desk.x + desk.w / 2 - 0.33, 0.34, desk.z + desk.d / 2 - 0.05),
    ]),
    tealMat,
  );

  const m = L.monitor;
  add(
    mergeAll([
      rbox(m.w + 0.06, m.h + 0.06, 0.045, m.x, m.y, m.z - 0.027, 0.018),
      rbox(0.07, m.y - desk.top - 0.2, 0.05, m.x, desk.top + (m.y - desk.top - 0.2) / 2, m.z - 0.08, 0.02),
      rbox(0.38, 0.022, 0.24, m.x, desk.top + 0.011, m.z - 0.04, 0.01),
    ]),
    inkGloss,
    "web",
    { cast: true },
  );
  makeScreen("web", m.w, m.h, 1280).position.set(m.x, m.y, m.z);

  const k = L.keyboard;
  const keyMat = std(mix(p.bright, p.grey, 0.1), 0.5);
  add(
    mergeAll([
      rbox(k.w, 0.026, k.d, k.x, desk.top + 0.013, k.z, 0.01),
      rbox(0.07, 0.03, 0.11, k.x + 0.48, desk.top + 0.015, k.z + 0.02, 0.015),
    ]),
    keyMat,
    "web",
    { cast: true },
  );
  // hàng phím nổi: nhìn gần thấy rõ "bàn phím khổng lồ" cho thợ code ngồi
  const keys: BufferGeometry[] = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 13; c++) keys.push(rbox(0.036, 0.008, 0.034, k.x - k.w / 2 + 0.05 + c * 0.0435, desk.top + 0.03, k.z - 0.07 + r * 0.045, 0.004));
  add(mergeAll(keys), std(p.bright, 0.4));
  add(new CylinderGeometry(0.045, 0.04, 0.1, 20).translate(desk.x - 0.92, desk.top + 0.05, desk.z + 0.2), tealMat, undefined, { cast: true });
  add(rbox(0.24, 0.02, 0.32, desk.x - 0.62, desk.top + 0.01, desk.z + 0.08, 0.006), std(p.soft, 0.7), undefined, { cast: true });

  buildMiniHouse(p, add, std, rbox);

  // ghế kéo ra bên trái bàn, xoay chéo (không che màn hình và bàn phím khi nhìn từ giữa phòng)
  const chair = std(p.inkRaised, 0.55, 0.1);
  add(
    mergeAll([
      rbox(0.54, 0.08, 0.5, 0, 0.48, 0, 0.035),
      rbox(0.52, 0.6, 0.07, 0, 0.86, 0.26, 0.03),
      new CylinderGeometry(0.03, 0.03, 0.38, 12).translate(0, 0.25, 0),
      new CylinderGeometry(0.28, 0.28, 0.03, 24).translate(0, 0.04, 0),
    ]).rotateY(0.75).translate(desk.x - 1.75, 0, desk.z + 0.55),
    chair,
    "web",
    { cast: true },
  );
  add(rbox(2.4, 0.012, 1.5, desk.x, 0.006, desk.z + 0.85, 0.3), std(mix(p.soft, p.grey, 0.2), 0.95), "web", { receive: true });

  // ---------- Thảm theo khu: nhìn toàn cảnh thấy rõ từng khu ----------
  const rugAqua = std(mix(p.aqua, p.bright, 0.45), 0.95);
  const rugSoft = std(mix(p.soft, p.bright, 0.15), 0.95);
  const rugTeal = std(mix(p.teal, p.bright, 0.62), 0.95);
  add(rbox(1.9, 0.012, 1.25, L.sideboard.x + 0.3, 0.006, R.z0 + 1.0, 0.3), rugAqua, "marketing", { receive: true });
  add(rbox(1.5, 0.012, 1.1, L.frame.x, 0.006, L.frame.z, 0.3), rugTeal, "about", { receive: true });
  add(new CylinderGeometry(0.78, 0.78, 0.012, 48).translate(L.table.x - 0.1, 0.006, L.table.z), rugSoft, "contact", { receive: true });
  add(rbox(1.6, 0.012, 1.1, L.board.x, 0.006, R.z0 + 0.72, 0.3), rugAqua, "projects", { receive: true });

  // ---------- 05 Liên hệ: bàn tròn dưới cửa sổ vách phải, laptop quay về phía người xem ----------
  const tb = L.table;
  add(
    mergeAll([
      new CylinderGeometry(tb.r, tb.r, 0.04, 40).translate(tb.x, tb.top - 0.02, tb.z),
      new CylinderGeometry(0.03, 0.03, tb.top - 0.04, 12).translate(tb.x, (tb.top - 0.04) / 2, tb.z),
      new CylinderGeometry(0.22, 0.24, 0.025, 28).translate(tb.x, 0.013, tb.z),
    ]),
    brightMat,
    "contact",
    { cast: true, receive: true },
  );
  add(new TorusGeometry(tb.r, 0.012, 8, 48).rotateX(Math.PI / 2).translate(tb.x, tb.top - 0.02, tb.z), tealMat);
  const lp = L.laptop;
  const lap = new Group();
  lap.position.set(tb.x, tb.top, tb.z);
  lap.rotation.y = lp.yaw;
  root.add(lap);
  const lapBase = new Mesh(rbox(lp.w + 0.02, 0.016, 0.34, 0, 0.008, 0, 0.008), inkGloss);
  lapBase.castShadow = !opts.phone;
  lapBase.userData.section = "contact";
  pickables.push(lapBase);
  disposables.push(lapBase.geometry);
  lap.add(lapBase);
  const lid = new Group();
  lid.position.set(0, 0.016, -0.17);
  lid.rotation.x = -lp.tilt;
  lap.add(lid);
  const lidBack = new Mesh(rbox(lp.w + 0.02, lp.h + 0.03, 0.012, 0, (lp.h + 0.03) / 2, -0.007, 0.008), inkGloss);
  lidBack.castShadow = !opts.phone;
  lidBack.userData.section = "contact";
  pickables.push(lidBack);
  disposables.push(lidBack.geometry);
  lid.add(lidBack);
  const lscreen = makeScreen("contact", lp.w, lp.h, 1024);
  root.remove(lscreen);
  lid.add(lscreen);
  lscreen.position.set(0, (lp.h + 0.03) / 2, 0.0005);

  // ---------- 02 Dự án: bảng ghim lớn, TV ở giữa, 7 thẻ dự án quanh TV, thang cho thợ ghim ----------
  const b = L.board;
  const pegTex = pegboardTexture(p);
  disposables.push(pegTex);
  const pegMat = new MeshStandardMaterial({ map: pegTex, roughness: 0.85 });
  disposables.push(pegMat);
  add(rbox(b.w, b.h, 0.03, b.x, b.y, R.z0 + 0.02, 0.012), pegMat, "projects", { receive: true });
  const halo = basic({ color: p.aqua, transparent: true, opacity: 0.55, toneMapped: false });
  glows.push(halo);
  add(
    mergeAll([
      boxAt(b.w + 0.06, 0.012, 0.01, b.x, b.y + b.h / 2 + 0.02, R.z0 + 0.005),
      boxAt(b.w + 0.06, 0.012, 0.01, b.x, b.y - b.h / 2 - 0.02, R.z0 + 0.005),
      boxAt(0.012, b.h + 0.04, 0.01, b.x - b.w / 2 - 0.03, b.y, R.z0 + 0.005),
      boxAt(0.012, b.h + 0.04, 0.01, b.x + b.w / 2 + 0.03, b.y, R.z0 + 0.005),
    ]),
    halo,
  );
  const tv = L.tv;
  add(rbox(tv.w + 0.06, tv.h + 0.06, 0.05, tv.x, tv.y, R.z0 + 0.06, 0.015), inkGloss, "projects", { cast: true });
  makeScreen("projects", tv.w, tv.h, 1280).position.set(tv.x, tv.y, R.z0 + 0.0865);

  const cards: Mesh[] = [];
  const pins: BufferGeometry[] = [];
  const slots: [number, number][] = [
    [b.x - b.w / 2 + 0.17, b.y + 0.42],
    [b.x - b.w / 2 + 0.17, b.y + 0.02],
    [b.x + b.w / 2 - 0.17, b.y + 0.42],
    [b.x + b.w / 2 - 0.17, b.y + 0.02],
    [b.x - 0.42, b.y - 0.5],
    [b.x, b.y - 0.52],
    [b.x + 0.42, b.y - 0.5],
  ];
  slots.forEach(([cx, cy], i) => {
    pins.push(new IcosahedronGeometry(0.012, 1).translate(cx, cy + 0.11, R.z0 + 0.05));
    const cardBack = new MeshStandardMaterial({ color: p.bright, roughness: 0.6 });
    disposables.push(cardBack);
    const card = own(new PlaneGeometry(0.2, 0.25), cardBack, "projects", { cast: true });
    card.position.set(cx, cy, R.z0 + 0.045);
    card.rotation.z = ((i % 3) - 1) * 0.04;
    cards.push(card);
  });
  add(mergeAll(pins), tealMat);

  // thang gỗ sáng tựa vào vách, cạnh bảng
  const ld = L.ladder;
  const lean = Math.atan2(ld.baseZ - (R.z0 + 0.06), ld.topY);
  const rails: BufferGeometry[] = [];
  const len = Math.hypot(ld.topY, ld.baseZ - (R.z0 + 0.06));
  for (const dx of [-0.1, 0.1]) rails.push(boxAt(0.022, len, 0.022, ld.x + dx, len / 2, 0));
  for (let r = 0; r < 5; r++) rails.push(boxAt(0.2, 0.016, 0.018, ld.x, 0.16 + r * ((len - 0.25) / 4), 0));
  add(mergeAll(rails).rotateX(-lean).translate(0, 0, ld.baseZ), std(mix(p.bright, p.grey, 0.25), 0.6), undefined, { cast: true });
  // hộp thẻ dưới sàn
  const cb = L.cardBox;
  add(rbox(0.3, 0.14, 0.22, cb.x, 0.07, cb.z, 0.015), tealMat, undefined, { cast: true });
  add(mergeAll([0, 1, 2].map((i) => boxAt(0.17, 0.12, 0.004, cb.x - 0.05 + i * 0.05, 0.16, cb.z - 0.03 + i * 0.02))), std(p.bright, 0.6));

  // ---------- 03 Digital Marketing: tủ thấp sát vách + bảng hiển thị chiến dịch + điện thoại + loa sàn ----------
  const sb = L.sideboard;
  add(rbox(sb.w, sb.h, sb.d, sb.x, sb.h / 2, sb.z, 0.025), inkMat, "marketing", { cast: true, receive: true });
  add(
    mergeAll([boxAt(0.02, 0.22, 0.012, sb.x - 0.25, 0.42, sb.z + sb.d / 2 + 0.002), boxAt(0.02, 0.22, 0.012, sb.x + 0.25, 0.42, sb.z + sb.d / 2 + 0.002)]),
    tealMat,
  );
  const sg = L.signage;
  add(
    mergeAll([
      rbox(sg.w + 0.06, sg.h + 0.06, 0.05, sg.x, sg.y, sg.z - 0.03, 0.015),
      rbox(0.36, 0.025, 0.16, sg.x, sb.h + 0.0125, sg.z - 0.01, 0.01),
      rbox(0.06, sg.y - sg.h / 2 - sb.h, 0.04, sg.x, sb.h + (sg.y - sg.h / 2 - sb.h) / 2, sg.z - 0.04, 0.01),
    ]),
    inkGloss,
    "marketing",
    { cast: true },
  );
  makeScreen("marketing", sg.w, sg.h, 1024).position.set(sg.x, sg.y, sg.z - 0.0045);

  const ph = L.phone;
  add(
    mergeAll([
      rbox(0.15, 0.3, 0.02, 0, 0, 0, 0.008).rotateX(-0.2).translate(ph.x, sb.h + 0.17, ph.z),
      rbox(0.14, 0.02, 0.12, ph.x, sb.h + 0.01, ph.z - 0.03, 0.006),
    ]),
    inkGloss,
    "marketing",
    { cast: true },
  );
  const feed = feedTexture(p);
  disposables.push(feed);
  const feedMesh = own(new PlaneGeometry(0.13, 0.27), basic({ map: feed, toneMapped: false }), "marketing");
  feedMesh.position.set(ph.x, sb.h + 0.17, ph.z + 0.012);
  feedMesh.rotation.set(-0.2, 0, 0);

  const sp = L.speaker;
  add(rbox(sp.w, sp.h, sp.w, sp.x, sp.h / 2, sp.z, 0.05), brightMat, "marketing", { cast: true });
  add(
    mergeAll([
      new CircleGeometry(0.11, 32).translate(sp.x, sp.h * 0.36, sp.z + sp.w / 2 + 0.002),
      new CircleGeometry(0.05, 24).translate(sp.x, sp.h * 0.74, sp.z + sp.w / 2 + 0.002),
    ]),
    inkMat,
  );
  const ring = basic({ color: p.teal, toneMapped: false });
  glows.push(ring);
  add(new TorusGeometry(0.115, 0.007, 8, 40).translate(sp.x, sp.h * 0.36, sp.z + sp.w / 2 + 0.004), ring);

  // kệ sách trên tủ
  const shelfY = 1.82;
  add(boxAt(1.5, 0.03, 0.3, sb.x, shelfY, R.z0 + 0.15), inkMat, undefined, { cast: true });
  const bookCols = [mix(p.teal, p.ink, 0.3), p.ink, mix(p.aqua, p.grey, 0.35)];
  const bookGeo: BufferGeometry[][] = bookCols.map(() => []);
  let bx = sb.x - 0.65;
  for (let i = 0; i < 12; i++) {
    const bh = 0.2 + ((i * 37) % 9) / 60;
    const bw = 0.04 + ((i * 13) % 4) / 100;
    bookGeo[i % bookCols.length].push(boxAt(bw, bh, 0.2, bx, shelfY + 0.015 + bh / 2, R.z0 + 0.14));
    bx += bw + 0.012;
  }
  bookCols.forEach((c, i) => add(mergeAll(bookGeo[i]), std(c, 0.7), undefined, { cast: true }));

  // ---------- 04 Về Aegis (sau lưng người xem): logo kính trên vách, khung ảnh điện tử trên giá, ghế băng + chậu cây ----------
  const emblemMat = basic({ transparent: true, toneMapped: false, color: p.bright, opacity: 0 });
  const emblem = own(new PlaneGeometry(0.74, 0.78), emblemMat, "about");
  emblem.position.set(L.emblem.x, L.emblem.y, R.z1 - 0.02);
  emblem.rotation.y = Math.PI;
  const plateMesh = own(new CircleGeometry(0.52, 64), std(p.ink, 0.4, 0.15), "about", { receive: true });
  plateMesh.position.set(L.emblem.x, L.emblem.y, R.z1 - 0.012);
  plateMesh.rotation.y = Math.PI;

  const fr = L.frame;
  const easel = new Group();
  easel.position.set(fr.x, 0, fr.z);
  easel.rotation.y = fr.yaw;
  root.add(easel);
  const stand = new Mesh(
    mergeAll([
      rbox(0.56, 0.035, 0.34, 0, 0.0175, 0, 0.012),
      rbox(0.05, fr.y - fr.h / 2 + 0.02, 0.05, 0, (fr.y - fr.h / 2 + 0.02) / 2, -0.02, 0.012),
    ]),
    std(mix(p.bright, p.grey, 0.15), 0.5),
  );
  stand.castShadow = !opts.phone;
  stand.userData.section = "about";
  pickables.push(stand);
  disposables.push(stand.geometry);
  easel.add(stand);
  const tilt = new Group();
  tilt.position.set(0, fr.y, 0);
  tilt.rotation.x = -0.1;
  easel.add(tilt);
  const bezel = new Mesh(rbox(fr.w + 0.08, fr.h + 0.08, 0.04, 0, 0, -0.021, 0.015), inkGloss);
  bezel.castShadow = !opts.phone;
  bezel.userData.section = "about";
  pickables.push(bezel);
  disposables.push(bezel.geometry);
  tilt.add(bezel);
  const frs = makeScreen("about", fr.w, fr.h, 1024);
  root.remove(frs);
  tilt.add(frs);
  frs.position.set(0, 0, 0.0005);

  const bn = L.bench;
  add(
    mergeAll([
      rbox(bn.w, 0.05, bn.d, bn.x, bn.h - 0.025, bn.z, 0.02),
      rbox(0.05, bn.h - 0.05, 0.05, bn.x - bn.w / 2 + 0.06, (bn.h - 0.05) / 2, bn.z - bn.d / 2 + 0.06, 0.01),
      rbox(0.05, bn.h - 0.05, 0.05, bn.x + bn.w / 2 - 0.06, (bn.h - 0.05) / 2, bn.z - bn.d / 2 + 0.06, 0.01),
      rbox(0.05, bn.h - 0.05, 0.05, bn.x - bn.w / 2 + 0.06, (bn.h - 0.05) / 2, bn.z + bn.d / 2 - 0.06, 0.01),
      rbox(0.05, bn.h - 0.05, 0.05, bn.x + bn.w / 2 - 0.06, (bn.h - 0.05) / 2, bn.z + bn.d / 2 - 0.06, 0.01),
    ]),
    std(mix(p.bright, p.grey, 0.25), 0.6),
    "about",
    { cast: true, receive: true },
  );

  // ---------- Cây xanh (tán tròn tông teal, gộp chung) ----------
  const pots: BufferGeometry[] = [];
  const bushes: BufferGeometry[] = [];
  const plants: [number, number, number, number][] = [
    [R.x0 + 0.5, 0, 1.35, 0.95],
    [R.x1 - 0.5, 0, 1.55, 0.85],
    [0.95, 0, R.z0 + 0.35, 0.7],
    [L.benchPlant.x, bn.h, bn.z, 0.32],
  ];
  for (const [x, y, z, s] of plants) {
    pots.push(new CylinderGeometry(0.22 * s, 0.17 * s, 0.42 * s, 24).translate(x, y + 0.21 * s, z));
    for (const [dx, dy, dz, r] of [
      [0, 0.78, 0, 0.3],
      [0.17, 0.62, 0.06, 0.22],
      [-0.15, 0.66, -0.05, 0.22],
      [0.04, 1.02, -0.03, 0.2],
      [-0.06, 0.6, 0.16, 0.18],
    ] as const) {
      bushes.push(new IcosahedronGeometry(r * s, 1).translate(x + dx * s, y + dy * s, z + dz * s));
    }
  }
  add(mergeAll(pots), inkMat, undefined, { cast: true });
  add(mergeAll(bushes), std(mix(p.teal, p.ink, 0.5), 0.8), undefined, { cast: true });

  // ---------- Đèn treo trên bàn ----------
  add(
    mergeAll([
      new CylinderGeometry(0.006, 0.006, 0.9, 6).translate(desk.x - 0.7, R.h - 0.45, desk.z + 0.3),
      new ConeGeometry(0.2, 0.18, 28, 1, true).translate(desk.x - 0.7, R.h - 0.95, desk.z + 0.3),
    ]),
    std(p.ink, 0.4, 0.3),
  );
  add(new CircleGeometry(0.19, 28).rotateX(Math.PI / 2).translate(desk.x - 0.7, R.h - 1.03, desk.z + 0.3), basic({ color: p.soft, toneMapped: false, side: DoubleSide }));

  for (const batch of batches.values()) own(batch.parts.length === 1 ? batch.parts[0] : mergeAll(batch.parts), batch.material, batch.section, batch.shadow);
  root.updateMatrixWorld(true);

  return {
    root,
    pickables,
    screens,
    cards,
    emblem,
    glows,
    dispose() {
      for (const d of disposables) d.dispose();
      for (const c of cards) (c.material as Material).dispose();
    },
  };
}

/** Ngôi nhà thu nhỏ đang xây trên bàn: "website là bất động sản số", thợ xây khiêng khối teal tới đặt */
function buildMiniHouse(
  p: RoomPalette,
  add: (g: BufferGeometry, m: Material, s?: SectionId, sh?: { cast?: boolean; receive?: boolean }) => void,
  std: (c: Color, r?: number, m?: number) => MeshStandardMaterial,
  rbox: (w: number, h: number, d: number, x: number, y: number, z: number, r?: number) => BufferGeometry,
) {
  const { house, desk } = LAYOUT;
  const y0 = desk.top;
  const s = 0.05; // cạnh một khối
  add(rbox(0.42, 0.012, 0.34, house.x, y0 + 0.006, house.z, 0.004), std(mix(p.soft, p.bright, 0.3), 0.8), "web", { receive: true });
  const blocks: BufferGeometry[] = [];
  const blocksLight: BufferGeometry[] = [];
  const cols = 6;
  const rows = 4;
  const w = cols * s;
  const d = 4 * s;
  // 4 vách bằng khối; vách trước chừa cửa; hàng trên cùng còn dở (đang xây)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const top = r === rows - 1 && c > 3;
      if (top) continue;
      const door = r < 2 && (c === 2 || c === 3);
      const x = house.x - w / 2 + s / 2 + c * s;
      const y = y0 + 0.012 + s / 2 + r * s;
      const list = (r + c) % 2 ? blocksLight : blocks;
      if (!door) list.push(boxAt(s * 0.96, s * 0.96, s * 0.96, x, y, house.z + d / 2 - s / 2));
      list.push(boxAt(s * 0.96, s * 0.96, s * 0.96, x, y, house.z - d / 2 + s / 2));
    }
    for (let c = 1; c < 3; c++) {
      const y = y0 + 0.012 + s / 2 + r * s;
      const list = (r + c) % 2 ? blocks : blocksLight;
      list.push(boxAt(s * 0.96, s * 0.96, s * 0.96, house.x - w / 2 + s / 2, y, house.z - d / 2 + s / 2 + c * s));
      if (r < rows - 1) list.push(boxAt(s * 0.96, s * 0.96, s * 0.96, house.x + w / 2 - s / 2, y, house.z - d / 2 + s / 2 + c * s));
    }
  }
  // đống khối chờ xây (thợ xây khiêng từ đây)
  const { pile } = LAYOUT;
  for (const [dx, dy, dz] of [
    [-0.03, 0, -0.025],
    [0.025, 0, -0.025],
    [-0.03, 0, 0.03],
    [0.025, 0, 0.03],
    [0, 1, 0],
  ] as const) (dy ? blocksLight : blocks).push(boxAt(s * 0.96, s * 0.96, s * 0.96, pile.x + dx, y0 + s / 2 + dy * s, pile.z + dz));
  add(mergeAll(blocks), std(p.teal, 0.5), "web", { cast: true });
  add(mergeAll(blocksLight), std(p.aqua, 0.55), "web", { cast: true });
  // giàn giáo + nửa mái
  const scaffold: BufferGeometry[] = [];
  const sh = rows * s + 0.08;
  for (const [dx, dz] of [
    [w / 2 + 0.03, d / 2 + 0.03],
    [w / 2 + 0.03, -d / 2 - 0.03],
  ]) scaffold.push(boxAt(0.008, sh, 0.008, house.x + dx, y0 + sh / 2, house.z + dz));
  scaffold.push(boxAt(0.008, 0.008, d + 0.06, house.x + w / 2 + 0.03, y0 + sh - 0.01, house.z));
  scaffold.push(boxAt(0.06, 0.006, d + 0.06, house.x + w / 2 + 0.0, y0 + 2 * s + 0.012, house.z));
  add(mergeAll(scaffold), std(p.grey, 0.5, 0.3), "web", { cast: true });
  const roofY = y0 + 0.012 + rows * s;
  const roof = new ConeGeometry(d * 0.82, 0.12, 4, 1).rotateY(Math.PI / 4).scale(w * 0.62 / d, 1, 1).translate(house.x - w * 0.18, roofY + 0.06, house.z);
  add(roof, std(p.ink, 0.45, 0.1), "web", { cast: true });
}

// ---------- Texture vẽ bằng canvas (chỉ hình học trừu tượng, không chữ số / dữ liệu giả) ----------

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

function plankTexture(base: Color, line: Color): CanvasTexture {
  return canvasTex(512, 512, (g) => {
    g.fillStyle = css(base);
    g.fillRect(0, 0, 512, 512);
    g.strokeStyle = css(line);
    g.globalAlpha = 0.35;
    g.lineWidth = 2;
    for (let y = 0; y <= 512; y += 64) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(512, y);
      g.stroke();
      const off = (y / 64) % 2 ? 180 : 360;
      g.beginPath();
      g.moveTo(off, y);
      g.lineTo(off, y + 64);
      g.stroke();
    }
  });
}

function skyTexture(p: RoomPalette): CanvasTexture {
  return canvasTex(512, 480, (g) => {
    const grad = g.createLinearGradient(0, 0, 0, 480);
    grad.addColorStop(0, css(mix(p.soft, p.aqua, 0.35)));
    grad.addColorStop(0.7, css(p.bright));
    g.fillStyle = grad;
    g.fillRect(0, 0, 512, 480);
    const far = css(mix(p.bright, p.grey, 0.35));
    const near = css(mix(p.bright, p.grey, 0.55));
    let x = 0;
    let i = 0;
    while (x < 512) {
      const w = 40 + ((i * 53) % 50);
      const h = 120 + ((i * 97) % 170);
      g.fillStyle = i % 2 ? far : near;
      g.fillRect(x, 480 - h, w - 6, h);
      g.fillStyle = css(mix(p.bright, p.soft, 0.6));
      for (let wy = 480 - h + 14; wy < 470; wy += 22) for (let wx = x + 8; wx < x + w - 14; wx += 14) g.fillRect(wx, wy, 6, 9);
      x += w;
      i++;
    }
  });
}

function pegboardTexture(p: RoomPalette): CanvasTexture {
  return canvasTex(640, 456, (g) => {
    g.fillStyle = css(p.ink);
    g.fillRect(0, 0, 640, 456);
    g.fillStyle = css(mix(p.ink, p.teal, 0.32));
    for (let y = 12; y < 456; y += 16) for (let x = 12; x < 640; x += 16) {
      g.beginPath();
      g.arc(x, y, 2.2, 0, Math.PI * 2);
      g.fill();
    }
  });
}

function feedTexture(p: RoomPalette): CanvasTexture {
  return canvasTex(240, 500, (g) => {
    g.fillStyle = css(p.bright);
    g.fillRect(0, 0, 240, 500);
    g.fillStyle = css(p.ink);
    g.fillRect(0, 0, 240, 46);
    g.fillStyle = css(p.teal);
    g.beginPath();
    g.arc(26, 23, 12, 0, Math.PI * 2);
    g.fill();
    const post = (y: number, c: Color) => {
      g.fillStyle = css(mix(p.bright, p.grey, 0.2));
      g.fillRect(12, y, 216, 196);
      g.fillStyle = css(c);
      g.fillRect(12, y + 26, 216, 128);
      g.fillStyle = css(p.ink);
      g.beginPath();
      g.arc(26, y + 13, 7, 0, Math.PI * 2);
      g.fill();
      g.fillRect(40, y + 9, 70, 8);
      g.fillStyle = css(p.teal);
      for (let k = 0; k < 3; k++) g.fillRect(18 + k * 28, y + 168, 18, 14);
    };
    post(58, p.aqua);
    post(266, p.teal);
  });
}
