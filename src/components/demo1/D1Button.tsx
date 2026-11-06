import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { ArrowRight, ArrowUpRight } from "./icons";

/**
 * Nút /demo1: "ink" (nền mực, ô mũi tên bên phải) cho hành động chính, "soft" (nền giấy đậm) cho hành động phụ.
 * Link ra ngoài (http…) tự mở tab mới, mũi tên chéo.
 */
export function D1Button({
  href,
  children,
  variant = "ink",
  icon = true,
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: "ink" | "soft";
  icon?: boolean;
  className?: string;
}) {
  const external = /^https?:\/\//.test(href);
  const content = (
    <>
      <span>{children}</span>
      {icon && <span className="d1-btn-icon">{external ? <ArrowUpRight /> : <ArrowRight />}</span>}
    </>
  );
  const classes = cn("d1-btn", variant === "ink" ? "d1-btn-ink" : "d1-btn-soft", !icon && "pr-4", className);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
