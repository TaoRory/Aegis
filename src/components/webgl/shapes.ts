/**
 * Hình đích cho particle engine, tạo bằng thủ tục (không cần asset).
 * Mỗi hình trả về Float32Array(count * 3) trong hệ tọa độ thế giới ~[-1, 1], trục y hướng lên.
 * Thứ tự: 0 nền móng (hero) · 1 AI · 2 phần mềm · 3 web · 4 marketing.
 */

type Vec3 = [number, number, number];
type Segment = [Vec3, Vec3];

/** Góc nhìn cơ sở của engine (shader xoay theo Y rồi X). Dùng để "dựng đứng" các hình phẳng. */
export const BASE_ROTATION = { y: -0.72, x: 0.5 };

function random(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

class ShapeBuilder {
  private points: number[] = [];
  constructor(
    private readonly count: number,
    private readonly rand: () => number,
  ) {}

  /** Rải `n` điểm dọc các đoạn thẳng, tỉ lệ theo độ dài */
  segments(segments: Segment[], n: number, jitter = 0.004) {
    const lengths = segments.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]));
    const total = lengths.reduce((s, l) => s + l, 0) || 1;
    segments.forEach(([a, b], i) => {
      const k = Math.max(1, Math.round((lengths[i] / total) * n));
      for (let j = 0; j < k; j++) {
        const t = this.rand();
        this.push(
          a[0] + (b[0] - a[0]) * t + (this.rand() - 0.5) * jitter,
          a[1] + (b[1] - a[1]) * t + (this.rand() - 0.5) * jitter,
          a[2] + (b[2] - a[2]) * t + (this.rand() - 0.5) * jitter,
        );
      }
    });
  }

  /** Lưới điểm trên mặt phẳng ngang (y cố định) */
  gridXZ(cx: number, y: number, cz: number, halfX: number, halfZ: number, n: number, step: number) {
    const cols = Math.max(2, Math.round((halfX * 2) / step));
    const rows = Math.max(2, Math.round((halfZ * 2) / step));
    for (let i = 0; i < n; i++) {
      const c = Math.floor(this.rand() * (cols + 1));
      const r = Math.floor(this.rand() * (rows + 1));
      this.push(cx - halfX + (c / cols) * halfX * 2, y, cz - halfZ + (r / rows) * halfZ * 2);
    }
  }

  /** Cụm điểm hình cầu (nút mạng) */
  cluster(center: Vec3, radius: number, n: number) {
    for (let i = 0; i < n; i++) {
      const u = this.rand() * 2 - 1;
      const phi = this.rand() * Math.PI * 2;
      const r = radius * Math.cbrt(this.rand());
      const s = Math.sqrt(1 - u * u);
      this.push(center[0] + r * s * Math.cos(phi), center[1] + r * u, center[2] + r * s * Math.sin(phi));
    }
  }

  /** Đường tròn trên mặt phẳng ngang */
  ring(center: Vec3, radius: number, n: number, jitter = 0.006) {
    for (let i = 0; i < n; i++) {
      const a = this.rand() * Math.PI * 2;
      this.push(
        center[0] + Math.cos(a) * radius + (this.rand() - 0.5) * jitter,
        center[1] + (this.rand() - 0.5) * jitter,
        center[2] + Math.sin(a) * radius + (this.rand() - 0.5) * jitter,
      );
    }
  }

  push(x: number, y: number, z: number) {
    this.points.push(x, y, z);
  }

  /** Cắt/bù cho đúng `count` điểm rồi xáo trộn (để morph trộn đều giữa các phần) */
  build() {
    const out = new Float32Array(this.count * 3);
    const available = this.points.length / 3;
    // Xáo trộn toàn bộ điểm đã sinh, lấy `count` điểm đầu; nếu thiếu thì lặp lại kèm nhiễu nhỏ
    const order = Array.from({ length: available }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(this.rand() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    for (let i = 0; i < this.count; i++) {
      const src = order[i % available] * 3;
      const jitter = i >= available ? 0.012 : 0;
      out[i * 3] = this.points[src] + (this.rand() - 0.5) * jitter;
      out[i * 3 + 1] = this.points[src + 1] + (this.rand() - 0.5) * jitter;
      out[i * 3 + 2] = this.points[src + 2] + (this.rand() - 0.5) * jitter;
    }
    return out;
  }
}

function boxEdges(cx: number, cy: number, cz: number, hx: number, hy: number, hz: number): Segment[] {
  const x0 = cx - hx, x1 = cx + hx, y0 = cy - hy, y1 = cy + hy, z0 = cz - hz, z1 = cz + hz;
  const v: Vec3[] = [
    [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1],
    [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1],
  ];
  const e: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  return e.map(([a, b]) => [v[a], v[b]]);
}

/** Xoay ngược góc nhìn cơ sở để một hình phẳng (mặt XY) hướng thẳng về người xem */
function faceCamera(points: Float32Array) {
  const cy = Math.cos(-BASE_ROTATION.y), sy = Math.sin(-BASE_ROTATION.y);
  const cx = Math.cos(-BASE_ROTATION.x), sx = Math.sin(-BASE_ROTATION.x);
  for (let i = 0; i < points.length; i += 3) {
    const x = points[i], y = points[i + 1], z = points[i + 2];
    // Ngược thứ tự của shader: shader áp Ry rồi Rx → ở đây áp Rx⁻¹ rồi Ry⁻¹
    const y1 = y * cx - z * sx;
    const z1 = y * sx + z * cx;
    points[i] = x * cy + z1 * sy;
    points[i + 1] = y1;
    points[i + 2] = -x * sy + z1 * cy;
  }
  return points;
}

/** 0 — Nền móng: bốn phiến xếp tầng thu nhỏ dần, có lưới mặt và lưới nền bản vẽ */
function foundation(count: number) {
  const rand = random(11);
  const b = new ShapeBuilder(count, rand);
  const slabs = [1, 0.78, 0.56, 0.34];
  slabs.forEach((half, i) => {
    const y = -0.5 + i * 0.24;
    b.segments(boxEdges(0, y, 0, half, 0.065, half), count * (0.13 - i * 0.012));
    b.gridXZ(0, y + 0.065, 0, half * 0.94, half * 0.94, count * (0.07 - i * 0.008), 0.09);
  });
  b.gridXZ(0, -0.78, 0, 1.45, 1.45, count * 0.12, 0.16);
  return b.build();
}

/** 1 — AI: mạng nơ-ron 4 lớp */
function neuralNetwork(count: number) {
  const rand = random(23);
  const b = new ShapeBuilder(count, rand);
  const layers = [4, 6, 6, 3];
  const nodes: Vec3[][] = layers.map((n, li) =>
    Array.from({ length: n }, (_, i) => [
      -1 + li * 0.66,
      (i - (n - 1) / 2) * 0.32,
      (rand() - 0.5) * 0.5,
    ] as Vec3),
  );
  nodes.flat().forEach((node) => b.cluster(node, 0.05, Math.round((count * 0.32) / 19)));
  const edges: Segment[] = [];
  for (let l = 0; l < nodes.length - 1; l++) {
    for (const a of nodes[l]) for (const c of nodes[l + 1]) edges.push([a, c]);
  }
  b.segments(edges, count * 0.68, 0.006);
  return faceCamera(b.build());
}

/** 2 — Phần mềm quản trị: lưới mô-đun 3×3 cao thấp khác nhau */
function modules(count: number) {
  const rand = random(37);
  const b = new ShapeBuilder(count, rand);
  const heights = [0.3, 0.62, 0.42, 0.5, 0.95, 0.34, 0.44, 0.58, 0.24];
  heights.forEach((h, i) => {
    const x = ((i % 3) - 1) * 0.62;
    const z = (Math.floor(i / 3) - 1) * 0.62;
    const y = -0.55 + h / 2;
    b.segments(boxEdges(x, y, z, 0.24, h / 2, 0.24), (count * 0.78) / 9);
    b.gridXZ(x, y + h / 2, z, 0.22, 0.22, (count * 0.22) / 9, 0.07);
  });
  return b.build();
}

/** 3 — Website & web app: khung trình duyệt dạng wireframe, các lớp nổi nhẹ */
function browser(count: number) {
  const rand = random(41);
  const b = new ShapeBuilder(count, rand);
  const rect = (x0: number, y0: number, x1: number, y1: number, z = 0): Segment[] => [
    [[x0, y0, z], [x1, y0, z]], [[x1, y0, z], [x1, y1, z]], [[x1, y1, z], [x0, y1, z]], [[x0, y1, z], [x0, y0, z]],
  ];
  b.segments([...rect(-1.05, -0.72, 1.05, 0.72), [[-1.05, 0.56, 0], [1.05, 0.56, 0]]], count * 0.3);
  [-0.96, -0.88, -0.8].forEach((x) => b.cluster([x, 0.64, 0], 0.02, Math.round(count * 0.012)));
  b.segments(rect(-0.92, 0.38, 0.92, 0.46, 0.08), count * 0.08);
  const image = rect(-0.92, -0.38, 0.12, 0.28, 0.16);
  b.segments([...image, [[-0.92, -0.38, 0.16], [0.12, 0.28, 0.16]], [[-0.92, 0.28, 0.16], [0.12, -0.38, 0.16]]], count * 0.24);
  [0.2, 0.08, -0.04, -0.16].forEach((y, i) => b.segments([[[0.26, y, 0.1], [0.92 - i * 0.12, y, 0.1]]], count * 0.04));
  b.segments(rect(0.26, -0.38, 0.62, -0.26, 0.2), count * 0.06);
  b.segments(rect(-0.92, -0.62, 0.92, -0.5, 0.05), count * 0.06);
  return faceCamera(b.build());
}

/** 4 — Marketing: sóng lan tỏa từ một tâm phát */
function broadcast(count: number) {
  const rand = random(53);
  const b = new ShapeBuilder(count, rand);
  [0.18, 0.36, 0.56, 0.78, 1.02, 1.28].forEach((r, i) => b.ring([0, -0.45, 0], r, count * (0.06 + i * 0.022)));
  b.segments([[[0, -0.45, 0], [0, 0.5, 0]]], count * 0.06);
  b.cluster([0, 0.55, 0], 0.06, Math.round(count * 0.04));
  for (let k = 1; k <= 3; k++) {
    const arc: Segment[] = [];
    const r = 0.16 * k;
    for (let s = 0; s < 18; s++) {
      const a0 = -0.9 + (s / 18) * 1.8, a1 = -0.9 + ((s + 1) / 18) * 1.8;
      arc.push([[Math.sin(a0) * r, 0.55 + Math.cos(a0) * r, 0], [Math.sin(a1) * r, 0.55 + Math.cos(a1) * r, 0]]);
    }
    b.segments(arc, count * 0.05);
  }
  return b.build();
}

export function createShapes(count: number) {
  return [foundation(count), neuralNetwork(count), modules(count), browser(count), broadcast(count)];
}
