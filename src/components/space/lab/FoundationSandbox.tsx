"use client";

import { useEffect, useRef, useState } from "react";

import { spaceStore } from "@/components/space/space-store";
import { cn } from "@/lib/cn";
import { gsap, MQ } from "@/lib/motion";

type Engine = import("@/components/webgl/particle-engine").ParticleEngine;

const SHAPES = ["Nền móng", "AI", "Phần mềm", "Web", "Marketing"] as const;

function tokenRGB(name: string, fallback: [number, number, number]): [number, number, number] {
  const hex = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const match = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!match) return fallback;
  const n = parseInt(match[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/**
 * Thí nghiệm 01: engine hạt của trang chủ đặt trong một khung riêng. Chọn hình, kéo thanh "tán", rê chuột để đẩy hạt.
 * Cảnh 3D của Xưởng được tạm dừng khi thí nghiệm này mở (mỗi lúc chỉ một bối cảnh WebGL chạy).
 */
export default function FoundationSandbox() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const [shape, setShape] = useState(0);
  const [scatter, setScatter] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let cleanup = () => {};
    spaceStore.hold("lab-particles");

    void (async () => {
      const [{ ParticleEngine }, { createShapes }] = await Promise.all([import("@/components/webgl/particle-engine"), import("@/components/webgl/shapes")]);
      if (disposed) return;
      const mobile = window.matchMedia("(max-width: 47.99rem)").matches;
      const reduced = window.matchMedia(MQ.reduced).matches;
      let engine: Engine;
      try {
        engine = new ParticleEngine(canvas, createShapes(mobile ? 5000 : 9000), { dpr: Math.min(window.devicePixelRatio || 1, 1.5), pointSize: mobile ? 2.4 : 2 });
      } catch {
        setFailed(true);
        return;
      }
      engine.setColors(tokenRGB("--palette-paper", [0.92, 0.91, 0.89]), tokenRGB("--palette-ultramarine-light", [0.55, 0.56, 1]));
      engine.state.scale = 0.78;
      engineRef.current = engine;
      if (reduced) engine.render();
      else engine.start();

      const rect = () => canvas.getBoundingClientRect();
      const onMove = (event: PointerEvent) => {
        const r = rect();
        engine.pointer(event.clientX - r.left, event.clientY - r.top);
      };
      const onLeave = () => engine.pointerLeave();
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerleave", onLeave);
      cleanup = () => {
        canvas.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("pointerleave", onLeave);
        engine.destroy();
        engineRef.current = null;
      };
    })();

    return () => {
      disposed = true;
      cleanup();
      spaceStore.release("lab-particles");
    };
  }, []);

  const choose = (index: number) => {
    setShape(index);
    const engine = engineRef.current;
    if (!engine) return;
    const state = engine.state;
    if (window.matchMedia(MQ.reduced).matches) {
      state.phase = index;
      engine.render();
    } else gsap.to(state, { phase: index, duration: 1.6, ease: "power3.inOut", overwrite: "auto" });
  };

  const tune = (value: number) => {
    setScatter(value);
    const engine = engineRef.current;
    if (!engine) return;
    engine.state.scatter = value;
    if (window.matchMedia(MQ.reduced).matches) engine.render();
  };

  if (failed) return <p className="label p-6 text-muted">Thiết bị này không chạy được WebGL2, thí nghiệm không khả dụng.</p>;

  return (
    <div className="space-lab-fill">
      <canvas ref={canvasRef} className="absolute inset-0 size-full cursor-crosshair" role="img" aria-label="Đám hạt sáng đổi hình theo lựa chọn của bạn" />
      <div className="space-lab-controls">
        <div role="group" aria-label="Chọn hình" className="flex flex-wrap gap-1.5">
          {SHAPES.map((label, index) => (
            <button
              key={label}
              type="button"
              aria-pressed={shape === index}
              onClick={() => choose(index)}
              className={cn("label border px-3 py-2 transition-colors", shape === index ? "border-fg bg-fg text-bg" : "border-line-strong text-muted hover:border-fg hover:text-fg")}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-3">
          <span className="label text-muted">Tán</span>
          <input type="range" min={0} max={1.5} step={0.01} value={scatter} onChange={(event) => tune(Number(event.target.value))} aria-label="Độ tán của các điểm" className="w-40 accent-(--accent)" />
        </label>
      </div>
    </div>
  );
}
