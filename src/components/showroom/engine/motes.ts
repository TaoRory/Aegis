import { AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, Points, PointsMaterial, SRGBColorSpace, type Color } from "three";

/**
 * Hạt sáng lơ lửng trong phòng (bụi sáng aqua trôi lên chậm, đung đưa nhẹ): một lệnh vẽ, cho căn phòng có không khí và sinh động.
 * Giảm chuyển động: đứng yên. Không bắt chuột (không nằm trong danh sách vật thể bấm được).
 */
export interface Motes {
  points: Points;
  update(seconds: number): void;
  dispose(): void;
}

export function buildMotes(color: Color, count: number, box: { x: [number, number]; y: [number, number]; z: [number, number] }): Motes {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const g = canvas.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.5)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;

  const base = new Float32Array(count * 3);
  const seed = new Float32Array(count * 2);
  const pos = new Float32Array(count * 3);
  // số giả ngẫu nhiên cố định: cùng một cảnh mỗi lần mở
  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < count; i++) {
    base[i * 3] = box.x[0] + rnd() * (box.x[1] - box.x[0]);
    base[i * 3 + 1] = box.y[0] + rnd() * (box.y[1] - box.y[0]);
    base[i * 3 + 2] = box.z[0] + rnd() * (box.z[1] - box.z[0]);
    seed[i * 2] = rnd();
    seed[i * 2 + 1] = 0.4 + rnd();
  }
  pos.set(base);
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(pos, 3));
  const material = new PointsMaterial({ color, map, size: 0.075, sizeAttenuation: true, transparent: true, opacity: 0.85, depthWrite: false, blending: AdditiveBlending, toneMapped: false });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  const height = box.y[1] - box.y[0];

  return {
    points,
    update(t) {
      for (let i = 0; i < count; i++) {
        const a = seed[i * 2];
        const v = seed[i * 2 + 1];
        const rise = (((t * 0.035 * v + a) % 1) + 1) % 1;
        pos[i * 3] = base[i * 3] + Math.sin(t * 0.4 * v + a * 6.28) * 0.18;
        pos[i * 3 + 1] = box.y[0] + ((base[i * 3 + 1] - box.y[0]) / height + rise) % 1 * height;
        pos[i * 3 + 2] = base[i * 3 + 2] + Math.cos(t * 0.33 * v + a * 6.28) * 0.18;
      }
      geometry.attributes.position.needsUpdate = true;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      map.dispose();
    },
  };
}
