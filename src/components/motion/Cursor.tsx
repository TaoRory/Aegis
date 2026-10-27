"use client";

import { useEffect, useRef, useState } from "react";

import { gsap, MQ } from "@/lib/motion";
import { onPointerMove, pointer } from "@/lib/pointer";

/**
 * Con trỏ "đầu bút kỹ thuật": thay con trỏ gốc bằng một chấm + một vòng, chỉ trên thiết bị có chuột
 * và khi không giảm chuyển động (con trỏ gốc vẫn dùng ở ô nhập chữ).
 *
 * - Chấm bám tức thì; vòng đuổi theo bằng nội suy theo thời gian (mượt như nhau ở 60/120/144 Hz),
 *   kéo giãn và xoay theo hướng di chuyển, hồi tròn khi dừng.
 * - Rê lên nút (.btn-box, .round-btn, [data-cursor="snap"]) thì vòng "ôm" hình dạng nút.
 * - data-cursor="view" | "drag" + data-cursor-label="Xem ↗" → bong bóng có nhãn (nhãn xáo chữ khi đổi).
 * - a, button, label, [data-cursor="link"] → vòng phóng to. Ô nhập chữ → ẩn vòng, trả con trỏ gốc.
 * - Bấm chuột: vòng co lại, để lại dấu "+" mờ dần (chữ ký bản vẽ).
 * Trong Xưởng (html[data-space="on"]) con trỏ đổi sang dạng "ngắm kỹ thuật": khung bốn góc vuông, chấm hình thoi, nhãn vát góc;
 * không kéo giãn/xoay theo hướng di chuyển (hình vuông xoay trông lệch).
 * Trạng thái hiện tại nằm ở html[data-cursor-state] (kit.css và CSS mẫu đọc để đổi màu).
 */

type Mode = "idle" | "link" | "snap" | "view" | "text";

const SNAP = ".btn-box, .round-btn, [data-cursor='snap']";
const LINK = "a, button, [role='button'], label, summary, [data-cursor='link']";
const VIEW = "[data-cursor='view'], [data-cursor='drag']";
const TEXT =
  "input:not([type='checkbox']):not([type='radio']):not([type='button']):not([type='submit']):not([type='range']), textarea, select, [contenteditable='true']";

const IDLE_SIZE = 34;
const LINK_SIZE = 58;
const SNAP_PAD = 9;
const BUBBLE_SIZE = 104;
const GLYPHS = "ABCDEFGHJKLMNPRSTUVXYZ↗↔→";

