/**
 * Một vòng requestAnimationFrame chung cho mọi canvas ký tự của /demo1.
 * Mỗi job tự báo đang cần chạy hay không (đang hiện trên màn hình + đang có chuyển động); job đứng yên không tốn khung hình.
 * Số job đang chạy ghi vào html[data-d1-ascii] để QA kiểm tra "mỗi lúc chỉ một canvas chạy".
 */

export interface AsciiJob {
  /** Số khung hình/giây tối đa của job */
  fps: number;
  /** true khi job cần được vẽ ở khung này (đang hiện + có chuyển động) */
  active: () => boolean;
  tick: (t: number) => void;
  last?: number;
}

const jobs = new Set<AsciiJob>();
let raf = 0;

function loop(t: number) {
  raf = 0;
  if (document.hidden) {
    document.documentElement.dataset.d1Ascii = "0";
    return;
  }
  let running = 0;
  for (const job of jobs) {
    if (!job.active()) continue;
    running++;
    if (job.last === undefined || t - job.last >= 1000 / job.fps - 2) {
      job.last = t;
      job.tick(t);
    }
  }
  document.documentElement.dataset.d1Ascii = String(running);
  if (running) raf = requestAnimationFrame(loop);
}

/** Đánh thức vòng lặp (gọi khi một job vừa có việc: hiện ra, chuột di chuyển, đổi nguồn hình…) */
export function wakeAscii() {
  if (!raf && typeof window !== "undefined") raf = requestAnimationFrame(loop);
}

export function registerAscii(job: AsciiJob) {
  jobs.add(job);
  wakeAscii();
  return () => {
    jobs.delete(job);
  };
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) wakeAscii();
  });
}
