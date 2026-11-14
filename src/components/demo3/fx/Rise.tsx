"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

/**
 * "Trồi lên" khi vào màn hình mà KHÔNG giấu chữ.
 *   <Rise>…</Rise>                       dịch lên 3rem
 *   <Rise kind="pop">…</Rise>            dịch lên + phóng từ 95%
 *   <Rise kind="wipe">…</Rise>           lộ dần bằng clip-path (CHỈ cho hình trang trí, logo, ảnh; không dùng cho chữ nội dung)
 *   <Rise as="article" index={2} className="card">…</Rise>   đổi thẻ, so le theo thứ tự trong nhóm (mỗi bậc 80ms)
 *
 * Khối chưa tới chỉ bị dịch chuyển (transform), opacity vẫn là 1, nên người dùng và công cụ tìm kiếm luôn đọc được chữ.
 * Vào màn hình: component tự đặt data-in, CSS (motion.css) đưa khối về chỗ.
 * Trạng thái chờ chỉ có dưới html[data-motion="on"]: không JS / giảm chuyển động thì mọi thứ đứng đúng chỗ ngay từ đầu.
 *
 * Vì sao là component chứ không phải một bộ quan sát toàn trang gắn thuộc tính lên mọi [data-rise]:
 * gắn thuộc tính bằng tay lên phần tử React chưa hydrate xong sẽ gây cảnh báo "hydration mismatch" (đã gặp thật).
 * Ở đây thuộc tính đi qua state nên React tự quản. Mọi <Rise> dùng chung MỘT IntersectionObserver.
 * `children` có thể là Server Component: chỉ lớp vỏ này chạy ở client.
 */

const waiting = new Map<Element, () => void>();
let observer: IntersectionObserver | null = null;

function watch(el: Element, onEnter: () => void) {
  if (typeof IntersectionObserver === "undefined") {
    const timer = window.setTimeout(onEnter, 0);
    return () => window.clearTimeout(timer);
  }
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        waiting.get(entry.target)?.();
        waiting.delete(entry.target);
        observer?.unobserve(entry.target);
      }
    },
    // Chờ khối vào sâu 6% chiều cao màn hình rồi mới chạy, để người xem kịp thấy chuyển động
    { rootMargin: "0px 0px -6% 0px" },
  );
  waiting.set(el, onEnter);
  observer.observe(el);
  return () => {
    waiting.delete(el);
    observer?.unobserve(el);
  };
}

export function Rise({
  as: Tag = "div",
  kind = "up",
  index = 0,
  style,
  children,
  ...rest
}: {
  as?: ElementType;
  kind?: "up" | "pop" | "wipe";
  /** Thứ tự trong nhóm để so le (0, 1, 2…) */
  index?: number;
  style?: CSSProperties;
  children?: ReactNode;
  [prop: string]: unknown;
}) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return watch(el, () => setInView(true));
  }, []);

  return (
    <Tag ref={ref} {...rest} data-rise={kind} data-in={inView ? "" : undefined} style={index ? ({ ...style, "--rise-i": index } as CSSProperties) : style}>
      {children}
    </Tag>
  );
}
