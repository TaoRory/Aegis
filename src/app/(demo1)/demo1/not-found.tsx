import type { Metadata } from "next";

import { D1Button } from "@/components/demo1/D1Button";
import { D1_BASE } from "@/content/demo1";

export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: true },
};

/** 404 trong vỏ /demo1 (vd. địa chỉ dự án không có). Với cacheComponents, trang dựng lúc chạy giữ mã 200 nhưng có noindex. */
export default function Demo1NotFound() {
  return (
    <section aria-labelledby="d1-404-title" className="d1-wrap d1-section">
      <p className="d1-label text-muted">404</p>
      <h1 id="d1-404-title" className="d1-h2 mt-6 max-w-[16em]">
        Không tìm thấy trang này. <span className="text-subtle">Có thể đường dẫn đã đổi hoặc gõ nhầm.</span>
      </h1>
      <div className="mt-10 flex flex-wrap gap-2">
        <D1Button href={D1_BASE}>Về trang chủ</D1Button>
        <D1Button href={`${D1_BASE}#du-an`} variant="soft" icon={false}>
          Xem dự án
        </D1Button>
      </div>
    </section>
  );
}
