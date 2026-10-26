"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { spaceStore } from "@/components/space/space-store";

/**
 * Đọc pathname và ghi vào store (URL là nguồn sự thật). Phải nằm trong <Suspense>: với cacheComponents,
 * usePathname có thể treo lúc build nếu không bọc, và đặt ở lá nhỏ này để cả shell không bị ảnh hưởng.
 */
export function RouteSync() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      spaceStore.initRoute(pathname);
      return;
    }
    spaceStore.setRoute(pathname);
  }, [pathname]);

  return null;
}
