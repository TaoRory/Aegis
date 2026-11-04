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
import { radialTexture } from "@/components/space/engine/textures";
import type { SectionId } from "@/content/showroom";

/**
 * Dựng "Studio Aegis": mô hình cắt lớp một phòng làm việc ban ngày (sàn có độ dày + 2 vách, nổi trên nền sáng), tông màu
 * đọc từ CSS token brand (không có mã màu ở đây trừ giá trị dự phòng). Các "Thợ Aegis" tí hon (makers.ts) sống trên đồ đạc.
 *
 * Toạ độ (mét): x −4..4 (trái → phải), z −3.5..1.6 (vách sau ở z = −3.5), y lên trên; vách trái ở x = −4.
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

export const ROOM = { x0: -3.2, x1: 3.2, z0: -2.8, z1: 2.0, h: 3.0 };

/**
 * Bố cục (dùng chung cho dựng phòng và lộ trình của Thợ Aegis). Hai sản phẩm chính chiếm hai vách đối diện camera:
 * Website & App ở giữa vách sau, Digital Marketing ở vách trái; Dự án ở phần phải vách sau. Về Aegis và Liên hệ là hai
 * "trạm" đứng ở nửa trước của sàn, màn hình quay chéo về phía người xem, lấp khoảng trống và tạo chiều sâu.
 */
export const LAYOUT = {
  desk: { x: -0.35, z: -2.15, w: 2.6, d: 1.05, top: 0.76 },
  monitor: { x: -0.35, y: 1.27, z: -2.42, w: 1.2, h: 0.75 },
  keyboard: { x: -0.43, z: -1.9, w: 0.62, d: 0.2, top: 0.786 },
  house: { x: 0.55, z: -2.32 },
  pile: { x: 0.72, z: -1.84 },
  window: { x0: -2.95, x1: -1.85, y0: 0.95, y1: 2.45 },
  board: { x: 2.15, y: 1.7, w: 1.8, h: 1.45 },
  tv: { x: 2.15, y: 1.92, w: 1.1, h: 0.62 },
  ladder: { x: 2.86, baseZ: -2.26, topY: 1.08 },
  cardBox: { x: 1.55, z: -2.12 },
  sideboard: { x: -2.9, z: -0.95, w: 0.55, d: 1.6, h: 0.62 },
  signage: { x: -2.96, y: 1.05, z: -1.05, w: 0.88, h: 0.66 },
  phone: { x: -2.94, z: -0.38 },
  speaker: { x: -2.8, z: 0.22, w: 0.36, h: 0.6 },
  emblem: { y: 2.2, z: -2.28 },
  frame: { x: -1.35, z: 1.45, y: 1.06, w: 0.8, h: 0.6, yaw: Math.PI / 4 },
  bench: { x: -2.55, z: 1.25, w: 0.42, d: 0.9, h: 0.42 },
  benchPlant: { z: 1.52 },
  table: { x: 2.05, z: 0.85, r: 0.44, top: 0.72 },
  laptop: { w: 0.5, h: 0.31, tilt: 0.2, yaw: Math.PI / 4 },
};

