import type { SpaceEngine } from "@/components/space/engine/space-engine";

/**
 * Tham chiếu dùng chung tới engine 3D (singleton). Chỉ import KIỂU từ engine nên không kéo three vào chunk chính:
 * three nằm trong chunk tải lười khi SceneCanvas gọi import("./engine/space-engine").
 */
let engine: SpaceEngine | null = null;
let creating: Promise<SpaceEngine> | null = null;
let disposeTimer: number | undefined;

export const engineRef = {
  get current() {
    return engine;
  },
  set(value: SpaceEngine | null) {
    engine = value;
  },
  get creating() {
    return creating;
  },
  setCreating(value: Promise<SpaceEngine> | null) {
    creating = value;
  },
  /** Hẹn giải phóng engine sau `ms` nếu không ai gắn lại (người dùng rời Xưởng) */
  scheduleDispose(ms: number) {
    window.clearTimeout(disposeTimer);
    disposeTimer = window.setTimeout(() => {
      engine?.dispose();
      engine = null;
      creating = null;
    }, ms);
  },
  cancelDispose() {
    window.clearTimeout(disposeTimer);
  },
};
