import {
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  ShaderMaterial,
  Vector3,
  Vector4,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

import type { ZoneId } from "@/config/space";
import { rooms, roomByZone } from "@/components/space/plan";
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
  float fade = smoothstep(20.0, 6.0, length(vW.xz * vec2(0.8, 1.15)));
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
 * Tường: tối dần xuống chân, viền trên phát sáng, đường ghép tấm mờ, một dải sáng chậm chạy dọc;
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
  if (n.y > 0.5) col = uRim * (vTop > 0.5 ? 0.5 : 0.22);

  float inside = step(uRect.x - 0.3, vW.x) * step(vW.x, uRect.y + 0.3) * step(uRect.z - 0.3, vW.z) * step(vW.z, uRect.w + 0.3);
  col += uRim * inside * uAct * (0.05 + rim * 0.4 + seam * 0.1);

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export interface Architecture {
  group: Group;
  /** Nhóm tường + đường viền: co theo trục y khi "dựng lên" lúc khởi động */
  walls: Group;
  /** Đường nét mặt bằng trên sàn (hiện ngay từ khung hình đầu) */
  planLines: LineSegments;
  pickables: Mesh[];
  anchors: Record<string, Vector3>;
  setZone(zone: ZoneId | "hub"): void;
  setHover(zone: ZoneId | null): void;
  /** Vòng sóng lan trên sàn từ tâm khu (hub: từ giữa xưởng) */
  ripple(zone: ZoneId | "hub"): void;
  update(dt: number): void;
  dispose(): void;
}

/**
 * Kiến trúc nền của xưởng, dựng từ plan.ts: sàn lưới, đường nét mặt bằng, tường (bắc cao, đông/tây thấp, nam là gờ),
 * tấm sáng cho từng phòng (vừa làm điểm nhấn khu đang xem, vừa làm mục tiêu raycast ở tổng mặt bằng).
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
  const floor = new Mesh(new PlaneGeometry(160, 120).rotateX(-Math.PI / 2), floorMat);
  floor.renderOrder = 1;
  group.add(floor);

  // Đường nét mặt bằng (hình chữ nhật từng phòng)
  const linePositions: number[] = [];
  const addRect = (x: number, z: number, w: number, d: number, y: number) => {
    const x0 = x - w / 2, x1 = x + w / 2, z0 = z - d / 2, z1 = z + d / 2;
    linePositions.push(x0, y, z0, x1, y, z0, x1, y, z0, x1, y, z1, x1, y, z1, x0, y, z1, x0, y, z1, x0, y, z0);
  };
  for (const r of rooms) addRect(r.x, r.z, r.w, r.d, 0.02);
  const lineGeo = new BufferGeometry();
  lineGeo.setAttribute("position", new Float32BufferAttribute(linePositions, 3));
  const planLines = new LineSegments(lineGeo, new LineBasicMaterial({ color: palette.accentLight, transparent: true, opacity: 0.85 }));
  planLines.renderOrder = 3;
  group.add(planLines);

  // Tường: gộp thành một mesh
  const parts: BufferGeometry[] = [];
  const box = (w: number, h: number, d: number, x: number, y: number, z: number) => {
    const g = new BoxGeometry(w, h, d);
    g.translate(x, y, z);
    g.setAttribute("aTop", new Float32BufferAttribute(new Float32Array(g.attributes.position.count).fill(h === 2.4 ? 2.4 : h === 1.0 ? 1.0 : 0.16), 1));
    parts.push(g);
  };
  for (const r of rooms) {
    const t = 0.16;
    box(r.w, 2.4, t, r.x, 1.2, r.z - r.d / 2); // bắc
    box(t, 1.0, r.d, r.x - r.w / 2, 0.5, r.z); // tây
    box(t, 1.0, r.d, r.x + r.w / 2, 0.5, r.z); // đông
    box(r.w, 0.16, t, r.x, 0.08, r.z + r.d / 2); // nam (gờ)
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
  const edges = new LineSegments(new EdgesGeometry(merged, 25), new LineBasicMaterial({ color: palette.accentLight, transparent: true, opacity: 0.3 }));
  walls.add(edges);
  group.add(walls);

  // Tấm sáng từng phòng
  const pickables: Mesh[] = [];
  const anchors: Record<string, Vector3> = {};
  const glow = new Map<ZoneId, { mesh: Mesh; target: number; current: number }>();
  for (const r of rooms) {
    const mesh = new Mesh(
      new PlaneGeometry(r.w - 0.3, r.d - 0.3).rotateX(-Math.PI / 2),
      new MeshBasicMaterial({ color: palette.accent, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false }),
    );
    mesh.position.set(r.x, 0.035, r.z);
    mesh.renderOrder = 2;
    mesh.userData.pick = `zone:${r.zone}`;
    group.add(mesh);
    pickables.push(mesh);
    glow.set(r.zone, { mesh, target: 0, current: 0 });
    anchors[`zone:${r.zone}`] = new Vector3(r.x, 0.5, r.z);
  }

  let active: ZoneId | "hub" = "hub";
  let hover: ZoneId | null = null;
  let wallAct = 0;
  let wallActTarget = 0;
  const refresh = () => {
    for (const [zone, g] of glow) g.target = zone === active ? 0.09 : zone === hover ? 0.07 : active === "hub" && !ctx.mobile ? 0.02 : 0;
    wallActTarget = active === "hub" ? 0 : 1;
    if (active !== "hub") {
      const r = roomByZone[active];
      (wallMat.uniforms.uRect.value as Vector4).set(r.x - r.w / 2, r.x + r.w / 2, r.z - r.d / 2, r.z + r.d / 2);
    }
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
