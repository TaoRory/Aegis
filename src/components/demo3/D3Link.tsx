"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

/**
 * Link nội bộ của /demo3. Mọi liên kết giữa các trang /demo3 đi qua đây, để hiệu ứng chuyển trang gắn vào một chỗ:
 * - trong /demo3: loại "d3-nav" (trang cũ lùi lên và mờ đi, trang mới trồi lên; header đứng yên). CSS: src/styles/demo3/shell.css;
 * - ra ngoài /demo3 (trang chính, /demo1): loại "aegis-forward" của trang chính.
 * Là Client Component nên truyền được làm `as={D3Link}` cho <Rise> từ Server Component.
 */
export function D3Link(props: ComponentProps<typeof Link>) {
  const href = typeof props.href === "string" ? props.href : (props.href.pathname ?? "");
  const type = href === "/demo3" || href.startsWith("/demo3/") ? "d3-nav" : "aegis-forward";
  return <Link transitionTypes={[type]} {...props} />;
}
