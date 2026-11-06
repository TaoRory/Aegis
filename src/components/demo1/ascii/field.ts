/**
 * Lưới ký tự trên canvas 2D (lõi của mọi chữ ký /demo1).
 *
 * Nguồn hình (`DrawSource`) vẽ bằng toạ độ CSS px của khung; engine thu nhỏ vào một canvas đúng bằng số ô
 * (mỗi pixel = một ô) rồi đọc độ phủ và độ sáng từng ô. Ô có hình in một ký tự của chuỗi `text` theo vị trí
 * (chữ đọc được theo hàng, chảy chậm theo thời gian), màu theo độ sáng; ô trống là lưới chấm mờ vẽ sẵn.
 * Thêm: dải sáng chéo quét qua, "nhiệt" quanh con trỏ (ô nóng thành dấu "+"), và hiệu ứng "rõ dần" thành ô màu thật
 * (dùng cho ảnh dự án trước khi hiện ảnh gốc).
 */

/** t < 0: vẽ trạng thái cuối, đứng yên (giảm chuyển động) */
export type DrawSource = (ctx: CanvasRenderingContext2D, width: number, height: number, t: number) => void;

export interface FieldOptions {
  text: string;
  /** Dải màu ký tự từ tối tới sáng */
  ramp: string[];
  background: string;
  /** Màu chấm ở ô trống (null = không chấm) */
  dot: string | null;
  /** Màu ký tự ô "nóng" quanh con trỏ */
  hot: string;
  /** font-family đã tính (đọc từ CSS của canvas) */
  family: string;
  fontSize: (width: number) => number;
  /** Ngưỡng độ phủ để coi ô là có hình (0..1) */
  threshold?: number;
  /** Cách đổi độ sáng mẫu thành độ sáng ký tự */
  tone?: (luma: number, alpha: number) => number;
  /** ms cho mỗi bước chữ chảy (0 = đứng yên) */
  flowMs?: number;
  /** Dải sáng chéo quét qua */
  sweep?: boolean;
}

