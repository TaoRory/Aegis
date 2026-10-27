/**
 * Chữ AEGIS khoét thành ô cửa (mặt nạ SVG) dùng chung cho màn mở đầu của Factory (SpaceIntro) và của trang chính (SiteIntro).
 */

export const WORD = "AEGIS";
export const REF = 400; // cỡ chữ tham chiếu để đo (px)

export interface Layout {
  vw: number;
  vh: number;
  fs: number;
  x: number;
  y: number;
  /** Điểm phóng to: khối đặc ở đỉnh chữ A, ngay trên lỗ tam giác (là ô cửa nên phóng vào sẽ thấy xưởng lớn dần) */
  ax: number;
  ay: number;
  /** Hệ số phóng to cuối cùng */
  zoom: number;
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/**
 * Đo chữ AEGIS (font thật của thương hiệu) và tìm khối đặc ở đỉnh chữ A bằng cách quét một cột điểm ảnh ở giữa chữ:
 * từ trên xuống là đỉnh chữ (đặc), lỗ tam giác (trống), thanh ngang (đặc), khe giữa hai chân (trống). Điểm phóng to là giữa đoạn đặc đầu tiên.
 */
export function measure(textEl: SVGTextElement, vw: number, vh: number): Layout {
  const style = getComputedStyle(textEl);
  const canvas = document.createElement("canvas");
  canvas.width = REF * 1.6;
  canvas.height = REF * 1.4;
  const g = canvas.getContext("2d", { willReadFrequently: true })!;
  g.font = `${style.fontWeight} ${REF}px ${style.fontFamily}`;
  const full = g.measureText(WORD);
  const fs = Math.min((vw * 0.9 * REF) / full.width, (vh * 0.52 * REF) / (REF * 0.72));
  const scale = fs / REF;
  const width = full.width * scale;
  const x = (vw - width) / 2;
  const y = vh * 0.5 + 0.36 * fs; // đường cơ sở: chữ hoa nằm giữa màn hình theo chiều dọc

  // Quét chữ A
  const baseline = REF * 1.05;
  const left = 20;
  g.fillStyle = "#fff";
  g.fillText("A", left, baseline);
  const m = g.measureText("A");
  const cx = Math.round(left + (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2);
  const top = Math.max(0, Math.floor(baseline - m.actualBoundingBoxAscent) - 2);
  const data = g.getImageData(cx, top, 1, Math.ceil(baseline - top) + 4).data;
  let state = 0; // 0: trước đỉnh chữ, 1: trong đỉnh chữ, 2: trong lỗ
  let firstSolid = -1;
  let holeStart = -1;
  for (let i = 0; i < data.length / 4; i++) {
    const solid = data[i * 4 + 3] > 128;
    if (state === 0 && solid) {
      state = 1;
      firstSolid = i;
    } else if (state === 1 && !solid) {
      holeStart = i;
      break;
    }
  }
  const apexMid = firstSolid >= 0 && holeStart > firstSolid ? top + (firstSolid + holeStart) / 2 : baseline - REF * 0.62;
  const ax = x + ((cx - left) / REF) * fs;
  const ay = y - ((baseline - apexMid) / REF) * fs;
  const zoom = 14;
  return { vw, vh, fs, x, y, ax, ay, zoom };
}
