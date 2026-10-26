import {
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  CylinderGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Points,
  PointsMaterial,
  ShaderMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from "three";

import { mergeAll } from "@/components/space/engine/builders/merge";
import { LAB, labZ } from "@/components/space/engine/layout";
import type { BuildContext, ZoneBuild } from "@/components/space/engine/types";
import { disposeGroup } from "@/components/space/engine/types";

const GLASS_VERT = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;

/** Kính: viền sáng theo Fresnel, thân gần như trong suốt */
const GLASS_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uGlow;
varying vec3 vN;
varying vec3 vV;
void main() {
  float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.4);
  float a = 0.05 + f * (0.55 + uGlow * 0.4);
  gl_FragColor = vec4(uColor * (0.6 + f), a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const BUBBLE_VERT = /* glsl */ `
attribute vec4 aSeed;
attribute float aCap;
uniform float uTime;
uniform float uPixelRatio;
uniform float uGlow[4];
varying float vA;
void main() {
  float glow = uGlow[int(aCap + 0.5)];
  float a = aSeed.x * 6.2832 + uTime * (0.4 + aSeed.w);
  float r = (0.04 + 0.22 * aSeed.z) * (0.6 + 0.4 * sin(uTime * 0.7 + aSeed.y * 30.0));
  float t = fract(aSeed.y + uTime * (0.06 + aSeed.w * 0.1 + glow * 0.16));
  vec3 p = position + vec3(cos(a) * r, 0.08 + t * 0.92, sin(a) * r);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  vA = sin(t * 3.1416) * (0.45 + glow * 0.55);
  gl_PointSize = (1.4 + aSeed.w * 2.2) * uPixelRatio * (34.0 / max(-mv.z, 0.5));
}`;

const BUBBLE_FRAG = /* glsl */ `
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
 * Phòng thí nghiệm: bàn dài với bốn viên nang thủy tinh, mỗi viên chứa một "mẫu thử" tương ứng một thí nghiệm
 * (hạt, sương, vòng tách màu, dải cong). Viên nang đang chọn sáng hơn và quay nhanh hơn.
 */
export function buildLab(ctx: BuildContext): ZoneBuild {
  const { palette, manifest } = ctx;
  const group = new Group();
  const pickables: Mesh[] = [];
  const anchors: Record<string, Vector3> = {};

  const bodyMat = new MeshStandardMaterial({ color: palette.inkSurface, roughness: 0.55, metalness: 0.45 });
  const bench = new Mesh(new BoxGeometry(1.15, 0.86, 4.1), bodyMat);
  bench.position.set(LAB.x, 0.43, LAB.z);
  const top = new Mesh(new BoxGeometry(1.25, 0.05, 4.2), new MeshBasicMaterial({ color: palette.accentLight, transparent: true, opacity: 0.35 }));
  top.position.set(LAB.x, 0.885, LAB.z);
  group.add(bench, top);

  interface Capsule {
    id: string;
    root: Group;
    glass: Mesh;
    inner: Group;
    spin: number;
    glow: number;
    target: number;
  }
  const capGeos: BufferGeometry[] = [];
  const capsules: Capsule[] = manifest.lab.map((item, i) => {
    const z = labZ(i);
    const root = new Group();
    root.position.set(LAB.x, 0.91, z);

    const glass = new Mesh(
      new CylinderGeometry(0.34, 0.34, 1.05, 32, 1, true),
      new ShaderMaterial({
        vertexShader: GLASS_VERT,
        fragmentShader: GLASS_FRAG,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: { uColor: { value: palette.accentLight.clone() }, uGlow: { value: 0 } },
      }),
    );
    glass.position.y = 0.55;
    glass.userData.pick = `lab:${item.id}`;
    capGeos.push(new CylinderGeometry(0.38, 0.4, 0.06, 32).translate(LAB.x, 0.91 + 0.03, z), new CylinderGeometry(0.38, 0.36, 0.06, 32).translate(LAB.x, 0.91 + 1.1, z));

    const inner = new Group();
    inner.position.y = 0.56;
    if (item.id === "nen-mong") {
      // đám hạt hình cầu
      const pts: number[] = [];
      for (let k = 0; k < 220; k++) {
        const u = Math.random() * 2 - 1;
        const a = Math.random() * Math.PI * 2;
        const r = 0.28 * Math.cbrt(Math.random());
        const s = Math.sqrt(1 - u * u);
        pts.push(s * Math.cos(a) * r, u * r, s * Math.sin(a) * r);
      }
      const g = new BufferGeometry();
      g.setAttribute("position", new Float32BufferAttribute(pts, 3));
      inner.add(new Points(g, new PointsMaterial({ color: palette.accentPale, size: 0.03, transparent: true, opacity: 0.9, depthWrite: false, blending: AdditiveBlending })));
    } else if (item.id === "suong-mu") {
      for (let k = 0; k < 3; k++) {
        const s = new Mesh(
          new SphereGeometry(0.1 + k * 0.035, 20, 14),
          new MeshBasicMaterial({ color: palette.accentLight, transparent: true, opacity: 0.22, blending: AdditiveBlending, depthWrite: false }),
        );
        s.position.set((k - 1) * 0.1, (k - 1) * 0.12, (k % 2) * 0.06);
        inner.add(s);
      }
    } else if (item.id === "tach-mau") {
      [palette.danger, palette.accentLight, palette.paper].forEach((c, k) => {
        const ring = new Mesh(
          new TorusGeometry(0.17, 0.014, 10, 40),
          new MeshBasicMaterial({ color: c, transparent: true, opacity: 0.85, blending: AdditiveBlending, depthWrite: false }),
        );
        ring.userData.offset = (k - 1) * 0.035;
        inner.add(ring);
      });
    } else {
      for (let k = 0; k < 5; k++) {
        const card = new Mesh(
          new PlaneGeometry(0.1, 0.2),
          new MeshBasicMaterial({ color: palette.accentPale, transparent: true, opacity: 0.8, side: DoubleSide, blending: AdditiveBlending, depthWrite: false }),
        );
        card.userData.k = k;
        inner.add(card);
      }
    }

    root.add(glass, inner);
    group.add(root);
    pickables.push(glass);
    anchors[`lab:${item.id}`] = new Vector3(LAB.x, 2.25, z);
    return { id: item.id, root, glass, inner, spin: 0, glow: 0, target: 0 };
  });

  group.add(new Mesh(mergeAll(capGeos), bodyMat));

  // Bong bóng nổi trong các viên nang (một Points cho cả bốn) và vòng quét chạy dọc viên nang đang chọn
  const bubblesPer = ctx.mobile ? 22 : 40;
  const bubbleCount = capsules.length * bubblesPer;
  const bPos = new Float32Array(bubbleCount * 3);
  const bSeed = new Float32Array(bubbleCount * 4);
  const bCap = new Float32Array(bubbleCount);
  for (let i = 0; i < bubbleCount; i++) {
    const c = Math.floor(i / bubblesPer);
    bPos.set([LAB.x, 0.91 + 0.06, labZ(c)], i * 3);
    for (let k = 0; k < 4; k++) bSeed[i * 4 + k] = Math.random();
    bCap[i] = c;
  }
  const bubbleGeo = new BufferGeometry();
  bubbleGeo.setAttribute("position", new Float32BufferAttribute(bPos, 3));
  bubbleGeo.setAttribute("aSeed", new Float32BufferAttribute(bSeed, 4));
  bubbleGeo.setAttribute("aCap", new Float32BufferAttribute(bCap, 1));
  const bubbleMat = new ShaderMaterial({
    vertexShader: BUBBLE_VERT,
    fragmentShader: BUBBLE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, ctx.mobile ? 1.25 : 1.75) },
      uGlow: { value: [0, 0, 0, 0] },
      uColor: { value: palette.accentPale.clone() },
    },
  });
  const bubbles = new Points(bubbleGeo, bubbleMat);
  bubbles.frustumCulled = false;
  const scanner = new Mesh(
    new TorusGeometry(0.37, 0.009, 8, 56).rotateX(Math.PI / 2),
    new MeshBasicMaterial({ color: palette.paper, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false }),
  );
  scanner.visible = false;
  group.add(bubbles, scanner);

  let active = false;
  let focus: string | null = null;
  let hover: string | null = null;
  const recompute = () => {
    for (const c of capsules) c.target = focus === c.id ? 1 : hover === `lab:${c.id}` ? 0.6 : active && !focus ? 0.25 : 0;
  };

  return {
    group,
    anchors,
    pickables,
    setState(a, f) {
      active = a;
      focus = f;
      recompute();
    },
    setHover(id) {
      hover = id;
      recompute();
    },
    update(time, dt) {
      const k = 1 - Math.exp(-dt * 6);
      bubbleMat.uniforms.uTime.value = time;
      bubbleMat.uniforms.uGlow.value = capsules.map((c) => c.glow);
      // Vòng quét bám theo viên nang sáng nhất
      const lead = capsules.reduce((a, c) => (c.glow > a.glow ? c : a), capsules[0]);
      const scanOpacity = Math.min(0.9, lead.glow * 1.2);
      (scanner.material as MeshBasicMaterial).opacity = scanOpacity;
      scanner.visible = scanOpacity > 0.03;
      if (scanner.visible) scanner.position.set(LAB.x, 0.91 + 0.12 + (0.5 + 0.5 * Math.sin(time * 1.6)) * 0.95, lead.root.position.z);
      capsules.forEach((c, i) => {
        c.glow += (c.target - c.glow) * k;
        c.spin += dt * (0.4 + c.glow * 1.6);
        (c.glass.material as ShaderMaterial).uniforms.uGlow.value = c.glow;
        c.inner.rotation.y = c.spin;
        c.inner.position.y = 0.56 + Math.sin(time * 1.1 + i) * 0.03;
        for (const child of c.inner.children) {
          if (child.userData.offset !== undefined) {
            child.position.x = child.userData.offset * (1 + Math.sin(time * 1.4) * 0.6) * (1 + c.glow * 1.5);
            child.rotation.x = Math.PI / 2 + Math.sin(time * 0.8 + i) * 0.5;
          }
          if (child.userData.k !== undefined) {
            const kk = child.userData.k as number;
            child.position.set((kk - 2) * 0.09, Math.sin(kk * 0.9 + time * 1.2) * 0.05 + Math.abs(kk - 2) * -0.025, 0);
            child.rotation.z = (kk - 2) * 0.22 + Math.sin(time + kk) * 0.1;
          }
        }
      });
    },
    dispose() {
      disposeGroup(group);
    },
  };
}
