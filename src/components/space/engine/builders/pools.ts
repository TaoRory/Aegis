import { AdditiveBlending, BufferAttribute, BufferGeometry, Mesh, ShaderMaterial, type Color } from "three";

const VERT = /* glsl */ `
attribute float aGlow;
attribute vec2 aUv;
varying float vGlow;
varying vec2 vUv;
void main() {
  vGlow = aGlow;
  vUv = aUv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const FRAG = /* glsl */ `
uniform vec3 uColor;
varying float vGlow;
varying vec2 vUv;
void main() {
  float r = length(vUv - 0.5) * 2.0;
  float a = smoothstep(1.0, 0.0, r);
  gl_FragColor = vec4(uColor, a * a * vGlow * 0.6);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export interface Pools {
  mesh: Mesh;
  /** Đặt độ sáng (0..1) của vệt sáng thứ i */
  set(i: number, value: number): void;
  dispose(): void;
}

export interface PoolSpec {
  x: number;
  z: number;
  w: number;
  d: number;
  /** Góc quay quanh trục y (rad), mặc định 0 */
  yaw?: number;
}

/** Các vệt sáng loang trên sàn (màn hình chiếu ánh sáng xuống sàn trước mặt): một mesh, độ sáng từng vệt qua thuộc tính đỉnh */
export function createPools(specs: PoolSpec[], color: Color, y = 0.04): Pools {
  const positions = new Float32Array(specs.length * 12);
  const uvs = new Float32Array(specs.length * 8);
  const glow = new Float32Array(specs.length * 4);
  const index: number[] = [];
  specs.forEach((s, i) => {
    const yaw = s.yaw ?? 0;
    const c = Math.cos(yaw);
    const sn = Math.sin(yaw);
    const corners = [
      [-s.w / 2, -s.d / 2, 0, 0],
      [s.w / 2, -s.d / 2, 1, 0],
      [s.w / 2, s.d / 2, 1, 1],
      [-s.w / 2, s.d / 2, 0, 1],
    ];
    corners.forEach(([lx, lz, u, v], k) => {
      positions.set([s.x + lx * c + lz * sn, y, s.z - lx * sn + lz * c], (i * 4 + k) * 3);
      uvs.set([u, v], (i * 4 + k) * 2);
    });
    index.push(i * 4, i * 4 + 2, i * 4 + 1, i * 4, i * 4 + 3, i * 4 + 2);
  });
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("aUv", new BufferAttribute(uvs, 2));
  const glowAttr = new BufferAttribute(glow, 1);
  geometry.setAttribute("aGlow", glowAttr);
  geometry.setIndex(index);
  const mesh = new Mesh(
    geometry,
    new ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, blending: AdditiveBlending, uniforms: { uColor: { value: color.clone() } } }),
  );
  mesh.renderOrder = 2;
  mesh.frustumCulled = false;
  return {
    mesh,
    set(i, value) {
      const v = Math.max(0, value);
      if (Math.abs(glow[i * 4] - v) < 0.002) return;
      glow.fill(v, i * 4, i * 4 + 4);
      glowAttr.needsUpdate = true;
    },
    dispose() {
      geometry.dispose();
      (mesh.material as ShaderMaterial).dispose();
    },
  };
}
