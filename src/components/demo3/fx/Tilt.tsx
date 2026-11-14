"use client";

import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";

import { cx, MQ } from "@/lib/motion";

/**
 * Chiều sâu 3D theo con trỏ: cả khối nghiêng nhẹ về phía chuột, các lớp con nổi ở độ sâu khác nhau.
 * Không dùng thư viện: chỉ ghi hai biến CSS (--rx, --ry trong khoảng −1…1), phần còn lại là CSS (motion.css: .kit-tilt).
 * Lớp con muốn nổi: thêm class "kit-tilt-layer" và style={{ "--z": "40px" }}.
 * Chỉ chuột; cảm ứng và giảm chuyển động thì đứng yên. Dùng cho MỘT khối chính của trang (hình minh hoạ ở màn đầu, thẻ nổi bật).
 */
export function Tilt({ children, className, max = 6 }: { children: ReactNode; className?: string; /** Góc nghiêng tối đa (độ) */ max?: number }) {
  const innerRef = useRef<HTMLDivElement>(null);

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    const inner = innerRef.current;
    if (!inner || event.pointerType !== "mouse" || window.matchMedia(MQ.reduced).matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    inner.style.setProperty("--rx", (((event.clientX - rect.left) / rect.width) * 2 - 1).toFixed(3));
    inner.style.setProperty("--ry", (((event.clientY - rect.top) / rect.height) * 2 - 1).toFixed(3));
  };
  const onLeave = () => {
    innerRef.current?.style.removeProperty("--rx");
    innerRef.current?.style.removeProperty("--ry");
  };

  return (
    <div className={cx("kit-tilt", className)} onPointerMove={onMove} onPointerLeave={onLeave}>
      <div ref={innerRef} className="kit-tilt-inner" style={{ "--tilt-max": `${max}deg` } as CSSProperties}>
        {children}
      </div>
    </div>
  );
}
