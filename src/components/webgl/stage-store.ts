/**
 * Kênh trao đổi nhỏ giữa các section và sân khấu hạt (ParticleStage).
 * Section Dịch vụ ghi tiến độ chương (0..3); sân khấu đọc mỗi frame.
 */
type Listener = () => void;

const state = {
  /** Tiến độ trong chương Dịch vụ: 0 = AI, 1 = phần mềm, 2 = web, 3 = marketing (có phần thập phân khi đang morph) */
  servicePhase: 0,
};
const listeners = new Set<Listener>();

export const stageStore = {
  get servicePhase() {
    return state.servicePhase;
  },
  setServicePhase(value: number) {
    if (value === state.servicePhase) return;
    state.servicePhase = value;
    listeners.forEach((l) => l());
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
