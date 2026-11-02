import { useId } from "react";

import { cn } from "@/lib/cn";

/**
 * Logo Aegis theo Brand Guideline: biểu tượng lục giác "dải Möbius" sáu cánh, lõi mở (bảo vệ mà vẫn mở) + chữ AEGIS giãn rộng.
 * Bản vector VẼ LẠI gần đúng từ ảnh guideline (Brand-guideline/), chưa phải file gốc của designer: khi có SVG chính thức, thay BLADE.
 *
 * Biến thể (theo mục Logo Variations):
 *   color — teal chuyển sắc (Aqua Glow → Transformative Teal → teal sâu), dùng trên nền Deep Ink Teal hoặc nền sáng
 *   mono  — một màu theo currentColor (header dùng mix-blend nên chỉ dùng bản một màu)
 */

/** Một cánh: cạnh ngoài thẳng (viền lục giác), hai cạnh chéo cong nhẹ như dải lụa xoắn; xoay 6 lần quanh tâm */
const BLADE = "M0.93 -42.5L36.75 -21.82Q23.11 -13.12 14.9 0.83L9.61 -12.25Q8.9 -28.41 0.93 -42.5Z";

export function AegisMark({ variant = "color", className }: { variant?: "color" | "mono"; className?: string }) {
  const id = useId();
  const fill = variant === "color" ? `url(#${id})` : "currentColor";
  return (
    <svg viewBox="-50 -50 100 100" aria-hidden className={cn("aegis-mark", className)}>
      {variant === "color" && (
        <defs>
          <linearGradient id={id} x1="19.8" y1="-34.29" x2="14.72" y2="-2.86" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="var(--palette-aqua)" />
            <stop offset="0.5" stopColor="var(--palette-teal)" />
            <stop offset="1" stopColor="var(--palette-teal-darker)" />
          </linearGradient>
        </defs>
      )}
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <path key={deg} d={BLADE} fill={fill} stroke={fill} strokeWidth={2.4} strokeLinejoin="round" transform={`rotate(${deg})`} />
      ))}
    </svg>
  );
}

/** Biểu tượng + chữ AEGIS. Chữ là văn bản thật (font thương hiệu), tên đọc cho trình đọc màn hình do thẻ bao ngoài (link) cung cấp. */
export function AegisLogo({ variant = "color", className }: { variant?: "color" | "mono"; className?: string }) {
  return (
    <span className={cn("aegis-logo", className)}>
      <AegisMark variant={variant} />
      <span className="aegis-logo-word">AEGIS</span>
    </span>
  );
}
