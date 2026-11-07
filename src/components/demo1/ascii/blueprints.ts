/**
 * "Bản vẽ" nét cho 4 mảng dịch vụ /demo1, vẽ thẳng trong hệ toạ độ ô của lưới ký tự:
 * mỗi nét dày đúng 1 ô và được bắt vào giữa ô, nên khi in bằng 0/1 hình vẫn rõ (không nhoè như đám điểm).
 * Độ sáng = vai trò: nét viền sáng nhất, mặt khối tối dần theo hướng, chi tiết phụ mờ.
 *
 * 0 AI (mạng nơ-ron có tín hiệu chạy qua) · 1 Phần mềm quản trị (các mô-đun khối nổi lên/hạ xuống)
 * 2 Website & web app (khung trình duyệt, nội dung cuộn + điện thoại) · 3 Marketing (sóng lan ra, người nhận sáng lên khi sóng tới)
 * t < 0: tư thế tĩnh đại diện (giảm chuyển động).
 */

type Pt = [number, number];

export interface Pen {
  /** Toạ độ chuẩn hoá (x sang phải, y lên trên; 1 đơn vị ≈ 46% bề ngang khung) → toạ độ ô */
  p: (x: number, y: number) => Pt;
  line: (points: Pt[], shade: number, close?: boolean) => void;
  fill: (points: Pt[], shade: number) => void;
  /** Hình elip theo bán kính chuẩn hoá (rx, ry); `ring` = chỉ nét */
  ellipse: (x: number, y: number, rx: number, ry: number, shade: number, ring?: boolean) => void;
  /** Xoá vùng (đặt vật phía trước lên vật phía sau) */
  erase: (points: Pt[]) => void;
  /** Vẽ trong vùng cắt (nội dung cuộn bên trong khung) */
  within: (points: Pt[], draw: () => void) => void;
  /** Nửa bề ngang / nửa chiều cao của khung theo đơn vị chuẩn hoá */
  half: Pt;
}

export type Blueprint = (pen: Pen, t: number) => void;

const gray = (shade: number) => {
  const v = Math.round(Math.min(1, Math.max(0, shade)) * 255);
  return `rgb(${v},${v},${v})`;
};

const fract = (x: number) => x - Math.floor(x);
const hash = (n: number) => fract(Math.sin(n * 91.345 + 12.17) * 43758.5453);

/** Tạo bút vẽ trên ngữ cảnh mẫu (đang ở hệ CSS px → ô); bút chuyển hẳn sang hệ ô để nét dày đúng 1 ô */
export function createPen(ctx: CanvasRenderingContext2D, W: number, H: number): Pen {
  const m = ctx.getTransform();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.lineWidth = 1;
  ctx.lineJoin = "miter";
  ctx.lineCap = "square";
  const unit = W * 0.46;
  const cx = W / 2;
  const cy = H / 2;
  const snap = (v: number) => Math.floor(v) + 0.5;
  const p = (x: number, y: number): Pt => [snap(m.a * (cx + x * unit) + m.e), snap(m.d * (cy - y * unit) + m.f)];
  const path = (points: Pt[]) => {
    ctx.beginPath();
    points.forEach(([x, y], i) => {
      const [px, py] = p(x, y);
      if (i) ctx.lineTo(px, py);
      else ctx.moveTo(px, py);
    });
  };
  return {
    p,
    half: [cx / unit, cy / unit],
    line(points, shade, close = false) {
      path(points);
      if (close) ctx.closePath();
      ctx.strokeStyle = gray(shade);
      ctx.stroke();
    },
    fill(points, shade) {
      path(points);
      ctx.closePath();
      ctx.fillStyle = gray(shade);
      ctx.fill();
    },
    ellipse(x, y, rx, ry, shade, ring = false) {
      const [px, py] = p(x, y);
      ctx.beginPath();
      ctx.ellipse(px, py, Math.max(0.5, rx * unit * m.a), Math.max(0.5, ry * unit * m.d), 0, 0, Math.PI * 2);
      if (ring) {
        ctx.strokeStyle = gray(shade);
        ctx.stroke();
      } else {
        ctx.fillStyle = gray(shade);
        ctx.fill();
      }
    },
    erase(points) {
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      path(points);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    },
    within(points, draw) {
      ctx.save();
      path(points);
      ctx.closePath();
      ctx.clip();
      draw();
      ctx.restore();
    },
  };
}

