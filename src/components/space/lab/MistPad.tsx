"use client";

import { useState } from "react";

import { MistCursor } from "@/components/fx/MistCursor";
import { MQ } from "@/lib/motion";

function readToken(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
}

/**
 * Thí nghiệm 02: làn sương theo con trỏ (MistCursor) trong một khung riêng.
 * Cần chuột (thiết bị cảm ứng không có "rê"), nên có lời nhắn thay thế.
 */
export default function MistPad() {
  const [color] = useState(() => readToken("--palette-ultramarine-pale", "#b5b7ff"));
  const [canHover] = useState(() => window.matchMedia(`${MQ.fineHover} and ${MQ.anyMotion}`).matches);

  return (
    <div className="space-lab-fill" role="img" aria-label="Khung vẽ làn sương bằng con trỏ chuột">
      {canHover ? <MistCursor color={color} opacity={0.9} className="size-full" /> : null}
      <p className="label pointer-events-none absolute inset-x-0 bottom-4 text-center text-muted">
        {canHover ? "Rê chuột trong khung, rê nhanh để sương dày hơn" : "Thí nghiệm này cần con trỏ chuột hoặc đang bật giảm chuyển động"}
      </p>
    </div>
  );
}
