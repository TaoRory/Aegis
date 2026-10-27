/**
 * Sinh mạch điện (PCB) trang trí cho màn mở đầu: đường mạch chỉ đi ngang, dọc hoặc chéo 45°, đầu mạch có chân hàn, thỉnh thoảng có via,
 * bus song song và chip có chân. Dùng bộ sinh số giả ngẫu nhiên cố định nên mỗi lần vẽ ra cùng một bản mạch. Không chữ, không số liệu.
 */

export type Circuit = {
  traces: string;
  buses: string;
  pads: { x: number; y: number }[];
  vias: { x: number; y: number }[];
  chips: { x: number; y: number; w: number; h: number; pins: string }[];
  /** Xung sáng chạy dọc một đoạn thẳng của mạch: điểm đầu và vector dịch chuyển */
  pulses: { x: number; y: number; dx: number; dy: number; dur: number; delay: number }[];
};

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 8 hướng đi: phải, chéo xuống phải, xuống, ... (theo chiều kim đồng hồ)
const DIRS: [number, number][] = [
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
];

export function buildCircuit(vw: number, vh: number): Circuit {
  // Điện thoại: chữ nhỏ nên mạch mịn hơn (bước lưới nửa), để vẫn thấy nhiều chi tiết trong từng nét chữ
  const PITCH = vw < 640 ? 12 : 24;
  const u = PITCH / 24;
  const rand = rng(20261027);
  const cols = Math.floor(vw / PITCH);
  const rows = Math.floor(vh / PITCH);
  const inside = (c: number, r: number) => c >= 0 && c <= cols && r >= 0 && r <= rows;
  const pick = (n: number) => Math.floor(rand() * n);

  const traces: string[] = [];
  const pads: Circuit["pads"] = [];
  const vias: Circuit["vias"] = [];
  const pulses: Circuit["pulses"] = [];
  const count = Math.round((cols * rows) / 5.5);

  for (let i = 0; i < count; i++) {
    let c = pick(cols + 1);
    let r = pick(rows + 1);
    let dir = pick(8);
    const pts: [number, number][] = [[c, r]];
    const segs = 2 + pick(3);
    for (let s = 0; s < segs; s++) {
      const len = 2 + pick(5);
      let moved = 0;
      for (let k = 0; k < len; k++) {
        const nc = c + DIRS[dir][0];
        const nr = r + DIRS[dir][1];
        if (!inside(nc, nr)) break;
        c = nc;
        r = nr;
        moved++;
      }
      if (moved === 0) break;
      pts.push([c, r]);
      dir = (dir + (rand() < 0.5 ? 1 : 7)) % 8; // chỉ rẽ 45°
    }
    if (pts.length < 2) continue;
    const d = pts.map(([pc, pr], k) => `${k ? "L" : "M"}${pc * PITCH} ${pr * PITCH}`).join(" ");
    traces.push(d);
    const first = pts[0];
    const last = pts[pts.length - 1];
    pads.push({ x: first[0] * PITCH, y: first[1] * PITCH });
    if (rand() < 0.55) pads.push({ x: last[0] * PITCH, y: last[1] * PITCH });
    else vias.push({ x: last[0] * PITCH, y: last[1] * PITCH });
    if (pulses.length < 46 && rand() < 0.2) {
      const [x0, y0] = pts[0];
      const [x1, y1] = pts[1];
      pulses.push({ x: x0 * PITCH, y: y0 * PITCH, dx: (x1 - x0) * PITCH, dy: (y1 - y0) * PITCH, dur: 1.6 + rand() * 2.4, delay: -rand() * 4 });
    }
  }

  // Bus: bốn đường song song, ngang hoặc dọc
  const buses: string[] = [];
  const busCount = Math.max(3, Math.round((cols * rows) / 160));
  for (let i = 0; i < busCount; i++) {
    const horizontal = rand() < 0.5;
    const reach = horizontal ? cols : rows;
    const len = Math.min(6 + pick(8), reach - 2);
    if (len < 3) continue;
    const c0 = horizontal ? pick(cols - len) : 1 + pick(Math.max(1, cols - 2));
    const r0 = horizontal ? 1 + pick(Math.max(1, rows - 2)) : pick(rows - len);
    const lines = 4;
    for (let k = 0; k < lines; k++) {
      const off = (k * 7 - 10) * u;
      if (horizontal) {
        const y = r0 * PITCH + off;
        buses.push(`M${c0 * PITCH} ${y} H${(c0 + len) * PITCH}`);
      } else {
        const x = c0 * PITCH + off;
        buses.push(`M${x} ${r0 * PITCH} V${(r0 + len) * PITCH}`);
      }
    }
  }

  // Chip có chân, đặt rải rác (tránh sát mép)
  const chips: Circuit["chips"] = [];
  const chipCount = Math.max(3, Math.round((cols * rows) / 140));
  for (let i = 0; i < chipCount; i++) {
    const w = (2 + pick(3)) * PITCH;
    const h = (2 + pick(2)) * PITCH;
    const x = (1 + pick(Math.max(1, cols - 6))) * PITCH;
    const y = (1 + pick(Math.max(1, rows - 6))) * PITCH;
    const pins: string[] = [];
    for (let px = x + PITCH / 2; px < x + w; px += PITCH / 2) pins.push(`M${px} ${y} v${-7 * u} M${px} ${y + h} v${7 * u}`);
    for (let py = y + PITCH / 2; py < y + h; py += PITCH / 2) pins.push(`M${x} ${py} h${-7 * u} M${x + w} ${py} h${7 * u}`);
    chips.push({ x, y, w, h, pins: pins.join(" ") });
  }

  return { traces: traces.join(" "), buses: buses.join(" "), pads, vias, chips, pulses };
}

/** Một vòng tròn bán kính r quanh (x, y) dưới dạng đường dẫn (gộp nhiều vòng vào một <path> cho nhẹ DOM) */
export function circlePath(points: { x: number; y: number }[], r: number): string {
  return points.map(({ x, y }) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`).join("");
}
