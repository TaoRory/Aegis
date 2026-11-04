import type { Color } from "three";

import type { RoomPalette } from "@/components/showroom/engine/room-build";

/**
 * Hình vẽ canvas cho các màn hình trong Studio (màn hình máy tính, TV dự án, bảng hiển thị, khung ảnh, laptop).
 * Chỉ hình học trừu tượng + chữ lấy từ nội dung đã có; không vẽ số liệu, biểu đồ có số hay dữ liệu giả.
 * Khi camera bay tới một màn hình, màn hình đổi sang "màn chào" (drawSplash) giống lớp HTML sắp hiện lên, để lúc lớp HTML
 * bật sáng không bị giật hình.
 */

const css = (c: Color) => `#${c.getHexString()}`;
const mix = (a: Color, b: Color, t: number) => css(a.clone().lerp(b, t));

export function pageFont() {
  return getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
}

/** ImageBitmap trong texture đã lật dọc (dùng cho PlaneGeometry): vẽ lên canvas 2D thì phải lật lại */
export function unflip(img: ImageBitmap): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const g = c.getContext("2d")!;
  g.translate(0, img.height);
  g.scale(1, -1);
  g.drawImage(img, 0, 0);
  return c;
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
}

/** Thanh tiêu đề kiểu cửa sổ ứng dụng (giống thanh của lớp HTML) */
function appBar(g: CanvasRenderingContext2D, w: number, bar: number, p: RoomPalette) {
  g.fillStyle = css(p.ink);
  g.fillRect(0, 0, w, bar);
  const dot = bar * 0.16;
  [p.teal, p.aqua, p.grey].forEach((c, k) => {
    g.fillStyle = css(c);
    g.beginPath();
    g.arc(bar * 0.62 + k * dot * 3, bar / 2, dot, 0, Math.PI * 2);
    g.fill();
  });
}

function cover(g: CanvasRenderingContext2D, img: CanvasImageSource & { width: number; height: number }, x: number, y: number, w: number, h: number) {
  const s = Math.max(w / img.width, h / img.height);
  const iw = img.width * s;
  const ih = img.height * s;
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  g.drawImage(img, x + (w - iw) / 2, y, iw, ih);
  g.restore();
}

/** Màn hình máy tính: trình duyệt brand, hiện ảnh chụp một dự án (xoay vòng) */
export function drawBrowser(canvas: HTMLCanvasElement, p: RoomPalette, image?: HTMLCanvasElement) {
  const g = canvas.getContext("2d")!;
  const { width: w, height: h } = canvas;
  const bar = Math.round(h * 0.07);
  g.fillStyle = css(p.bright);
  g.fillRect(0, 0, w, h);
  appBar(g, w, bar, p);
  g.fillStyle = mix(p.ink, p.bright, 0.16);
  roundRect(g, w * 0.2, bar * 0.25, w * 0.6, bar * 0.5, bar * 0.25);
  g.fill();
  if (image) cover(g, image, 0, bar, w, h - bar);
  else {
    g.fillStyle = css(p.teal);
    g.fillRect(0, bar, w, bar * 0.12);
  }
}

/** TV dự án: lưới ảnh các dự án */
export function drawMosaic(canvas: HTMLCanvasElement, p: RoomPalette, images: HTMLCanvasElement[]) {
  const g = canvas.getContext("2d")!;
  const { width: w, height: h } = canvas;
  g.fillStyle = css(p.ink);
  g.fillRect(0, 0, w, h);
  const cols = 4;
  const rows = 2;
  const gap = w * 0.014;
  const cw = (w - gap * (cols + 1)) / cols;
  const ch = (h - gap * (rows + 1)) / rows;
  for (let i = 0; i < cols * rows; i++) {
    const x = gap + (i % cols) * (cw + gap);
    const y = gap + Math.floor(i / cols) * (ch + gap);
    const img = images[i];
    if (img) cover(g, img, x, y, cw, ch);
    else {
      // ô cuối: khối teal có dấu kim cương, ô "của dự án tiếp theo"
      g.fillStyle = css(p.teal);
      g.fillRect(x, y, cw, ch);
      g.fillStyle = css(p.ink);
      g.save();
      g.translate(x + cw / 2, y + ch / 2);
      g.rotate(Math.PI / 4);
      g.fillRect(-ch * 0.09, -ch * 0.09, ch * 0.18, ch * 0.18);
      g.restore();
    }
  }
}

