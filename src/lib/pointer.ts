"use client";

/**
 * Nguồn vị trí chuột dùng chung: chỉ một listener `pointermove` cho cả website.
 * Con trỏ (Cursor), thước ngắm hero, khói (MistCursor)… đăng ký qua `onPointerMove` thay vì tự nghe sự kiện.
 * Callback nhận `null` khi con trỏ rời cửa sổ.
 */

export const pointer = { x: -100, y: -100, type: "", inside: false };

type Listener = (event: PointerEvent | null) => void;
const listeners = new Set<Listener>();
let attached = false;

function handleMove(event: PointerEvent) {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.type = event.pointerType;
  pointer.inside = true;
  listeners.forEach((listener) => listener(event));
}

function handleLeave() {
  pointer.inside = false;
  listeners.forEach((listener) => listener(null));
}

export function onPointerMove(listener: Listener) {
  listeners.add(listener);
  if (!attached) {
    attached = true;
    window.addEventListener("pointermove", handleMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handleLeave);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && attached) {
      attached = false;
      window.removeEventListener("pointermove", handleMove);
      document.documentElement.removeEventListener("pointerleave", handleLeave);
    }
  };
}
