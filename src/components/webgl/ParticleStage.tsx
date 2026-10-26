"use client";

import { useEffect, useRef } from "react";

import { stageStore } from "@/components/webgl/stage-store";
import { getLenis, gsap, MQ, onIntroDone, ScrollTrigger } from "@/lib/motion";
import { onPointerMove } from "@/lib/pointer";

/** Đọc màu token CSS (#rrggbb) thành vec3 0..1, để đổi theme không phải sửa shader */
function tokenColor(name: string, fallback: [number, number, number]): [number, number, number] {
  const hex = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const match = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!match) return fallback;
  const n = parseInt(match[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/**
 * Sân khấu hạt cố định phía sau nội dung. Chỉ lộ ra ở các section nền mực trong suốt
 * (Hero, Dịch vụ); section nền giấy che phủ nó. Thuần trang trí: aria-hidden, không nhận chuột.
 *
 * Kịch bản: hero = nền móng tự lắp ráp khi intro xong → cuộn khỏi hero thì phân tán nhẹ →
 * vào Dịch vụ thì morph lần lượt: AI → phần mềm → web → marketing (tiến độ do Services cung cấp).
 */
export function ParticleStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let cleanup = () => {};

    const setup = async () => {
      const probe = document.createElement("canvas").getContext("webgl2");
      if (!probe) return;
      const [{ ParticleEngine }, { createShapes }] = await Promise.all([
        import("@/components/webgl/particle-engine"),
        import("@/components/webgl/shapes"),
      ]);
      if (disposed) return;

      const reduced = window.matchMedia(MQ.reduced).matches;
      const desktop = window.matchMedia("(min-width: 64rem)").matches;
      const lowQuality = document.documentElement.dataset.quality === "low";
      const weak = lowQuality || (navigator.hardwareConcurrency ?? 8) <= 4;
      const count = Math.round((desktop ? 18000 : 10000) * (lowQuality ? 0.3 : weak ? 0.55 : 1));
      const dpr = Math.min(window.devicePixelRatio || 1, lowQuality ? 1 : desktop ? 2 : 1.5);

      let engine: InstanceType<typeof ParticleEngine>;
      try {
        engine = new ParticleEngine(canvas, createShapes(count), { dpr, pointSize: desktop ? 2 : 2.6 });
      } catch (error) {
        console.warn("[ParticleStage] Bỏ qua hiệu ứng WebGL:", error);
        return;
      }
      engine.setColors(tokenColor("--palette-paper", [0.92, 0.91, 0.89]), tokenColor("--palette-ultramarine-light", [0.55, 0.56, 1]));
      canvas.dataset.ready = "on";
      // Kiểm thử tự động: ?debug-flow cho phép đọc trạng thái trường năng lượng từ trình duyệt
      if (window.location.search.includes("debug-flow")) (window as unknown as { __aegisParticles?: unknown }).__aegisParticles = engine;

      const s = engine.state;
      const layout = () => {
        const isDesktop = window.matchMedia("(min-width: 64rem)").matches;
        const aspect = window.innerWidth / Math.max(1, window.innerHeight);
        return {
          // Điện thoại: artwork chiếm trọn nửa trên màn hình (chữ nằm ở nửa dưới), vừa khít bề ngang
          hero: isDesktop ? { x: aspect * 0.42, y: 0.02, scale: 0.62 } : { x: 0, y: 0.5, scale: Math.min(0.62, aspect * 0.86) },
          services: isDesktop ? { x: aspect * 0.48, y: 0, scale: 0.58 } : { x: 0, y: 0.4, scale: Math.min(0.58, aspect * 0.95) },
        };
      };

      // Tiến độ chuyển cảnh, cập nhật bởi ScrollTrigger
      const progress = { heroOut: 0, servicesIn: 0, intro: reduced ? 1 : 0 };
      const apply = () => {
        const L = layout();
        const k = progress.servicesIn;
        s.offsetX = L.hero.x + (L.services.x - L.hero.x) * k;
        s.offsetY = L.hero.y + (L.services.y - L.hero.y) * k;
        s.scale = L.hero.scale + (L.services.scale - L.hero.scale) * k;
        s.phase = k < 1 ? k : 1 + stageStore.servicePhase;
        const outScatter = progress.heroOut * (1 - k) * 0.55;
        s.scatter = (1 - progress.intro) * 1.4 + outScatter;
        s.rotY = progress.heroOut * 0.5 * (1 - k);
      };
      apply();

      if (reduced) {
        engine.render();
        const unsubscribe = stageStore.subscribe(() => {
          apply();
          engine.render();
        });
        const onResize = () => {
          apply();
          engine.render();
        };
        window.addEventListener("resize", onResize);
        cleanup = () => {
          unsubscribe();
          window.removeEventListener("resize", onResize);
          engine.destroy();
        };
        return;
      }

      // Intro: hạt tụ lại thành nền móng
      const introTween = gsap.to(progress, { intro: 1, duration: 2.6, ease: "expo.out", paused: true, onUpdate: apply });
      const offIntro = onIntroDone(() => introTween.play());

      const triggers = [
        ScrollTrigger.create({
          trigger: "#trang-chu",
          start: "top top",
          end: "bottom top",
          scrub: true,
          onUpdate: (self) => {
            progress.heroOut = self.progress;
            apply();
          },
        }),
        ScrollTrigger.create({
          trigger: "#dich-vu",
          start: "top bottom",
          end: "top top",
          scrub: true,
          onUpdate: (self) => {
            progress.servicesIn = self.progress;
            apply();
          },
        }),
      ];
      const unsubscribe = stageStore.subscribe(apply);

      // Luồng năng lượng: chuột / ngón tay đi qua cuốn phân tử theo hướng di chuyển (không đẩy ra xa).
      // Chuột còn làm khối nghiêng rất nhẹ theo chiều dọc.
      const onPointer = (event: PointerEvent) => {
        engine.pointer(event.clientX, event.clientY);
        if (event.pointerType === "mouse") {
          const ny = -((event.clientY / window.innerHeight) * 2 - 1);
          gsap.to(s, { rotX: ny * 0.08, duration: 0.6, overwrite: "auto" });
        }
      };
      const onPointerLeave = () => {
        engine.pointerLeave();
        gsap.to(s, { rotX: 0, duration: 0.8, overwrite: "auto" });
      };
      const stopPointer = onPointerMove((event) => (event ? onPointer(event) : onPointerLeave()));
      // Cảm ứng: trình duyệt huỷ pointer khi bắt đầu cuộn, nên nghe thêm touchmove (passive, không chặn cuộn)
      const onTouch = (event: TouchEvent) => {
        const t = event.touches[0];
        if (t) engine.pointer(t.clientX, t.clientY);
      };
      const onTouchEnd = () => engine.pointerLeave();
      window.addEventListener("touchmove", onTouch, { passive: true });
      window.addEventListener("touchend", onTouchEnd, { passive: true });

      // Gió cuộn: phân tử lệch nhẹ theo vận tốc cuộn rồi trở lại (artwork "sống" cả khi không chạm)
      let lastY = window.scrollY;
      const windTick = () => {
        const lenis = getLenis();
        const v = lenis ? lenis.velocity : window.scrollY - lastY;
        lastY = window.scrollY;
        const target = Math.max(-0.05, Math.min(0.05, v * 0.0016));
        s.windY += (target - s.windY) * 0.12;
        if (Math.abs(s.windY) < 1e-4) s.windY = 0;
      };
      gsap.ticker.add(windTick);

      // Chỉ chạy vòng render khi Hero hoặc Dịch vụ đang hiển thị và tab đang mở
      const visible = new Set<Element>();
      const sync = () => {
        const show = visible.size > 0 && document.visibilityState === "visible";
        canvas.dataset.active = show ? "on" : "off";
        if (show) engine.start();
        else engine.stop();
      };
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        sync();
      });
      ["#trang-chu", "#dich-vu"].forEach((sel) => {
        const el = document.querySelector(sel);
        if (el) observer.observe(el);
      });
      document.addEventListener("visibilitychange", sync);
      const onResize = () => apply();
      window.addEventListener("resize", onResize);

      cleanup = () => {
        offIntro();
        introTween.kill();
        triggers.forEach((t) => t.kill());
        unsubscribe();
        observer.disconnect();
        document.removeEventListener("visibilitychange", sync);
        window.removeEventListener("resize", onResize);
        stopPointer();
        window.removeEventListener("touchmove", onTouch);
        window.removeEventListener("touchend", onTouchEnd);
        gsap.ticker.remove(windTick);
        engine.destroy();
      };
    };

    // Không chặn LCP: khởi tạo khi trình duyệt rảnh
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    const handle = idle(() => void setup());

    return () => {
      disposed = true;
      cancelIdle(handle);
      cleanup();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="particle-stage pointer-events-none fixed inset-0 z-0 h-svh w-full" />;
}
