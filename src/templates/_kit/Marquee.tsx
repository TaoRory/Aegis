import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Dải chữ chạy vô hạn (CSS thuần). Nội dung được nhân đôi; bản sao aria-hidden.
 * Dừng khi giảm chuyển động (xem templates/_kit/kit.css).
 */
export function Marquee({
  children,
  duration = 30,
  reverse = false,
  className,
}: {
  children: ReactNode;
  duration?: number;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("marquee", reverse && "marquee-reverse", className)} style={{ "--marquee-duration": `${duration}s` } as CSSProperties}>
      <div className="marquee-track">
        <div className="marquee-group">{children}</div>
        <div className="marquee-group" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
