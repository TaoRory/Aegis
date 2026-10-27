import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CylinderGeometry,
  Group,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Points,
  Quaternion,
  ShaderMaterial,
  TorusGeometry,
  Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

import { isServiceZone, type ZoneId } from "@/config/space";
import { BAY_OBJECT_Y } from "@/components/space/engine/builders/bay";
import { GANTRY } from "@/components/space/engine/builders/architecture";
import { boxAt, mergeAll } from "@/components/space/engine/builders/merge";
import { roomByZone, type RoomZone } from "@/components/space/plan";
import type { BuildContext, ZoneBuild } from "@/components/space/engine/types";
import { disposeGroup } from "@/components/space/engine/types";

const SERVICES: RoomZone[] = ["ai", "software", "web", "marketing"];
const L1 = 1.9; // cánh tay trên
const L2 = 1.75; // cẳng tay
const TOOL = 0.66; // chiều dài dụng cụ ở cổ tay (cổ + bàn kẹp + ngón)
const SHOULDER_Y = 2.55;
const SPARKS_PER_ARM = 4;
/** Số cạnh của hình trụ và độ mịn bo cạnh: giảm ở điện thoại để giữ ngân sách tam giác */
let radial = 24;
let bevel = 2;

type Act = "weld" | "grip" | "scan";

interface Step {
  at: Vector3;
  act: Act;
  /** giây di chuyển tới đây, rồi dừng làm việc */
  move: number;
  dwell: number;
}

interface Arm {
  zone: RoomZone;
  shoulder: Vector3;
  focus: Vector3;
  steps: Step[];
  index: number;
  t: number;
  speed: number;
  gap: number;
  roll: number;
  tip: Vector3;
  from: Vector3;
}

const SPARK_VERT = /* glsl */ `
attribute float aPower;
uniform float uPixelRatio;
varying float vA;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  vA = aPower;
  gl_PointSize = (4.0 + aPower * 8.0) * uPixelRatio * (12.0 / max(-mv.z, 0.5));
}`;

