import type { ComponentProps } from "react";
import Link from "next/link";

/** Loại điều hướng cho View Transitions (xem PageTransition.tsx) */
export type NavType = "aegis-forward" | "aegis-back" | "aegis-open";

/** Đường dẫn nội bộ của website (không phải link ngoài, mailto, tel…) */
export function isInternalHref(href: string | undefined): href is string {
  return !!href && href.startsWith("/") && !href.startsWith("//");
}

/**
 * Link cùng trang ("#id") dùng <a> thường để Lenis cuộn mượt;
 * link sang trang khác dùng next/link để điều hướng phía client (kèm hiệu ứng chuyển trang).
 */
export function SmartLink({
  href,
  navType = "aegis-forward",
  ...props
}: Omit<ComponentProps<"a">, "href"> & { href: string; navType?: NavType }) {
  if (!isInternalHref(href)) return <a href={href} {...props} />;
  return <Link href={href} transitionTypes={[navType]} {...props} />;
}

/** "/#id" hoặc "/en#id" → "#id" khi đang ở chính trang đó (để cuộn tại chỗ), giữ nguyên ở trang khác */
export function localizeHref(href: string, pathname: string) {
  const hash = href.indexOf("#");
  if (hash < 0) return href;
  const base = href.slice(0, hash).replace(/\/+$/, "") || "/";
  const here = pathname.replace(/\/+$/, "") || "/";
  return base === here ? href.slice(hash) : href;
}
