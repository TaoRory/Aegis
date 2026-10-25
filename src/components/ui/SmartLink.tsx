import type { ComponentProps } from "react";
import Link from "next/link";

/**
 * Link cùng trang ("#id") dùng <a> thường để Lenis cuộn mượt;
 * link sang trang khác dùng next/link để điều hướng phía client.
 */
export function SmartLink({ href, ...props }: Omit<ComponentProps<"a">, "href"> & { href: string }) {
  if (href.startsWith("#")) return <a href={href} {...props} />;
  return <Link href={href} {...props} />;
}

/** "/#id" → "#id" khi đang ở trang chủ (để cuộn tại chỗ), giữ nguyên ở trang khác */
export function localizeHref(href: string, pathname: string) {
  return pathname === "/" && href.startsWith("/#") ? href.slice(1) : href;
}