const SPARK_FRAG = /* glsl */ `
uniform vec3 uColor;
varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float soft = 1.0 - d * 2.0;
  gl_FragColor = vec4(uColor, soft * soft * vA);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

/** Bộ sinh số ngẫu nhiên có hạt giống: mỗi cánh tay có "chương trình" công việc riêng nhưng lần nào dựng cũng giống nhau */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Thanh côn dọc theo +Z từ 0 tới length, mặt cắt (w0 × h0) thu về (w1 × h1), cạnh bo tròn */
function beam(length: number, w0: number, h0: number, w1: number, h1: number, radius = 0.06) {
  const g = new RoundedBoxGeometry(1, 1, 1, bevel, radius);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const t = p.getZ(i) + 0.5;
    p.setXYZ(i, p.getX(i) * (w0 + (w1 - w0) * t), p.getY(i) * (h0 + (h1 - h0) * t), t * length);
  }
  g.computeVertexNormals();
  return g;
}

/** Trục khớp: hình trụ nằm ngang theo trục X cục bộ, tâm ở dọc theo Z = z */
function hub(radius: number, length: number, z: number, x = 0, y = 0) {
  return new CylinderGeometry(radius, radius, length, radial).rotateZ(Math.PI / 2).translate(x, y, z);
}

/** Trục dọc (xy-z): hình trụ dọc theo Z từ z0 tới z1 */
function rod(radius: number, z0: number, z1: number, x = 0, y = 0) {
  return new CylinderGeometry(radius, radius, z1 - z0, Math.max(8, radial / 2)).rotateX(Math.PI / 2).translate(x, y, (z0 + z1) / 2);
}

/** Đồng bộ thuộc tính để gộp: mọi hình học đã có position/normal/uv và cùng có chỉ mục */
function merged(list: BufferGeometry[]) {
  return mergeAll(list);
}

/**
 * Tám cánh tay máy công nghiệp (hai cánh mỗi trạm, gắn vào hai trụ giàn). Mỗi cánh tay có chương trình công việc riêng
 * (hàn, kẹp–đặt, quét) với điểm dừng, tốc độ và nhịp nghỉ khác nhau, nên không bao giờ chuyển động đồng bộ.
 * Khuỷu luôn nhô lên (IK hai khớp); đầu dụng cụ quay về phía tác phẩm; đầu hàn có tia lửa nhấp nháy.
 * Thân cánh tay là thanh côn bo cạnh + trục khớp + thanh chống + động cơ nhỏ, vẽ bằng 6 InstancedMesh + 1 Points.
 */
export function buildArms(ctx: BuildContext): ZoneBuild {
  const { palette, mobile, reduced } = ctx;
  radial = mobile ? 12 : 24;
  bevel = mobile ? 1 : 2;
  const group = new Group();
  const arms: Arm[] = [];
  let index = 0;
  for (const zone of SERVICES) {
    const r = roomByZone[zone];
    for (const side of [-1, 1]) {
      const rand = seeded(index * 7919 + 101);
      const focus = new Vector3(r.x, BAY_OBJECT_Y, r.z);
      const shoulder = new Vector3(r.x + side * GANTRY.postDx, SHOULDER_Y, r.z - GANTRY.back + 0.28);
      // Mỗi cánh tay nghiêng về một kiểu việc: hàn / kẹp / quét, thỉnh thoảng đổi sang kiểu khác
      const lead: Act = (["weld", "grip", "scan"] as const)[(index + (index > 3 ? 1 : 0)) % 3];
      const steps: Step[] = [];
      const count = 4 + Math.floor(rand() * 3);
      // điểm "sẵn sàng": lùi ra mép bàn, phía trụ của chính cánh tay
      steps.push({ at: focus.clone().add(new Vector3(side * 1.35, 0.55, 0.2)), act: "scan", move: 1.6 + rand(), dwell: 0.5 + rand() * 1.2 });
      for (let k = 0; k < count; k++) {
        const angle = rand() * Math.PI * 2;
        const rr = 0.25 + rand() * 0.8;
        const act: Act = rand() < 0.68 ? lead : (["weld", "grip", "scan"] as const)[Math.floor(rand() * 3)];
        steps.push({
          at: focus.clone().add(new Vector3(Math.cos(angle) * rr, (rand() - 0.35) * 0.9, Math.sin(angle) * rr)),
          act,
          move: 0.7 + rand() * 1.5,
          dwell: act === "scan" ? 0.2 + rand() * 0.5 : 0.5 + rand() * 1.5,
        });
      }
      arms.push({
        zone,
        shoulder,
        focus,
        steps,
        index: Math.floor(rand() * steps.length),
        t: rand() * 2,
        speed: 0.75 + rand() * 0.5,
        gap: 0.13,
        roll: rand() * Math.PI,
        tip: steps[0].at.clone(),
        from: steps[steps.length - 1].at.clone(),
      });
      index++;
    }
  }
  const n = arms.length;

  // ---- Hình học (một lần) ----
  const baseGeo = merged([
    new CylinderGeometry(0.3, 0.34, 0.12, radial + 4).translate(0, -0.38, 0),
    new CylinderGeometry(0.25, 0.28, 0.5, radial + 4).translate(0, -0.1, 0),
    new CylinderGeometry(0.29, 0.29, 0.07, radial + 4).translate(0, 0.19, 0),
    boxAt(0.46, 0.5, 0.34, 0, -0.08, -0.34), // đế bắt vào trụ giàn
  ]);
  const upperGeo = merged([
    beam(L1, 0.3, 0.34, 0.22, 0.25),
    hub(0.215, 0.44, 0),
    hub(0.17, 0.4, L1),
    rod(0.032, 0.3, L1 - 0.32, 0, 0.27), // thanh chống thủy lực chạy dọc mặt trên
    boxAt(0.06, 0.12, 0.1, 0, 0.22, 0.3),
    boxAt(0.06, 0.1, 0.1, 0, 0.2, L1 - 0.32),
    hub(0.1, 0.18, L1 - 0.12, 0.3, 0), // động cơ khuỷu
    hub(0.12, 0.2, 0.34, -0.28, 0), // động cơ vai
  ]);
  const foreGeo = merged([
    beam(L2, 0.22, 0.24, 0.14, 0.16),
    hub(0.155, 0.36, 0),
    hub(0.105, 0.28, L2),
    boxAt(0.18, 0.05, 0.12, 0, 0.13, 0.45),
    boxAt(0.14, 0.05, 0.1, 0, 0.1, 0.95),
    hub(0.07, 0.14, 0.7, 0.18, 0),
  ]);
  const toolGeo = merged([
    new CylinderGeometry(0.085, 0.1, 0.16, Math.max(8, radial - 6)).rotateX(Math.PI / 2).translate(0, 0, 0.1),
    new RoundedBoxGeometry(0.36, 0.13, 0.15, bevel, 0.03).translate(0, 0, 0.23),
    boxAt(0.1, 0.07, 0.1, 0, 0.09, 0.15),
  ]);
  const fingerGeo = merged([new RoundedBoxGeometry(0.06, 0.1, 0.3, bevel, 0.015).translate(0, 0, 0.45), boxAt(0.03, 0.06, 0.06, 0, 0, 0.62)]);
  const ringGeo = new TorusGeometry(0.2, 0.02, 6, radial + 12).rotateY(Math.PI / 2);

  const dark = new MeshStandardMaterial({ color: palette.inkSurface, roughness: 0.55, metalness: 0.55 });
  const light = new MeshStandardMaterial({ color: palette.paper.clone().multiplyScalar(0.7), roughness: 0.42, metalness: 0.5 });
  const mid = new MeshStandardMaterial({ color: palette.graphite.clone().multiplyScalar(0.55), roughness: 0.45, metalness: 0.6 });
  const glowMat = new MeshBasicMaterial({ color: palette.accentLight, toneMapped: false });
  const base = new InstancedMesh(baseGeo, dark, n);
  const upper = new InstancedMesh(upperGeo, light, n);
  const fore = new InstancedMesh(foreGeo, mid, n);
  const tool = new InstancedMesh(toolGeo, dark, n);
  const fingers = new InstancedMesh(fingerGeo, light, n * 2);
  const rings = new InstancedMesh(ringGeo, glowMat, n * 3);
  for (const m of [base, upper, fore, tool, fingers, rings]) {
    m.frustumCulled = false;
    group.add(m);
  }

  const sparkCount = n * SPARKS_PER_ARM;
  const sparkGeo = new BufferGeometry();
  sparkGeo.setAttribute("position", new BufferAttribute(new Float32Array(sparkCount * 3), 3));
  const sparkPower = new BufferAttribute(new Float32Array(sparkCount), 1);
  sparkGeo.setAttribute("aPower", sparkPower);
  const sparks = new Points(
    sparkGeo,
    new ShaderMaterial({
      vertexShader: SPARK_VERT,
      fragmentShader: SPARK_FRAG,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75) }, uColor: { value: palette.paper.clone() } },
    }),
  );
  sparks.frustumCulled = false;
  group.add(sparks);

  // ---- Bộ nhớ tạm ----
  const wrist = new Vector3();
  const elbow = new Vector3();
  const dir = new Vector3();
  const perp = new Vector3();
  const pos = new Vector3();
  const aim = new Vector3();
  const up = new Vector3(0, 1, 0);
  const xa = new Vector3();
  const ya = new Vector3();
  const za = new Vector3();
  const frame = new Matrix4();
  const local = new Matrix4();
  const out = new Matrix4();
  const roll = new Quaternion();
  const zAxis = new Vector3(0, 0, 1);

  /** Khung tọa độ của một đoạn: Z dọc đoạn, Y theo hướng "lên" (đã trực giao), X là trục khớp */
  const setFrame = (origin: Vector3, z: Vector3, upHint: Vector3) => {
    za.copy(z).normalize();
    ya.copy(upHint).addScaledVector(za, -upHint.dot(za));
    if (ya.lengthSq() < 1e-6) ya.set(1, 0, 0);
    ya.normalize();
    xa.crossVectors(ya, za);
    frame.makeBasis(xa, ya, za).setPosition(origin);
    return frame;
  };

  let activeBay: RoomZone | null = null;
  const level = new Map<RoomZone, number>(SERVICES.map((s) => [s, 0.4]));
  const minJerk = (u: number) => u * u * u * (10 - 15 * u + 6 * u * u);

  const pose = (time: number, dt: number) => {
    for (const zone of SERVICES) {
      const target = activeBay === zone ? 1 : 0.4;
      level.set(zone, (level.get(zone) ?? 0.4) + (target - (level.get(zone) ?? 0.4)) * (1 - Math.exp(-dt * 4)));
    }
    arms.forEach((arm, i) => {
      const lv = level.get(arm.zone) ?? 0.4;
      // ---- Chương trình công việc: tiến theo thời gian riêng của từng cánh tay ----
      arm.t += dt * arm.speed * (0.8 + lv * 0.45);
      let step = arm.steps[arm.index];
      while (arm.t >= step.move + step.dwell) {
        arm.t -= step.move + step.dwell;
        arm.from.copy(step.at);
        arm.index = (arm.index + 1) % arm.steps.length;
        step = arm.steps[arm.index];
      }
      const moving = arm.t < step.move;
      const u = moving ? minJerk(Math.min(1, arm.t / step.move)) : 1;
      pos.lerpVectors(arm.from, step.at, u);
      if (moving) pos.y += Math.sin(Math.PI * u) * 0.14; // nhấc nhẹ giữa chặng, không lướt sát vật
      const working = !moving;
      if (working) {
        const w = arm.t - step.move;
        if (step.act === "weld") {
          pos.x += Math.cos(w * 7) * 0.035;
          pos.z += Math.sin(w * 7) * 0.035;
        } else if (step.act === "grip") pos.y -= Math.sin(Math.min(1, w * 2.2) * Math.PI) * 0.05;
        else pos.y += Math.sin(w * 2.4) * 0.025;
      }
      arm.tip.copy(pos);

      // ---- Dụng cụ chĩa về phía tác phẩm, hơi chúc xuống ----
      aim.subVectors(arm.focus, arm.tip);
      aim.y -= 1.0;
      aim.normalize();
      wrist.copy(arm.tip).addScaledVector(aim, -TOOL);

      // ---- IK hai khớp: khuỷu nằm trên đường vai–cổ tay ----
      dir.subVectors(wrist, arm.shoulder);
      let d = dir.length();
      d = Math.min(Math.max(d, Math.abs(L1 - L2) + 0.05), L1 + L2 - 0.05);
      dir.normalize();
      const along = (L1 * L1 - L2 * L2 + d * d) / (2 * d);
      const h = Math.sqrt(Math.max(L1 * L1 - along * along, 0));
      perp.copy(up).addScaledVector(dir, -up.dot(dir)).normalize();
      elbow.copy(arm.shoulder).addScaledVector(dir, along).addScaledVector(perp, h);
      wrist.copy(arm.shoulder).addScaledVector(dir, d);

      // ---- Đặt từng bộ phận ----
      local.makeTranslation(arm.shoulder.x, arm.shoulder.y, arm.shoulder.z);
      base.setMatrixAt(i, local);

      dir.subVectors(elbow, arm.shoulder);
      upper.setMatrixAt(i, setFrame(arm.shoulder, dir, perp));
      local.makeTranslation(0.25, 0, 0);
      rings.setMatrixAt(i * 3, out.multiplyMatrices(frame, local));

      dir.subVectors(wrist, elbow);
      fore.setMatrixAt(i, setFrame(elbow, dir, perp));
      local.makeTranslation(0.2, 0, 0);
      rings.setMatrixAt(i * 3 + 1, out.multiplyMatrices(frame, local));
      local.makeTranslation(0.15, 0, L2);
      rings.setMatrixAt(i * 3 + 2, out.multiplyMatrices(frame, local));

      // dụng cụ: cổ tay xoay quanh trục của chính nó khi làm việc
      const spin = step.act === "scan" ? Math.sin(time * 0.9 + i) * 0.5 : step.act === "grip" ? Math.sin(arm.index * 1.7) * 0.4 : 0;
      arm.roll += (spin - arm.roll) * (1 - Math.exp(-dt * 2.5));
      setFrame(wrist, aim, up);
      roll.setFromAxisAngle(zAxis, arm.roll);
      local.makeRotationFromQuaternion(roll);
      out.multiplyMatrices(frame, local);
      tool.setMatrixAt(i, out);

      // ngón kẹp: mở khi tới gần, khép khi làm việc (kẹp), khép sát thành mỏ hàn (hàn)
      const closed = step.act === "weld" ? 0.022 : step.act === "grip" ? 0.05 : 0.12;
      const target = working || (moving && arm.t > step.move - 0.25) ? closed : 0.14;
      arm.gap += (target - arm.gap) * (1 - Math.exp(-dt * 9));
      for (const s of [-1, 1]) {
        local.makeTranslation(s * arm.gap, 0, 0);
        fingers.setMatrixAt(i * 2 + (s < 0 ? 0 : 1), local.premultiply(out));
      }

      // ---- Tia lửa ở mũi hàn ----
      const welding = step.act === "weld" && (working || arm.t > step.move - 0.15);
      for (let k = 0; k < SPARKS_PER_ARM; k++) {
        const j = i * SPARKS_PER_ARM + k;
        const spread = 0.035 + k * 0.025;
        sparkGeo.attributes.position.setXYZ(
          j,
          arm.tip.x + (Math.random() - 0.5) * spread,
          arm.tip.y + (Math.random() - 0.2) * spread,
          arm.tip.z + (Math.random() - 0.5) * spread,
        );
        sparkPower.setX(j, welding ? (0.4 + Math.random() * 0.6) * (k === 0 ? 1 : 0.7) : 0);
      }
    });
    for (const m of [base, upper, fore, tool, fingers, rings]) m.instanceMatrix.needsUpdate = true;
    sparkGeo.attributes.position.needsUpdate = true;
    sparkPower.needsUpdate = true;
  };
  pose(0, 0.016);

  return {
    group,
    anchors: {},
    pickables: [],
    setState() {},
    setZone(zone: ZoneId) {
      activeBay = isServiceZone(zone) ? zone : null;
    },
    update(time, dt) {
      if (reduced) return;
      pose(time, dt);
    },
    dispose() {
      disposeGroup(group);
      ringGeo.dispose();
    },
  };
}
