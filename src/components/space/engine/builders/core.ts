import { AdditiveBlending, BufferAttribute, BufferGeometry, CylinderGeometry, DoubleSide, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, Points, RingGeometry, ShaderMaterial, Vector3 } from "three";

import { BASE_ROTATION, createShapes } from "@/components/webgl/shapes";
import { CORE } from "@/components/space/engine/layout";
import type { BuildContext, ZoneBuild } from "@/components/space/engine/types";
import { disposeGroup } from "@/components/space/engine/types";

const VERT = /* glsl */ `
attribute vec3 aFrom;
attribute vec3 aTo;
attribute float aSeed;
uniform float uMorph;
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform float uScale;
uniform vec2 uRot;
varying float vA;
varying float vNucleus;
vec3 rotY(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z); }
vec3 rotX(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z); }
void main() {
  float m = smoothstep(0.0, 1.0, clamp(uMorph * 1.3 - aSeed * 0.3, 0.0, 1.0));
  vec3 p = mix(aFrom, aTo, m);
  p += 0.018 * vec3(sin(uTime * 0.8 + aSeed * 40.0), cos(uTime * 0.6 + aSeed * 31.0), sin(uTime * 0.7 + aSeed * 17.0));
  p = rotY(p, uRot.x + sin(uTime * 0.25) * 0.25);
  p = rotX(p, uRot.y);
  vec4 mv = modelViewMatrix * vec4(p * uScale, 1.0);
  gl_Position = projectionMatrix * mv;
  vNucleus = step(0.94, fract(aSeed * 13.0));
  gl_PointSize = uSize * uPixelRatio * (0.55 + aSeed * 0.9 + vNucleus * 1.4) * (9.0 / max(-mv.z, 0.1));
  vA = 0.35 + 0.65 * fract(aSeed * 7.0);
}`;

const FRAG = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uAccent;
uniform float uOpacity;
varying float vA;
varying float vNucleus;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float soft = 1.0 - d * 2.0;
  vec3 c = mix(uColor, uAccent, vNucleus);
  gl_FragColor = vec4(c, soft * soft * vA * uOpacity);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

/**
 * Lõi nền móng: bệ tròn với hologram hạt đổi hình lần lượt qua 5 hình của engine hạt trang chủ
 * (nền móng, mạng nơ-ron, lưới mô-đun, khung trình duyệt, sóng lan tỏa). Dữ liệu hình lấy từ webgl/shapes.ts.
 */
export function buildCore(ctx: BuildContext): ZoneBuild {
  const { palette, mobile, reduced } = ctx;
  const group = new Group();
  const anchors: Record<string, Vector3> = {};
  const count = mobile ? 4500 : 9000;
  const shapes = createShapes(count);

  const plinth = new Mesh(new CylinderGeometry(1.75, 1.85, 0.3, 48), new MeshStandardMaterial({ color: palette.inkSurface, roughness: 0.5, metalness: 0.5 }));
  plinth.position.set(CORE.x, 0.15, CORE.z);
  const ring = new Mesh(new RingGeometry(1.45, 1.52, 64).rotateX(-Math.PI / 2), new MeshBasicMaterial({ color: palette.accentLight, transparent: true, opacity: 0.8 }));
  ring.position.set(CORE.x, 0.305, CORE.z);
  const beam = new Mesh(
    new CylinderGeometry(1.2, 1.5, 1.7, 40, 1, true),
    new MeshBasicMaterial({ color: palette.accent, transparent: true, opacity: 0.05, blending: AdditiveBlending, depthWrite: false, side: DoubleSide }),
  );
  beam.position.set(CORE.x, 1.15, CORE.z);
  group.add(plinth, ring, beam);

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(count * 3), 3));
  const aFrom = new BufferAttribute(new Float32Array(shapes[0]), 3);
  const aTo = new BufferAttribute(new Float32Array(shapes[0]), 3);
  geometry.setAttribute("aFrom", aFrom);
  geometry.setAttribute("aTo", aTo);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) seeds[i] = ((i * 2654435761) >>> 0) / 4294967296;
  geometry.setAttribute("aSeed", new BufferAttribute(seeds, 1));

  const material = new ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uMorph: { value: 1 },
      uTime: { value: 0 },
      uSize: { value: mobile ? 3.4 : 3.0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75) },
      uScale: { value: CORE.holoScale },
      uRot: { value: [BASE_ROTATION.y, BASE_ROTATION.x * 0.6] },
      uColor: { value: palette.paper.clone() },
      uAccent: { value: palette.accentLight.clone() },
      uOpacity: { value: 0.85 },
    },
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  points.position.set(CORE.x, CORE.holoY, CORE.z);
  group.add(points);
  anchors["core"] = new Vector3(CORE.x, CORE.holoY + 1.3, CORE.z);

  let current = 0;
  let morphing = 1; // 1 = đứng yên ở hình hiện tại
  let since = 0;
  let active = false;
  const morphTo = (index: number) => {
    aFrom.array.set(shapes[current]);
    aTo.array.set(shapes[index]);
    aFrom.needsUpdate = true;
    aTo.needsUpdate = true;
    current = index;
    morphing = 0;
    since = 0;
  };

  return {
    group,
    anchors,
    pickables: [],
    setState(a) {
      active = a;
    },
    update(time, dt) {
      material.uniforms.uTime.value = time;
      material.uniforms.uOpacity.value += ((active ? 0.95 : 0.65) - material.uniforms.uOpacity.value) * (1 - Math.exp(-dt * 4));
      if (reduced) return;
      if (morphing < 1) {
        morphing = Math.min(1, morphing + dt / 1.8);
        material.uniforms.uMorph.value = morphing;
      }
      since += dt;
      // Khu đang xem thì đổi hình nhanh hơn
      if (morphing >= 1 && since > (active ? 4.2 : 7)) morphTo((current + 1) % shapes.length);
    },
    dispose() {
      disposeGroup(group);
    },
  };
}
