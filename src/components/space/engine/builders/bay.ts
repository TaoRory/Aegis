import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  Points,
  RingGeometry,
  ShaderMaterial,
  Vector3,
} from "three";

import { servicesWithDemo } from "@/config/space";
import { BASE_ROTATION, createShapes } from "@/components/webgl/shapes";
import { roomByZone } from "@/components/space/plan";
import type { BuildContext, ZoneBuild } from "@/components/space/engine/types";
import { disposeGroup } from "@/components/space/engine/types";
import type { ServiceId } from "@/content/types";

/** Hình hạt của từng dịch vụ (chỉ số trong createShapes): cùng một ngôn ngữ, mỗi dịch vụ một hình */
export const SERVICE_SHAPE: Record<ServiceId, number> = { ai: 1, software: 2, web: 3, marketing: 4 };
const MODE: Record<ServiceId, number> = { ai: 0, software: 1, web: 2, marketing: 3 };

/** Chiều cao tâm tác phẩm trên bàn xoay (m) */
export const BAY_OBJECT_Y = 1.75;

const VERT = /* glsl */ `
attribute float aSeed;
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform float uScale;
uniform float uMode;
uniform float uSpin;
varying float vA;
varying float vNucleus;
varying float vHot;
vec3 rotY(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z); }
vec3 rotX(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z); }
void main() {
  vec3 p = position;
  p += 0.018 * vec3(sin(uTime * 0.8 + aSeed * 40.0), cos(uTime * 0.6 + aSeed * 31.0), sin(uTime * 0.7 + aSeed * 17.0));
  // Mỗi dịch vụ một kiểu "sóng" chạy qua hình: AI tín hiệu toả từ tâm, phần mềm quét dọc,
  // web quét ngang như dòng tải trang, marketing vòng lan từ chân lên
  float band;
  if (uMode < 0.5) band = length(p) * 1.4 - uTime * 0.55;
  else if (uMode < 1.5) band = p.y * 0.9 - uTime * 0.4;
  else if (uMode < 2.5) band = p.x * 0.9 - uTime * 0.45;
  else band = length(p.xz) * 1.3 - p.y * 0.4 - uTime * 0.6;
  vHot = smoothstep(0.1, 0.0, abs(fract(band) - 0.5) - 0.4);
  p = rotY(p, ${BASE_ROTATION.y.toFixed(3)} + uSpin);
  p = rotX(p, ${(BASE_ROTATION.x * 0.5).toFixed(3)});
  vec4 mv = modelViewMatrix * vec4(p * uScale, 1.0);
  gl_Position = projectionMatrix * mv;
  vNucleus = step(0.93, fract(aSeed * 13.0));
  gl_PointSize = uSize * uPixelRatio * (0.55 + aSeed * 0.9 + vNucleus * 1.3 + vHot * 0.8) * (9.0 / max(-mv.z, 0.1));
  vA = 0.35 + 0.65 * fract(aSeed * 7.0);
}`;

const FRAG = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uAccent;
uniform float uOpacity;
varying float vA;
varying float vNucleus;
varying float vHot;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float soft = 1.0 - d * 2.0;
  vec3 c = mix(uColor, uAccent, max(vNucleus, vHot * 0.7));
  gl_FragColor = vec4(c, soft * soft * vA * uOpacity * (0.75 + vHot * 0.9));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

/**
 * Bốn trạm chế tác dịch vụ, dựng bằng CÙNG một công thức (ngang hàng): tác phẩm hạt mang hình của dịch vụ đặt trên bàn xoay,
 * vòng sáng, mặt phẳng laser quét lên xuống (hai cánh tay máy do arms.ts lo), điểm chạm "Demo / Dự án" và "Trao đổi".
 * Trạm đang xem sáng và quay nhanh hơn.
 */
export function buildBays(ctx: BuildContext): { zone: ServiceId; build: ZoneBuild }[] {
  const { palette, mobile } = ctx;
  const count = mobile ? 1700 : 3400;
  const shapes = createShapes(count);
  const pixelRatio = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) seeds[i] = ((i * 2654435761) >>> 0) / 4294967296;
  const additive = { transparent: true, blending: AdditiveBlending, depthWrite: false } as const;

  return (["ai", "software", "web", "marketing"] as const).map((id) => {
    const room = roomByZone[id];
    const group = new Group();
    const anchors: Record<string, Vector3> = {};

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(new Float32Array(shapes[SERVICE_SHAPE[id]]), 3));
    geometry.setAttribute("aSeed", new BufferAttribute(seeds, 1));
    const material = new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      ...additive,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: mobile ? 3.2 : 2.8 },
        uPixelRatio: { value: pixelRatio },
        uScale: { value: 1.05 },
        uMode: { value: MODE[id] },
        uSpin: { value: 0 },
        uColor: { value: palette.paper.clone() },
        uAccent: { value: palette.accentLight.clone() },
        uOpacity: { value: 0.7 },
      },
    });
    const points = new Points(geometry, material);
    points.frustumCulled = false;
    points.position.set(room.x, BAY_OBJECT_Y, room.z);

    // Vòng sáng trên bàn xoay
    const ring = new Mesh(new RingGeometry(1.2, 1.26, 72).rotateX(-Math.PI / 2), new MeshBasicMaterial({ color: palette.accentLight, opacity: 0.5, ...additive }));
    ring.position.set(room.x, 0.38, room.z);

    // Mặt phẳng laser quét lên xuống qua tác phẩm
    const scan = new Mesh(new CircleGeometry(1.35, 48).rotateX(-Math.PI / 2), new MeshBasicMaterial({ color: palette.accentPale, opacity: 0.1, ...additive, side: DoubleSide }));
    scan.position.set(room.x, 1, room.z);

    // Vùng chạm vô hình quanh tác phẩm (raycast không xét visible)
    const primary = servicesWithDemo.includes(id) ? `demo:${id}` : `proof:${id}`;
    const pick = new Mesh(new BoxGeometry(2.8, 3.2, 2.8), new MeshBasicMaterial());
    pick.visible = false;
    pick.position.set(room.x, 1.9, room.z);
    pick.userData.pick = primary;

    group.add(points, ring, scan, pick);
    anchors[primary] = new Vector3(room.x, 4.1, room.z);
    anchors[`start:${id}`] = new Vector3(room.x + (room.x > 0 ? -1 : 1) * 2.1, 0.9, room.z + 1.9);

    let active = false;
    let hover = false;
    let level = 0.4;
    let spin = 0;
    const build: ZoneBuild = {
      group,
      anchors,
      pickables: [pick],
      setState(a) {
        active = a;
      },
      setHover(hotspot) {
        hover = hotspot === primary || hotspot === `zone:${id}`;
      },
      update(time, dt) {
        const target = active ? 1 : hover ? 0.8 : 0.45;
        level += (target - level) * (1 - Math.exp(-dt * 4));
        spin += dt * (0.12 + level * 0.3);
        material.uniforms.uTime.value = time;
        material.uniforms.uSpin.value = spin;
        material.uniforms.uOpacity.value = 0.45 + level * 0.55;
        (ring.material as MeshBasicMaterial).opacity = 0.2 + level * 0.55;
        // laser quét: lên xuống chậm, sáng hơn ở trạm đang xem
        const sweep = 0.5 + 0.5 * Math.sin(time * (0.7 + level * 0.5) + room.x);
        scan.position.y = 0.5 + sweep * 2.5;
        (scan.material as MeshBasicMaterial).opacity = 0.05 + level * 0.14;
      },
      dispose() {
        disposeGroup(group);
      },
    };
    return { zone: id, build };
  });
}