export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const blendRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const media = window.matchMedia(`${MQ.fineHover} and ${MQ.anyMotion}`);
    const update = () => setEnabled(media.matches && document.documentElement.dataset.cursorPref !== "off");
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const blend = blendRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const bubble = bubbleRef.current;
    const label = labelRef.current;
    if (!enabled || !blend || !dot || !ring || !bubble || !label) return;

    const root = document.documentElement;

    // ---- Trạng thái mục tiêu (đổi theo phần tử đang rê chuột) ----
    let mode: Mode = "idle";
    let snapEl: HTMLElement | null = null;
    let viewEl: HTMLElement | null = null;
    let snapRadius = 8;
    let labelText = "";
    let scrambleTween: gsap.core.Tween | null = null;
    let pressed = false;

    // ---- Trạng thái đã làm mượt ----
    let ready = false;
    let rx = 0;
    let ry = 0;
    let w = IDLE_SIZE;
    let h = IDLE_SIZE;
    let round = 1; // 1 = tròn, 0 = góc bo theo nút
    let rad = 8;
    let stretch = 0;
    let angle = 0;
    let press = 0;
    let bubbleScale = 0;
    let ringAlpha = 1;
    let dotAlpha = 1;
    let shown = 0;

    const setMode = (next: Mode) => {
      if (mode === next) return;
      mode = next;
      root.dataset.cursorState = next;
    };

    const setLabel = (text: string) => {
      if (text === labelText) return;
      labelText = text;
      scrambleTween?.kill();
      const progress = { p: 0 };
      scrambleTween = gsap.to(progress, {
        p: 1,
        duration: 0.38,
        ease: "none",
        onUpdate: () => {
          const settled = Math.floor(progress.p * text.length);
          label.textContent =
            text.slice(0, settled) +
            [...text.slice(settled)].map((c) => (c === " " ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join("");
        },
        onComplete: () => {
          label.textContent = text;
        },
      });
    };

    const onOver = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target) return;
      const view = target.closest<HTMLElement>(VIEW);
      const snap = target.closest<HTMLElement>(SNAP);
      snapEl = null;
      viewEl = null;
      if (target.closest(TEXT)) setMode("text");
      else if (view) {
        viewEl = view;
        setMode("view");
        setLabel(view.dataset.cursorLabel ?? "");
      } else if (snap) {
        snapEl = snap;
        const radius = Number.parseFloat(getComputedStyle(snap).borderTopLeftRadius);
        snapRadius = (Number.isFinite(radius) ? radius : 0) + SNAP_PAD * 0.6;
        setMode("snap");
      } else if (target.closest(LINK)) setMode("link");
      else setMode("idle");
    };

    const spawnPlus = (x: number, y: number) => {
      const plus = document.createElement("span");
      plus.className = "cursor-plus";
      plus.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      blend.appendChild(plus);
      gsap.fromTo(
        plus,
        { scale: 0.3, rotation: -45, opacity: 1 },
        { scale: 1.5, rotation: 0, opacity: 0, duration: 0.8, ease: "expo.out", onComplete: () => plus.remove() },
      );
    };

    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || mode === "text") return;
      pressed = true;
      spawnPlus(event.clientX, event.clientY);
    };
    const onUp = () => {
      pressed = false;
    };
    const onBlur = () => {
      pressed = false;
    };

    const stopMove = onPointerMove((event) => {
      if (!event || event.pointerType !== "mouse" || ready) return;
      ready = true;
      rx = pointer.x;
      ry = pointer.y;
      root.dataset.cursorOn = "";
      root.dataset.cursorState ||= "idle";
    });
    document.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    window.addEventListener("blur", onBlur);

    const tick = (_time: number, deltaMs: number) => {
      if (!ready) return;
      const dt = Math.min(deltaMs, 64) / 1000;
      const kPos = 1 - Math.exp(-dt * 17);
      const kSize = 1 - Math.exp(-dt * 13);
      const kFade = 1 - Math.exp(-dt * 16);

      const px = pointer.x;
      const py = pointer.y;
      // Phần tử bị gỡ hoặc trang đang bị ẩn (không có hộp hiển thị) thì thôi ôm nút
      if (snapEl && (!snapEl.isConnected || snapEl.getClientRects().length === 0)) {
        snapEl = null;
        setMode("idle");
      }
      // Vùng có nhãn động (thư viện 3D đổi nhãn theo thẻ đang rê tới): theo dõi thuộc tính mỗi khung hình
      if (viewEl) {
        if (!viewEl.isConnected || !viewEl.dataset.cursor) {
          viewEl = null;
          setMode("idle");
        } else setLabel(viewEl.dataset.cursorLabel ?? "");
      }

      // Đích của vòng
      let tx = px;
      let ty = py;
      let tw = IDLE_SIZE;
      let th = IDLE_SIZE;
      let tRound = 1;
      if (mode === "link") tw = th = LINK_SIZE;
      if (mode === "view") tw = th = BUBBLE_SIZE;
      if (mode === "snap" && snapEl) {
        const r = snapEl.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        // Vòng hơi nghiêng về phía chuột để có cảm giác "sống"
        tx = cx + (px - cx) * 0.12;
        ty = cy + (py - cy) * 0.12;
        tw = r.width + SNAP_PAD * 2;
        th = r.height + SNAP_PAD * 1.4;
        tRound = 0;
      }

      // Vị trí: nội suy theo thời gian; vận tốc lấy từ độ dời của vòng
      const ox = rx;
      const oy = ry;
      rx += (tx - rx) * kPos;
      ry += (ty - ry) * kPos;
      const vx = (rx - ox) / Math.max(dt, 0.001);
      const vy = (ry - oy) / Math.max(dt, 0.001);
      const speed = Math.hypot(vx, vy);
      const tech = root.dataset.space === "on";
      const stretching = !tech && (mode === "idle" || mode === "link");
      const tStretch = stretching ? Math.min(speed / 2600, 0.5) : 0;
      stretch += (tStretch - stretch) * (1 - Math.exp(-dt * 11));
      if (stretching) {
        if (speed > 140) angle = Math.atan2(vy, vx);
      } else {
        angle = 0; // nút/bong bóng không xoay (vòng tròn xoay về 0 không nhìn thấy)
      }

      w += (tw - w) * kSize;
      h += (th - h) * kSize;
      round += (tRound - round) * kSize;
      rad += (snapRadius - rad) * kSize;
      const radius = tech ? 0 : round * (Math.min(w, h) / 2) + (1 - round) * Math.min(rad, Math.min(w, h) / 2);
      press += ((pressed ? 1 : 0) - press) * (1 - Math.exp(-dt * 22));

      // Mức hiện / ẩn của từng phần
      const hidden = mode === "text" || !pointer.inside || document.visibilityState !== "visible";
      shown += ((hidden ? 0 : 1) - shown) * kFade;
      ringAlpha += ((mode === "view" ? 0 : 1) - ringAlpha) * kFade;
      dotAlpha += ((mode === "view" || mode === "snap" ? 0 : 1) - dotAlpha) * kFade;
      bubbleScale += ((mode === "view" ? 1 : 0) - bubbleScale) * (1 - Math.exp(-dt * 12));

      const squash = 1 - press * 0.16;
      ring.style.width = `${w.toFixed(1)}px`;
      ring.style.height = `${h.toFixed(1)}px`;
      ring.style.borderRadius = `${radius.toFixed(1)}px`;
      ring.style.opacity = (ringAlpha * shown).toFixed(3);
      ring.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0) rotate(${angle.toFixed(3)}rad) scale(${((1 + stretch) * squash).toFixed(3)}, ${((1 - stretch * 0.45) * squash).toFixed(3)}) translate(-50%, -50%)`;

      dot.style.opacity = (dotAlpha * shown).toFixed(3);
      dot.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) translate(-50%, -50%)`;

      bubble.style.opacity = (Math.min(1, bubbleScale * 1.4) * shown).toFixed(3);
      bubble.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0) scale(${(bubbleScale * squash).toFixed(3)}) translate(-50%, -50%)`;
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      stopMove();
      scrambleTween?.kill();
      document.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", onBlur);
      delete root.dataset.cursorOn;
      delete root.dataset.cursorState;
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      {/* Lớp hòa trộn "difference": chấm và vòng luôn tương phản trên cả nền giấy lẫn nền mực */}
      <div ref={blendRef} aria-hidden className="cursor-layer cursor-blend pointer-events-none fixed inset-0 z-[80]">
        <div ref={ringRef} className="cursor-ring" />
        <div ref={dotRef} className="cursor-dot" />
      </div>
      {/* Lớp màu thật: bong bóng có nhãn (không bị đảo màu) */}
      <div aria-hidden className="cursor-layer pointer-events-none fixed inset-0 z-[81]">
        <div ref={bubbleRef} className="cursor-bubble">
          <span ref={labelRef} className="cursor-label label" />
        </div>
      </div>
    </>
  );
}
