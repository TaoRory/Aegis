"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function openFor(hash: string) {
  if (hash.length < 2) return;
  const target = document.getElementById(decodeURIComponent(hash.slice(1)));
  const details = target?.closest("details");
  if (details && !details.open) details.open = true;
}

/**
 * Link tới một mục <details> (vd. #dich-vu-web từ hàng dịch vụ ở màn đầu hoặc footer): mở mục đó trước khi cuộn tới.
 * Bắt lần bấm link (kể cả khi hash không đổi), khi đổi hash, và khi vừa chuyển sang trang có sẵn #hash.
 */
export function D1DetailsHash() {
  const pathname = usePathname();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[href*='#']");
      if (!link) return;
      const url = new URL(link.href, window.location.href);
      if (url.pathname === window.location.pathname) openFor(url.hash);
    };
    const onHash = () => openFor(window.location.hash);
    document.addEventListener("click", onClick, true);
    window.addEventListener("hashchange", onHash);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("hashchange", onHash);
    };
  }, []);

  useEffect(() => {
    openFor(window.location.hash);
  }, [pathname]);

  return null;
}
