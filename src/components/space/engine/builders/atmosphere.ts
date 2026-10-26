import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  Mesh,
  Points,
  ShaderMaterial,
} from "three";

import type { ZoneId } from "@/config/space";
import { roomByZone, rooms } from "@/components/space/plan";
import type { BuildContext } from "@/components/space/engine/types";
import { disposeGroup } from "@/components/space/engine/types";

function rng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- Thành phố nền móng ----------

const CITY_VERT = /* glsl */ `
attribute float aSeed;
varying vec3 vW;
varying vec3 vL;
varying vec3 vN;
varying vec3 vS;
varying float vSeed;
void main() {
  vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0);
  vW = w.xyz;
  vL = position;
  vN = normal;
  vS = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
  vSeed = aSeed;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

/** Khối nhà tối, ô cửa sổ thưa sáng lên chậm; nhạt dần vào sương theo khoảng cách để có chiều sâu */
const CITY_FRAG = /* glsl */ `
uniform vec3 uBase;
uniform vec3 uTop;
uniform vec3 uLit;
uniform vec3 uFog;
uniform float uTime;
uniform vec2 uFogRange;
varying vec3 vW;
varying vec3 vL;
varying vec3 vN;
varying vec3 vS;
varying float vSeed;
float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  vec3 n = abs(vN);
  float height = (vL.y + 0.5) * vS.y;
  vec3 col = mix(uBase, uTop, clamp(height / max(vS.y, 0.1), 0.0, 1.0) * 0.8);
  if (n.y > 0.5) {
    col = uTop * 1.5;
  } else {
    vec2 f = n.x > 0.5 ? vec2(vL.z * vS.z, vL.y * vS.y) : vec2(vL.x * vS.x, vL.y * vS.y);
    vec2 cell = floor(f / vec2(0.55, 0.75));
    vec2 uv = fract(f / vec2(0.55, 0.75));
    float win = step(0.22, uv.x) * step(uv.x, 0.78) * step(0.28, uv.y) * step(uv.y, 0.72);
    float r = h21(cell + vSeed * 91.0);
    float on = step(0.8, r) * (0.55 + 0.45 * sin(uTime * 0.5 + r * 40.0));
    col += uLit * win * on * 1.4;
  }
  float d = length(vW - cameraPosition);
  col = mix(col, uFog, smoothstep(uFogRange.x, uFogRange.y, d));
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

// ---------- Hạt bụi sáng ----------

const MOTE_VERT = /* glsl */ `
attribute vec4 aSeed;
uniform float uTime;
uniform float uPixelRatio;
uniform vec4 uFocus;
uniform vec3 uBox;
varying float vA;
varying float vMix;
void main() {
  vec3 p;
  p.x = (aSeed.x * 2.0 - 1.0) * uBox.x + sin(uTime * 0.15 + aSeed.y * 20.0) * 0.7;
  p.z = (aSeed.z * 2.0 - 1.0) * uBox.z + cos(uTime * 0.12 + aSeed.x * 17.0) * 0.7;
  p.y = mod(aSeed.y * uBox.y + uTime * (0.1 + aSeed.w * 0.22), uBox.y);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float tw = 0.5 + 0.5 * sin(uTime * (0.8 + aSeed.w * 2.0) + aSeed.x * 50.0);
  float near = 1.0 - smoothstep(0.0, uFocus.w, distance(p.xz, uFocus.xz));
  vA = (0.2 + 0.8 * tw) * (0.3 + 0.9 * near) * smoothstep(0.0, 0.7, p.y) * (1.0 - smoothstep(uBox.y * 0.75, uBox.y, p.y));
  vMix = near;
  gl_PointSize = (1.3 + aSeed.w * 2.4) * uPixelRatio * (42.0 / max(-mv.z, 0.5));
}`;

const MOTE_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uAccent;
varying float vA;
varying float vMix;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float soft = 1.0 - d * 2.0;
  gl_FragColor = vec4(mix(uColor, uAccent, vMix), soft * soft * vA);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

// ---------- Xung năng lượng chạy quanh các phòng ----------

