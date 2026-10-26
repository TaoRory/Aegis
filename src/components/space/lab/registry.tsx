"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

import type { LabId } from "@/content/lab";

const loading = () => <p className="label text-muted">Đang lắp nguyên mẫu…</p>;

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