export const rect = (x0: number, y0: number, x1: number, y1: number): Pt[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];

/* ---------------- 0 · AI: mạng nơ-ron ---------------- */
const LAYERS = [3, 4, 4, 2];
const LAYER_X = [-0.78, -0.26, 0.26, 0.78];
const nodeY = (count: number, i: number) => (i - (count - 1) / 2) * 0.46;
const NODE_R = 0.1;
/** Chỉ nối các nút gần nhau giữa hai lớp kề (mạng có cấu trúc, không rối như nối tất cả) */
const EDGES = LAYERS.slice(0, -1).flatMap((count, l) =>
  Array.from({ length: count }, (_, a) => a).flatMap((a) =>
    Array.from({ length: LAYERS[l + 1] }, (_, b) => b)
      .filter((b) => Math.abs(nodeY(count, a) - nodeY(LAYERS[l + 1], b)) <= 0.5)
      .map((b) => ({ l, ax: LAYER_X[l], ay: nodeY(count, a), bx: LAYER_X[l + 1], by: nodeY(LAYERS[l + 1], b) })),
  ),
);

const ai: Blueprint = (pen, t) => {
  // Tín hiệu đi từ trái sang phải qua 3 khoảng giữa các lớp, lặp mỗi ~3 giây
  const wave = t < 0 ? 1.55 : fract(t / 3000) * 3.6 - 0.3;
  EDGES.forEach((e, i) => {
    // Nét nối bắt đầu / kết thúc ở mép vòng tròn nút
    const len = Math.hypot(e.bx - e.ax, e.by - e.ay);
    const ux = (e.bx - e.ax) / len;
    const uy = (e.by - e.ay) / len;
    const a: Pt = [e.ax + ux * NODE_R, e.ay + uy * NODE_R];
    const b: Pt = [e.bx - ux * NODE_R, e.by - uy * NODE_R];
    const local = wave - e.l;
    const on = local > 0 && local < 1 && hash(i) < 0.7;
    pen.line([a, b], on ? 0.5 : 0.3);
    if (on) {
      const k0 = Math.max(0, local - 0.22);
      pen.line(
        [
          [a[0] + (b[0] - a[0]) * k0, a[1] + (b[1] - a[1]) * k0],
          [a[0] + (b[0] - a[0]) * local, a[1] + (b[1] - a[1]) * local],
        ],
        1,
      );
    }
  });
  LAYERS.forEach((count, l) => {
    // Lớp vừa nhận tín hiệu: lõi sáng đầy
    const lit = Math.max(0, 1 - Math.abs(wave - l) * 2.2);
    for (let i = 0; i < count; i++) {
      const x = LAYER_X[l];
      const y = nodeY(count, i);
      pen.ellipse(x, y, NODE_R, NODE_R, 0.9, true);
      pen.ellipse(x, y, 0.035 + lit * 0.04, 0.035 + lit * 0.04, 0.45 + lit * 0.55);
    }
  });
};

/* ---------------- 1 · Phần mềm quản trị: mô-đun khối isometric ---------------- */
/** Chiếu isometric (x sang phải-xuống, z sang trái-xuống, y lên), thu nhỏ để vừa khung */
const iso = (x: number, y: number, z: number): [number, number] => [(x - z) * 0.866 * 0.9, (y - (x + z) * 0.5) * 0.9 + 0.02];
/** 4 mô-đun (bán hàng, kho, nhân sự, tài chính… — không ghi chữ), lần lượt từng khối nhấc lên rồi lắp lại vào chỗ */
const CELLS = [
  { i: 0, x: -0.31, z: -0.31, h: 0.5 },
  { i: 1, x: 0.31, z: -0.31, h: 0.34 },
  { i: 2, x: -0.31, z: 0.31, h: 0.38 },
  { i: 3, x: 0.31, z: 0.31, h: 0.26 },
];
const LIFT_ORDER = [3, 1, 2, 0];

