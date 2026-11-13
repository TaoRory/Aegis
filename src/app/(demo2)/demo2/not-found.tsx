import type { Metadata } from "next";
import Link from "next/link";

import { D2Shell } from "@/components/demo2/D2Pages";
import { d2Href, getD2 } from "@/content/demo2";

export const metadata: Metadata = { title: "404 — Aegis", robots: { index: false, follow: true } };

const t = getD2("en");

/**
 * Trang không tìm thấy trong vỏ /demo2 (vd. địa chỉ dự án hoặc bài blog không có).
 * Với cacheComponents, trang dựng lúc chạy giữ mã 200 nhưng có noindex và không hiện nội dung nào khác.
 */
export default function Demo2NotFound() {
  return (
    <D2Shell t={t}>
      <section aria-labelledby="d2-404-title" className="d2-wrap d2-pagehead pb-(--d2-section)" data-d2-404>
        <h1 id="d2-404-title" className="d2-display d2-two-tone max-w-[14em]">
          This page isn&apos;t here. <span>The link may have changed or been mistyped.</span>
        </h1>
        <div className="d2-hero-actions">
          <Link href={d2Href("en")} className="d2-btn d2-btn-primary">
            Back to home
          </Link>
          <Link href={d2Href("vi")} className="d2-btn d2-btn-line">
            Về trang chủ (Tiếng Việt)
          </Link>
        </div>
      </section>
    </D2Shell>
  );
}
