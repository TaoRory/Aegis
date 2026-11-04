import {
  BoxGeometry,
  CapsuleGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  DynamicDrawUsage,
  Euler,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Quaternion,
  Sphere,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  ConeGeometry,
  type BufferGeometry,
  type Material,
  type Ray,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

import { mergeAll } from "@/components/space/engine/builders/merge";
import { radialTexture } from "@/components/space/engine/textures";
import { LAYOUT, mix, type RoomPalette } from "@/components/showroom/engine/room-build";
import type { MakerRole, SectionId } from "@/content/showroom";

/**
 * "Thợ Aegis": các minibot tí hon làm việc trong Studio (linh vật riêng của Aegis, chỉ để minh hoạ tinh thần
 * "nhỏ nhưng có võ", mỗi người một chuyên môn, cùng nhau làm việc; không đại diện cho nhân sự thật).
 *
 * Kỹ thuật: mỗi BỘ PHẬN (đầu, kính mặt, mắt, thân, tay, chân, từng loại mũ, từng dụng cụ) là MỘT InstancedMesh dùng chung
 * cho cả đàn; khớp xương tính trên CPU mỗi khung hình (vài chục ma trận), nên cả đàn chỉ tốn khoảng 20 lệnh vẽ.
 * Mỗi thợ chạy một "kịch bản" lặp: đi tới điểm, leo thang, làm động tác (gõ phím, khiêng khối, ghim thẻ, phát loa…).
 * Giảm chuyển động: đứng yên trong tư thế làm việc đầu tiên.
 */

type V3 = [number, number, number];
type Pose = "idle" | "walk" | "carry" | "bend" | "place" | "hammer" | "inspect" | "look" | "climb" | "pin" | "shout" | "tap" | "type" | "cheer" | "water" | "throw" | "wave" | "stretch";
type Hat = "hardhat" | "headphones" | "glasses" | "cap" | null;
type Prop = "block" | "blueprint" | "card" | "megaphone" | "can" | "plane" | "cube" | "hammer";
type Step = { t: "go"; to: V3; climb?: boolean } | { t: "do"; pose: Pose; dur: number; yaw?: number; fx?: "plane" | "spark" } | { t: "hold"; prop: Prop | null };

interface MakerDef {
  role: MakerRole;
  section: SectionId;
  hat: Hat;
  suit: "teal" | "ink" | "deep";
  start: V3;
  yaw: number;
  prop?: Prop;
  sit?: boolean;
  script: Step[];
}

const go = (x: number, y: number, z: number, climb = false): Step => ({ t: "go", to: [x, y, z], climb });
const act = (pose: Pose, dur: number, yaw?: number, fx?: "plane" | "spark"): Step => ({ t: "do", pose, dur, yaw, fx });
const hold = (prop: Prop | null): Step => ({ t: "hold", prop });

const PI = Math.PI;
const { desk, keyboard, pile, house, table, sideboard, speaker, bench, ladder, cardBox } = LAYOUT;
const D = desk.top;

const MAKERS: MakerDef[] = [
  {
    role: "coder",
    section: "web",
    hat: "headphones",
    suit: "ink",
    start: [keyboard.x - 0.04, keyboard.top + 0.008, keyboard.z + 0.02],
    yaw: PI,
    sit: true,
    script: [act("type", 5.5, PI), act("stretch", 1.4, PI), act("type", 4.5, PI), act("look", 1.6, PI)],
  },
  {
    role: "builder",
    section: "web",
    hat: "hardhat",
    suit: "teal",
    start: [pile.x, D, pile.z - 0.09],
    yaw: 0,
    script: [act("bend", 0.7, 0), hold("block"), go(house.x + 0.26, D, house.z + 0.04), act("place", 0.9, -PI / 2), hold(null), go(pile.x, D, pile.z - 0.09)],
  },
  {
    role: "builder",
    section: "web",
    hat: "hardhat",
    suit: "deep",
    start: [house.x - 0.02, D, house.z + 0.2],
    yaw: PI,
    prop: "hammer",
    script: [act("hammer", 3.4, PI), go(house.x - 0.17, D, house.z + 0.2), act("hammer", 2.8, PI), go(house.x - 0.02, D, house.z + 0.2)],
  },
  {
    role: "architect",
    section: "web",
    hat: "glasses",
    suit: "teal",
    start: [desk.x + 0.62, D, desk.z + 0.42],
    yaw: 2.5,
    prop: "blueprint",
    script: [act("inspect", 2.4, 2.4), go(desk.x - 0.75, D, desk.z + 0.42), act("look", 2, PI), go(desk.x + 0.62, D, desk.z + 0.42)],
  },
  {
    role: "pinner",
    section: "projects",
    hat: "cap",
    suit: "teal",
    start: [cardBox.x, 0, cardBox.z + 0.22],
    yaw: PI,
    script: [
      act("bend", 0.7, PI),
      hold("card"),
      go(ladder.x, 0, ladder.baseZ + 0.08),
      go(ladder.x, 0.98, -3.34, true),
      act("pin", 1.7, PI),
      hold(null),
      go(ladder.x, 0, ladder.baseZ + 0.08, true),
      go(cardBox.x, 0, cardBox.z + 0.22),
    ],
  },
  {
    role: "crier",
    section: "marketing",
    hat: "cap",
    suit: "ink",
    start: [speaker.x, speaker.h, speaker.z],
    yaw: PI / 2,
    prop: "megaphone",
    script: [act("shout", 2.6, PI / 2), act("idle", 0.9, 1.2), act("shout", 2.4, 1.1), act("cheer", 1.1, PI / 2)],
  },
  {
    role: "poster",
    section: "marketing",
    hat: null,
    suit: "teal",
    start: [sideboard.x + 0.15, sideboard.h, LAYOUT.phone.z - 0.2],
    yaw: -0.7,
    script: [act("tap", 3, -0.7), act("cheer", 1.2, 0.9, "spark"), act("tap", 2.4, -0.7), act("look", 1.2, 0.6)],
  },
  {
    role: "gardener",
    section: "about",
    hat: null,
    suit: "deep",
    start: [bench.x + 0.06, bench.h, bench.z - 0.38],
    yaw: PI / 2,
    prop: "can",
    script: [act("look", 1.5, PI / 2), go(bench.x + 0.06, bench.h, LAYOUT.benchPlant.z - 0.2), act("water", 2.8, 0), go(bench.x + 0.06, bench.h, bench.z - 0.38)],
  },
  {
    role: "messenger",
    section: "contact",
    hat: "headphones",
    suit: "teal",
    start: [table.x + 0.32, table.top, table.z + 0.14],
    yaw: -PI / 2,
    script: [act("tap", 2.8, -PI / 2), hold("plane"), act("throw", 0.95, 0.5, "plane"), hold(null), act("idle", 1.3, 0.2)],
  },
  {
    role: "courier",
    section: "projects",
    hat: "cap",
    suit: "deep",
    start: [2.2, 0, -2.0],
    yaw: 0,
    prop: "cube",
    script: [go(1.2, 0, -0.7), go(-0.6, 0, 0.15), go(-2.95, 0, 0.9), act("place", 0.9, -PI / 2), hold(null), go(-1.0, 0, 0.75), go(1.1, 0, -0.25), go(2.2, 0, -2.0), act("bend", 0.7, 0), hold("cube")],
  },
];

const SCALE = 0.9;
const HIP = 0.055;

interface Joints {
  legL: number;
  legR: number;
  armL: number;
  armR: number;
  spreadL: number;
  spreadR: number;
  lean: number;
  headPitch: number;
  headYaw: number;
  headTilt: number;
  lift: number;
  sit: number;
}

const zeroJoints = (): Joints => ({ legL: 0, legR: 0, armL: 0.08, armR: 0.08, spreadL: 0.06, spreadR: 0.06, lean: 0, headPitch: 0, headYaw: 0, headTilt: 0, lift: 0, sit: 0 });

interface Bot {
  def: MakerDef;
  pos: Vector3;
  ground: number;
  yaw: number;
  yawTarget: number;
  step: number;
  t: number;
  phase: number;
  prop: Prop | null;
  pose: Pose;
  j: Joints;
  blinkAt: number;
  blink: number;
  hovered: boolean;
  fxDone: boolean;
}

const CARRY: Prop[] = ["block", "card", "cube", "blueprint"];

/** Góc khớp mục tiêu của một tư thế tại thời điểm t (giây) và pha bước chân φ */
function poseJoints(pose: Pose, t: number, phi: number, holding: Prop | null, progress: number, out: Joints) {
  const j = Object.assign(out, zeroJoints());
  const s = Math.sin(phi);
  switch (pose) {
    case "walk":
    case "carry":
      j.legL = 0.62 * s;
      j.legR = -0.62 * s;
      j.lift = Math.abs(Math.cos(phi)) * 0.008;
      j.lean = 0.07;
      if (pose === "carry" || (holding && CARRY.includes(holding))) {
        j.armL = j.armR = -1.2;
        j.spreadL = j.spreadR = -0.18;
      } else {
        j.armL = -0.55 * s;
        j.armR = 0.55 * s;
        if (holding) j.armR = -0.5 + 0.15 * s;
      }
      break;
    case "bend":
    case "place":
      j.lean = 0.55;
      j.armL = j.armR = pose === "place" ? -1.45 : -0.95;
      j.spreadL = j.spreadR = -0.15;
      j.headPitch = 0.35;
      break;
    case "hammer": {
      const k = Math.max(0, Math.sin(t * 8));
      j.armR = -2.5 + 1.25 * k;
      j.armL = -0.5;
      j.lean = 0.12 + 0.08 * k;
      j.headPitch = 0.2;
      break;
    }
    case "inspect":
      j.armL = j.armR = -1.15;
      j.spreadL = j.spreadR = -0.16;
      j.headPitch = 0.28;
      j.headTilt = Math.sin(t * 1.6) * 0.22;
      break;
    case "look":
      j.headYaw = Math.sin(t * 1.3) * 0.65;
      j.headPitch = -0.1;
      if (holding && CARRY.includes(holding)) j.armL = j.armR = -1.15;
      break;
    case "climb": {
      j.armL = -2.75 + 0.35 * s;
      j.armR = -2.75 - 0.35 * s;
      j.legL = -0.55 + 0.45 * s;
      j.legR = -0.55 - 0.45 * s;
      j.lean = 0.1;
      j.headPitch = -0.25;
      break;
    }
    case "pin":
      j.armL = -2.65 + 0.08 * Math.sin(t * 9);
      j.armR = -2.8 - 0.08 * Math.sin(t * 9);
      j.headPitch = -0.35;
      break;
    case "shout": {
      j.armR = -1.55;
      j.spreadR = -0.32;
      j.armL = -2.7 + 0.3 * Math.sin(t * 7);
      j.spreadL = 0.25;
      j.lift = Math.max(0, Math.sin(t * 6)) * 0.012;
      j.lean = -0.06;
      j.headPitch = -0.12;
      break;
    }
    case "tap":
      j.armL = -1.2 + 0.12 * Math.sin(t * 13);
      j.armR = -1.2 - 0.12 * Math.sin(t * 13);
      j.spreadL = j.spreadR = -0.12;
      j.headPitch = 0.22;
      j.lean = 0.1;
      break;
    case "type":
      j.sit = 1;
      j.legL = j.legR = -1.45;
      j.armL = -1.3 + 0.13 * Math.sin(t * 17);
      j.armR = -1.3 - 0.13 * Math.sin(t * 17 + 1.3);
      j.headPitch = 0.12 + Math.sin(t * 2.2) * 0.06;
      break;
    case "stretch":
      j.sit = 1;
      j.legL = j.legR = -1.45;
      j.armL = j.armR = -3.0;
      j.spreadL = j.spreadR = 0.25;
      j.lean = -0.12;
      j.headPitch = -0.3;
      break;
    case "cheer":
      j.armL = -2.9 + 0.2 * Math.sin(t * 9);
      j.armR = -2.9 - 0.2 * Math.sin(t * 9);
      j.spreadL = j.spreadR = 0.35;
      j.lift = Math.max(0, Math.sin(t * 7)) * 0.03;
      j.headPitch = -0.2;
      break;
    case "water":
      j.armR = -1.35;
      j.armL = -0.2;
      j.lean = 0.12;
      j.headPitch = 0.3;
      break;
    case "throw": {
      const e = 1 - (1 - Math.min(1, progress * 1.6)) ** 3;
      j.armR = -2.9 + 2.3 * e;
      j.armL = -0.6;
      j.lean = -0.1 + 0.25 * e;
      break;
    }
    case "wave":
      j.armR = -2.85 + 0.35 * Math.sin(t * 11);
      j.spreadR = 0.35;
      j.headTilt = Math.sin(t * 5) * 0.12;
      break;
    case "idle":
      j.lift = (Math.sin(t * 2.4) * 0.5 + 0.5) * 0.002;
      break;
  }
  return j;
}

export interface Makers {
  root: Group;
  update(dt: number, time: number, camera: Vector3): void;
  /** Thợ gần nhất mà tia chuột chạm (chỉ số) */
  pick(ray: Ray): number | null;
  setHover(index: number | null): void;
  headPosition(index: number, out: Vector3): Vector3;
  info(index: number): { role: MakerRole; section: SectionId };
  readonly count: number;
  /** Vị trí từng thợ (kiểm thử: xác nhận các thợ đang di chuyển) */
  positions(): number[][];
  dispose(): void;
}

export function buildMakers(p: RoomPalette, opts: { reduced: boolean; shadows: boolean }): Makers {
  const root = new Group();
  const disposables: { dispose(): void }[] = [];
  const N = MAKERS.length;

  const std = (color: Color, roughness: number, metalness = 0) => {
    const m = new MeshStandardMaterial({ color, roughness, metalness });
    disposables.push(m);
    return m;
  };
  const glow = (color: Color) => {
    const m = new MeshBasicMaterial({ color, toneMapped: false });
    disposables.push(m);
    return m;
  };
  const inst = (geometry: BufferGeometry, material: Material, count: number, cast = false) => {
    const mesh = new InstancedMesh(geometry, material, count);
    mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    mesh.castShadow = cast && opts.shadows;
    mesh.frustumCulled = false;
    disposables.push(geometry);
    root.add(mesh);
    return mesh;
  };
  const rb = (w: number, h: number, d: number, r: number) => new RoundedBoxGeometry(w, h, d, 3, r);

  // ---------- Hình học bộ phận (gốc toạ độ = khớp xoay) ----------
  const white = std(p.bright, 0.32, 0.05);
  const head = inst(rb(0.138, 0.112, 0.122, 0.042).translate(0, 0.06, 0), white, N, true);
  const visor = inst(
    mergeAll([rb(0.11, 0.072, 0.024, 0.022).translate(0, 0.058, 0.054), new CylinderGeometry(0.004, 0.004, 0.032, 8).translate(0, 0.13, 0)]),
    std(p.ink, 0.14, 0.35),
    N,
  );
  const eyes = inst(mergeAll([rb(0.018, 0.026, 0.006, 0.0029).translate(-0.025, 0, 0), rb(0.018, 0.026, 0.006, 0.0029).translate(0.025, 0, 0)]), glow(p.aqua), N);
  const bulb = inst(new SphereGeometry(0.012, 12, 10).translate(0, 0.152, 0), glow(p.teal), N);
  const suitMat = new MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 });
  disposables.push(suitMat);
  const torso = inst(new CapsuleGeometry(0.046, 0.03, 6, 16), suitMat, N, true);
  const badge = inst(rb(0.02, 0.02, 0.008, 0.003).rotateZ(PI / 4), glow(p.aqua), N);
  const arms = inst(mergeAll([new CapsuleGeometry(0.013, 0.034, 4, 10).translate(0, -0.028, 0), new SphereGeometry(0.018, 12, 10).translate(0, -0.062, 0)]), white, N * 2);
  const legs = inst(mergeAll([new CapsuleGeometry(0.016, 0.02, 4, 10).translate(0, -0.026, 0), rb(0.036, 0.022, 0.054, 0.009).translate(0, -0.046, 0.009)]), std(p.ink, 0.45, 0.1), N * 2);

  // mũ / phụ kiện theo chuyên môn
  const hats: Record<Exclude<Hat, null>, InstancedMesh> = {
    hardhat: inst(
      mergeAll([
        new SphereGeometry(0.075, 20, 10, 0, PI * 2, 0, PI / 2).scale(1, 0.82, 1.06).translate(0, 0.1, 0),
        new CylinderGeometry(0.09, 0.09, 0.008, 28).translate(0, 0.1, 0.006),
        new BoxGeometry(0.012, 0.012, 0.14).translate(0, 0.158, 0),
      ]),
      std(p.aqua, 0.4),
      N,
    ),
    cap: inst(
      mergeAll([new SphereGeometry(0.072, 20, 10, 0, PI * 2, 0, PI / 2).scale(1, 0.55, 1.05).translate(0, 0.108, 0), rb(0.086, 0.008, 0.07, 0.003).translate(0, 0.11, 0.08)]),
      std(p.teal, 0.5),
      N,
    ),
    headphones: inst(
      mergeAll([
        new TorusGeometry(0.076, 0.008, 8, 28, PI).translate(0, 0.06, 0),
        new CylinderGeometry(0.028, 0.028, 0.022, 20).rotateZ(PI / 2).translate(-0.074, 0.06, 0),
        new CylinderGeometry(0.028, 0.028, 0.022, 20).rotateZ(PI / 2).translate(0.074, 0.06, 0),
      ]),
      std(p.tealDeep, 0.4, 0.1),
      N,
    ),
    glasses: inst(
      mergeAll([
        new TorusGeometry(0.021, 0.0045, 8, 20).translate(-0.026, 0.06, 0.07),
        new TorusGeometry(0.021, 0.0045, 8, 20).translate(0.026, 0.06, 0.07),
        new BoxGeometry(0.012, 0.004, 0.004).translate(0, 0.064, 0.07),
      ]),
      glow(p.teal),
      N,
    ),
  };

  // dụng cụ cầm tay (gốc = bàn tay, hướng dọc cánh tay là −y) và vật khiêng trước ngực
  const props: Record<Prop, InstancedMesh> = {
    hammer: inst(mergeAll([new CylinderGeometry(0.005, 0.005, 0.08, 8).translate(0, -0.03, 0), new BoxGeometry(0.044, 0.02, 0.02).translate(0, -0.07, 0)]), std(p.grey, 0.35, 0.5), N),
    megaphone: inst(new CylinderGeometry(0.012, 0.034, 0.075, 18, 1, true).translate(0, -0.03, 0), new MeshStandardMaterial({ color: p.teal, roughness: 0.4, side: DoubleSide }), N),
    can: inst(mergeAll([new CylinderGeometry(0.022, 0.025, 0.042, 16).translate(0, -0.03, 0.012), new CylinderGeometry(0.003, 0.006, 0.06, 8).rotateX(-1.1).translate(0, -0.02, 0.05)]), std(p.aqua, 0.4), N),
    plane: inst(new ConeGeometry(0.026, 0.08, 3).rotateX(PI / 2).scale(1, 0.28, 1).translate(0, -0.02, 0), std(p.bright, 0.6), N),
    block: inst(new BoxGeometry(0.048, 0.048, 0.048), std(p.teal, 0.5), N),
    card: inst(rb(0.09, 0.12, 0.006, 0.002), std(p.bright, 0.5), N),
    blueprint: inst(new CylinderGeometry(0.012, 0.012, 0.13, 12).rotateZ(PI / 2), std(p.aqua, 0.55), N),
    cube: inst(new IcosahedronGeometry(0.028, 0), glow(p.aqua), N),
  };
  disposables.push(props.megaphone.material as Material);

  // máy bay giấy đang bay + kim cương "tương tác" bay lên
  const FX_PLANES = 3;
  const FX_SPARKS = 8;
  const flyers = inst(new ConeGeometry(0.026, 0.08, 3).rotateX(PI / 2).scale(1, 0.28, 1), std(p.bright, 0.6), FX_PLANES);
  const sparks = inst(rb(0.022, 0.022, 0.006, 0.003).rotateZ(PI / 4), glow(p.teal), FX_SPARKS);
  const planeFx = Array.from({ length: FX_PLANES }, () => ({ life: -1, from: new Vector3(), dir: 0 }));
  const sparkFx = Array.from({ length: FX_SPARKS }, () => ({ life: -1, delay: 0, from: new Vector3() }));

  // bóng tiếp xúc mờ dưới chân
  const blobTex = radialTexture();
  disposables.push(blobTex);
  const blobMat = new MeshBasicMaterial({ color: p.ink, alphaMap: blobTex, transparent: true, opacity: 0.42, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  disposables.push(blobMat);
  const blobs = inst(new PlaneGeometry(0.2, 0.2).rotateX(-PI / 2), blobMat, N);
  blobs.renderOrder = 1;

  const suitColor = { teal: p.teal, ink: p.inkRaised, deep: p.tealDeep };
  MAKERS.forEach((d, i) => torso.setColorAt(i, mix(suitColor[d.suit], p.bright, 0.04)));
  if (torso.instanceColor) torso.instanceColor.needsUpdate = true;

  const bots: Bot[] = MAKERS.map((def, i) => ({
    def,
    pos: new Vector3(...def.start),
    ground: def.start[1],
    yaw: def.yaw,
    yawTarget: def.yaw,
    step: 0,
    t: 0,
    phase: i * 1.7,
    prop: def.prop ?? null,
    pose: "idle",
    j: zeroJoints(),
    blinkAt: 1 + i * 0.37,
    blink: 1,
    hovered: false,
    fxDone: false,
  }));

  // ---------- Ma trận ----------
  const e = new Euler();
  const q = new Quaternion();
  const v = new Vector3();
  const sc = new Vector3();
  const mRoot = new Matrix4();
  const mHip = new Matrix4();
  const mHead = new Matrix4();
  const mArm = new Matrix4();
  const mLocal = new Matrix4();
  const mOut = new Matrix4();
  const hidden = new Matrix4().makeScale(0, 0, 0);
  const trs = (out: Matrix4, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, order: "XYZ" | "YXZ" | "ZXY" = "ZXY", sx = 1, sy = 1, sz = 1) => {
    e.set(rx, ry, rz, order);
    q.setFromEuler(e);
    return out.compose(v.set(x, y, z), q, sc.set(sx, sy, sz));
  };
  const local = (parent: Matrix4, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, order: "XYZ" | "YXZ" | "ZXY" = "ZXY") => mOut.multiplyMatrices(parent, trs(mLocal, x, y, z, rx, ry, rz, order));

  const hatIndex = new Map<Hat, number>();
  const hatSlot = MAKERS.map((d) => {
    const n = hatIndex.get(d.hat) ?? 0;
    hatIndex.set(d.hat, n + 1);
    return n;
  });
  // ẩn các ô mũ / dụng cụ / hiệu ứng chưa dùng
  for (const mesh of [...Object.values(hats), ...Object.values(props), flyers, sparks]) for (let i = 0; i < mesh.count; i++) mesh.setMatrixAt(i, hidden);

  function writeBot(i: number) {
    const b = bots[i];
    const j = b.j;
    const sitDrop = j.sit * 0.04;
    trs(mRoot, b.pos.x, b.pos.y + j.lift, b.pos.z, 0, b.yaw, 0, "YXZ", SCALE, SCALE, SCALE);
    mHip.multiplyMatrices(mRoot, trs(mLocal, 0, HIP - sitDrop, 0, j.lean, 0, 0));
    torso.setMatrixAt(i, local(mHip, 0, 0.042, 0));
    badge.setMatrixAt(i, local(mHip, 0, 0.058, 0.047));
    mHead.multiplyMatrices(mHip, trs(mLocal, 0, 0.104, 0, j.headPitch, j.headYaw, j.headTilt, "YXZ"));
    head.setMatrixAt(i, mHead);
    visor.setMatrixAt(i, mHead);
    bulb.setMatrixAt(i, mHead);
    mOut.multiplyMatrices(mHead, trs(mLocal, 0, 0.06, 0.068, 0, 0, 0, "ZXY", 1, b.blink, 1));
    eyes.setMatrixAt(i, mOut);
    if (b.def.hat) hats[b.def.hat].setMatrixAt(hatSlot[i], mHead);

    arms.setMatrixAt(i * 2, local(mHip, -0.054, 0.076, 0, j.armL, 0, -j.spreadL));
    mArm.multiplyMatrices(mHip, trs(mLocal, 0.054, 0.076, 0, j.armR, 0, j.spreadR));
    arms.setMatrixAt(i * 2 + 1, mArm);
    legs.setMatrixAt(i * 2, local(mRoot, -0.026, HIP - sitDrop, 0, j.legL));
    legs.setMatrixAt(i * 2 + 1, local(mRoot, 0.026, HIP - sitDrop, 0, j.legR));

    for (const [name, mesh] of Object.entries(props) as [Prop, InstancedMesh][]) {
      if (b.prop !== name) mesh.setMatrixAt(i, hidden);
      else if (CARRY.includes(name)) mesh.setMatrixAt(i, local(mHip, 0, 0.06, 0.1));
      else mesh.setMatrixAt(i, local(mArm, 0, -0.068, 0));
    }
    blobs.setMatrixAt(i, trs(mLocal, b.pos.x, b.ground + 0.004, b.pos.z, 0, 0, 0, "ZXY", SCALE * (1 - j.lift * 6), 1, SCALE * (1 - j.lift * 6)));
  }

  const flagAll = () => {
    for (const mesh of [head, visor, eyes, bulb, torso, badge, arms, legs, blobs, flyers, sparks, ...Object.values(hats), ...Object.values(props)]) mesh.instanceMatrix.needsUpdate = true;
    // dụng cụ / hiệu ứng không ai đang dùng thì không vẽ (bớt lệnh vẽ)
    for (const [name, mesh] of Object.entries(props) as [Prop, InstancedMesh][]) mesh.visible = bots.some((b) => b.prop === name);
    flyers.visible = planeFx.some((f) => f.life >= 0);
    sparks.visible = sparkFx.some((f) => f.life >= 0);
  };

  // ---------- Kịch bản ----------
  const target = zeroJoints();
  const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

  function spawn(kind: "plane" | "spark", b: Bot) {
    if (kind === "plane") {
      const slot = planeFx.find((f) => f.life < 0);
      if (!slot) return;
      slot.life = 0;
      slot.from.copy(b.pos).add(v.set(0, 0.2, 0));
      slot.dir = b.yaw;
    } else {
      for (let k = 0; k < 3; k++) {
        const slot = sparkFx.find((f) => f.life < 0);
        if (!slot) return;
        slot.life = 0;
        slot.delay = k * 0.18;
        slot.from.copy(b.pos).add(v.set((k - 1) * 0.05, 0.25, 0.02));
      }
    }
  }

  function advance(b: Bot, dt: number, time: number) {
    const script = b.def.script;
    let guard = 0;
    while (guard++ < script.length) {
      const step = script[b.step % script.length];
      if (step.t === "hold") {
        b.prop = step.prop;
        b.step = (b.step + 1) % script.length;
        b.t = 0;
        continue;
      }
      if (step.t === "go") {
        v.set(...step.to).sub(b.pos);
        const dist = v.length();
        const speed = step.climb ? 0.14 : 0.19;
        if (dist < 1e-3) {
          b.step = (b.step + 1) % script.length;
          b.t = 0;
          if (!step.climb) b.ground = b.pos.y;
          continue;
        }
        const move = Math.min(dist, speed * dt);
        b.pos.addScaledVector(v.normalize(), move);
        b.phase += (move / 0.05) * PI;
        if (step.climb) {
          b.yawTarget = PI;
          b.pose = "climb";
          b.ground = Math.min(b.ground, 0);
        } else {
          b.yawTarget = Math.atan2(v.x, v.z);
          b.pose = b.prop && CARRY.includes(b.prop) ? "carry" : "walk";
          b.ground = b.pos.y;
        }
        return;
      }
      // "do": làm động tác trong dur giây
      if (b.t === 0) b.fxDone = false;
      b.t += dt;
      b.pose = step.pose;
      if (step.yaw !== undefined) b.yawTarget = step.yaw;
      if (step.fx && !b.fxDone && b.t > step.dur * 0.45) {
        b.fxDone = true;
        spawn(step.fx, b);
      }
      if (b.t >= step.dur) {
        b.step = (b.step + 1) % script.length;
        b.t = 0;
      }
      void time;
      return;
    }
  }

  function currentProgress(b: Bot) {
    const step = b.def.script[b.step % b.def.script.length];
    return step.t === "do" ? b.t / step.dur : 0;
  }

  // Tư thế ban đầu: tư thế làm việc đầu tiên trong kịch bản (cũng là tư thế đứng yên khi giảm chuyển động)
  bots.forEach((b, i) => {
    const first = b.def.script.find((s) => s.t === "do") as Extract<Step, { t: "do" }> | undefined;
    b.pose = first?.pose ?? "idle";
    if (first?.yaw !== undefined) b.yaw = b.yawTarget = first.yaw;
    if (b.def.sit) b.pose = "type";
    poseJoints(b.pose, 0.3, 0, b.prop, 0.5, b.j);
    writeBot(i);
  });
  flagAll();

  let hoverIndex: number | null = null;
  const sphere = new Sphere();

  return {
    root,
    count: N,
    update(dt, time, cam) {
      if (opts.reduced) return;
      const k = 1 - Math.exp(-dt * 12);
      bots.forEach((b, i) => {
        if (b.hovered) {
          b.pose = "wave";
          b.yawTarget = Math.atan2(cam.x - b.pos.x, cam.z - b.pos.z);
        } else advance(b, dt, time);
        b.yaw += wrap(b.yawTarget - b.yaw) * Math.min(1, dt * 7);
        poseJoints(b.pose, time + i * 0.7, b.phase, b.prop, currentProgress(b), target);
        if (b.def.sit && (b.pose === "wave" || b.pose === "look")) {
          target.sit = 1;
          target.legL = target.legR = -1.45;
        }
        const j = b.j;
        for (const key of Object.keys(j) as (keyof Joints)[]) j[key] += (target[key] - j[key]) * k;
        // chớp mắt
        if (time > b.blinkAt) {
          b.blink = 0.12;
          b.blinkAt = time + 2.4 + ((i * 1.37 + time) % 3);
        }
        b.blink += (1 - b.blink) * Math.min(1, dt * 9);
        writeBot(i);
      });

      // máy bay giấy: bay vòng ra giữa phòng rồi nhỏ dần
      planeFx.forEach((f, idx) => {
        if (f.life < 0) return flyers.setMatrixAt(idx, hidden);
        f.life += dt;
        const u = f.life / 2.6;
        if (u >= 1) {
          f.life = -1;
          return flyers.setMatrixAt(idx, hidden);
        }
        const dist = u * 1.6;
        const x = f.from.x + Math.sin(f.dir) * dist + Math.sin(u * PI * 2) * 0.12;
        const z = f.from.z + Math.cos(f.dir) * dist;
        const y = f.from.y + Math.sin(u * PI) * 0.35 - u * 0.1;
        const s = SCALE * (1 - Math.max(0, u - 0.75) * 4);
        flyers.setMatrixAt(idx, trs(mLocal, x, y, z, -0.15 + Math.cos(u * PI) * 0.3, f.dir, Math.sin(u * PI * 2) * 0.4, "YXZ", s, s, s));
      });
      sparkFx.forEach((f, idx) => {
        if (f.life < 0) return sparks.setMatrixAt(idx, hidden);
        if (f.delay > 0) {
          f.delay -= dt;
          return sparks.setMatrixAt(idx, hidden);
        }
        f.life += dt;
        const u = f.life / 1.3;
        if (u >= 1) {
          f.life = -1;
          return sparks.setMatrixAt(idx, hidden);
        }
        const s = SCALE * Math.sin(u * PI) * 1.2;
        sparks.setMatrixAt(idx, trs(mLocal, f.from.x, f.from.y + u * 0.28, f.from.z + Math.sin(u * 6 + idx) * 0.02, 0, PI / 2, u * 2, "YXZ", s, s, s));
      });
      flagAll();
    },
    pick(ray) {
      let best: number | null = null;
      let bestD = Infinity;
      bots.forEach((b, i) => {
        sphere.center.copy(b.pos).add(v.set(0, 0.14 * SCALE + 0.02, 0));
        sphere.radius = 0.13 * SCALE;
        if (ray.intersectsSphere(sphere)) {
          const d = ray.origin.distanceToSquared(sphere.center);
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        }
      });
      return best;
    },
    setHover(index) {
      if (hoverIndex !== null) bots[hoverIndex].hovered = false;
      hoverIndex = index;
      if (index !== null) bots[index].hovered = true;
    },
    headPosition(index, out) {
      const b = bots[index];
      return out.copy(b.pos).add(v.set(0, (0.3 - b.j.sit * 0.04) * SCALE + b.j.lift, 0));
    },
    info(index) {
      return { role: bots[index].def.role, section: bots[index].def.section };
    },
    positions() {
      return bots.map((b) => [b.pos.x, b.pos.y, b.pos.z, b.j.armR]);
    },
    dispose() {
      for (const d of disposables) d.dispose();
    },
  };
}
