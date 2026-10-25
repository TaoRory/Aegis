"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { DemoTemplate } from "@/content/templates";
import { cn } from "@/lib/cn";

/**
 * Thanh nổi trên mọi trang mẫu: luôn ghi rõ đây là MẪU DEMO với thương hiệu giả định,
 * kèm đường quay lại thư viện và liên hệ Aegis. Dùng token của Aegis (không theo theme mẫu).
 * Thu gọn khi cuộn xuống (không che nội dung), mở lại khi cuộn lên hoặc gần cuối trang.
 */
export function DemoBar({ template, index }: { template: DemoTemplate; index: number }) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const nearEnd = y + window.innerHeight > document.documentElement.scrollHeight - 400;
      if (Math.abs(y - lastY) < 6) return;
      setCompact(y > lastY && y > 200 && !nearEnd);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      data-surface="dark"
      className={cn(
        "demo-bar fixed z-[70] transition-[left,right,transform] duration-500 ease-[cubic-bezier(0.7,0,0.2,1)]",
        compact ? "right-4 bottom-4" : "right-4 bottom-4 sm:right-auto sm:left-1/2 sm:-translate-x-1/2",
      )}
    >
      <div className="label flex items-center gap-3 rounded-sm border border-line-strong bg-bg/90 px-3 py-2 whitespace-nowrap text-muted backdrop-blur-md sm:gap-4">
        <Link href="/mau-giao-dien" transitionTypes={["aegis-back"]} className="text-fg transition-colors hover:text-accent">
          ← <span className={cn(compact && "sr-only")}>Thư viện</span>
        </Link>
        <span aria-hidden className="h-3 w-px bg-line-strong" />
        <span className="text-accent">
          Demo {template.name} /{String(index + 1).padStart(2, "0")}
        </span>
        <span className={cn("hidden lg:inline", compact && "lg:hidden")}>· {template.brand} là thương hiệu giả định</span>
        <span aria-hidden className={cn("hidden h-3 w-px bg-line-strong md:block", compact && "md:hidden")} />
        <Link href="/lien-he" transitionTypes={["aegis-forward"]} className={cn("hidden text-fg transition-colors hover:text-accent md:inline", compact && "md:hidden")}>
          Trao đổi với Aegis ↗
        </Link>
      </div>
    </div>
  );
}
