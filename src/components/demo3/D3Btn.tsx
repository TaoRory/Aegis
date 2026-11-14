import type { MouseEventHandler } from "react";

import { D3Link } from "./D3Link";
import { ArrowSwap } from "./HomeArrowSwap";

/**
 * Nút của /demo3 (mọi nút dạng viên đi qua đây để cùng một cách phản hồi):
 * - chữ "cuộn" khi rê chuột: dòng chữ trượt lên, bản sao của nó vào từ dưới (.kit-roll, motion-kit.css);
 * - mũi tên "đi qua" (ArrowSwap);
 * - nhấn xuống thì nút lún nhẹ (CSS .d3-btn trong shell.css).
 * Bản sao chữ là aria-hidden nên trình đọc màn hình chỉ đọc một lần. Giảm chuyển động / cảm ứng: nút tĩnh như thường.
 *
 * tone: primary (lời mời chính, nền teal) · ink (nền tối) · line (viền, hành động phụ).
 * arrow: mặc định có mũi tên với primary / ink, không có với line. `external`: mở website ngoài ở tab mới, mũi tên chéo.
 */
export function D3Btn({
  href,
  tone = "primary",
  arrow,
  external = false,
  className,
  onClick,
  children,
}: {
  href: string;
  tone?: "primary" | "ink" | "line";
  arrow?: boolean;
  external?: boolean;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  children: string;
}) {
  const classes = `d2-btn d3-btn d2-btn-${tone}${className ? ` ${className}` : ""}`;
  const inner = (
    <>
      <span className="kit-roll">
        <span>{children}</span>
        <span aria-hidden>{children}</span>
      </span>
      {(arrow ?? tone !== "line") && <ArrowSwap dir={external ? "out" : "right"} />}
    </>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {inner}
      </a>
    );
  }
  return (
    <D3Link href={href} className={classes} onClick={onClick}>
      {inner}
    </D3Link>
  );
}
