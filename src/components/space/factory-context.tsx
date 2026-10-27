"use client";

import { createContext, useContext, type ReactNode } from "react";

import { factoryHref, type Variant } from "@/config/space";
import type { FactoryUi } from "@/content/factory/types";

interface FactoryValue {
  ui: FactoryUi;
  variant: Variant;
}

const FactoryContext = createContext<FactoryValue | null>(null);

/** Chữ giao diện, ngôn ngữ và bản (trung tính / web) của Factory cho các thành phần client (layout truyền xuống một lần) */
export function FactoryProvider({ ui, variant, children }: { ui: FactoryUi; variant: Variant; children: ReactNode }) {
  return <FactoryContext.Provider value={{ ui, variant }}>{children}</FactoryContext.Provider>;
}

export function useFactory() {
  const value = useContext(FactoryContext);
  if (!value) throw new Error("useFactory phải nằm trong FactoryProvider");
  const { ui, variant } = value;
  return { ui, lang: ui.lang, variant, href: (sub = "") => factoryHref(ui.lang, sub, variant) };
}
