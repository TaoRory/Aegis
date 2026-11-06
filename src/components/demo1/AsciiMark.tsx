"use client";

import { useEffect, useRef, useState } from "react";

/** Nền mực và dải màu từ tối tới sáng (mực → teal → aqua → Cloud Dancer) cho ký tự theo độ sáng của dấu */
const INK = "#071f1e";
const RAMP = ["#174440", "#1d5a54", "#247068", "#2c877d", "#3ba093", "#55b9ab", "#78d3c6", "#a6e9df", "#dff7f2", "#f5f7f6"];
const HOT = "#13b5a5";
const DOT = "rgba(132, 228, 214, 0.13)";

/**
 * Chữ ký /demo1: dấu Aegis (ảnh emblem chính thức) dựng lại bằng ký tự mono trên canvas 2D.
 * - Mỗi ô lưới lấy độ sáng/độ phủ của emblem; ô thuộc dấu in một ký tự của chuỗi `text` (tên bốn mảng dịch vụ), chữ chảy chậm theo hàng.
 * - Một dải sáng chéo quét qua vài giây một lần; rê chuột làm các ô quanh con trỏ sáng lên thành dấu "+" rồi nguội dần.
 * - Ô ngoài dấu: lưới chấm mờ (vẽ sẵn một lần vào lớp nền).
 * Nhẹ: ~30 khung/giây, dừng khi ra khỏi màn hình hoặc tab ẩn; giảm chuyển động thì chỉ vẽ một khung tĩnh, không theo chuột.
 */
