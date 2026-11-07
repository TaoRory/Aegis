"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

import { AsciiField, DOT, HOT, INK, RAMP, type DrawSource, type FieldOptions } from "./field";
import { registerAscii, wakeAscii } from "./scheduler";

export interface AsciiController {
  source: DrawSource;
  /** Nguồn hình có đổi theo thời gian ở khung t không (cần lấy mẫu lại mỗi khung) */
  isDynamic: (t: number) => boolean;
  /** Còn chuyển động cần vẽ không (ngoài chữ chảy / dải sáng) */
  isAnimating: (t: number) => boolean;
  /** Gọi mỗi khung trước khi vẽ (vd. cập nhật độ "rõ dần") */
  beforeDraw?: (field: AsciiField, t: number) => void;
}

interface UseAsciiOptions extends Partial<Pick<FieldOptions, "flowMs" | "sweep" | "threshold" | "tone" | "dot" | "fontSize" | "glyphs">> {
  text: string;
  /** Khung hình/giây trên máy tính (điện thoại tự giảm còn 2/3, tối đa 20) */
  fps?: number;
  /** Con trỏ làm nóng ô (chỉ thiết bị có chuột) */
  interactive?: boolean;
  /** Dựng nguồn hình một lần cho mỗi lần gắn canvas */
  build: () => AsciiController;
}

/**
 * Gắn một AsciiField vào canvas: đo khung (ResizeObserver), chờ font mono, chạy trong vòng lặp chung khi đang hiện trên màn hình.
 * Giảm chuyển động: chỉ vẽ một khung tĩnh, không theo chuột. Trả `ready` để hiện canvas (tránh nhấp nháy khung trống).
 */
export function useAscii(wrapRef: RefObject<HTMLElement | null>, canvasRef: RefObject<HTMLCanvasElement | null>, options: UseAsciiOptions) {
  const [ready, setReady] = useState(false);
  const optionsRef = useRef(options);
  const kick = useRef<() => void>(() => {});

  // Giữ tuỳ chọn mới nhất cho lần gắn canvas (đọc một lần khi gắn)
  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const o = optionsRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const family = getComputedStyle(canvas).fontFamily || "monospace";
    const field = new AsciiField(canvas, {
      text: o.text,
      ramp: RAMP,
      background: INK,
      dot: o.dot === undefined ? DOT : o.dot,
      hot: HOT,
      family,
      // Điện thoại: ô chữ to hơn (ít ô hơn ~1/3), không dải sáng quét → nhẹ CPU
      fontSize: fine ? (o.fontSize ?? ((w) => (w < 380 ? 9 : w < 520 ? 10 : 11))) : (w) => Math.max(11, o.fontSize?.(w) ?? 11),
      threshold: o.threshold,
      tone: o.tone,
      flowMs: o.flowMs,
      sweep: fine ? o.sweep : false,
      glyphs: o.glyphs,
    });
    const controller = o.build();
    field.source = controller.source;
    const continuous = !!(o.flowMs || (fine && o.sweep));

    let disposed = false;
    let visible = false;
    let laidOut = false;
    let needsSample = true;
    let hot = false;

    // Khung tĩnh (giảm chuyển động): t = -1 báo nguồn hình vẽ trạng thái cuối
    const drawStill = () => {
      if (!laidOut) return;
      field.sample(-1);
      controller.beforeDraw?.(field, 0);
      field.draw(0, true);
    };

    const unregister = registerAscii({
      fps: fine ? (o.fps ?? 30) : Math.min(15, Math.round((o.fps ?? 30) * 0.5)),
      active: () => !disposed && !reduce && laidOut && visible && (continuous || hot || needsSample || controller.isAnimating(performance.now())),
      tick: (t) => {
        if (needsSample || controller.isDynamic(t)) {
          field.sample(t);
          needsSample = false;
        }
        hot = field.cool();
        controller.beforeDraw?.(field, t);
        field.draw(t);
      },
    });

    const layout = () => {
      const rect = wrap.getBoundingClientRect();
      laidOut = field.layout(rect.width, rect.height);
      needsSample = true;
      if (reduce) drawStill();
      else wakeAscii();
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wakeAscii();
    });
    io.observe(wrap);
    const fontsReady = document.fonts?.load(`500 11px ${family}`).then(() => undefined, () => undefined) ?? Promise.resolve();
    // Đổi kích thước: chỉ đo lại sau khi đã bắt đầu (lần đo đầu do begin() làm lúc trình duyệt rảnh)
    let started = false;
    const ro = new ResizeObserver(() => started && !disposed && layout());
    ro.observe(wrap);
    // Bắt đầu khi trình duyệt rảnh (sau khi trang đã tương tác được), không tranh CPU lúc khởi động
    let idle = 0;
    fontsReady.then(() => {
      if (disposed) return;
      const begin = () => {
        if (disposed) return;
        started = true;
        layout();
        setReady(true);
      };
      idle = typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(begin, { timeout: 1200 }) : window.setTimeout(begin, 300);
    });

    const onMove = (event: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      field.warm(event.clientX - rect.left, event.clientY - rect.top);
      hot = true;
      wakeAscii();
    };
    if (o.interactive && fine && !reduce) wrap.addEventListener("pointermove", onMove);

    kick.current = () => {
      needsSample = true;
      if (reduce) drawStill();
      else wakeAscii();
    };

    return () => {
      disposed = true;
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      unregister();
      io.disconnect();
      ro.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      kick.current = () => {};
    };
  }, [wrapRef, canvasRef]);

  /** Báo engine nguồn hình vừa đổi (lấy mẫu lại và chạy tiếp) */
  return { ready, kick: () => kick.current() };
}
