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
  MeshStandardMaterial,
  PlaneGeometry,
  ShaderMaterial,
  Vector3,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

import type { ZoneId } from "@/config/space";
import { rooms } from "@/components/space/plan";
import type { BuildContext } from "@/components/space/engine/types";
import { disposeGroup } from "@/components/space/engine/types";

const FLOOR_VERT = /* glsl */ `
varying vec3 vW;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

/** Sàn lưới bản vẽ: vạch 1 m mờ, vạch 5 m rõ hơn, nhạt dần ra xa tâm; hơi trong suốt để lộ phản chiếu bên dưới */
const FLOOR_FRAG = /* glsl */ `
uniform vec3 uBase;
uniform vec3 uLine;
uniform float uAlpha;
varying vec3 vW;
float grid(vec2 p, float size) {
  vec2 q = p / size;
  vec2 g = abs(fract(q - 0.5) - 0.5) / fwidth(q);
  return 1.0 - min(min(g.x, g.y), 1.0);
}
void main() {
  float fade = smoothstep(20.0, 6.0, length(vW.xz * vec2(0.8, 1.15)));
  float l = (grid(vW.xz, 1.0) * 0.12 + grid(vW.xz, 5.0) * 0.26) * fade;
  gl_FragColor = vec4(mix(uBase, uLine, clamp(l * 2.4, 0.0, 1.0)), uAlpha);
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

  // Sàn
  const floor = new Mesh(
    new PlaneGeometry(40, 32).rotateX(-Math.PI / 2),
    new ShaderMaterial({
      vertexShader: FLOOR_VERT,
      fragmentShader: FLOOR_FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: { uBase: { value: palette.inkRaised.clone() }, uLine: { value: palette.accentLight.clone() }, uAlpha: { value: 0.8 } },
    }),
  );
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
  const wallMesh = new Mesh(merged, new MeshStandardMaterial({ color: palette.inkSurface, roughness: 0.85, metalness: 0.15 }));
  walls.add(wallMesh);
  const edges = new LineSegments(new EdgesGeometry(merged, 25), new LineBasicMaterial({ color: palette.accentLight, transparent: true, opacity: 0.5 }));
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
  const refresh = () => {
    for (const [zone, g] of glow) g.target = zone === active ? 0.09 : zone === hover ? 0.07 : active === "hub" ? 0.02 : 0;
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
    update(dt) {
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
