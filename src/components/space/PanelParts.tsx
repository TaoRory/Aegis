import Image from "next/image";
import type { ReactNode } from "react";

import type { PreviewImage } from "@/content/types";

/** Bảng thông số kiểu hồ sơ (khung tên bản vẽ): mỗi hàng một cặp nhãn mono / giá trị */
export function SpecTable({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl data-panel-in className="space-spec">
      {rows.map((row) => (
        <div key={row.label}>
          <dt className="label text-muted">{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * "Sân khấu thiết bị": ảnh toàn trang đặt trong khung trình duyệt trên nền accent; cuộn trong khung để xem hết.
 * Ảnh là ảnh chụp tĩnh (không phải website sống) nên ghi chú rõ ở chú thích.
 */
export function DeviceStage({ full, alt, shot, fullShot }: { full: PreviewImage; alt: string; shot: string; fullShot: string }) {
  return (
    <figure data-panel-in className="space-stage">
      <div className="space-device">
        <div className="space-device-bar" aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <div className="space-device-screen" data-lenis-prevent="" tabIndex={0} role="region" aria-label={fullShot}>
          <Image src={full.src} width={full.width} height={full.height} alt={alt} sizes="(min-width: 64rem) 40rem, 90vw" className="w-full" />
        </div>
      </div>
      <figcaption className="label mt-3 text-muted">
        {shot} · {fullShot}
      </figcaption>
    </figure>
  );
}

/** Khung chờ cho trang động (bọc <Suspense>): đúng vị trí/kích thước của Panel, không animation, báo "đang tải" cho trình đọc màn hình */
export function PanelSkeleton({ label }: { label: string }) {
  return <section className="space-panel" data-ready="true" aria-busy="true" aria-label={label} />;
}
