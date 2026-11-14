"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Hai sự kiện lăn chuột cách nhau quá ngần này (ms) thì coi là một lần lăn mới */
const GESTURE_GAP = 180;

/**
 * Khung xem ảnh chụp toàn trang của dự án: một "cửa sổ trình duyệt" có thanh địa chỉ thật, bên trong tự cuộn (cuộn gốc của trình duyệt).
 * Đặt trong <figure>: component dựng cả <figcaption> (nhãn + gợi ý cuộn) lẫn cửa sổ.
 *
 * Vì sao cần JS: Lenis làm mượt cuộn của cả trang nên sẽ nuốt mọi lần lăn chuột, kể cả khi con trỏ đang ở trong khung.
 * data-lenis-prevent bảo Lenis bỏ qua khung này. Nhưng gắn cứng thuộc tính đó thì khi khung đã cuộn tới đầu / cuối,
 * lăn tiếp sẽ rơi về cuộn gốc của trang (giật, mất quán tính) hoặc kẹt hẳn. Ở đây mỗi LẦN LĂN có một "chủ":
 * - lần lăn bắt đầu trong khung và khung còn chỗ cuộn theo hướng đó: khung là chủ (giữ data-lenis-prevent);
 * - còn lại (khung đã tới đầu / cuối, hoặc người xem đang cuộn trang và con trỏ chỉ lướt ngang qua khung): trang là chủ,
 *   thuộc tính được gỡ để Lenis cuộn trang mượt như mọi chỗ khác.
 * Chủ giữ nguyên tới hết lần lăn, giống cách trình duyệt "chốt" vùng cuộn, nên không có cú nhảy giữa chừng.
 * Không Lenis (giảm chuyển động, cảm ứng, không JS): khung cuộn gốc và tự nhường cho trang ở hai đầu, không cần gì thêm.
 *
 * Vạch tiến độ trên thanh địa chỉ cho biết đã xem tới đâu của trang (chỉ transform).
 * Trang ngắn hơn khung (màn hình rất cao): không có gì để cuộn nên bỏ gợi ý và bỏ điểm dừng Tab.
 */
export function WorkLongFrame({ label, hint, host, children }: { label: string; hint: string; host: string; children: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [scrollable, setScrollable] = useState(true);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    let owner: "page" | "frame" = "frame";
    let last = -Infinity;
    const onWheel = (event: WheelEvent) => {
      // Chụm để phóng to (ctrl + lăn) và lăn ngang: không phải việc của khung này
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (event.timeStamp - last > GESTURE_GAP) {
        const inside = event.target instanceof Node && frame.contains(event.target);
        const room = event.deltaY > 0 ? frame.scrollTop < frame.scrollHeight - frame.clientHeight - 1 : frame.scrollTop > 0;
        owner = inside && room ? "frame" : "page";
      }
      last = event.timeStamp;
      frame.toggleAttribute("data-lenis-prevent", owner === "frame");
    };
    // capture trên window: chạy trước listener của Lenis (cũng nằm trên window) để kịp đổi thuộc tính cho chính sự kiện này
    window.addEventListener("wheel", onWheel, { capture: true, passive: true });

    const onScroll = () => {
      const max = frame.scrollHeight - frame.clientHeight;
      barRef.current?.style.setProperty("--long-p", max > 0 ? (frame.scrollTop / max).toFixed(4) : "0");
    };
    frame.addEventListener("scroll", onScroll, { passive: true });

    // Ảnh tải xong hoặc đổi kích thước cửa sổ: xem khung còn gì để cuộn không
    const measure = () => setScrollable(frame.scrollHeight > frame.clientHeight + 1);
    const sizes = new ResizeObserver(measure);
    sizes.observe(frame);
    if (frame.firstElementChild) sizes.observe(frame.firstElementChild);

    return () => {
      window.removeEventListener("wheel", onWheel, { capture: true });
      frame.removeEventListener("scroll", onScroll);
      sizes.disconnect();
    };
  }, []);

  return (
    <>
      <figcaption className="d2-small font-semibold text-muted">
        <span>{label}</span>
        {scrollable && <span className="d3-long-hint">{hint}</span>}
      </figcaption>
      <div className="d3-long-window">
        <div className="d2-shot-bar d3-long-bar" aria-hidden>
          <i />
          <i />
          <i />
          <span className="d3-long-url">{host}</span>
          <span ref={barRef} className="d3-long-progress" />
        </div>
        <div ref={frameRef} className="d3-long-scroll" tabIndex={scrollable ? 0 : undefined} role="group" aria-label={label} data-lenis-prevent="">
          {children}
        </div>
      </div>
    </>
  );
}
