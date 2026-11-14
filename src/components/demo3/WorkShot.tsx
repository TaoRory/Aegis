import Image from "next/image";
import { ViewTransition, type CSSProperties, type ReactNode, type Ref } from "react";

import type { PreviewImage } from "@/content/types";

/**
 * Ảnh chụp dự án thật trong khung trình duyệt mảnh, bản của khu vực "work" ở /demo3.
 * Khác <Shot> (D3Bits) ở ba điểm:
 * - <ViewTransition name="d3-work-<slug>">: khi đổi trang, ảnh trong ô dự án trên tường /work bay thẳng vào chỗ
 *   ảnh đầu trang chi tiết của chính dự án đó ("phần tử dùng chung"). React chỉ gắn tên lúc chuyển trang; kiểu: .aegis-morph (effects.css).
 *   `share={false}` cho ảnh chỉ để minh hoạ (cánh cửa "dự án kế tiếp"): nếu nó cũng mang tên thì ô của dự án đó trên tường sẽ bay nhầm về phía nó.
 *   Một trang không được có hai WorkShot cùng slug đang bật `share`;
 * - vùng ảnh (.d3-shot-view) có tỉ lệ cố định và là container kích thước, nên lớp con (ảnh toàn trang) trượt được đúng một
 *   quãng "chiều cao ảnh trừ chiều cao khung" chỉ bằng CSS (đơn vị cqh), không cần đo bằng JS;
 * - nhận dữ liệu ảnh qua props (không tự đọc JSON) để dùng được cả ở Server lẫn Client Component mà không kéo JSON vào bundle.
 */
export function WorkShot({
  slug,
  cover,
  alt,
  sizes,
  eager,
  peek,
  share = true,
  ref,
  children,
}: {
  slug: string;
  cover: PreviewImage;
  alt: string;
  sizes: string;
  /** Ảnh nằm ở màn đầu: tải ngay (Next 16 bỏ `priority`, dùng loading / fetchPriority) */
  eager?: "high" | "auto";
  /** "ready" khi ảnh toàn trang đã tải xong và sẵn sàng trượt */
  peek?: "ready";
  /** Tham gia hiệu ứng "phần tử dùng chung" khi đổi trang (mặc định có) */
  share?: boolean;
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}) {
  return (
    <ViewTransition name={share ? `d3-work-${slug}` : undefined} share="aegis-morph" default="none">
      <div ref={ref} className="d2-shot d3-shot">
        <div className="d2-shot-bar" aria-hidden>
          <i />
          <i />
          <i />
        </div>
        <div className="d3-shot-view" data-peek={peek} style={{ aspectRatio: `${cover.width} / ${cover.height}` } as CSSProperties}>
          <Image
            src={cover.src}
            alt={alt}
            width={cover.width}
            height={cover.height}
            sizes={sizes}
            loading={eager ? "eager" : undefined}
            fetchPriority={eager === "high" ? "high" : undefined}
          />
          {children}
        </div>
      </div>
    </ViewTransition>
  );
}
