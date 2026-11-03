import {
  CanvasTexture,
  IcosahedronGeometry,
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
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
 * Dựng "Studio Aegis": một góc phòng làm việc ban ngày, tông sáng theo bảng màu brand (đọc từ CSS token, không có mã màu ở đây
 * trừ giá trị dự phòng). Hai vách (sau, trái) + sàn, mở về phía camera như một diorama.
 *
 * Toạ độ (mét): x −4..4 (trái → phải), z −3.5..3.5 (vách sau ở z = −3.5), y lên trên; vách trái ở x = −4.
 * Mỗi khu có một nhóm vật thể gắn `userData.section` để bắt rê/bấm chuột, và một điểm neo cho kim cương.
 */

export interface RoomPalette {
  ink: Color;
  inkRaised: Color;
  teal: Color;
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
    aqua: token("--palette-aqua", "#84e4d6"),
    soft: token("--palette-soft", "#c9f8f0"),
    bright: token("--palette-bright", "#f5f7f6"),
    grey: token("--palette-grey", "#8b9ca1"),
    neutral: token("--palette-ink-neutral", "#0b0f14"),
  };
}

const css = (c: Color) => `#${c.getHexString()}`;
const mix = (a: Color, b: Color, t: number) => a.clone().lerp(b, t);

export const ROOM = { w: 8, d: 7, h: 3.2, backZ: -3.5, leftX: -4 };

/** Điểm neo kim cương (toạ độ thế giới) của từng khu */
export const ANCHORS: Record<SectionId, [number, number, number]> = {
  web: [-1.6, 1.78, -3.05],
  projects: [3.0, 2.48, -3.4],
  marketing: [-3.55, 1.42, 0.9],
  about: [-3.9, 2.82, -1.2],
  contact: [-0.62, 1.12, -2.62],
};

export interface BuiltRoom {
  root: Group;
  pickables: Mesh[];
  /** Màn hình máy tính: đổi ảnh dự án theo thời gian */
  monitor: { mesh: Mesh; canvas: HTMLCanvasElement; texture: CanvasTexture };
  /** Thẻ dự án trên bảng ghim: gắn ảnh khi tải xong */
  cards: Mesh[];
  /** Biểu tượng kính trên vách trái */
  emblem: Mesh;
  /** Đèn LED viền bàn, quầng sáng: nhịp thở nhẹ */
  glows: MeshBasicMaterial[];
  dispose(): void;
}

