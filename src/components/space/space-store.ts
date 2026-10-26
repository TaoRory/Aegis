import { resolveZone, type ZoneId } from "@/config/space";

/**
 * Kênh trạng thái nhỏ của Xưởng (mô phỏng src/components/webgl/stage-store.ts).
 * URL là nguồn sự thật: RouteSync ghi zone/focus từ pathname; engine 3D, HUD, bản phẳng chỉ đọc.
 * Vị trí hotspot mỗi khung hình KHÔNG đi qua đây (engine ghi thẳng transform lên phần tử DOM).
 */

export type SpaceMode = "flat" | "3d";
export type BootPhase = "idle" | "playing" | "done";

interface SpaceState {
  zone: ZoneId;
  focus: string | null;
  pathname: string;
  /** true sau lần đổi route đầu tiên: dùng để chỉ chuyển focus vào panel khi điều hướng phía client */
  navigated: boolean;
  mode: SpaceMode;
  /** Cảnh 3D đã dựng xong (shader/texture sẵn sàng), chưa chắc đã hiện */
  ready: boolean;
  /** Màn mở đầu của cảnh đã chạy xong: bản phẳng ẩn đi, hotspot hiện */
  staged: boolean;
  /** id hotspot đang rê chuột tới trong cảnh 3D */
  hover: string | null;
  /** Lý do chuyển bản phẳng tự động (hiện thông báo); null nếu do người dùng chọn hoặc đang chạy 3D */
  flatReason: string | null;
  bootPhase: BootPhase;
  /** Tiến độ dựng cảnh 3D 0..1 (do engine báo); -1 = không có engine, màn khởi động chạy theo thời gian */
  bootProgress: number;
  /** Tạm dừng render 3D (thí nghiệm dùng GPU, sheet mobile mở hết cỡ…) */
  paused: boolean;
  /** Điểm màn hình của nút vừa bấm (panel thu về đó khi đóng) */
  lastTrigger: { x: number; y: number } | null;
}

const state: SpaceState = {
  zone: "hub",
  focus: null,
  pathname: "/factory",
  navigated: false,
  mode: "flat",
  ready: false,
  staged: false,
  hover: null,
  flatReason: null,
  bootPhase: "idle",
  bootProgress: -1,
  paused: false,
  lastTrigger: null,
};

const holders = new Set<string>();

type Listener = () => void;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());

export const spaceStore = {
  get: () => state,
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setRoute(pathname: string) {
    if (pathname === state.pathname) return;
    const { zone, focus } = resolveZone(pathname);
    // Lần ghi đầu (khi mount) chỉ đồng bộ, không tính là "đã điều hướng"
    state.navigated = state.navigated || state.pathname !== pathname;
    state.pathname = pathname;
    state.zone = zone;
    state.focus = focus;
    emit();
  },
  /** Đồng bộ lần đầu khi mount (không đánh dấu navigated) */
  initRoute(pathname: string) {
    const { zone, focus } = resolveZone(pathname);
    state.pathname = pathname;
    state.zone = zone;
    state.focus = focus;
    emit();
  },
  /**
   * Giữ/nhả quyền "tạm dừng cảnh 3D" theo khóa: cảnh chỉ chạy lại khi mọi bên đã nhả
   * (thí nghiệm đang dùng GPU, sheet mobile mở hết cỡ…).
   */
  hold(key: string) {
    holders.add(key);
    spaceStore.set("paused", true);
  },
  release(key: string) {
    holders.delete(key);
    spaceStore.set("paused", holders.size > 0);
  },
  set<K extends keyof SpaceState>(key: K, value: SpaceState[K]) {
    if (state[key] === value) return;
    state[key] = value;
    emit();
  },
};

/** Giá trị snapshot cho SSR: luôn là trạng thái mặc định (hub, bản phẳng) để không lệch hydration */
export const serverSpaceState: SpaceState = { ...state };