const software: Blueprint = (pen, t) => {
  const ground = -0.36;
  const hw = 0.22;
  // Nền: hình thoi mờ
  const g = 0.62;
  pen.line([iso(-g, ground, -g), iso(g, ground, -g), iso(g, ground, g), iso(-g, ground, g)], 0.3, true);
  const cycle = t < 0 ? 0.5 : fract(t / 2200);
  const active = t < 0 ? 3 : LIFT_ORDER[Math.floor(t / 2200) % 4];
  const lift = Math.sin(Math.PI * Math.min(1, cycle / 0.8)) * 0.3;
  // Vẽ từ sau ra trước; mỗi khối xoá phần phía sau nó rồi chỉ vẽ nét: mặt trái để trống (tối), mặt phải gạch ngang, mặt trên tô mờ
  for (const cell of CELLS) {
    const { x, z } = cell;
    const up = cell.i === active ? lift : 0;
    if (up > 0.01) {
      // Ô trống trên nền nơi mô-đun được nhấc ra
      pen.line([iso(x - hw, ground, z - hw), iso(x + hw, ground, z - hw), iso(x + hw, ground, z + hw), iso(x - hw, ground, z + hw)], 0.55, true);
    }
    const y0 = ground + up;
    const y1 = y0 + cell.h;
    const left = [iso(x - hw, y0, z + hw), iso(x + hw, y0, z + hw), iso(x + hw, y1, z + hw), iso(x - hw, y1, z + hw)];
    const right = [iso(x + hw, y0, z + hw), iso(x + hw, y0, z - hw), iso(x + hw, y1, z - hw), iso(x + hw, y1, z + hw)];
    const top = [iso(x - hw, y1, z - hw), iso(x + hw, y1, z - hw), iso(x + hw, y1, z + hw), iso(x - hw, y1, z + hw)];
    pen.erase(left);
    pen.erase(right);
    pen.erase(top);
    for (let y = y0 + 0.09; y < y1 - 0.04; y += 0.09) pen.line([iso(x + hw, y, z + hw), iso(x + hw, y, z - hw)], 0.32);
    pen.fill(top, up > 0.01 ? 0.8 : 0.2);
    pen.line(left, 0.9, true);
    pen.line(right, 0.9, true);
    pen.line(top, 1, true);
  }
};

/* ---------------- 2 · Website & web app: khung trình duyệt + điện thoại ---------------- */
const PAGE_H = 1.5;

/** Một "trang" mẫu (cao PAGE_H), vẽ từ đỉnh `top` xuống */
function page(pen: Pen, top: number) {
  // Thanh điều hướng
  pen.fill(rect(-0.86, top - 0.06, -0.62, top - 0.12), 0.7);
  [0.28, 0.46, 0.64].forEach((x) => pen.line([[x, top - 0.09], [x + 0.12, top - 0.09]], 0.45));
  // Hero: tiêu đề hai dòng, đoạn văn, nút; ảnh bên phải (khung gạch chéo)
  pen.fill(rect(-0.86, top - 0.26, 0.1, top - 0.34), 0.95);
  pen.fill(rect(-0.86, top - 0.4, -0.12, top - 0.48), 0.95);
  pen.line([[-0.86, top - 0.58], [0.04, top - 0.58]], 0.4);
  pen.line([[-0.86, top - 0.64], [-0.1, top - 0.64]], 0.4);
  pen.fill(rect(-0.86, top - 0.74, -0.46, top - 0.84), 0.85);
  const img = rect(0.22, top - 0.24, 0.86, top - 0.84);
  pen.fill(img, 0.2);
  pen.line(img, 0.7, true);
  pen.line([[0.22, top - 0.24], [0.86, top - 0.84]], 0.45);
  pen.line([[0.22, top - 0.84], [0.86, top - 0.24]], 0.45);
  // Hàng thẻ
  [-0.86, -0.27, 0.32].forEach((x) => {
    const card = rect(x, top - 0.98, x + 0.54, top - 1.38);
    pen.line(card, 0.62, true);
    pen.fill(rect(x + 0.06, top - 1.04, x + 0.48, top - 1.2), 0.3);
    pen.line([[x + 0.06, top - 1.28], [x + 0.36, top - 1.28]], 0.4);
  });
}

/** Bản hẹp của trang (điện thoại), cao MINI_H */
const MINI_H = 0.9;
function miniPage(pen: Pen, top: number) {
  pen.fill(rect(0.46, top - 0.06, 0.8, top - 0.13), 0.95);
  pen.fill(rect(0.46, top - 0.17, 0.7, top - 0.24), 0.95);
  pen.line([[0.46, top - 0.32], [0.78, top - 0.32]], 0.4);
  pen.line([[0.46, top - 0.38], [0.72, top - 0.38]], 0.4);
  pen.fill(rect(0.46, top - 0.46, 0.62, top - 0.52), 0.85);
  const img = rect(0.46, top - 0.6, 0.8, top - 0.84);
  pen.fill(img, 0.2);
  pen.line(img, 0.7, true);
}

