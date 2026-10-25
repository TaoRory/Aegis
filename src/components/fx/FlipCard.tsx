"use client";

import { useState, type ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Thẻ lật hai mặt (bấm/Enter/Space để lật). Dùng cho từ vựng, FAQ ngắn, món ăn.
 * Là một nút bật/tắt (aria-pressed); nhãn đọc màn hình mô tả hành động.
 */
export function FlipCard({
  front,
  back,
  label,
  className,
}: {
  front: ReactNode;
  back: ReactNode;
  /** Ví dụ: "Lật thẻ: Ambitious" */
  label: string;
  className?: string;
}) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button type="button" aria-pressed={flipped} aria-label={label} onClick={() => setFlipped((v) => !v)} className={cn("flip-card block w-full text-left", className)}>
      <span className="flip-card-inner h-full">
        <span className="block h-full">{front}</span>
        <span className="block h-full" aria-hidden={!flipped}>
          {back}
        </span>
      </span>
    </button>
  );
}