export function AsciiMark({ text, src, className }: { text: string; src: string; className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!wrap || !canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const chars = Array.from(text);

    let disposed = false;
    let W = 0;
    let H = 0;
    let cols = 0;
    let rows = 0;
    let cw = 0;
    let ch = 0;
    let offX = 0;
    let offY = 0;
    let fontSize = 11;
    let font = "";
    let base = new Float32Array(0);
    let order = new Int32Array(0);
    let heat = new Float32Array(0);
    let bucket = new Uint8Array(0);
    let background: HTMLCanvasElement | null = null;
    let imageReady = false;

    const family = getComputedStyle(canvas).fontFamily || "monospace";
    const img = new Image();
    img.decoding = "async";

    /** Lưới ô theo kích thước khung; lấy mẫu emblem vào canvas nhỏ đúng bằng số ô (mỗi pixel = một ô) */
    const layout = () => {
      const rect = wrap.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      if (W < 10 || H < 10) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fontSize = W < 380 ? 9 : W < 520 ? 10 : 11;
      font = `500 ${fontSize}px ${family}`;
      ctx.font = font;
      cw = Math.max(5, ctx.measureText("M").width);
      ch = fontSize * 1.2;
      cols = Math.floor(W / cw);
      rows = Math.floor(H / ch);
      offX = (W - cols * cw) / 2;
      offY = (H - rows * ch) / 2;
      const n = cols * rows;
      base = new Float32Array(n);
      order = new Int32Array(n).fill(-1);
      heat = new Float32Array(n);
      bucket = new Uint8Array(n);

      if (imageReady) {
        const sample = document.createElement("canvas");
        sample.width = cols;
        sample.height = rows;
        const s = sample.getContext("2d", { willReadFrequently: true });
        if (s) {
          s.imageSmoothingEnabled = true;
          s.imageSmoothingQuality = "high";
          const ratio = img.naturalWidth / img.naturalHeight;
          let bw = W * 0.86;
          let bh = bw / ratio;
          if (bh > H * 0.86) {
            bh = H * 0.86;
            bw = bh * ratio;
          }
          const bx = (W - bw) / 2;
          const by = (H - bh) / 2;
          s.drawImage(img, (bx - offX) / cw, (by - offY) / ch, bw / cw, bh / ch);
          const data = s.getImageData(0, 0, cols, rows).data;
          let k = 0;
          for (let i = 0; i < n; i++) {
            const a = data[i * 4 + 3] / 255;
            if (a < 0.3) continue;
            const l = (0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]) / 255;
            // lũy thừa > 1: phần tối của dải kính tối hẳn, phần sáng giữ sáng → đọc được các nếp gấp của logo
            base[i] = Math.min(1, 0.06 + Math.pow(l, 1.5) * 1.05) * a;
            order[i] = k++;
          }
        }
      }

      // Lớp nền vẽ một lần: mực + lưới chấm ở các ô ngoài dấu
      background = document.createElement("canvas");
      background.width = canvas.width;
      background.height = canvas.height;
      const b = background.getContext("2d");
      if (b) {
        b.setTransform(dpr, 0, 0, dpr, 0, 0);
        b.fillStyle = INK;
        b.fillRect(0, 0, W, H);
        b.fillStyle = DOT;
        for (let r = 0; r < rows; r += 2) {
          for (let c = r % 4 === 0 ? 0 : 1; c < cols; c += 2) {
            if (order[r * cols + c] >= 0) continue;
            b.fillRect(offX + c * cw + cw / 2 - 0.75, offY + r * ch + ch / 2 - 0.75, 1.5, 1.5);
          }
        }
      }
    };

    let lastDraw = 0;
    const draw = (t: number) => {
      if (!background || !cols) return;
      ctx.drawImage(background, 0, 0, W, H);
      if (!imageReady) return;
      ctx.font = font;
      ctx.textBaseline = "top";
      const len = chars.length;
      const flow = reduce ? 0 : Math.floor(t / 140);
      const sweepT = (t % 8000) / 8000;
      const sweep = reduce ? -9 : sweepT * 1.8 - 0.4;
      const n = cols * rows;
      for (let i = 0; i < n; i++) {
        if (order[i] < 0) continue;
        const c = i % cols;
        const r = (i / cols) | 0;
        let v = base[i];
        const d = (c / cols + r / rows) / 2 - sweep;
        if (d > -0.09 && d < 0.09) v += (1 - Math.abs(d) / 0.09) * 0.42;
        v += heat[i] * 0.9;
        bucket[i] = Math.min(RAMP.length - 1, Math.max(0, Math.floor(v * RAMP.length)));
      }
      for (let level = 0; level < RAMP.length; level++) {
        ctx.fillStyle = RAMP[level];
        for (let i = 0; i < n; i++) {
          if (order[i] < 0 || bucket[i] !== level || heat[i] > 0.35) continue;
          const glyph = chars[(order[i] + flow) % len];
          if (glyph === " ") continue;
          ctx.fillText(glyph, offX + (i % cols) * cw, offY + ((i / cols) | 0) * ch);
        }
      }
      // Ô "nóng" quanh con trỏ: dấu cộng màu teal
      ctx.fillStyle = HOT;
      for (let i = 0; i < n; i++) {
        if (order[i] < 0 || heat[i] <= 0.35) continue;
        ctx.fillText("+", offX + (i % cols) * cw, offY + ((i / cols) | 0) * ch);
      }
    };

    // Vòng lặp ~30 khung/giây, chỉ chạy khi khung đang hiện trên màn hình
    let raf = 0;
    let visible = false;
    const loop = (t: number) => {
      raf = 0;
      if (disposed || !visible || document.hidden) return;
      if (t - lastDraw >= 33) {
        lastDraw = t;
        for (let i = 0; i < heat.length; i++) if (heat[i] > 0.001) heat[i] *= 0.92;
        draw(t);
      }
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (reduce) {
        draw(0);
        return;
      }
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    io.observe(wrap);
    const onVisibility = () => start();
    document.addEventListener("visibilitychange", onVisibility);

    const ro = new ResizeObserver(() => {
      layout();
      draw(performance.now());
    });
    ro.observe(wrap);

    // Con trỏ: làm nóng các ô trong bán kính ~4 ô
    const onMove = (event: PointerEvent) => {
      if (!cols) return;
      const rect = wrap.getBoundingClientRect();
      const px = (event.clientX - rect.left - offX) / cw;
      const py = (event.clientY - rect.top - offY) / ch;
      const radius = 4.2;
      for (let r = Math.max(0, Math.floor(py - radius)); r <= Math.min(rows - 1, Math.ceil(py + radius)); r++) {
        for (let c = Math.max(0, Math.floor(px - radius * 1.8)); c <= Math.min(cols - 1, Math.ceil(px + radius * 1.8)); c++) {
          const dx = (c + 0.5 - px) / 1.8;
          const dy = r + 0.5 - py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > radius) continue;
          const i = r * cols + c;
          heat[i] = Math.min(1, heat[i] + (1 - dist / radius) * 0.75);
        }
      }
      start();
    };
    if (finePointer && !reduce) wrap.addEventListener("pointermove", onMove);

    // Ảnh emblem + font mono sẵn sàng thì lấy mẫu lại và hiện canvas
    const fontReady = document.fonts?.load(`500 11px ${family}`).catch(() => undefined) ?? Promise.resolve();
    img.src = src;
    Promise.all([img.decode().catch(() => undefined), fontReady]).then(() => {
      if (disposed) return;
      imageReady = img.naturalWidth > 0;
      layout();
      draw(performance.now());
      setReady(true);
      start();
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      wrap.removeEventListener("pointermove", onMove);
    };
  }, [text, src]);

  return (
    <div ref={wrapRef} className={`d1-mark ${className ?? ""}`} data-ready={ready}>
      <canvas ref={canvasRef} aria-hidden />
    </div>
  );
}