const PULSE_VERT = /* glsl */ `
attribute float aU;
attribute float aRoom;
attribute float aLen;
attribute float aSide;
varying float vU;
varying float vRoom;
varying float vLen;
varying float vSide;
void main() {
  vU = aU;
  vRoom = aRoom;
  vLen = aLen;
  vSide = aSide;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

/** Mỗi phòng có hai xung sáng đuôi dài chạy vòng quanh nét mặt bằng; phòng đang xem chạy nhanh và sáng hơn */
const PULSE_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uHot;
uniform float uTime;
uniform float uActive;
uniform float uHover;
varying float vU;
varying float vRoom;
varying float vLen;
varying float vSide;
void main() {
  float isA = 1.0 - step(0.5, abs(vRoom - uActive));
  float isH = 1.0 - step(0.5, abs(vRoom - uHover));
  float speed = 2.0 + isA * 2.4;
  float a = 0.0;
  for (int k = 0; k < 2; k++) {
    float head = fract(uTime * speed / vLen + float(k) * 0.5 + vRoom * 0.137);
    float behind = fract(head - vU) * vLen;
    a += exp(-behind * 1.1);
  }
  float edge = smoothstep(1.0, 0.3, abs(vSide));
  float alpha = a * edge * (0.4 + isA * 0.9 + isH * 0.5) + isA * 0.2 * edge;
  gl_FragColor = vec4(mix(uColor, uHot, clamp(a * 0.6, 0.0, 1.0)), alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export interface Atmosphere {
  group: Group;
  /** Khối nhà: co theo trục y khi mở màn */
  city: Group;
  setZone(zone: ZoneId | "hub"): void;
  setHover(zone: ZoneId | null): void;
  update(time: number): void;
  dispose(): void;
}

export function buildAtmosphere(ctx: BuildContext): Atmosphere {
  const { palette, mobile } = ctx;
  const group = new Group();
  const city = new Group();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75);

  // Thành phố: vành khối nhà quanh xưởng, né vùng camera bay qua (phía nam) để không che cảnh
  const count = mobile ? 110 : 280;
  const rand = rng(20260);
  const matrices: Matrix4[] = [];
  const seeds = new Float32Array(count);
  const m = new Matrix4();
  for (let attempts = 0; matrices.length < count && attempts < count * 12; attempts++) {
    const angle = rand() * Math.PI * 2;
    const radius = 15 + Math.pow(rand(), 0.8) * 46;
    const x = Math.cos(angle) * radius * 1.25;
    const z = Math.sin(angle) * radius * 0.85;
    if (Math.abs(x) < 14 && Math.abs(z) < 11.5) continue;
    if (z > 6 && z < 30 && Math.abs(x) < 28) continue;
    const w = 1 + rand() * 2.6;
    const d = 1 + rand() * 2.6;
    const far = Math.hypot(x, z);
    const h = 0.5 + rand() * 2.5 + Math.max(0, far - 14) * (0.04 + rand() * 0.14);
    m.makeScale(w, h, d).setPosition(x, h / 2, z);
    seeds[matrices.length] = rand();
    matrices.push(m.clone());
  }
  const cityGeo = new BoxGeometry(1, 1, 1);
  cityGeo.setAttribute("aSeed", new InstancedBufferAttribute(seeds.slice(0, matrices.length), 1));
  const cityMat = new ShaderMaterial({
    vertexShader: CITY_VERT,
    fragmentShader: CITY_FRAG,
    uniforms: {
      uBase: { value: palette.ink.clone().lerp(palette.inkRaised, 0.8) },
      uTop: { value: palette.inkSurface.clone() },
      uLit: { value: palette.accentLight.clone() },
      uFog: { value: palette.ink.clone() },
      uTime: { value: 0 },
      uFogRange: { value: [26, 78] },
    },
  });
  const blocks = new InstancedMesh(cityGeo, cityMat, matrices.length);
  matrices.forEach((mat, i) => blocks.setMatrixAt(i, mat));
  blocks.frustumCulled = false;
  city.add(blocks);
  group.add(city);

  // Bụi sáng trôi lơ lửng
  const moteCount = mobile ? 240 : 760;
  const moteGeo = new BufferGeometry();
  const moteSeeds = new Float32Array(moteCount * 4);
  const mr = rng(777);
  for (let i = 0; i < moteSeeds.length; i++) moteSeeds[i] = mr();
  moteGeo.setAttribute("position", new BufferAttribute(new Float32Array(moteCount * 3), 3));
  moteGeo.setAttribute("aSeed", new BufferAttribute(moteSeeds, 4));
  const moteMat = new ShaderMaterial({
    vertexShader: MOTE_VERT,
    fragmentShader: MOTE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uFocus: { value: [0, 0, 0, 16] },
      uBox: { value: [14, 6.5, 10] },
      uColor: { value: palette.paper.clone() },
      uAccent: { value: palette.accentLight.clone() },
    },
  });
  const motes = new Points(moteGeo, moteMat);
  motes.frustumCulled = false;
  group.add(motes);

  // Xung chạy quanh nét mặt bằng từng phòng (một mesh cho cả 7 phòng)
  const pos: number[] = [];
  const aU: number[] = [];
  const aRoom: number[] = [];
  const aLen: number[] = [];
  const aSide: number[] = [];
  const index: number[] = [];
  const W = 0.07;
  const Y = 0.045;
  rooms.forEach((r, ri) => {
    const inset = 0.12;
    const x0 = r.x - r.w / 2 + inset, x1 = r.x + r.w / 2 - inset, z0 = r.z - r.d / 2 + inset, z1 = r.z + r.d / 2 - inset;
    const corners: [number, number][] = [[x0, z0], [x1, z0], [x1, z1], [x0, z1], [x0, z0]];
    const total = 2 * ((x1 - x0) + (z1 - z0));
    let run = 0;
    for (let e = 0; e < 4; e++) {
      const [ax, az] = corners[e];
      const [bx, bz] = corners[e + 1];
      const len = Math.hypot(bx - ax, bz - az);
      const nx = -(bz - az) / len, nz = (bx - ax) / len;
      const base = pos.length / 3;
      for (const [px, pz, u, side] of [
        [ax, az, run, -1],
        [bx, bz, run + len, -1],
        [bx, bz, run + len, 1],
        [ax, az, run, 1],
      ] as const) {
        pos.push(px + nx * W * side, Y, pz + nz * W * side);
        aU.push(u / total);
        aRoom.push(ri);
        aLen.push(total);
        aSide.push(side);
      }
      index.push(base, base + 1, base + 2, base, base + 2, base + 3);
      run += len;
    }
  });
  const pulseGeo = new BufferGeometry();
  pulseGeo.setAttribute("position", new Float32BufferAttribute(pos, 3));
  pulseGeo.setAttribute("aU", new Float32BufferAttribute(aU, 1));
  pulseGeo.setAttribute("aRoom", new Float32BufferAttribute(aRoom, 1));
  pulseGeo.setAttribute("aLen", new Float32BufferAttribute(aLen, 1));
  pulseGeo.setAttribute("aSide", new Float32BufferAttribute(aSide, 1));
  pulseGeo.setIndex(index);
  const pulseMat = new ShaderMaterial({
    vertexShader: PULSE_VERT,
    fragmentShader: PULSE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
    uniforms: {
      uColor: { value: palette.accentLight.clone() },
      uHot: { value: palette.paper.clone() },
      uTime: { value: 0 },
      uActive: { value: -1 },
      uHover: { value: -1 },
    },
  });
  const pulses = new Mesh(pulseGeo, pulseMat);
  pulses.renderOrder = 4;
  pulses.frustumCulled = false;
  group.add(pulses);

  const roomIndex = (zone: ZoneId | "hub" | null) => (zone && zone !== "hub" ? rooms.findIndex((r) => r.zone === zone) : -1);

  return {
    group,
    city,
    setZone(zone) {
      pulseMat.uniforms.uActive.value = roomIndex(zone);
      const c = zone === "hub" ? { x: 0, z: 0, r: 16 } : { x: roomByZone[zone].x, z: roomByZone[zone].z, r: 9 };
      moteMat.uniforms.uFocus.value = [c.x, 0, c.z, c.r];
    },
    setHover(zone) {
      pulseMat.uniforms.uHover.value = roomIndex(zone);
    },
    update(time) {
      cityMat.uniforms.uTime.value = time;
      moteMat.uniforms.uTime.value = time;
      pulseMat.uniforms.uTime.value = time;
    },
    dispose() {
      disposeGroup(group);
    },
  };
}
