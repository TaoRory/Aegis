import {
  AdditiveBlending,
  BufferGeometry,
  CircleGeometry,
  CylinderGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  RingGeometry,
  ShaderMaterial,
  TorusGeometry,
  Vector3,
} from "three";

import { isServiceZone, type ZoneId } from "@/config/space";
import { boxAt, mergeAll } from "@/components/space/engine/builders/merge";
import { CORE_RADIUS, HALL, outlinePoints, roomByZone, rooms, type Room, type RoomZone } from "@/components/space/plan";
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
 * Sàn bóng có lưới bản vẽ: vạch 1 m mờ, vạch 5 m rõ hơn, nhạt dần ra xa tâm; hơi trong suốt để lộ phản chiếu bên dưới.
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
  float fade = smoothstep(34.0, 10.0, length(vW.xz * vec2(0.8, 0.85) - vec2(0.0, 0.6)));
  float rr = 0.0;
  if (uRT >= 0.0) {
    float r = length(vW.xz - uRC);
    rr = smoothstep(1.4, 0.0, abs(r - uRT * 13.0)) * exp(-uRT * 1.3);
  }
  float l = (grid(vW.xz, 1.0) * 0.1 + grid(vW.xz, 5.0) * 0.24) * (fade + rr * 1.6);
  vec3 c = mix(uBase, uLine, clamp(l * 2.4, 0.0, 1.0)) + uRCol * rr * 0.5;
  gl_FragColor = vec4(c, uAlpha + rr * 0.25);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const WALL_VERT = /* glsl */ `
varying vec3 vW;
varying vec3 vN;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  vN = mat3(modelMatrix) * normal;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

/**
 * Vách cong của sảnh dự án: tối dần xuống chân, viền trên phát sáng, các tấm kính ghép dọc mờ, một dải sáng chậm chạy ngang.
 * Hai mặt đều vẽ (camera có thể ở trong hoặc ngoài cung).
 */
const WALL_FRAG = /* glsl */ `
uniform vec3 uBase;
uniform vec3 uRim;
uniform float uTime;
uniform float uHeight;
uniform float uAct;
varying vec3 vW;
varying vec3 vN;
void main() {
  float t = clamp(vW.y / uHeight, 0.0, 1.0);
  float ang = atan(vW.x, -vW.z);
  float f = fract(ang / 0.085);
  float seam = smoothstep(0.03, 0.0, min(f, 1.0 - f));
  float rim = smoothstep(uHeight - 0.14, uHeight, vW.y);
  float sweep = smoothstep(0.0, 1.0, 1.0 - abs(fract(ang * 0.9 - uTime * 0.04) - 0.5) * 7.0);
  vec3 col = uBase * mix(0.45, 1.25, t);
  col += uRim * (seam * (0.05 + 0.05 * t) + rim * 0.36 + sweep * 0.05 * (0.3 + t) + uAct * (0.05 + rim * 0.3));
  gl_FragColor = vec4(col, 0.94);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export interface Architecture {
  group: Group;
  /** Nhóm vật cao (vách, giàn): co theo trục y khi "dựng lên" lúc mở màn */
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

export const WALL_H = 3.2;
export const GANTRY = { h: 3.4, postDx: 2.4, back: 1.9 } as const;
const SERVICES: RoomZone[] = ["ai", "software", "web", "marketing"];

/** Tâm vòng sóng / điểm neo của một khu */
function centerOf(room: Room): { x: number; z: number } {
  return room.shape === "arc" ? { x: 0, z: -room.r } : { x: room.x, z: room.z };
}

/**
 * Kiến trúc nền của "Aegis Forge", dựng từ plan.ts: sàn bóng, nét mặt bằng, bậc lõi, bệ trạm bát giác, trụ băng chuyền, bệ phóng,
 * vách cong sảnh dự án, giàn chế tác của bốn trạm (giống hệt nhau), vòng giàn trên cao, và tấm sáng từng khu
 * (vừa làm điểm nhấn khu đang xem, vừa làm mục tiêu raycast ở tổng quan).
 */
export function buildArchitecture(ctx: BuildContext): Architecture {
  const { palette } = ctx;
  const group = new Group();
  const walls = new Group();
  let time = 0;

  // Sàn
  const floorMat = new ShaderMaterial({
    vertexShader: FLOOR_VERT,
    fragmentShader: FLOOR_FRAG,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uBase: { value: palette.inkRaised.clone() },
      uLine: { value: palette.accentLight.clone() },
      uRCol: { value: palette.accentPale.clone() },
      uAlpha: { value: 0.82 },
      uRC: { value: [0, 0] },
      uRT: { value: -1 },
    },
  });
  const floor = new Mesh(new PlaneGeometry(200, 160).rotateX(-Math.PI / 2), floorMat);
  floor.renderOrder = 1;
  group.add(floor);

  // Nét mặt bằng
  const linePositions: number[] = [];
  for (const r of rooms) {
    const pts = outlinePoints(r);
    for (let i = 0; i < pts.length - 1; i++) linePositions.push(pts[i][0], 0.02, pts[i][1], pts[i + 1][0], 0.02, pts[i + 1][1]);
  }
  const lineGeo = new BufferGeometry();
  lineGeo.setAttribute("position", new Float32BufferAttribute(linePositions, 3));
  const planLines = new LineSegments(lineGeo, new LineBasicMaterial({ color: palette.accentLight, transparent: true, opacity: 0.8 }));
  planLines.renderOrder = 3;
  group.add(planLines);

  // Bệ: bậc lõi, bệ bát giác + bàn xoay của bốn trạm, dải sàn cung sảnh, trống băng chuyền, bệ phóng. Gộp một mesh.
  const platformMat = new MeshStandardMaterial({ color: palette.inkSurface, roughness: 0.5, metalness: 0.45, emissive: palette.accent, emissiveIntensity: 0.12 });
  const plat: BufferGeometry[] = [];
  const tier = (r: number, h: number, x: number, z: number, sides = 72, phase = 0) =>
    plat.push(new CylinderGeometry(r, r + 0.05, h, sides).rotateY(phase).translate(x, h / 2, z));
  tier(CORE_RADIUS, 0.14, 0, 0);
  tier(3.0, 0.28, 0, 0);
  tier(2.45, 0.42, 0, 0);
  for (const zone of SERVICES) {
    const r = roomByZone[zone];
    tier(r.r, 0.24, r.x, r.z, 8, Math.PI / 8);
    tier(1.55, 0.36, r.x, r.z); // bàn xoay đỡ tác phẩm
  }
  const hall = roomByZone.work;
  plat.push(new RingGeometry(hall.r - HALL.band, hall.r + HALL.band, 72, 1, Math.PI / 2 - (hall.a1 ?? 0), (hall.a1 ?? 0) - (hall.a0 ?? 0)).rotateX(-Math.PI / 2).translate(0, 0.05, 0));
  const studio = roomByZone.studio;
  tier(studio.r, 0.2, studio.x, studio.z);
  plat.push(new CylinderGeometry(0.5, 0.55, 2.8, 24).translate(studio.x, 1.4, studio.z)); // trụ băng chuyền
  const gate = roomByZone.contact;
  tier(gate.r, 0.18, gate.x, gate.z);
  group.add(new Mesh(mergeAll(plat), platformMat));

  // Vách cong sảnh dự án (đi theo cung, hai mặt)
  const wallMat = new ShaderMaterial({
    vertexShader: WALL_VERT,
    fragmentShader: WALL_FRAG,
    side: DoubleSide,
    transparent: true,
    uniforms: {
      uBase: { value: palette.inkSurface.clone() },
      uRim: { value: palette.accentLight.clone() },
      uTime: { value: 0 },
      uHeight: { value: WALL_H },
      uAct: { value: 0 },
    },
  });
  const a0 = hall.a0 ?? 0;
  const a1 = hall.a1 ?? 0;
  const arcWall = new Mesh(new CylinderGeometry(hall.r + HALL.band - 0.05, hall.r + HALL.band - 0.05, WALL_H, 96, 1, true, Math.PI - a1 - 0.06, a1 - a0 + 0.12).translate(0, WALL_H / 2, 0), wallMat);
  walls.add(arcWall);

  // Giàn chế tác của bốn trạm: hai trụ + cổng vòm phía sau bàn xoay. Kim loại tối và dải sáng gộp riêng.
  const metal: BufferGeometry[] = [];
  const glowParts: BufferGeometry[] = [];
  for (const zone of SERVICES) {
    const r = roomByZone[zone];
    const pz = r.z - GANTRY.back;
    for (const side of [-1, 1]) {
      const px = r.x + side * GANTRY.postDx;
      metal.push(boxAt(0.26, GANTRY.h, 0.26, px, GANTRY.h / 2 + 0.24, pz), boxAt(0.7, 0.3, 0.7, px, 0.39, pz), boxAt(0.4, 0.14, 0.4, px, GANTRY.h + 0.31, pz));
      glowParts.push(boxAt(0.07, GANTRY.h - 0.4, 0.07, px + side * 0.14, GANTRY.h / 2 + 0.4, pz + 0.12)); // dải sáng dọc trụ
    }
    const arch = new TorusGeometry(GANTRY.postDx, 0.055, 8, 56, Math.PI);
    arch.scale(1, 0.62, 1);
    arch.translate(r.x, GANTRY.h + 0.31, pz);
    glowParts.push(arch);
    // xà ngang phía sau bàn xoay, nối hai trụ
    metal.push(boxAt(GANTRY.postDx * 2, 0.12, 0.12, r.x, 0.56, pz));
  }
  const gantryMetal = new Mesh(mergeAll(metal), new MeshStandardMaterial({ color: palette.inkSurface, roughness: 0.5, metalness: 0.6 }));
  const gantryGlowMat = new MeshBasicMaterial({ color: palette.accentLight, transparent: true, opacity: 0.6, toneMapped: false });
  const gantryGlow = new Mesh(mergeAll(glowParts.map((g) => (g.index ? g : g))), gantryGlowMat);
  walls.add(gantryMetal, gantryGlow);
  group.add(walls);

  // Vòng giàn trên cao quanh lõi (mờ khi camera đứng gần các khu)
  const trussMat = new MeshBasicMaterial({ color: palette.accentLight, transparent: true, opacity: 0.3, blending: AdditiveBlending, depthWrite: false, toneMapped: false });
  const truss = new Mesh(new TorusGeometry(7.4, 0.045, 6, 96).rotateX(Math.PI / 2).translate(0, 9, 0), trussMat);
  const truss2 = new Mesh(new TorusGeometry(5.6, 0.03, 6, 96).rotateX(Math.PI / 2).translate(0, 8.2, 0), trussMat);
  group.add(truss, truss2);

  // Tấm sáng từng khu (mục tiêu raycast ở tổng quan)
  const pickables: Mesh[] = [];
  const anchors: Record<string, Vector3> = {};
  const glow = new Map<RoomZone, { mesh: Mesh; target: number; current: number }>();
  for (const r of rooms) {
    let geometry: BufferGeometry;
    if (r.shape === "arc") geometry = new RingGeometry(r.r - HALL.band + 0.1, r.r + HALL.band - 0.1, 72, 1, Math.PI / 2 - (r.a1 ?? 0), (r.a1 ?? 0) - (r.a0 ?? 0)).rotateX(-Math.PI / 2);
    else if (r.shape === "octagon") geometry = new CircleGeometry(r.r - 0.1, 8, Math.PI / 8).rotateX(-Math.PI / 2);
    else geometry = new CircleGeometry(r.r - 0.12, 64).rotateX(-Math.PI / 2);
    const mesh = new Mesh(geometry, new MeshBasicMaterial({ color: palette.accent, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false }));
    mesh.position.set(r.shape === "arc" ? 0 : r.x, 0.3, r.shape === "arc" ? 0 : r.z);
    mesh.renderOrder = 2;
    mesh.userData.pick = `zone:${r.zone}`;
    group.add(mesh);
    pickables.push(mesh);
    glow.set(r.zone, { mesh, target: 0, current: 0 });
    const c = centerOf(r);
    // Điểm neo kim cương ở tổng quan: lõi trên cột plasma, trạm trên đỉnh cổng vòm, sảnh phía trên vách, băng chuyền và cổng trên cao
    const y = r.zone === "about" ? 6.2 : SERVICES.includes(r.zone) ? 5.6 : r.zone === "work" ? WALL_H + 0.7 : r.zone === "studio" ? 4.2 : 3.6;
    anchors[`zone:${r.zone}`] = new Vector3(c.x, y, c.z);
  }

  let active: ZoneId = "hub";
  let hover: ZoneId | null = null;
  const refresh = () => {
    for (const [zone, g] of glow) g.target = zone === active ? 0.1 : zone === hover ? 0.08 : active === "hub" && !ctx.mobile ? 0.025 : 0;
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
      const c = zone === "hub" ? { x: 0, z: 0 } : centerOf(roomByZone[zone]);
      floorMat.uniforms.uRC.value = [c.x, c.z];
      floorMat.uniforms.uRT.value = 0;
    },
    update(dt) {
      time += dt;
      wallMat.uniforms.uTime.value = time;
      wallMat.uniforms.uAct.value += ((active === "work" ? 1 : 0) - wallMat.uniforms.uAct.value) * (1 - Math.exp(-dt * 4));
      // Giàn các trạm "thở" nhẹ; ở khu cần camera đứng gần thì mờ đi để không cắt ngang khung hình
      const nearView = active !== "hub" && !isServiceZone(active);
      gantryGlowMat.opacity += ((nearView ? 0.18 : 0.48 + Math.sin(time * 0.9) * 0.07 + (isServiceZone(active) ? 0.2 : 0)) - gantryGlowMat.opacity) * (1 - Math.exp(-dt * 5));
      trussMat.opacity += ((active === "hub" ? 0.3 : 0.05) - trussMat.opacity) * (1 - Math.exp(-dt * 4));
      truss.rotation.y = time * 0.05;
      truss2.rotation.y = -time * 0.08;
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
