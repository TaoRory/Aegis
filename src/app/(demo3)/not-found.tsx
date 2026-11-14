import type { Metadata } from "next";

import { D3NotFound } from "@/components/demo3/D3NotFound";

export const metadata: Metadata = { title: "404 — Aegis", robots: { index: false, follow: true } };

/** Không tìm thấy trong website chính (vd. địa chỉ dự án hoặc bài blog không có). Vỏ .d2 .d3 đã có từ layout của nhóm. */
export default function MainNotFound() {
  return <D3NotFound />;
}