const web: Blueprint = (pen, t) => {
  const left = -0.95;
  const right = 0.95;
  const top = 0.92;
  const bar = 0.76;
  const bottom = -0.66;
  // Nội dung cuộn trong khung (lặp liền mạch)
  const s = t < 0 ? 0.08 : fract(t / 14000);
  pen.within(rect(left, bar, right, bottom), () => {
    for (let k = 0; k < 2; k++) page(pen, bar - 0.02 + s * PAGE_H - k * PAGE_H);
  });
  pen.line(rect(left, top, right, bottom), 1, true);
  pen.line([[left, bar], [right, bar]], 0.85);
  [-0.88, -0.81, -0.74].forEach((x) => pen.ellipse(x, (top + bar) / 2, 0.018, 0.018, 0.8));
  pen.fill(rect(-0.5, top - 0.045, 0.5, bar + 0.045), 0.28);
  // Thanh cuộn
  const thumb = bar - 0.04 - s * (bar - bottom - 0.32);
  pen.fill(rect(right - 0.06, thumb, right - 0.03, thumb - 0.24), 0.6);
  // Điện thoại phía trước: cùng trang, bản hẹp, cuộn cùng nhịp
  const phone = rect(0.38, -0.1, 0.88, -1.14);
  pen.erase(rect(0.34, -0.05, 0.92, -1.19));
  pen.within(rect(0.4, -0.2, 0.86, -1.04), () => {
    for (let k = 0; k < 3; k++) miniPage(pen, -0.2 + s * MINI_H * 2 - k * MINI_H);
  });
  pen.line(phone, 1, true);
  pen.line([[0.57, -0.15], [0.69, -0.15]], 0.6);
  pen.line([[0.57, -1.09], [0.69, -1.09]], 0.6);
};

/* ---------------- 3 · Marketing: sóng lan toả tới người nhận ---------------- */
const AUDIENCE = Array.from({ length: 18 }, (_, i) => {
  const a = hash(i + 3) * Math.PI * 2;
  const d = 0.3 + hash(i + 40) * 0.64;
  return { x: Math.cos(a) * d, z: Math.sin(a) * d, d };
});

const marketing: Blueprint = (pen, t) => {
  const gy = -0.42; // mặt đất
  const squash = 0.42; // phối cảnh: vòng tròn trên mặt đất thành elip dẹt
  const phase = t < 0 ? 0.35 : t / 4200;
  const rings = [0, 1, 2, 3].map((k) => fract(phase + k / 4) * 1.02);
  rings.forEach((r) => {
    const fade = 1 - r / 1.02;
    if (r > 0.04) pen.ellipse(0, gy, r, r * squash, 0.22 + fade * 0.7, true);
  });
  // Người nhận: sáng lên khi sóng vừa đi qua
  for (const p of AUDIENCE) {
    const hit = Math.max(...rings.map((r) => Math.max(0, 1 - Math.abs(r - p.d) / 0.09)));
    const y = gy + p.z * squash;
    pen.line([[p.x, y], [p.x, y + 0.05 + hit * 0.06]], 0.35 + hit * 0.5);
    pen.ellipse(p.x, y + 0.08 + hit * 0.06, 0.03 + hit * 0.015, 0.03 + hit * 0.015, 0.42 + hit * 0.58);
  }
  // Cột phát + đỉnh phát và các cung sóng phía trên
  pen.line([[0, gy], [0, 0.38]], 0.85);
  pen.line([[-0.12, gy], [0, 0.1], [0.12, gy]], 0.55);
  pen.ellipse(0, 0.44, 0.065, 0.065, 1);
  const pulse = t < 0 ? 0.5 : fract(t / 1400);
  [0.16, 0.26, 0.36].forEach((r, i) => {
    const lit = Math.max(0, 1 - Math.abs(pulse * 3 - i) * 1.2);
    pen.line(arc(0, 0.44, r, -0.75, 0.75), 0.35 + lit * 0.6);
    pen.line(arc(0, 0.44, r, Math.PI - 0.75, Math.PI + 0.75), 0.35 + lit * 0.6);
  });
};

function arc(cx: number, cy: number, r: number, a0: number, a1: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= 12; i++) {
    const a = a0 + ((a1 - a0) * i) / 12;
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return out;
}

export const BLUEPRINTS: Blueprint[] = [ai, software, web, marketing];