export function buildRoom(p: RoomPalette, opts: { phone: boolean }): BuiltRoom {
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
  const add = (geometry: BufferGeometry, material: Material, section?: SectionId, shadow: { cast?: boolean; receive?: boolean } = {}) => {
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

  // ---------- Vỏ phòng ----------
  const wallColor = p.bright;
  const floorTex = plankTexture(mix(p.bright, p.grey, 0.16), mix(p.bright, p.grey, 0.4));
  floorTex.wrapS = floorTex.wrapT = RepeatWrapping;
  floorTex.repeat.set(2, 2);
  disposables.push(floorTex);
  const floor = new MeshStandardMaterial({ map: floorTex, roughness: 0.7 });
  disposables.push(floor);
  // sàn và vách kéo dài quá khung hình để camera không thấy mép
  floorTex.repeat.set(4, 4);
  add(new PlaneGeometry(18, 18).rotateX(-Math.PI / 2).translate(2, 0, 4.5), floor, undefined, { receive: true });

  const wall = std(wallColor, 0.95);
  // vách sau có ô cửa sổ (x 0.1..1.7, y 0.95..2.45) → ghép 4 khối quanh ô
  const wx0 = 0.1, wx1 = 1.7, wy0 = 0.95, wy1 = 2.45, t = 0.12;
  const back = mergeAll([
    boxAt(wx0 - ROOM.leftX, ROOM.h, t, (ROOM.leftX + wx0) / 2, ROOM.h / 2, ROOM.backZ - t / 2),
    boxAt(9 - wx1, ROOM.h, t, (wx1 + 9) / 2, ROOM.h / 2, ROOM.backZ - t / 2),
    boxAt(wx1 - wx0, wy0, t, (wx0 + wx1) / 2, wy0 / 2, ROOM.backZ - t / 2),
    boxAt(wx1 - wx0, ROOM.h - wy1, t, (wx0 + wx1) / 2, (wy1 + ROOM.h) / 2, ROOM.backZ - t / 2),
  ]);
  add(back, wall, undefined, { receive: true });
  add(boxAt(t, ROOM.h, 13, ROOM.leftX - t / 2, ROOM.h / 2, 3), wall, undefined, { receive: true });
  // mảng sơn Soft Aqua ở nửa dưới vách + chỉ teal mảnh: điểm màu thương hiệu cho căn phòng sáng
  const band = std(mix(p.soft, p.bright, 0.62), 0.92);
  add(
    mergeAll([
      boxAt(wx0 - ROOM.leftX, 0.95, 0.01, (ROOM.leftX + wx0) / 2, 0.475, ROOM.backZ + 0.006),
      boxAt(9 - wx1, 0.95, 0.01, (wx1 + 9) / 2, 0.475, ROOM.backZ + 0.006),
      boxAt(wx1 - wx0, 0.95, 0.01, (wx0 + wx1) / 2, 0.475, ROOM.backZ + 0.006),
      boxAt(0.01, 0.95, 13, ROOM.leftX + 0.006, 0.475, 3),
    ]),
    band,
    undefined,
    { receive: true },
  );
  add(mergeAll([boxAt(13, 0.012, 0.012, 2.5, 0.955, ROOM.backZ + 0.012), boxAt(0.012, 0.012, 13, ROOM.leftX + 0.012, 0.955, 3)]), std(p.teal, 0.5));
  // chân tường (len chân tường) màu soft để tách vách với sàn
  const skirt = std(mix(p.soft, p.grey, 0.25), 0.8);
  add(mergeAll([boxAt(13, 0.08, 0.02, 2.5, 0.04, ROOM.backZ + 0.012), boxAt(0.02, 0.08, 13, ROOM.leftX + 0.012, 0.04, 3)]), skirt);

  // ---------- Cửa sổ: bầu trời sáng + đường chân trời thành phố, khung ink ----------
  const sky = skyTexture(p);
  disposables.push(sky);
  const skyMat = new MeshBasicMaterial({ map: sky, toneMapped: false });
  disposables.push(skyMat);
  const glass = add(new PlaneGeometry(wx1 - wx0, wy1 - wy0), skyMat, "about");
  glass.position.set((wx0 + wx1) / 2, (wy0 + wy1) / 2, ROOM.backZ - t);
  const frame = std(p.ink, 0.5, 0.2);
  const fw = 0.05;
  add(
    mergeAll([
      boxAt(wx1 - wx0 + fw * 2, fw, 0.08, (wx0 + wx1) / 2, wy0, ROOM.backZ - 0.02),
      boxAt(wx1 - wx0 + fw * 2, fw, 0.08, (wx0 + wx1) / 2, wy1, ROOM.backZ - 0.02),
      boxAt(fw, wy1 - wy0, 0.08, wx0, (wy0 + wy1) / 2, ROOM.backZ - 0.02),
      boxAt(fw, wy1 - wy0, 0.08, wx1, (wy0 + wy1) / 2, ROOM.backZ - 0.02),
      boxAt(0.03, wy1 - wy0, 0.05, (wx0 + wx1) / 2, (wy0 + wy1) / 2, ROOM.backZ - 0.04),
      boxAt(wx1 - wx0 + 0.3, 0.04, 0.22, (wx0 + wx1) / 2, wy0 - 0.02, ROOM.backZ + 0.08),
    ]),
    frame,
    "about",
    { cast: true },
  );
  // ---------- Khu 01 Website & App: bàn, màn hình, ghế ----------
  const desk = { x: -1.6, z: -2.9, w: 2.4, d: 1.0, top: 0.76 };
  const inkMat = std(p.ink, 0.55, 0.1);
  add(
    mergeAll([
      new RoundedBoxGeometry(desk.w, 0.06, desk.d, 2, 0.02).translate(desk.x, desk.top - 0.03, desk.z),
      boxAt(0.06, desk.top - 0.06, desk.d - 0.1, desk.x - desk.w / 2 + 0.08, (desk.top - 0.06) / 2, desk.z),
      boxAt(0.5, desk.top - 0.06, desk.d - 0.1, desk.x + desk.w / 2 - 0.3, (desk.top - 0.06) / 2, desk.z),
      boxAt(desk.w - 0.2, 0.3, 0.03, desk.x, desk.top - 0.25, desk.z - desk.d / 2 + 0.06),
    ]),
    inkMat,
    "web",
    { cast: true, receive: true },
  );
  // dải LED teal ở mép trước mặt bàn
  const led = new MeshBasicMaterial({ color: p.teal, toneMapped: false });
  disposables.push(led);
  glows.push(led);
  add(boxAt(desk.w - 0.04, 0.012, 0.012, desk.x, desk.top - 0.052, desk.z + desk.d / 2 + 0.002), led, "web");
  // tay nắm ngăn kéo
  add(boxAt(0.18, 0.02, 0.02, desk.x + desk.w / 2 - 0.3, 0.5, desk.z + desk.d / 2 - 0.02), std(p.teal, 0.4, 0.3));

  // màn hình
  const screenW = 1.12, screenH = 0.66;
  const mx = desk.x, my = desk.top + 0.46, mz = desk.z - 0.18;
  add(
    mergeAll([
      new RoundedBoxGeometry(screenW + 0.06, screenH + 0.06, 0.04, 2, 0.015).translate(mx, my, mz - 0.025),
      boxAt(0.05, 0.36, 0.05, mx, desk.top + 0.18, mz - 0.07),
      new RoundedBoxGeometry(0.34, 0.02, 0.22, 2, 0.008).translate(mx, desk.top + 0.01, mz - 0.03),
    ]),
    inkMat,
    "web",
    { cast: true },
  );
  const monitorCanvas = document.createElement("canvas");
  monitorCanvas.width = 1024;
  monitorCanvas.height = 604;
  const monitorTex = new CanvasTexture(monitorCanvas);
  monitorTex.colorSpace = SRGBColorSpace;
  disposables.push(monitorTex);
  drawScreenPlaceholder(monitorCanvas, p);
  const screenMat = new MeshBasicMaterial({ map: monitorTex, toneMapped: false });
  disposables.push(screenMat);
  const monitor = add(new PlaneGeometry(screenW, screenH), screenMat, "web");
  monitor.position.set(mx, my, mz + 0.0);

  // bàn phím, chuột, cốc, sổ
  const keyMat = std(mix(p.bright, p.grey, 0.12), 0.6);
  add(
    mergeAll([
      new RoundedBoxGeometry(0.62, 0.025, 0.2, 2, 0.008).translate(mx - 0.05, desk.top + 0.013, desk.z + 0.16),
      new RoundedBoxGeometry(0.07, 0.03, 0.11, 2, 0.015).translate(mx + 0.4, desk.top + 0.015, desk.z + 0.18),
    ]),
    keyMat,
    "web",
    { cast: true },
  );
  add(new CylinderGeometry(0.045, 0.04, 0.1, 18).translate(desk.x - 0.85, desk.top + 0.05, desk.z + 0.12), std(p.teal, 0.45), undefined, { cast: true });
  add(new RoundedBoxGeometry(0.24, 0.02, 0.32, 2, 0.006).rotateY(0.25).translate(desk.x - 0.62, desk.top + 0.01, desk.z + 0.05), std(p.soft, 0.7), undefined, { cast: true });

  // ghế
  const chair = std(p.inkRaised, 0.6, 0.1);
  add(
    mergeAll([
      new RoundedBoxGeometry(0.52, 0.08, 0.5, 2, 0.03).translate(desk.x + 0.05, 0.48, desk.z + 0.95),
      new RoundedBoxGeometry(0.5, 0.6, 0.07, 2, 0.03).rotateX(-0.12).translate(desk.x + 0.05, 0.86, desk.z + 1.2),
      new CylinderGeometry(0.03, 0.03, 0.38, 10).translate(desk.x + 0.05, 0.25, desk.z + 0.95),
      new CylinderGeometry(0.28, 0.28, 0.03, 20).translate(desk.x + 0.05, 0.05, desk.z + 0.95),
    ]),
    chair,
    "web",
    { cast: true },
  );

  // thảm dưới bàn
  const rug = std(mix(p.soft, p.grey, 0.22), 0.95);
  add(new RoundedBoxGeometry(3.0, 0.012, 2.2, 2, 0.006).translate(desk.x, 0.006, desk.z + 0.85), rug, undefined, { receive: true });

  // ---------- Khu 05 Liên hệ: kệ danh thiếp trên bàn ----------
  const cardX = -0.62, cardZ = -2.62;
  add(new RoundedBoxGeometry(0.22, 0.05, 0.12, 2, 0.01).translate(cardX, desk.top + 0.025, cardZ), inkMat, "contact", { cast: true });
  const cardTex = businessCardTexture(p);
  disposables.push(cardTex);
  const cardMat = new MeshStandardMaterial({ map: cardTex, roughness: 0.6 });
  disposables.push(cardMat);
  const card = add(new PlaneGeometry(0.2, 0.12), cardMat, "contact", { cast: true });
  card.position.set(cardX, desk.top + 0.1, cardZ + 0.01);
  card.rotation.x = -0.32;

  // ---------- Khu 02 Dự án: bảng ghim trên vách sau ----------
  const board = { x: 3.0, y: 1.75, w: 1.7, h: 1.05 };
  const pegTex = pegboardTexture(p);
  disposables.push(pegTex);
  const pegMat = new MeshStandardMaterial({ map: pegTex, roughness: 0.85 });
  disposables.push(pegMat);
  add(new RoundedBoxGeometry(board.w, board.h, 0.03, 2, 0.01).translate(board.x, board.y, ROOM.backZ + 0.02), pegMat, "projects", { receive: true });
  // viền sáng aqua quanh bảng (như đèn hắt)
  const halo = new MeshBasicMaterial({ color: p.aqua, transparent: true, opacity: 0.55, toneMapped: false });
  disposables.push(halo);
  glows.push(halo);
  add(
    mergeAll([
      boxAt(board.w + 0.06, 0.012, 0.01, board.x, board.y + board.h / 2 + 0.02, ROOM.backZ + 0.005),
      boxAt(board.w + 0.06, 0.012, 0.01, board.x, board.y - board.h / 2 - 0.02, ROOM.backZ + 0.005),
      boxAt(0.012, board.h + 0.04, 0.01, board.x - board.w / 2 - 0.03, board.y, ROOM.backZ + 0.005),
      boxAt(0.012, board.h + 0.04, 0.01, board.x + board.w / 2 + 0.03, board.y, ROOM.backZ + 0.005),
    ]),
    halo,
    "projects",
  );
  // 7 thẻ dự án treo bằng dây
  const cards: Mesh[] = [];
  const strap = std(p.teal, 0.5);
  const straps: BufferGeometry[] = [];
  for (let i = 0; i < 7; i++) {
    const cx = board.x - board.w / 2 + 0.16 + i * ((board.w - 0.32) / 6);
    const cy = board.y - 0.12 + (i % 2 ? -0.06 : 0.02);
    straps.push(boxAt(0.012, 0.36, 0.006, cx, cy + 0.27, ROOM.backZ + 0.045));
    const cardBack = new MeshStandardMaterial({ color: p.bright, roughness: 0.6 });
    disposables.push(cardBack);
    const m = add(new PlaneGeometry(0.17, 0.25), cardBack, "projects", { cast: true });
    m.position.set(cx, cy, ROOM.backZ + 0.05);
    m.rotation.z = (i % 3 - 1) * 0.035;
    cards.push(m);
  }
  add(mergeAll(straps), strap, "projects");

  // ---------- Khu 03 Digital Marketing: tủ thấp ở vách trái + loa + điện thoại ----------
  const sb = { x: ROOM.leftX + 0.3, z: 0.9, w: 0.55, d: 1.7, h: 0.62 };
  add(
    mergeAll([
      new RoundedBoxGeometry(sb.w, sb.h, sb.d, 2, 0.02).translate(sb.x, sb.h / 2, sb.z),
    ]),
    inkMat,
    "marketing",
    { cast: true, receive: true },
  );
  add(
    mergeAll([boxAt(0.01, 0.2, 0.02, sb.x + sb.w / 2 + 0.002, 0.42, sb.z - 0.2), boxAt(0.01, 0.2, 0.02, sb.x + sb.w / 2 + 0.002, 0.42, sb.z + 0.2)]),
    std(p.teal, 0.4, 0.3),
    "marketing",
  );
  // loa
  const spk = { x: sb.x, z: sb.z - 0.45 };
  add(new RoundedBoxGeometry(0.28, 0.42, 0.28, 3, 0.04).translate(spk.x, sb.h + 0.21, spk.z), std(p.bright, 0.5), "marketing", { cast: true });
  const cone = std(p.ink, 0.4, 0.2);
  add(
    mergeAll([
      new CircleGeometry(0.095, 28).rotateY(Math.PI / 2).translate(spk.x + 0.142, sb.h + 0.16, spk.z),
      new CircleGeometry(0.04, 20).rotateY(Math.PI / 2).translate(spk.x + 0.142, sb.h + 0.33, spk.z),
    ]),
    cone,
    "marketing",
  );
  const ring = new MeshBasicMaterial({ color: p.teal, toneMapped: false });
  disposables.push(ring);
  glows.push(ring);
  add(new TorusGeometry(0.1, 0.006, 8, 40).rotateY(Math.PI / 2).translate(spk.x + 0.145, sb.h + 0.16, spk.z), ring, "marketing");
  // điện thoại dựng trên giá, màn hình là "bảng tin mạng xã hội" trừu tượng
  const ph = { x: sb.x + 0.02, z: sb.z + 0.25 };
  add(
    mergeAll([
      new RoundedBoxGeometry(0.02, 0.32, 0.16, 2, 0.008).rotateZ(-0.18).translate(ph.x, sb.h + 0.18, ph.z),
      boxAt(0.12, 0.02, 0.14, ph.x - 0.02, sb.h + 0.01, ph.z),
    ]),
    inkMat,
    "marketing",
    { cast: true },
  );
  const feed = feedTexture(p);
  disposables.push(feed);
  const feedMat = new MeshBasicMaterial({ map: feed, toneMapped: false });
  disposables.push(feedMat);
  const screen = add(new PlaneGeometry(0.145, 0.3), feedMat, "marketing");
  screen.position.set(ph.x + 0.012, sb.h + 0.18, ph.z);
  screen.rotation.set(0, Math.PI / 2, -0.18);
  // kệ sách phía trên tủ
  const shelfY = 1.55;
  add(boxAt(0.3, 0.03, 1.5, ROOM.leftX + 0.15, shelfY, sb.z), inkMat, undefined, { cast: true });
  const bookCols = [mix(p.teal, p.ink, 0.35), p.ink, mix(p.aqua, p.grey, 0.4)];
  const bookGeo: BufferGeometry[][] = bookCols.map(() => []);
  let bz = sb.z - 0.65;
  for (let i = 0; i < 12; i++) {
    const bh = 0.2 + ((i * 37) % 9) / 60;
    const bw = 0.04 + ((i * 13) % 4) / 100;
    bookGeo[i % bookCols.length].push(boxAt(0.2, bh, bw, ROOM.leftX + 0.14, shelfY + 0.015 + bh / 2, bz));
    bz += bw + 0.012;
  }
  bookCols.forEach((c, k) => add(mergeAll(bookGeo[k]), std(c, 0.7), undefined, { cast: true }));

  // ---------- Khu 04 Về Aegis: biểu tượng kính trên vách trái ----------
  const emblemMat = new MeshBasicMaterial({ transparent: true, toneMapped: false, color: p.bright, opacity: 0 });
  disposables.push(emblemMat);
  const emblem = add(new PlaneGeometry(0.9, 0.95), emblemMat, "about");
  emblem.position.set(ROOM.leftX + 0.02, 2.2, -1.2);
  emblem.rotation.y = Math.PI / 2;
  // tấm nền ink tròn sau logo (để logo kính nổi trên vách sáng)
  const plate = std(p.ink, 0.45, 0.15);
  const plateMesh = add(new CircleGeometry(0.62, 64), plate, "about", { receive: true });
  plateMesh.position.set(ROOM.leftX + 0.012, 2.2, -1.2);
  plateMesh.rotation.y = Math.PI / 2;

  // ---------- Cây xanh (tán tròn tông teal, gộp chung một mesh cho cả hai chậu) ----------
  const pot = std(p.ink, 0.6);
  const leaf = std(mix(p.teal, p.ink, 0.55), 0.8);
  const pots: BufferGeometry[] = [];
  const bushes: BufferGeometry[] = [];
  for (const [x, z, s] of [
    [3.75, -3.0, 1],
    [-3.45, 2.6, 0.9],
  ] as const) {
    pots.push(new CylinderGeometry(0.22 * s, 0.17 * s, 0.42 * s, 24).translate(x, 0.21 * s, z));
    for (const [dx, dy, dz, r] of [
      [0, 0.78, 0, 0.3],
      [0.17, 0.62, 0.06, 0.22],
      [-0.15, 0.66, -0.05, 0.22],
      [0.04, 1.02, -0.03, 0.2],
      [-0.06, 0.6, 0.16, 0.18],
    ] as const) {
      bushes.push(new IcosahedronGeometry(r * s, 1).translate(x + dx * s, dy * s, z + dz * s));
    }
  }
  add(mergeAll(pots), pot, undefined, { cast: true });
  add(mergeAll(bushes), leaf, undefined, { cast: true });

  // ---------- Đèn treo trên bàn ----------
  const lampMat = std(p.ink, 0.4, 0.3);
  add(
    mergeAll([
      new CylinderGeometry(0.006, 0.006, 0.9, 6).translate(desk.x - 0.2, ROOM.h - 0.45, desk.z + 0.1),
      new ConeGeometry(0.2, 0.18, 28, 1, true).translate(desk.x - 0.2, ROOM.h - 0.95, desk.z + 0.1),
    ]),
    lampMat,
  );
  const bulb = new MeshBasicMaterial({ color: p.soft, toneMapped: false, side: DoubleSide });
  disposables.push(bulb);
  add(new CircleGeometry(0.19, 28).rotateX(Math.PI / 2).translate(desk.x - 0.2, ROOM.h - 1.03, desk.z + 0.1), bulb);

  return {
    root,
    pickables,
    monitor: { mesh: monitor, canvas: monitorCanvas, texture: monitorTex },
    cards,
    emblem,
    glows,
    dispose() {
      for (const d of disposables) d.dispose();
      for (const m of cards) (m.material as Material).dispose();
    },
  };
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
    // đường chân trời: khối nhà nhạt, có ô cửa
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
  return canvasTex(512, 320, (g) => {
    g.fillStyle = css(p.ink);
    g.fillRect(0, 0, 512, 320);
    g.fillStyle = css(mix(p.ink, p.teal, 0.35));
    for (let y = 12; y < 320; y += 16) for (let x = 12; x < 512; x += 16) {
      g.beginPath();
      g.arc(x, y, 2.2, 0, Math.PI * 2);
      g.fill();
    }
  });
}

function businessCardTexture(p: RoomPalette): CanvasTexture {
  return canvasTex(400, 240, (g) => {
    g.fillStyle = css(p.ink);
    g.fillRect(0, 0, 400, 240);
    g.fillStyle = css(p.teal);
    g.fillRect(0, 226, 400, 14);
    g.fillStyle = css(p.bright);
    g.font = "700 58px system-ui, sans-serif";
    g.fillText("Aegis", 34, 118);
    g.fillStyle = css(p.aqua);
    g.fillRect(36, 146, 120, 6);
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

/** Màn hình lúc chưa có ảnh dự án: khung trình duyệt brand */
export function drawScreenPlaceholder(canvas: HTMLCanvasElement, p: RoomPalette) {
  const g = canvas.getContext("2d")!;
  g.fillStyle = css(p.bright);
  g.fillRect(0, 0, canvas.width, canvas.height);
  g.fillStyle = css(p.ink);
  g.fillRect(0, 0, canvas.width, 40);
  g.fillStyle = css(p.teal);
  g.fillRect(0, 40, canvas.width, 6);
}

/** Vẽ ảnh dự án lên màn hình, kèm thanh trình duyệt brand ở trên */
export function drawScreenShot(canvas: HTMLCanvasElement, image: CanvasImageSource & { width: number; height: number }, p: RoomPalette) {
  const g = canvas.getContext("2d")!;
  const bar = 40;
  g.fillStyle = css(p.ink);
  g.fillRect(0, 0, canvas.width, bar);
  for (let k = 0; k < 3; k++) {
    g.fillStyle = css(k === 0 ? p.teal : mix(p.ink, p.bright, 0.35));
    g.beginPath();
    g.arc(22 + k * 22, bar / 2, 6, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = css(mix(p.ink, p.bright, 0.18));
  g.fillRect(110, 11, canvas.width - 220, 18);
  const h = canvas.height - bar;
  const scale = Math.max(canvas.width / image.width, h / image.height);
  const w = image.width * scale;
  g.drawImage(image, (canvas.width - w) / 2, bar, w, image.height * scale);
}
