"use client";

import { createContext, useContext, type ReactNode } from "react";

import { factoryHref } from "@/config/space";
import type { FactoryUi } from "@/content/factory/types";

const FactoryContext = createContext<FactoryUi | null>(null);

/** Chữ giao diện + ngôn ngữ của Factory cho các thành phần client (layout truyền xuống một lần) */
export function FactoryProvider({ ui, children }: { ui: FactoryUi; children: ReactNode }) {
  return <FactoryContext.Provider value={ui}>{children}</FactoryContext.Provider>;
}

export function useFactory() {
  const ui = useContext(FactoryContext);
  if (!ui) throw new Error("useFactory phải nằm trong FactoryProvider");
  return { ui, lang: ui.lang, href: (sub = "") => factoryHref(ui.lang, sub) };
}
