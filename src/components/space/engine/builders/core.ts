import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Euler,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  PointLight,
  Points,
  Quaternion,
  RingGeometry,
  ShaderMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from "three";

import { isServiceZone } from "@/config/space";
import { BASE_ROTATION, createShapes } from "@/components/webgl/shapes";
import { SERVICE_SHAPE } from "@/components/space/engine/builders/bay";
import { CORE } from "@/components/space/engine/layout";
import { radialTexture } from "@/components/space/engine/textures";
import type { BuildContext, ZoneBuild } from "@/components/space/engine/types";
import { disposeGroup } from "@/components/space/engine/types";

// ---------- Lớp hạt đổi hình (nền móng → mạng nơ-ron → mô-đun → khung trình duyệt → sóng lan) ----------

const MORPH_VERT = /* glsl */ `
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
  p = rotY(p, uRot.x + uTime * 0.12);
  p = rotX(p, uRot.y);
  vec4 mv = modelViewMatrix * vec4(p * uScale, 1.0);
  gl_Position = projectionMatrix * mv;
  vNucleus = step(0.94, fract(aSeed * 13.0));
  gl_PointSize = uSize * uPixelRatio * (0.55 + aSeed * 0.9 + vNucleus * 1.4) * (9.0 / max(-mv.z, 0.1));
  vA = 0.35 + 0.65 * fract(aSeed * 7.0);
}`;

const MORPH_FRAG = /* glsl */ `
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

// ---------- Quả cầu lõi: viền sáng theo Fresnel, dải năng lượng chạy dọc, nhịp đập ----------

const SPHERE_VERT = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
varying vec3 vP;
void main() {
  vP = position;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;

const SPHERE_FRAG = /* glsl */ `
uniform vec3 uCore;
uniform vec3 uRim;
uniform float uTime;
uniform float uPower;
varying vec3 vN;
varying vec3 vV;
varying vec3 vP;
void main() {
  float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.0);
  float pulse = 0.78 + 0.22 * sin(uTime * 2.2);
  float bands = 0.5 + 0.5 * sin(vP.y * 11.0 - uTime * 2.8 + vP.x * 3.0);
  vec3 col = mix(uCore, uRim, clamp(f * 1.3 + bands * 0.2, 0.0, 1.0));
  float a = (0.5 + f * 0.9 + bands * 0.12) * pulse * uPower;
  gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

// ---------- Cột plasma: hạt xoáy bốc lên từ lõi, hẹp dần ở trên ----------

const PLASMA_VERT = /* glsl */ `
attribute vec4 aSeed;
uniform float uTime;
uniform float uPixelRatio;
uniform float uHeight;
uniform float uPower;
varying float vA;
void main() {
  float life = fract(aSeed.x + uTime * (0.08 + aSeed.w * 0.12) * uPower);
  float ang = aSeed.y * 6.2832 + uTime * (0.6 + aSeed.z) + life * 5.0;
  float rad = (0.16 + aSeed.z * 0.5) * (1.0 - life * 0.55) + 0.05;
  vec3 p = vec3(cos(ang) * rad, life * uHeight, sin(ang) * rad);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  vA = sin(life * 3.1416) * (0.5 + 0.5 * aSeed.w);
  gl_PointSize = (1.4 + aSeed.w * 2.6) * uPixelRatio * (36.0 / max(-mv.z, 0.5));
}`;