export class AsciiField {
  private ctx: CanvasRenderingContext2D;
  private sampleCanvas = document.createElement("canvas");
  private sampleCtx: CanvasRenderingContext2D;
  private background: HTMLCanvasElement | null = null;
  private chars: string[];
  W = 0;
  H = 0;
  cols = 0;
  rows = 0;
  cw = 0;
  ch = 0;
  offX = 0;
  offY = 0;
  private font = "";
  private base = new Float32Array(0);
  private rgb = new Uint8ClampedArray(0);
  private heat = new Float32Array(0);
  private bucket = new Uint8Array(0);
  private reveal = new Float32Array(0);
  /** 0..1: tỉ lệ ô đã chuyển sang ô màu thật */
  resolve = 0;
  source: DrawSource | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private options: FieldOptions,
  ) {
    this.ctx = canvas.getContext("2d", { alpha: false })!;
    this.sampleCtx = this.sampleCanvas.getContext("2d", { willReadFrequently: true })!;
    this.chars = Array.from(options.text);
  }

  /** Đo khung, dựng lưới và lớp nền; trả false nếu khung chưa có kích thước */
  layout(width: number, height: number) {
    if (width < 10 || height < 10) return false;
    const { options } = this;
    this.W = width;
    this.H = height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const size = options.fontSize(width);
    this.font = `500 ${size}px ${options.family}`;
    this.ctx.font = this.font;
    this.cw = Math.max(4, this.ctx.measureText("M").width);
    this.ch = size * 1.2;
    this.cols = Math.max(1, Math.floor(width / this.cw));
    this.rows = Math.max(1, Math.floor(height / this.ch));
    this.offX = (width - this.cols * this.cw) / 2;
    this.offY = (height - this.rows * this.ch) / 2;
    const n = this.cols * this.rows;
    this.base = new Float32Array(n);
    this.rgb = new Uint8ClampedArray(n * 3);
    this.heat = new Float32Array(n);
    this.bucket = new Uint8Array(n);
    this.reveal = new Float32Array(n);
    // Thứ tự "rõ dần" ngẫu nhiên nhưng cố định theo ô
    for (let i = 0; i < n; i++) this.reveal[i] = fract(Math.sin(i * 12.9898 + 78.233) * 43758.5453);
    this.sampleCanvas.width = this.cols;
    this.sampleCanvas.height = this.rows;

    this.background = document.createElement("canvas");
    this.background.width = this.canvas.width;
    this.background.height = this.canvas.height;
    const b = this.background.getContext("2d")!;
    b.setTransform(dpr, 0, 0, dpr, 0, 0);
    b.fillStyle = options.background;
    b.fillRect(0, 0, width, height);
    if (options.dot) {
      b.fillStyle = options.dot;
      for (let r = 0; r < this.rows; r += 2) {
        for (let c = r % 4 === 0 ? 0 : 1; c < this.cols; c += 2) {
          b.fillRect(this.offX + c * this.cw + this.cw / 2 - 0.75, this.offY + r * this.ch + this.ch / 2 - 0.75, 1.5, 1.5);
        }
      }
    }
    return true;
  }

  /** Vẽ nguồn hình vào lưới mẫu và cập nhật độ sáng từng ô */
  sample(t: number) {
    if (!this.source || !this.cols) return;
    const s = this.sampleCtx;
    s.setTransform(1, 0, 0, 1, 0, 0);
    s.clearRect(0, 0, this.cols, this.rows);
    s.imageSmoothingEnabled = true;
    s.imageSmoothingQuality = "high";
    // Toạ độ nguồn = CSS px của khung → mỗi ô (cw × ch) co thành 1 pixel
    s.setTransform(1 / this.cw, 0, 0, 1 / this.ch, -this.offX / this.cw, -this.offY / this.ch);
    s.save();
    this.source(s, this.W, this.H, t);
    s.restore();
    const data = s.getImageData(0, 0, this.cols, this.rows).data;
    const threshold = this.options.threshold ?? 0.3;
    const tone = this.options.tone ?? ((l: number, a: number) => Math.min(1, 0.06 + Math.pow(l, 1.5) * 1.05) * a);
    for (let i = 0, n = this.cols * this.rows; i < n; i++) {
      const a = data[i * 4 + 3] / 255;
      this.rgb[i * 3] = data[i * 4];
      this.rgb[i * 3 + 1] = data[i * 4 + 1];
      this.rgb[i * 3 + 2] = data[i * 4 + 2];
      if (a < threshold) {
        this.base[i] = 0;
        continue;
      }
      const l = (0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]) / 255;
      this.base[i] = Math.max(0.001, tone(l, a));
    }
  }

  draw(t: number, still = false) {
    if (!this.background || !this.cols) return;
    const { ctx, options } = this;
    ctx.drawImage(this.background, 0, 0, this.W, this.H);
    ctx.font = this.font;
    ctx.textBaseline = "top";
    const n = this.cols * this.rows;
    const len = this.chars.length;
    const flow = still || !options.flowMs ? 0 : Math.floor(t / options.flowMs);
    const sweepT = (t % 8000) / 8000;
    const sweep = still || !options.sweep ? -9 : sweepT * 1.8 - 0.4;
    const levels = options.ramp.length;
    const resolve = this.resolve;

    // Ô đã "rõ" thành màu thật
    if (resolve > 0) {
      for (let i = 0; i < n; i++) {
        if (this.reveal[i] > resolve) continue;
        ctx.fillStyle = `rgb(${this.rgb[i * 3]},${this.rgb[i * 3 + 1]},${this.rgb[i * 3 + 2]})`;
        ctx.fillRect(this.offX + (i % this.cols) * this.cw, this.offY + ((i / this.cols) | 0) * this.ch, this.cw + 0.5, this.ch + 0.5);
      }
    }

    for (let i = 0; i < n; i++) {
      const v0 = this.base[i];
      if (v0 <= 0) continue;
      const c = i % this.cols;
      const r = (i / this.cols) | 0;
      let v = v0;
      const d = (c / this.cols + r / this.rows) / 2 - sweep;
      if (d > -0.09 && d < 0.09) v += (1 - Math.abs(d) / 0.09) * 0.42;
      v += this.heat[i] * 0.9;
      this.bucket[i] = Math.min(levels - 1, Math.max(0, Math.floor(v * levels)));
    }
    for (let level = 0; level < levels; level++) {
      ctx.fillStyle = options.ramp[level];
      for (let i = 0; i < n; i++) {
        if (this.base[i] <= 0 || this.bucket[i] !== level || this.heat[i] > 0.35) continue;
        if (resolve > 0 && this.reveal[i] <= resolve) continue;
        const c = i % this.cols;
        const r = (i / this.cols) | 0;
        const glyph = this.chars[(r * this.cols + c + flow) % len];
        if (glyph === " ") continue;
        ctx.fillText(glyph, this.offX + c * this.cw, this.offY + r * this.ch);
      }
    }
    ctx.fillStyle = options.hot;
    for (let i = 0; i < n; i++) {
      if (this.base[i] <= 0 || this.heat[i] <= 0.35) continue;
      ctx.fillText("+", this.offX + (i % this.cols) * this.cw, this.offY + ((i / this.cols) | 0) * this.ch);
    }
  }

  /** Làm nóng các ô quanh điểm (toạ độ CSS px trong khung) */
  warm(x: number, y: number, radius = 4.2) {
    if (!this.cols) return;
    const px = (x - this.offX) / this.cw;
    const py = (y - this.offY) / this.ch;
    for (let r = Math.max(0, Math.floor(py - radius)); r <= Math.min(this.rows - 1, Math.ceil(py + radius)); r++) {
      for (let c = Math.max(0, Math.floor(px - radius * 1.8)); c <= Math.min(this.cols - 1, Math.ceil(px + radius * 1.8)); c++) {
        const dx = (c + 0.5 - px) / 1.8;
        const dy = r + 0.5 - py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > radius) continue;
        const i = r * this.cols + c;
        this.heat[i] = Math.min(1, this.heat[i] + (1 - dist / radius) * 0.75);
      }
    }
  }

  /** Nguội dần; trả true nếu còn ô nóng */
  cool() {
    let hot = false;
    for (let i = 0; i < this.heat.length; i++) {
      if (this.heat[i] > 0.001) {
        this.heat[i] *= 0.92;
        hot = true;
      }
    }
    return hot;
  }
}

function fract(x: number) {
  return x - Math.floor(x);
}

/** Màu chung của các canvas ký tự /demo1 (nền mực, dải mực → teal → aqua → Cloud) */
export const INK = "#071f1e";
export const RAMP = ["#174440", "#1d5a54", "#247068", "#2c877d", "#3ba093", "#55b9ab", "#78d3c6", "#a6e9df", "#dff7f2", "#f5f7f6"];
export const HOT = "#13b5a5";
export const DOT = "rgba(132, 228, 214, 0.13)";

export const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
