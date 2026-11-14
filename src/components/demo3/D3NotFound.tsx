import Link from "next/link";

import { d3Href, getD3 } from "@/content/demo3";

import { D3Shell } from "./D3Shell";

const t = getD3("en");

/**
 * Trang không tìm thấy của website chính: dùng ở not-found trong nhóm route (địa chỉ dự án / bài blog không có)
 * và ở not-found chung của site (địa chỉ không khớp route nào; bọc thêm vỏ .d2 .d3 ở src/app/not-found.tsx).
 * Hai nút: về trang chủ tiếng Anh và tiếng Việt.
 */
export function D3NotFound() {
  return (
    <D3Shell t={t}>
      <section aria-labelledby="d2-404-title" className="d2-wrap d2-pagehead pb-(--d2-section)" data-d2-404>
        <h1 id="d2-404-title" className="d2-display d2-two-tone max-w-[14em]">
          This page isn&apos;t here. <span>The link may have changed or been mistyped.</span>
        </h1>
        <div className="d2-hero-actions">
          <Link href={d3Href("en")} className="d2-btn d2-btn-primary">
            Back to home
          </Link>
          <Link href={d3Href("vi")} className="d2-btn d2-btn-line">
            Về trang chủ (Tiếng Việt)
          </Link>
        </div>
      </section>
    </D3Shell>
  );
}
