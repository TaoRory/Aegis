"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

/**
 * Link nội bộ của website chính. Mọi liên kết giữa các trang đi qua đây, để hiệu ứng chuyển trang gắn vào một chỗ:
 * - trong website: loại "d3-nav" (kiểu tấm màn; header đứng yên). CSS: src/styles/demo3/shell.css;
 * - sang các bản demo cũ còn giữ (/demo1, /demo2, /mau-giao-dien…): loại "aegis-forward" của giao diện cũ.
 * Là Client Component nên truyền được làm `as={D3Link}` cho <Rise> từ Server Component.
 */
const LEGACY = ["/demo", "/demo1", "/demo2", "/mau-giao-dien", "/factory", "/web/factory", "/en/"];

export function D3Link(props: ComponentProps<typeof Link>) {
  const href = typeof props.href === "string" ? props.href : (props.href.pathname ?? "");
  const legacy = LEGACY.some((root) => href === root || href.startsWith(root.endsWith("/") ? root : `${root}/`));
  const type = legacy ? "aegis-forward" : "d3-nav";
  return <Link transitionTypes={[type]} {...props} />;
}