/** Bảng hiển thị marketing: bảng tin chiến dịch trừu tượng (thẻ bài đăng, loa, kim cương), không số liệu */
export function drawCampaign(canvas: HTMLCanvasElement, p: RoomPalette) {
  const g = canvas.getContext("2d")!;
  const { width: w, height: h } = canvas;
  const bar = Math.round(h * 0.09);
  g.fillStyle = mix(p.soft, p.bright, 0.55);
  g.fillRect(0, 0, w, h);
  appBar(g, w, bar, p);
  const pad = w * 0.05;
  const colW = (w - pad * 4) / 3;
  const cols = [p.teal, p.aqua, p.ink];
  for (let k = 0; k < 3; k++) {
    const x = pad + k * (colW + pad);
    const y = bar + pad;
    g.fillStyle = css(p.bright);
    roundRect(g, x, y, colW, h - y - pad, w * 0.02);
    g.fill();
    g.fillStyle = css(cols[k]);
    roundRect(g, x + colW * 0.08, y + colW * 0.08, colW * 0.84, colW * 0.6, w * 0.012);
    g.fill();
    g.fillStyle = mix(p.ink, p.bright, 0.25);
    for (let l = 0; l < 3; l++) {
      roundRect(g, x + colW * 0.08, y + colW * 0.8 + l * colW * 0.14, colW * (0.84 - l * 0.22), colW * 0.06, colW * 0.03);
      g.fill();
    }
    g.fillStyle = css(p.teal);
    g.save();
    g.translate(x + colW * 0.16, h - pad - colW * 0.16);
    g.rotate(Math.PI / 4);
    g.fillRect(-colW * 0.05, -colW * 0.05, colW * 0.1, colW * 0.1);
    g.restore();
  }
}

/** Khung ảnh "Về Aegis": logo + các giá trị (chữ lấy từ nội dung) */
export function drawValues(canvas: HTMLCanvasElement, p: RoomPalette, line: string, emblem?: HTMLCanvasElement) {
  const g = canvas.getContext("2d")!;
  const { width: w, height: h } = canvas;
  g.fillStyle = css(p.ink);
  g.fillRect(0, 0, w, h);
  const grad = g.createRadialGradient(w / 2, h * 0.42, 0, w / 2, h * 0.42, w * 0.5);
  grad.addColorStop(0, mix(p.ink, p.teal, 0.35));
  grad.addColorStop(1, css(p.ink));
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
  if (emblem) {
    const s = h * 0.42;
    g.drawImage(emblem, (w - s * (emblem.width / emblem.height)) / 2, h * 0.16, s * (emblem.width / emblem.height), s);
  }
  g.fillStyle = css(p.bright);
  g.font = `600 ${Math.round(h * 0.075)}px ${pageFont()}`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(line, w / 2, h * 0.76);
  g.fillStyle = css(p.teal);
  g.fillRect(w / 2 - w * 0.06, h * 0.85, w * 0.12, h * 0.012);
}

/** Laptop liên hệ: ứng dụng nhắn tin trừu tượng */
export function drawMessenger(canvas: HTMLCanvasElement, p: RoomPalette) {
  const g = canvas.getContext("2d")!;
  const { width: w, height: h } = canvas;
  const bar = Math.round(h * 0.09);
  g.fillStyle = css(p.bright);
  g.fillRect(0, 0, w, h);
  appBar(g, w, bar, p);
  g.fillStyle = mix(p.soft, p.bright, 0.4);
  g.fillRect(0, bar, w * 0.28, h - bar);
  for (let k = 0; k < 4; k++) {
    g.fillStyle = k === 0 ? css(p.teal) : mix(p.ink, p.bright, 0.7);
    g.beginPath();
    g.arc(w * 0.06, bar + h * 0.1 + k * h * 0.17, h * 0.045, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = mix(p.ink, p.bright, 0.75);
    roundRect(g, w * 0.11, bar + h * 0.085 + k * h * 0.17, w * 0.13, h * 0.03, h * 0.015);
    g.fill();
  }
  const bubble = (x: number, y: number, bw: number, fill: string) => {
    g.fillStyle = fill;
    roundRect(g, x, y, bw, h * 0.1, h * 0.05);
    g.fill();
  };
  bubble(w * 0.34, bar + h * 0.08, w * 0.34, mix(p.soft, p.grey, 0.15));
  bubble(w * 0.56, bar + h * 0.26, w * 0.38, css(p.teal));
  bubble(w * 0.34, bar + h * 0.44, w * 0.26, mix(p.soft, p.grey, 0.15));
  g.fillStyle = mix(p.ink, p.bright, 0.88);
  roundRect(g, w * 0.32, h - h * 0.15, w * 0.64, h * 0.09, h * 0.045);
  g.fill();
}

/** Màn chào khi camera đang bay tới: nền sáng + thanh ứng dụng + tên khu, giống lớp HTML sẽ bật lên */
export function drawSplash(canvas: HTMLCanvasElement, p: RoomPalette, index: string, title: string) {
  const g = canvas.getContext("2d")!;
  const { width: w, height: h } = canvas;
  const bar = Math.round(Math.min(h * 0.075, w * 0.045));
  g.fillStyle = css(p.bright);
  g.fillRect(0, 0, w, h);
  appBar(g, w, bar, p);
  g.textAlign = "left";
  g.textBaseline = "alphabetic";
  g.fillStyle = css(p.teal);
  g.font = `600 ${Math.round(h * 0.04)}px ${pageFont()}`;
  g.fillText(index, w * 0.06, h * 0.32);
  g.fillStyle = css(p.ink);
  g.font = `650 ${Math.round(h * 0.095)}px ${pageFont()}`;
  g.fillText(title, w * 0.06, h * 0.45);
  g.fillStyle = mix(p.ink, p.bright, 0.88);
  for (let k = 0; k < 3; k++) {
    roundRect(g, w * 0.06, h * 0.55 + k * h * 0.07, w * (0.62 - k * 0.14), h * 0.03, h * 0.015);
    g.fill();
  }
}
