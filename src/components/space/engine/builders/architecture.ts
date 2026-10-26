import {
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  CircleGeometry,
  CylinderGeometry,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  ShaderMaterial,
  Vector3,
  Vector4,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

import type { ZoneId } from "@/config/space";
import { CORE_RADIUS, roomByZone, rooms, type RoomZone } from "@/components/space/plan";
import { boxAt, mergeAll } from "@/components/space/engine/builders/merge";
import type { BuildContext } from "@/components/space/engine/types";
import { disposeGroup } from "@/components/space/engine/types";

const FLOOR_VERT = /* glsl */ `
varying vec3 vW;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

/**
 * Sàn lưới bản vẽ: vạch 1 m mờ, vạch 5 m rõ hơn, nhạt dần ra xa tâm; hơi trong suốt để lộ phản chiếu bên dưới.
 * Khi đổi khu, một vòng sóng lan ra từ tâm khu đó (uRT = thời gian kể từ lúc bắt đầu, âm = không có sóng).
 */
const FLOOR_FRAG = /* glsl */ `
uniform vec3 uBase;
uniform vec3 uLine;
uniform vec3 uRCol;
uniform float uAlpha;
uniform vec2 uRC;
uniform float uRT;
varying vec3 vW;
float grid(vec2 p, float size) {
  vec2 q = p / size;
  vec2 g = abs(fract(q - 0.5) - 0.5) / fwidth(q);
  return 1.0 - min(min(g.x, g.y), 1.0);
}
void main() {
  float fade = smoothstep(24.0, 8.0, length(vW.xz * 0.85));
  float rr = 0.0;
  if (uRT >= 0.0) {
    float r = length(vW.xz - uRC);
    rr = smoothstep(1.4, 0.0, abs(r - uRT * 13.0)) * exp(-uRT * 1.3);
  }
  float l = (grid(vW.xz, 1.0) * 0.12 + grid(vW.xz, 5.0) * 0.26) * (fade + rr * 1.6);
  vec3 c = mix(uBase, uLine, clamp(l * 2.4, 0.0, 1.0)) + uRCol * rr * 0.5;
  gl_FragColor = vec4(c, uAlpha + rr * 0.25);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const WALL_VERT = /* glsl */ `
attribute float aTop;
varying vec3 vW;
varying vec3 vN;
varying float vTop;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  vN = mat3(modelMatrix) * normal;
  vTop = aTop * modelMatrix[1][1];
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

/**
 * Tường lưng (Gallery, Studio, Cổng): tối dần xuống chân, viền trên phát sáng, đường ghép tấm mờ, dải sáng chậm chạy dọc;
 * tường của khu đang xem sáng lên (uRect = khung khu, uAct = mức sáng).
 */
const WALL_FRAG = /* glsl */ `
uniform vec3 uBase;
uniform vec3 uRim;
uniform float uTime;
uniform vec4 uRect;
uniform float uAct;
varying vec3 vW;
varying vec3 vN;
varying float vTop;
void main() {
  vec3 n = normalize(vN);
  float lam = max(dot(n, normalize(vec3(-0.45, 0.8, 0.55))), 0.0);
  float t = clamp(vW.y / max(vTop, 0.1), 0.0, 1.0);
  vec3 col = uBase * (0.5 + 0.8 * lam) * mix(0.5, 1.3, t);

  float c = abs(n.z) > 0.5 ? vW.x : vW.z;
  float s = min(fract(c / 1.25), 1.0 - fract(c / 1.25));
  float seam = smoothstep(0.025, 0.0, s);
  float rim = smoothstep(vTop - 0.12, vTop, vW.y);
  float sweep = smoothstep(0.0, 1.0, 1.0 - abs(fract(vW.x * 0.035 - uTime * 0.035) - 0.5) * 7.0);

  col += uRim * (seam * 0.04 + rim * 0.32 + sweep * 0.04 * (0.3 + t));
  if (n.y > 0.5) col = uRim * 0.5;

  float inside = step(uRect.x - 0.3, vW.x) * step(vW.x, uRect.y + 0.3) * step(uRect.z - 0.3, vW.z) * step(vW.z, uRect.w + 0.3);
  col += uRim * inside * uAct * (0.05 + rim * 0.4 + seam * 0.1);

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export interface Architecture {
  group: Group;
  /** Nhóm tường lưng + khung khu dịch vụ: co theo trục y khi "dựng lên" lúc khởi động */
  walls: Group;
  /** Đường nét mặt bằng trên sàn (hiện ngay từ khung hình đầu) */
  planLines: LineSegments;
  pickables: Mesh[];
  anchors: Record<string, Vector3>;
  setZone(zone: ZoneId): void;
  setHover(zone: ZoneId | null): void;
  /** Vòng sóng lan trên sàn từ tâm khu (hub: từ lõi) */
  ripple(zone: ZoneId): void;
  update(dt: number): void;
  dispose(): void;
}

export const BACK_WALL = 2.4;
export const PAVILION_H = 3.2;

/** Khu có tường lưng phía bắc (để treo/dựa vật trưng bày quay về phía người xem) */
const BACKED: RoomZone[] = ["work", "studio", "contact"];
const SERVICES: RoomZone[] = ["ai", "software", "web", "marketing"];

/** Hình chữ nhật hoặc đường tròn làm nét mặt bằng (cặp đoạn thẳng cho LineSegments) */
function outline(zone: RoomZone, y: number): number[] {
  const r = roomByZone[zone];
  const out: number[] = [];
  if (r.shape === "circle") {
    const n = 72;
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2;
      const a1 = ((i + 1) / n) * Math.PI * 2;
      out.push(r.x + Math.cos(a0) * CORE_RADIUS, y, r.z + Math.sin(a0) * CORE_RADIUS, r.x + Math.cos(a1) * CORE_RADIUS, y, r.z + Math.sin(a1) * CORE_RADIUS);
    }
    return out;
  }
  const x0 = r.x - r.w / 2, x1 = r.x + r.w / 2, z0 = r.z - r.d / 2, z1 = r.z + r.d / 2;
  out.push(x0, y, z0, x1, y, z0, x1, y, z0, x1, y, z1, x1, y, z1, x0, y, z1, x0, y, z1, x0, y, z0);
  return out;
}

/**
 * Kiến trúc nền của "Aegis Foundation", dựng từ plan.ts: sàn lưới, nét mặt bằng, quảng trường lõi tròn, bệ cho mọi khu,
 * khung kính phát sáng cho 4 khu dịch vụ (giống hệt nhau), tường lưng cho Gallery/Studio/Cổng, và tấm sáng từng khu
 * (vừa làm điểm nhấn khu đang xem, vừa làm mục tiêu raycast ở tổng quan).
 */
export function buildArchitecture(ctx: BuildContext): Architecture {
  const { palette } = ctx;
  const group = new Group();
  const walls = new Group();
  let time = 0;

  // Sàn: đủ rộng để làm nền cho thành phố xung quanh
  const floorMat = new ShaderMaterial({
    vertexShader: FLOOR_VERT,
    fragmentShader: FLOOR_FRAG,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uBase: { value: palette.inkRaised.clone() },
      uLine: { value: palette.accentLight.clone() },
      uRCol: { value: palette.accentPale.clone() },
      uAlpha: { value: 0.8 },
      uRC: { value: [0, 0] },
      uRT: { value: -1 },
    },
  });
  const floor = new Mesh(new PlaneGeometry(180, 140).rotateX(-Math.PI / 2), floorMat);
  floor.renderOrder = 1;
  group.add(floor);

  // Nét mặt bằng
  const linePositions: number[] = [];
  for (const r of rooms) linePositions.push(...outline(r.zone, 0.02));
  const lineGeo = new BufferGeometry();
  lineGeo.setAttribute("position", new Float32BufferAttribute(linePositions, 3));
  const planLines = new LineSegments(lineGeo, new LineBasicMaterial({ color: palette.accentLight, transparent: true, opacity: 0.85 }));
  planLines.renderOrder = 3;
  group.add(planLines);

  // Bệ: quảng trường lõi (đĩa) + bệ thấp cho mọi khu chữ nhật, gộp một mesh
  const platformMat = new MeshStandardMaterial({ color: palette.inkRaised, roughness: 0.7, metalness: 0.25 });
  const platformGeos: BufferGeometry[] = [new CylinderGeometry(CORE_RADIUS, CORE_RADIUS + 0.06, 0.1, 72).translate(0, 0.05, 0)];
  for (const r of rooms) if (r.shape === "rect") platformGeos.push(boxAt(r.w, 0.12, r.d, r.x, 0.06, r.z));
  const platforms = new Mesh(mergeAll(platformGeos.map((g) => (g.index ? g.toNonIndexed() : g))), platformMat);
  group.add(platforms);

  // Tường lưng: một mesh
  const parts: BufferGeometry[] = [];
  for (const zone of BACKED) {
    const r = roomByZone[zone];
    const g = new BoxGeometry(r.w, BACK_WALL, 0.16);
    g.translate(r.x, BACK_WALL / 2, r.z - r.d / 2);
    g.setAttribute("aTop", new Float32BufferAttribute(new Float32Array(g.attributes.position.count).fill(BACK_WALL), 1));
    parts.push(g);
  }
  const merged = mergeGeometries(parts, false);
  for (const p of parts) p.dispose();
  const wallMat = new ShaderMaterial({
    vertexShader: WALL_VERT,
    fragmentShader: WALL_FRAG,
    uniforms: {
      uBase: { value: palette.inkSurface.clone() },
      uRim: { value: palette.accentLight.clone() },
      uTime: { value: 0 },
      uRect: { value: new Vector4(0, 0, 0, 0) },
      uAct: { value: 0 },
    },
  });
  walls.add(new Mesh(merged, wallMat));
  walls.add(new LineSegments(new EdgesGeometry(merged, 25), new LineBasicMaterial({ color: palette.accentLight, transparent: true, opacity: 0.3 })));

  // Khung kính của 4 khu dịch vụ: 4 cột + 4 xà trên, giống hệt nhau (ngang hàng), gộp một mesh phát sáng
  const frameGeos: BufferGeometry[] = [];
  const t = 0.07;
  for (const zone of SERVICES) {
    const r = roomByZone[zone];
    const x0 = r.x - r.w / 2 + 0.2, x1 = r.x + r.w / 2 - 0.2, z0 = r.z - r.d / 2 + 0.2, z1 = r.z + r.d / 2 - 0.2;
    for (const [px, pz] of [
      [x0, z0],
      [x1, z0],
      [x0, z1],
      [x1, z1],
    ] as const) {
      frameGeos.push(boxAt(t, PAVILION_H, t, px, 0.12 + PAVILION_H / 2, pz));
    }
    const y = 0.12 + PAVILION_H;
    frameGeos.push(boxAt(x1 - x0 + t, t, t, r.x, y, z0), boxAt(x1 - x0 + t, t, t, r.x, y, z1), boxAt(t, t, z1 - z0, x0, y, r.z), boxAt(t, t, z1 - z0, x1, y, r.z));
  }
  const frameMat = new MeshBasicMaterial({ color: palette.accentLight, transparent: true, opacity: 0.5, toneMapped: false });
  walls.add(new Mesh(mergeAll(frameGeos), frameMat));
  group.add(walls);

  // Tấm sáng từng khu (lõi: đĩa tròn)
  const pickables: Mesh[] = [];
  const anchors: Record<string, Vector3> = {};
  const glow = new Map<RoomZone, { mesh: Mesh; target: number; current: number }>();
  for (const r of rooms) {
    const geometry = r.shape === "circle" ? new CircleGeometry(CORE_RADIUS - 0.15, 64).rotateX(-Math.PI / 2) : new PlaneGeometry(r.w - 0.3, r.d - 0.3).rotateX(-Math.PI / 2);
    const mesh = new Mesh(geometry, new MeshBasicMaterial({ color: palette.accent, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false }));
    mesh.position.set(r.x, 0.14, r.z);
    mesh.renderOrder = 2;
    mesh.userData.pick = `zone:${r.zone}`;
    group.add(mesh);
    pickables.push(mesh);
    glow.set(r.zone, { mesh, target: 0, current: 0 });
    // Điểm neo hotspot ở tổng quan: khu dịch vụ đặt trên khung, lõi trên hologram, khu có tường đặt trên đỉnh tường
    const y = SERVICES.includes(r.zone) ? PAVILION_H + 0.7 : r.zone === "about" ? 4.4 : BACK_WALL + 0.5;
    const z = BACKED.includes(r.zone) ? r.z - r.d / 2 + 0.3 : r.z;
    anchors[`zone:${r.zone}`] = new Vector3(r.x, y, z);
  }

  let active: ZoneId = "hub";
  let hover: ZoneId | null = null;
  let wallAct = 0;
  let wallActTarget = 0;
  const refresh = () => {
    for (const [zone, g] of glow) g.target = zone === active ? 0.09 : zone === hover ? 0.07 : active === "hub" && !ctx.mobile ? 0.02 : 0;
    const room = BACKED.includes(active as RoomZone) ? roomByZone[active as RoomZone] : null;
    wallActTarget = room ? 1 : 0;
    if (room) (wallMat.uniforms.uRect.value as Vector4).set(room.x - room.w / 2, room.x + room.w / 2, room.z - room.d / 2, room.z + room.d / 2);
  };
  refresh();

  return {
    group,
    walls,
    planLines,
    pickables,
    anchors,
    setZone(zone) {
      active = zone;
      refresh();
    },
    setHover(zone) {
      hover = zone;
      refresh();
    },
    ripple(zone) {
      const c = zone === "hub" ? { x: 0, z: 0 } : roomByZone[zone];
      floorMat.uniforms.uRC.value = [c.x, c.z];
      floorMat.uniforms.uRT.value = 0;
    },
    update(dt) {
      time += dt;
      wallMat.uniforms.uTime.value = time;
      wallAct += (wallActTarget - wallAct) * (1 - Math.exp(-dt * 4));
      wallMat.uniforms.uAct.value = wallAct;
      // Khung các khu dịch vụ "thở" nhẹ; khi đang ở một khu dịch vụ thì cả bốn khung sáng hơn một chút
      // Ở các khu cần camera đứng gần (dự án, studio, liên hệ, về Aegis) thanh khung mờ đi để không cắt ngang khung hình
      const nearView = active !== "hub" && !SERVICES.includes(active as RoomZone);
      frameMat.opacity = nearView ? 0.14 : 0.42 + Math.sin(time * 0.9) * 0.06 + (SERVICES.includes(active as RoomZone) ? 0.18 : 0);
      const rt = floorMat.uniforms.uRT.value as number;
      if (rt >= 0) floorMat.uniforms.uRT.value = rt + dt > 3.2 ? -1 : rt + dt;
      const k = 1 - Math.exp(-dt * 7);
      for (const g of glow.values()) {
        g.current += (g.target - g.current) * k;
        (g.mesh.material as MeshBasicMaterial).opacity = g.current;
        g.mesh.visible = g.current > 0.004; // vẫn nhận raycast khi ẩn (Raycaster không xét visible)
      }
    },
    dispose() {
      disposeGroup(group);
    },
  };
}