/** Điểm neo kim cương (toạ độ thế giới) của từng khu */
export const ANCHORS: Record<SectionId, [number, number, number]> = {
  web: [-0.35, 1.82, -2.4],
  projects: [2.15, 2.52, -2.7],
  marketing: [-2.97, 1.55, -1.05],
  about: [-1.35, 1.55, 1.45],
  contact: [2.05, 1.2, 0.85],
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
  /** Biểu tượng kính trên vách trái */
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

  // ---------- Đế mô hình: sàn gỗ sáng trên khối đế ink, bóng mờ dưới đế ----------
  const slabT = 0.28;
  const zc = (ROOM.z0 + ROOM.z1) / 2;
  add(rbox(ROOM.x1 - ROOM.x0 + 0.14, slabT, ROOM.z1 - ROOM.z0 + 0.14, (ROOM.x0 + ROOM.x1) / 2 - 0.07, -slabT / 2 - 0.002, zc - 0.07, 0.04), inkMat, undefined, { receive: true });
  const floorTex = plankTexture(mix(p.bright, p.grey, 0.14), mix(p.bright, p.grey, 0.42));
  floorTex.wrapS = floorTex.wrapT = RepeatWrapping;
  floorTex.repeat.set(2.2, 2);
  disposables.push(floorTex);
  const floor = new MeshStandardMaterial({ map: floorTex, roughness: 0.72 });
  disposables.push(floor);
  add(new PlaneGeometry(ROOM.x1 - ROOM.x0, ROOM.z1 - ROOM.z0).rotateX(-Math.PI / 2).translate(0, 0, zc), floor, undefined, { receive: true });
  // viền teal mảnh chạy quanh mép sàn (nét "bản vẽ" của brand)
  add(
    mergeAll([
      boxAt(ROOM.x1 - ROOM.x0 + 0.14, 0.014, 0.014, -0.07, 0.0, ROOM.z1 + 0.0),
      boxAt(0.014, 0.014, ROOM.z1 - ROOM.z0 + 0.14, ROOM.x1, 0.0, zc - 0.07),
    ]),
    basic({ color: p.teal, toneMapped: false }),
  );
  const ground = radialTexture();
  disposables.push(ground);
  add(
    new PlaneGeometry(13, 11).rotateX(-Math.PI / 2).translate(0.3, -slabT - 0.05, zc + 0.3),
    basic({ color: p.ink, alphaMap: ground, transparent: true, opacity: 0.32, depthWrite: false }),
  );

  // ---------- Vách sau (có ô cửa sổ) và vách trái ----------
  const wall = std(p.bright, 0.95);
  const { x0: wx0, x1: wx1, y0: wy0, y1: wy1 } = L.window;
  const t = 0.14;
  const bz = ROOM.z0 - t / 2;
  const backLeft = ROOM.x0 - t;
  add(
    mergeAll([
      boxAt(wx0 - backLeft, ROOM.h, t, (backLeft + wx0) / 2, ROOM.h / 2, bz),
      boxAt(ROOM.x1 - wx1, ROOM.h, t, (wx1 + ROOM.x1) / 2, ROOM.h / 2, bz),
      boxAt(wx1 - wx0, wy0, t, (wx0 + wx1) / 2, wy0 / 2, bz),
      boxAt(wx1 - wx0, ROOM.h - wy1, t, (wx0 + wx1) / 2, (wy1 + ROOM.h) / 2, bz),
      boxAt(t, ROOM.h, ROOM.z1 - ROOM.z0, ROOM.x0 - t / 2, ROOM.h / 2, (ROOM.z0 + ROOM.z1) / 2),
    ]),
    wall,
    undefined,
    { receive: true, cast: true },
  );
  // nắp vách màu ink: nét cắt của mô hình
  add(
    mergeAll([
      boxAt(ROOM.x1 - backLeft, 0.03, t + 0.004, (backLeft + ROOM.x1) / 2, ROOM.h + 0.015, bz),
      boxAt(t + 0.004, 0.03, ROOM.z1 - ROOM.z0, ROOM.x0 - t / 2, ROOM.h + 0.015, (ROOM.z0 + ROOM.z1) / 2),
      boxAt(0.03, ROOM.h + 0.03, t + 0.004, ROOM.x1 + 0.0, ROOM.h / 2, bz),
      boxAt(t + 0.004, ROOM.h + 0.03, 0.03, ROOM.x0 - t / 2, ROOM.h / 2, ROOM.z1),
    ]),
    inkMat,
  );
  // mảng sơn Soft Aqua nửa dưới vách + chỉ teal mảnh
  const band = std(mix(p.soft, p.bright, 0.55), 0.92);
  const bandH = 0.95;
  add(
    mergeAll([
      boxAt(wx0 - ROOM.x0, bandH, 0.01, (ROOM.x0 + wx0) / 2, bandH / 2, ROOM.z0 + 0.006),
      boxAt(ROOM.x1 - wx1, bandH, 0.01, (wx1 + ROOM.x1) / 2, bandH / 2, ROOM.z0 + 0.006),
      boxAt(wx1 - wx0, bandH, 0.01, (wx0 + wx1) / 2, bandH / 2, ROOM.z0 + 0.006),
      boxAt(0.01, bandH, ROOM.z1 - ROOM.z0, ROOM.x0 + 0.006, bandH / 2, (ROOM.z0 + ROOM.z1) / 2),
    ]),
    band,
    undefined,
    { receive: true },
  );
  add(
    mergeAll([
      boxAt(ROOM.x1 - ROOM.x0, 0.012, 0.012, 0, bandH + 0.006, ROOM.z0 + 0.012),
      boxAt(0.012, 0.012, ROOM.z1 - ROOM.z0, ROOM.x0 + 0.012, bandH + 0.006, zc),
    ]),
    tealMat,
  );
  const skirt = std(mix(p.soft, p.grey, 0.3), 0.8);
  add(mergeAll([boxAt(ROOM.x1 - ROOM.x0, 0.07, 0.02, 0, 0.035, ROOM.z0 + 0.012), boxAt(0.02, 0.07, ROOM.z1 - ROOM.z0, ROOM.x0 + 0.012, 0.035, zc)]), skirt);

  // ---------- Cửa sổ: bầu trời sáng + chân trời thành phố ----------
  const sky = skyTexture(p);
  disposables.push(sky);
  const glass = own(new PlaneGeometry(wx1 - wx0, wy1 - wy0), basic({ map: sky, toneMapped: false }));
  glass.position.set((wx0 + wx1) / 2, (wy0 + wy1) / 2, ROOM.z0 - t + 0.01);
  const fw = 0.05;
  add(
    mergeAll([
      boxAt(wx1 - wx0 + fw * 2, fw, 0.1, (wx0 + wx1) / 2, wy0, ROOM.z0 - 0.04),
      boxAt(wx1 - wx0 + fw * 2, fw, 0.1, (wx0 + wx1) / 2, wy1, ROOM.z0 - 0.04),
      boxAt(fw, wy1 - wy0, 0.1, wx0, (wy0 + wy1) / 2, ROOM.z0 - 0.04),
      boxAt(fw, wy1 - wy0, 0.1, wx1, (wy0 + wy1) / 2, ROOM.z0 - 0.04),
      boxAt(0.03, wy1 - wy0, 0.05, (wx0 + wx1) / 2, (wy0 + wy1) / 2, ROOM.z0 - 0.07),
      boxAt(wx1 - wx0 + 0.3, 0.04, 0.2, (wx0 + wx1) / 2, wy0 - 0.02, ROOM.z0 + 0.07),
    ]),
    inkMat,
    undefined,
    { cast: true },
  );

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
  add(new CylinderGeometry(0.045, 0.04, 0.1, 20).translate(desk.x - 1.1, desk.top + 0.05, desk.z + 0.2), tealMat, undefined, { cast: true });
  add(rbox(0.24, 0.02, 0.32, desk.x - 0.85, desk.top + 0.01, desk.z + 0.08, 0.006).rotateY(0.0), std(p.soft, 0.7), undefined, { cast: true });

  buildMiniHouse(p, add, std, rbox);

  // ghế
  const chair = std(p.inkRaised, 0.55, 0.1);
  add(
    mergeAll([
      rbox(0.54, 0.08, 0.5, desk.x + 0.05, 0.48, desk.z + 1.0, 0.035),
      rbox(0.52, 0.6, 0.07, desk.x + 0.05, 0.86, desk.z + 1.26, 0.03).rotateX(0),
      new CylinderGeometry(0.03, 0.03, 0.38, 12).translate(desk.x + 0.05, 0.25, desk.z + 1.0),
      new CylinderGeometry(0.28, 0.28, 0.03, 24).translate(desk.x + 0.05, 0.04, desk.z + 1.0),
    ]),
    chair,
    "web",
    { cast: true },
  );
  add(rbox(2.7, 0.012, 1.6, desk.x, 0.006, desk.z + 0.85, 0.3), std(mix(p.soft, p.grey, 0.2), 0.95), "web", { receive: true });

  // ---------- Thảm theo khu (mỗi khu một sắc trong bảng màu brand, nhìn toàn cảnh tách bạch từng khu) ----------
  const rugAqua = std(mix(p.aqua, p.bright, 0.45), 0.95);
  const rugSoft = std(mix(p.soft, p.bright, 0.15), 0.95);
  const rugTeal = std(mix(p.teal, p.bright, 0.62), 0.95);
  add(rbox(1.25, 0.012, 1.9, L.sideboard.x + 0.6, 0.006, L.sideboard.z, 0.3), rugAqua, "marketing", { receive: true });
  add(rbox(1.5, 0.012, 1.15, (L.bench.x + L.frame.x) / 2, 0.006, (L.bench.z + L.frame.z) / 2, 0.3), rugTeal, "about", { receive: true });
  add(new CylinderGeometry(0.78, 0.78, 0.012, 48).translate(L.table.x, 0.006, L.table.z), rugSoft, "contact", { receive: true });
  add(rbox(1.9, 0.012, 1.1, L.board.x, 0.006, ROOM.z0 + 0.72, 0.3), rugAqua, "projects", { receive: true });

  // ---------- 05 Liên hệ: trạm bàn tròn phía trước bên phải, laptop quay chéo về người xem ----------
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
  add(rbox(b.w, b.h, 0.03, b.x, b.y, ROOM.z0 + 0.02, 0.012), pegMat, "projects", { receive: true });
  const halo = basic({ color: p.aqua, transparent: true, opacity: 0.55, toneMapped: false });
  glows.push(halo);
  add(
    mergeAll([
      boxAt(b.w + 0.06, 0.012, 0.01, b.x, b.y + b.h / 2 + 0.02, ROOM.z0 + 0.005),
      boxAt(b.w + 0.06, 0.012, 0.01, b.x, b.y - b.h / 2 - 0.02, ROOM.z0 + 0.005),
      boxAt(0.012, b.h + 0.04, 0.01, b.x - b.w / 2 - 0.03, b.y, ROOM.z0 + 0.005),
      boxAt(0.012, b.h + 0.04, 0.01, b.x + b.w / 2 + 0.03, b.y, ROOM.z0 + 0.005),
    ]),
    halo,
  );
  const tv = L.tv;
  add(rbox(tv.w + 0.06, tv.h + 0.06, 0.05, tv.x, tv.y, ROOM.z0 + 0.06, 0.015), inkGloss, "projects", { cast: true });
  makeScreen("projects", tv.w, tv.h, 1280).position.set(tv.x, tv.y, ROOM.z0 + 0.0865);

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
    pins.push(new IcosahedronGeometry(0.012, 1).translate(cx, cy + 0.11, ROOM.z0 + 0.05));
    const cardBack = new MeshStandardMaterial({ color: p.bright, roughness: 0.6 });
    disposables.push(cardBack);
    const card = own(new PlaneGeometry(0.2, 0.25), cardBack, "projects", { cast: true });
    card.position.set(cx, cy, ROOM.z0 + 0.045);
    card.rotation.z = ((i % 3) - 1) * 0.04;
    cards.push(card);
  });
  add(mergeAll(pins), tealMat);

  // thang gỗ sáng tựa vào bảng
  const ld = L.ladder;
  const lean = Math.atan2(ld.baseZ - (ROOM.z0 + 0.06), ld.topY);
  const rails: BufferGeometry[] = [];
  const len = Math.hypot(ld.topY, ld.baseZ - (ROOM.z0 + 0.06));
  for (const dx of [-0.1, 0.1]) rails.push(boxAt(0.022, len, 0.022, ld.x + dx, len / 2, 0));
  for (let r = 0; r < 5; r++) rails.push(boxAt(0.2, 0.016, 0.018, ld.x, 0.16 + r * ((len - 0.25) / 4), 0));
  const ladderGeo = mergeAll(rails).rotateX(-lean).translate(0, 0, ld.baseZ);
  add(ladderGeo, std(mix(p.bright, p.grey, 0.25), 0.6), undefined, { cast: true });
  // hộp thẻ dưới sàn
  const cb = L.cardBox;
  add(rbox(0.3, 0.14, 0.22, cb.x, 0.07, cb.z, 0.015), tealMat, undefined, { cast: true });
  add(
    mergeAll([0, 1, 2].map((i) => boxAt(0.17, 0.12, 0.004, cb.x - 0.05 + i * 0.05, 0.16, cb.z - 0.03 + i * 0.02).rotateZ(0))),
    std(p.bright, 0.6),
  );

  // ---------- 03 Digital Marketing: tủ thấp + bảng hiển thị chiến dịch + điện thoại + loa sàn ----------
  const sb = L.sideboard;
  add(rbox(sb.w, sb.h, sb.d, sb.x, sb.h / 2, sb.z, 0.025), inkMat, "marketing", { cast: true, receive: true });
  add(
    mergeAll([boxAt(0.012, 0.22, 0.02, sb.x + sb.w / 2 + 0.002, 0.42, sb.z - 0.2), boxAt(0.012, 0.22, 0.02, sb.x + sb.w / 2 + 0.002, 0.42, sb.z + 0.2)]),
    tealMat,
  );
  const sg = L.signage;
  add(
    mergeAll([
      rbox(0.05, sg.h + 0.06, sg.w + 0.06, sg.x - 0.03, sg.y, sg.z, 0.015),
      rbox(0.16, 0.025, 0.36, sg.x - 0.01, sb.h + 0.0125, sg.z, 0.01),
      rbox(0.04, sg.y - sg.h / 2 - sb.h, 0.06, sg.x - 0.04, sb.h + (sg.y - sg.h / 2 - sb.h) / 2, sg.z, 0.01),
    ]),
    inkGloss,
    "marketing",
    { cast: true },
  );
  const sgs = makeScreen("marketing", sg.w, sg.h, 1024);
  sgs.position.set(sg.x - 0.0045, sg.y, sg.z);
  sgs.rotation.y = Math.PI / 2;

  const ph = L.phone;
  add(
    mergeAll([
      rbox(0.02, 0.3, 0.15, 0, 0, 0, 0.008).rotateZ(-0.2).translate(ph.x, sb.h + 0.17, ph.z),
      rbox(0.12, 0.02, 0.14, ph.x - 0.02, sb.h + 0.01, ph.z, 0.006),
    ]),
    inkGloss,
    "marketing",
    { cast: true },
  );
  const feed = feedTexture(p);
  disposables.push(feed);
  const feedMesh = own(new PlaneGeometry(0.13, 0.27), basic({ map: feed, toneMapped: false }), "marketing");
  feedMesh.position.set(ph.x + 0.012, sb.h + 0.17, ph.z);
  feedMesh.rotation.set(0, Math.PI / 2, 0);
  feedMesh.rotateX(-0.2);

  const sp = L.speaker;
  add(rbox(sp.w, sp.h, sp.w, sp.x, sp.h / 2, sp.z, 0.05), brightMat, "marketing", { cast: true });
  add(
    mergeAll([
      new CircleGeometry(0.11, 32).rotateY(Math.PI / 2).translate(sp.x + sp.w / 2 + 0.002, sp.h * 0.36, sp.z),
      new CircleGeometry(0.05, 24).rotateY(Math.PI / 2).translate(sp.x + sp.w / 2 + 0.002, sp.h * 0.74, sp.z),
    ]),
    inkMat,
  );
  const ring = basic({ color: p.teal, toneMapped: false });
  glows.push(ring);
  add(new TorusGeometry(0.115, 0.007, 8, 40).rotateY(Math.PI / 2).translate(sp.x + sp.w / 2 + 0.004, sp.h * 0.36, sp.z), ring);

  // kệ sách trên tủ
  const shelfY = 1.82;
  add(boxAt(0.3, 0.03, 1.5, ROOM.x0 + 0.15, shelfY, sb.z), inkMat, undefined, { cast: true });
  const bookCols = [mix(p.teal, p.ink, 0.3), p.ink, mix(p.aqua, p.grey, 0.35)];
  const bookGeo: BufferGeometry[][] = bookCols.map(() => []);
  let bzz = sb.z - 0.65;
  for (let i = 0; i < 12; i++) {
    const bh = 0.2 + ((i * 37) % 9) / 60;
    const bw = 0.04 + ((i * 13) % 4) / 100;
    bookGeo[i % bookCols.length].push(boxAt(0.2, bh, bw, ROOM.x0 + 0.14, shelfY + 0.015 + bh / 2, bzz));
    bzz += bw + 0.012;
  }
  bookCols.forEach((c, i) => add(mergeAll(bookGeo[i]), std(c, 0.7), undefined, { cast: true }));

  // ---------- 04 Về Aegis: logo kính trên vách trái + trạm khung ảnh trên giá đứng phía trước, ghế băng + chậu cây ----------
  const emblemMat = basic({ transparent: true, toneMapped: false, color: p.bright, opacity: 0 });
  const emblem = own(new PlaneGeometry(0.74, 0.78), emblemMat, "about");
  emblem.position.set(ROOM.x0 + 0.02, L.emblem.y, L.emblem.z);
  emblem.rotation.y = Math.PI / 2;
  const plateMesh = own(new CircleGeometry(0.52, 64), std(p.ink, 0.4, 0.15), "about", { receive: true });
  plateMesh.position.set(ROOM.x0 + 0.012, L.emblem.y, L.emblem.z);
  plateMesh.rotation.y = Math.PI / 2;

  const fr = L.frame;
  const easel = new Group();
  easel.position.set(fr.x, 0, fr.z);
  easel.rotation.y = fr.yaw;
  root.add(easel);
  const standMat = std(mix(p.bright, p.grey, 0.15), 0.5);
  const stand = new Mesh(
    mergeAll([
      rbox(0.56, 0.035, 0.34, 0, 0.0175, 0, 0.012),
      rbox(0.05, fr.y - fr.h / 2 + 0.02, 0.05, 0, (fr.y - fr.h / 2 + 0.02) / 2, -0.02, 0.012),
    ]),
    standMat,
  );
  stand.castShadow = !opts.phone;
  stand.userData.section = "about";
  pickables.push(stand);
  disposables.push(stand.geometry);
  easel.add(stand);
  const tilt = new Group();
  tilt.position.set(0, fr.y, 0.0);
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
    [(wx0 + wx1) / 2, 0, ROOM.z0 + 0.32, 0.78],
    [bn.x, bn.h, L.benchPlant.z, 0.32],
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
      new CylinderGeometry(0.006, 0.006, 0.9, 6).translate(desk.x - 0.55, ROOM.h - 0.45, desk.z + 0.15),
      new ConeGeometry(0.2, 0.18, 28, 1, true).translate(desk.x - 0.55, ROOM.h - 0.95, desk.z + 0.15),
    ]),
    std(p.ink, 0.4, 0.3),
  );
  add(new CircleGeometry(0.19, 28).rotateX(Math.PI / 2).translate(desk.x - 0.55, ROOM.h - 1.03, desk.z + 0.15), basic({ color: p.soft, toneMapped: false, side: DoubleSide }));

  for (const b of batches.values()) own(b.parts.length === 1 ? b.parts[0] : mergeAll(b.parts), b.material, b.section, b.shadow);
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
