import { useId } from "react";

import { MARK_CORE, MARK_IMAGE, MARK_OUTER, MARK_SEGMENTS, MARK_VIEWBOX, WORDMARK_LETTERS, WORDMARK_VIEWBOX } from "@/components/brand/mark-data";
import { cn } from "@/lib/cn";

/**
 * Logo Aegis dựng từ emblem chính thức (xem mark-data.ts). Biến thể:
 *   glass    — bề mặt kính thật của emblem (ảnh gốc cắt theo từng mảnh vector): logo lớn, intro, màn chuyển trang, footer
 *   gradient — 7 mảnh vector tô gradient gần đúng (khi không muốn tải ảnh)
 *   teal     — một màu Transformative Teal, giữ khe gấp giữa các mảnh (favicon, kích thước nhỏ)
 *   mono     — một màu theo currentColor, giữ khe gấp (header dùng mix-blend nên chỉ dùng bản này)
 * Mỗi mảnh là một nhóm có data-seg để animation (mark-motion.ts) điều khiển từng phần; viền ngoài có data-rim.
 */
export type MarkVariant = "glass" | "gradient" | "teal" | "mono";

const VB = MARK_VIEWBOX.split(" ").map(Number);

export function AegisMarkPaths({ variant = "glass", idPrefix, small = false }: { variant?: MarkVariant; idPrefix: string; small?: boolean }) {
  const gid = (name: string) => `${idPrefix}-${name}`;
  if (variant === "mono" || variant === "teal") {
    // Một màu: hình lục giác trừ lõi, cắt khe mảnh 5 đơn vị dọc các đường gấp (trong suốt thật, nên đứng được trên mọi nền / blend)
    const fill = variant === "teal" ? "var(--palette-teal)" : "currentColor";
    return (
      <>
        <defs>
          <mask id={gid("flat")} maskUnits="userSpaceOnUse" x={VB[0]} y={VB[1]} width={VB[2]} height={VB[3]}>
            <path d={MARK_OUTER} fill="#fff" />
            <path d={MARK_CORE.d} fill="#000" />
            {MARK_SEGMENTS.map((seg) => (
              <path key={seg.id} d={seg.d} fill="none" stroke="#000" strokeWidth={10} strokeLinejoin="round" />
            ))}
          </mask>
        </defs>
        <g data-mark-body mask={`url(#${gid("flat")})`}>
          {MARK_SEGMENTS.map((seg) => (
            <path key={seg.id} data-seg={seg.id} d={seg.d} fill={fill} />
          ))}
        </g>
      </>
    );
  }

  return (
    <>
      <defs>
        {/* Mỗi mảnh là một mask (nở 1.5 đơn vị để các mảnh khít nhau, không lộ khe tối) */}
        {MARK_SEGMENTS.map((seg) => (
          <mask key={seg.id} id={gid(seg.id)} maskUnits="userSpaceOnUse" x={VB[0]} y={VB[1]} width={VB[2]} height={VB[3]}>
            <path d={seg.d} fill="#fff" stroke="#fff" strokeWidth={3} strokeLinejoin="round" />
          </mask>
        ))}
        {variant === "gradient" && (
          <>
            {MARK_SEGMENTS.map((seg) => (
              <linearGradient key={seg.id} id={gid(`g-${seg.id}`)} gradientUnits="userSpaceOnUse" x1={seg.gradient.x1} y1={seg.gradient.y1} x2={seg.gradient.x2} y2={seg.gradient.y2}>
                {seg.gradient.stops.map(([offset, color]) => (
                  <stop key={offset} offset={offset} stopColor={color} />
                ))}
              </linearGradient>
            ))}
            <mask id={gid("shape")} maskUnits="userSpaceOnUse" x={VB[0]} y={VB[1]} width={VB[2]} height={VB[3]}>
              <path d={MARK_OUTER} fill="#fff" />
              <path d={MARK_CORE.d} fill="#000" />
            </mask>
          </>
        )}
      </defs>
      <g data-mark-body mask={variant === "gradient" ? `url(#${gid("shape")})` : undefined}>
        {MARK_SEGMENTS.map((seg) => (
          <g key={seg.id} data-seg={seg.id} mask={`url(#${gid(seg.id)})`}>
            {variant === "glass" ? (
              <image href={small ? MARK_IMAGE.small : MARK_IMAGE.href} x={MARK_IMAGE.x} y={MARK_IMAGE.y} width={MARK_IMAGE.width} height={MARK_IMAGE.height} preserveAspectRatio="none" />
            ) : (
              <path d={seg.d} fill={`url(#${gid(`g-${seg.id}`)})`} stroke={`url(#${gid(`g-${seg.id}`)})`} strokeWidth={3} />
            )}
          </g>
        ))}
      </g>
      {/* Viền sáng ngoài (ẩn sẵn, animation vẽ nét rồi mờ đi) */}
      <path data-rim d={MARK_OUTER} fill="none" stroke="var(--palette-soft)" strokeWidth={3} pathLength={1} opacity={0} />
    </>
  );
}

export function AegisMark({ variant = "glass", small, className }: { variant?: MarkVariant; small?: boolean; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox={MARK_VIEWBOX} aria-hidden className={cn("aegis-mark", className)}>
      <AegisMarkPaths variant={variant} idPrefix={id} small={small} />
    </svg>
  );
}

/** Chữ AEGIS đã outline (không phụ thuộc font), tô bằng currentColor */
export function AegisWordmark({ className }: { className?: string }) {
  return (
    <svg viewBox={WORDMARK_VIEWBOX} aria-hidden className={cn("aegis-wordmark", className)} fill="currentColor">
      {WORDMARK_LETTERS.map((d, index) => (
        <path key={index} data-letter={index} d={d} />
      ))}
    </svg>
  );
}

/** Logo ngang: biểu tượng + chữ. Tên đọc cho trình đọc màn hình do thẻ bao ngoài (link) cung cấp. */
export function AegisLogo({ variant = "glass", className }: { variant?: MarkVariant; className?: string }) {
  return (
    <span className={cn("aegis-logo", className)}>
      <AegisMark variant={variant} small />
      <AegisWordmark />
    </span>
  );
}
