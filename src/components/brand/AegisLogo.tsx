import { useId } from "react";

import { MARK_CORE, MARK_IMAGE, MARK_OUTER, MARK_SEGMENTS, MARK_VIEWBOX } from "@/components/brand/mark-data";
import { cn } from "@/lib/cn";

/**
 * Logo Aegis dựng từ emblem chính thức (xem mark-data.ts). Biến thể:
 *   glass — bề mặt kính thật của emblem (ảnh gốc đã cắt sạch viền): logo ở header, footer, intro, màn chuyển trang
 *   teal  — một màu Transformative Teal, giữ khe gấp giữa các mảnh
 *   mono  — một màu theo currentColor, giữ khe gấp
 * Dạng tĩnh chỉ vẽ MỘT ảnh nguyên khối (không có đường nối giữa các mảnh). Khi cần animation lắp ráp (`pieces`), 7 mảnh vector được
 * vẽ bằng cách cắt chính ảnh đó (data-seg); animation xong thì chuyển sang ảnh nguyên khối (data-whole) để không còn đường nối nào.
 */
export type MarkVariant = "glass" | "teal" | "mono";

const VB = MARK_VIEWBOX.split(" ").map(Number);
const SHAPE = `${MARK_OUTER} ${MARK_CORE.d}`;

export function AegisMarkPaths({ variant = "glass", idPrefix, small = false, pieces = false }: { variant?: MarkVariant; idPrefix: string; small?: boolean; pieces?: boolean }) {
  const gid = (name: string) => `${idPrefix}-${name}`;
  if (variant !== "glass") {
    // Một màu: hình ngoài trừ lõi, khoét khe 10 đơn vị dọc các đường gấp (trong suốt thật, đứng được trên mọi nền)
    const fill = variant === "teal" ? "var(--palette-teal)" : "currentColor";
    return (
      <>
        <defs>
          <mask id={gid("flat")} maskUnits="userSpaceOnUse" x={VB[0]} y={VB[1]} width={VB[2]} height={VB[3]}>
            <path d={SHAPE} fill="#fff" fillRule="evenodd" />
            {MARK_SEGMENTS.map((seg) => (
              <path key={seg.id} d={seg.d} fill="none" stroke="#000" strokeWidth={10} strokeLinejoin="round" />
            ))}
          </mask>
        </defs>
        <g data-mark-body mask={`url(#${gid("flat")})`}>
          <path d={SHAPE} fill={fill} fillRule="evenodd" />
        </g>
      </>
    );
  }

  const href = small ? MARK_IMAGE.small : MARK_IMAGE.href;
  const image = <image href={href} x={MARK_IMAGE.x} y={MARK_IMAGE.y} width={MARK_IMAGE.width} height={MARK_IMAGE.height} preserveAspectRatio="none" />;
  return (
    <>
      {pieces && (
        <>
          <defs>
            {/* Mỗi mảnh là một mask (nở 1.5 đơn vị để các mảnh khít nhau); alpha của ảnh tự cắt phần thừa ngoài viền */}
            {MARK_SEGMENTS.map((seg) => (
              <mask key={seg.id} id={gid(seg.id)} maskUnits="userSpaceOnUse" x={VB[0]} y={VB[1]} width={VB[2]} height={VB[3]}>
                <path d={seg.d} fill="#fff" stroke="#fff" strokeWidth={3} strokeLinejoin="round" />
              </mask>
            ))}
          </defs>
          <g data-mark-body>
            {MARK_SEGMENTS.map((seg) => (
              <g key={seg.id} data-seg={seg.id} mask={`url(#${gid(seg.id)})`}>
                {image}
              </g>
            ))}
          </g>
        </>
      )}
      <g data-whole opacity={pieces ? 0 : 1}>
        {image}
      </g>
    </>
  );
}

export function AegisMark({ variant = "glass", small, pieces, className }: { variant?: MarkVariant; small?: boolean; pieces?: boolean; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox={MARK_VIEWBOX} aria-hidden className={cn("aegis-mark", className)}>
      <AegisMarkPaths variant={variant} idPrefix={id} small={small} pieces={pieces} />
    </svg>
  );
}

/**
 * Chữ thương hiệu: văn bản thật bằng font của website (Bricolage Grotesque, giữ như trước khi áp guideline; không dùng chữ outline
 * của bộ kit). Mỗi ký tự là một span data-letter để animation điều khiển từng chữ.
 */
export function AegisWordmark({ text = "Aegis", className }: { text?: string; className?: string }) {
  return (
    <span aria-hidden className={cn("aegis-wordmark", className)}>
      {text.split("").map((char, index) => (
        <span key={index} data-letter={index} className="inline-block">
          {char}
        </span>
      ))}
    </span>
  );
}

/** Logo ngang: biểu tượng + chữ. Tên đọc cho trình đọc màn hình do thẻ bao ngoài (link) cung cấp. */
export function AegisLogo({ variant = "glass", className, markHidden = false }: { variant?: MarkVariant; className?: string; markHidden?: boolean }) {
  return (
    <span className={cn("aegis-logo", className)}>
      <AegisMark variant={variant} small className={markHidden ? "invisible" : undefined} />
      <AegisWordmark />
    </span>
  );
}