const PLASMA_FRAG = /* glsl */ `
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

/**
 * Lõi năng lượng (Về Aegis): quả cầu sáng đặt trên bệ bậc, ba vòng quay ngược chiều, cột plasma hạt bốc lên, vòng sóng lan ra từ bệ,
 * và một lớp hạt bao quanh đổi hình qua 5 hình của engine hạt trang chủ (khi xem một dịch vụ, lớp hạt giữ hình của dịch vụ đó).
 */
export function buildCore(ctx: BuildContext): ZoneBuild {
  const { palette, mobile, reduced } = ctx;
  const group = new Group();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75);
  const y = CORE.holoY;
  const additive = { transparent: true, blending: AdditiveBlending, depthWrite: false } as const;

  // Quả cầu
  const sphereMat = new ShaderMaterial({
    vertexShader: SPHERE_VERT,
    fragmentShader: SPHERE_FRAG,
    ...additive,
    uniforms: { uCore: { value: palette.paper.clone() }, uRim: { value: palette.accentLight.clone() }, uTime: { value: 0 }, uPower: { value: 0.8 } },
  });
  const sphere = new Mesh(new SphereGeometry(1.0, 40, 28), sphereMat);
  sphere.position.set(CORE.x, y, CORE.z);

  // Ba vòng: một InstancedMesh, mỗi vòng một trục và một tốc độ
  const rings = new InstancedMesh(new TorusGeometry(1, 0.022, 8, 96), new MeshBasicMaterial({ color: palette.accentPale, opacity: 0.85, ...additive, toneMapped: false }), 3);
  const ringSpec = [
    { r: 1.7, tilt: [1.1, 0.2, 0], speed: 0.55 },
    { r: 2.2, tilt: [0.3, 0.4, 1.0], speed: -0.4 },
    { r: 2.75, tilt: [1.45, -0.3, 0.2], speed: 0.28 },
  ];
  const ringM = new Matrix4();
  const ringQ = new Quaternion();
  const ringE = new Euler();
  const ringS = new Vector3();
  const ringP = new Vector3(CORE.x, y, CORE.z);
  const placeRings = (time: number) => {
    ringSpec.forEach((spec, i) => {
      ringE.set(spec.tilt[0], spec.tilt[1] + time * spec.speed, spec.tilt[2]);
      ringQ.setFromEuler(ringE);
      ringS.setScalar(spec.r);
      rings.setMatrixAt(i, ringM.compose(ringP, ringQ, ringS));
    });
    rings.instanceMatrix.needsUpdate = true;
  };
  placeRings(0);
  rings.frustumCulled = false;

  // Cột plasma
  const plasmaCount = mobile ? 420 : 1100;
  const seeds = new Float32Array(plasmaCount * 4);
  for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random();
  const plasmaGeo = new BufferGeometry();
  plasmaGeo.setAttribute("position", new BufferAttribute(new Float32Array(plasmaCount * 3), 3));
  plasmaGeo.setAttribute("aSeed", new BufferAttribute(seeds, 4));
  const plasmaMat = new ShaderMaterial({
    vertexShader: PLASMA_VERT,
    fragmentShader: PLASMA_FRAG,
    ...additive,
    uniforms: { uTime: { value: 0 }, uPixelRatio: { value: pixelRatio }, uHeight: { value: 6.4 }, uPower: { value: 1 }, uColor: { value: palette.accentLight.clone() } },
  });
  const plasma = new Points(plasmaGeo, plasmaMat);
  plasma.position.set(CORE.x, y - 0.2, CORE.z);
  plasma.frustumCulled = false;

  // Vầng sáng dưới chân + vòng sóng lan ra từ bệ
  const glowTex = radialTexture();
  const halo = new Mesh(new PlaneGeometry(13, 13).rotateX(-Math.PI / 2), new MeshBasicMaterial({ color: palette.accent, alphaMap: glowTex, opacity: 0.5, ...additive }));
  halo.position.set(CORE.x, 0.46, CORE.z);
  const shock = new Mesh(new RingGeometry(1.0, 1.06, 96).rotateX(-Math.PI / 2), new MeshBasicMaterial({ color: palette.accentLight, opacity: 0, ...additive }));
  shock.position.set(CORE.x, 0.46, CORE.z);

  // Ánh sáng thật cho các bậc và vách xung quanh
  const light = new PointLight(palette.accentLight, 22, 16, 1.7);
  light.position.set(CORE.x, y, CORE.z);

  // Lớp hạt đổi hình bao quanh quả cầu
  const count = mobile ? 3200 : 6500;
  const shapes = createShapes(count);
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(count * 3), 3));
  const aFrom = new BufferAttribute(new Float32Array(shapes[0]), 3);
  const aTo = new BufferAttribute(new Float32Array(shapes[0]), 3);
  geometry.setAttribute("aFrom", aFrom);
  geometry.setAttribute("aTo", aTo);
  const morphSeeds = new Float32Array(count);
  for (let i = 0; i < count; i++) morphSeeds[i] = ((i * 2654435761) >>> 0) / 4294967296;
  geometry.setAttribute("aSeed", new BufferAttribute(morphSeeds, 1));
  const morphMat = new ShaderMaterial({
    vertexShader: MORPH_VERT,
    fragmentShader: MORPH_FRAG,
    ...additive,
    uniforms: {
      uMorph: { value: 1 },
      uTime: { value: 0 },
      uSize: { value: mobile ? 3.2 : 2.8 },
      uPixelRatio: { value: pixelRatio },
      uScale: { value: 1.9 },
      uRot: { value: [BASE_ROTATION.y, BASE_ROTATION.x * 0.5] },
      uColor: { value: palette.paper.clone() },
      uAccent: { value: palette.accentLight.clone() },
      uOpacity: { value: 0.6 },
    },
  });
  const points = new Points(geometry, morphMat);
  points.frustumCulled = false;
  points.position.set(CORE.x, y, CORE.z);

  group.add(halo, shock, plasma, points, sphere, rings, light);

  let current = 0;
  let morphing = 1; // 1 = đứng yên ở hình hiện tại
  let since = 0;
  let active = false;
  let pinned: number | null = null; // đang xem một dịch vụ: giữ hình của dịch vụ đó
  let power = 0.8;
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
    anchors: {},
    pickables: [],
    setState(a) {
      active = a;
    },
    setZone(zone) {
      pinned = isServiceZone(zone) ? SERVICE_SHAPE[zone] : null;
      if (pinned !== null && pinned !== current && !reduced) morphTo(pinned);
    },
    update(time, dt) {
      const k = 1 - Math.exp(-dt * 4);
      power += ((active ? 1.15 : 0.8) - power) * k;
      sphereMat.uniforms.uTime.value = time;
      sphereMat.uniforms.uPower.value = power;
      plasmaMat.uniforms.uTime.value = time;
      plasmaMat.uniforms.uPower.value = active ? 1.5 : 1;
      morphMat.uniforms.uTime.value = time;
      morphMat.uniforms.uOpacity.value += ((active ? 0.85 : 0.55) - morphMat.uniforms.uOpacity.value) * k;
      light.intensity = (16 + Math.sin(time * 2.2) * 4) * (active ? 1.5 : 1);
      (halo.material as MeshBasicMaterial).opacity = 0.4 + Math.sin(time * 2.2) * 0.08 + (active ? 0.2 : 0);
      const wave = (time * (active ? 0.45 : 0.28)) % 1;
      shock.scale.setScalar(1.2 + wave * 3.2);
      (shock.material as MeshBasicMaterial).opacity = (1 - wave) * (active ? 0.55 : 0.3);
      if (!reduced) placeRings(time);
      if (reduced) return;
      if (morphing < 1) {
        morphing = Math.min(1, morphing + dt / 1.8);
        morphMat.uniforms.uMorph.value = morphing;
      }
      since += dt;
      if (pinned === null && morphing >= 1 && since > (active ? 4.2 : 7)) morphTo((current + 1) % shapes.length);
    },
    dispose() {
      disposeGroup(group);
      glowTex.dispose();
    },
  };
}
