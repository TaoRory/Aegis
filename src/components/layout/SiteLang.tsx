"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { SiteShellDict } from "@/content/site";

const SiteLangContext = createContext<SiteShellDict | null>(null);

/** Chữ giao diện dùng chung của trang chính (header, cài đặt, màn chờ…) và ngôn ngữ hiện tại cho các thành phần client */
export function SiteLangProvider({ shell, children }: { shell: SiteShellDict; children: ReactNode }) {
  return <SiteLangContext.Provider value={shell}>{children}</SiteLangContext.Provider>;
}

export function useSite() {
  const shell = useContext(SiteLangContext);
  if (!shell) throw new Error("useSite phải nằm trong SiteLangProvider");
  return shell;
}
