"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

import { useFactory } from "@/components/space/factory-context";
import type { LabId } from "@/content/lab";

function Loading() {
  const { ui } = useFactory();
  return <p className="label text-muted">{ui.lab.loading}</p>;
}
const loading = () => <Loading />;

/**
 * Bản đồ id → thành phần thí nghiệm. Mỗi thí nghiệm là một chunk riêng, chỉ tải khi mở trang của nó
 * (và không render phía server vì cần WebGL/con trỏ).
 */
export const experiments: Partial<Record<LabId, ComponentType>> = {
  "nen-mong": dynamic(() => import("@/components/space/lab/FoundationSandbox"), { ssr: false, loading }),
  "suong-mu": dynamic(() => import("@/components/space/lab/MistPad"), { ssr: false, loading }),
  "tach-mau": dynamic(() => import("@/components/space/lab/ChromaType"), { ssr: false, loading }),
  "dai-cong": dynamic(() => import("@/components/space/lab/BendStrip"), { ssr: false, loading }),
};
