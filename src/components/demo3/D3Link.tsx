"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

/**
 * Link nội bộ của /demo3. Mọi liên kết giữa các trang /demo3 đi qua đây, để hiệu ứng chuyển trang gắn vào một chỗ.
 * Là Client Component nên truyền được làm `as={D3Link}` cho <Rise> từ Server Component.
 */
export function D3Link(props: ComponentProps<typeof Link>) {
  return <Link {...props} />;
}
