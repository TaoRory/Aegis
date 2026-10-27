import type { CSSProperties } from "react";
import Image from "next/image";

import type { DemoTemplate } from "@/content/templates";
import type { PreviewImage } from "@/content/types";
import { cn } from "@/lib/cn";

export type TemplatePreview = { cover: PreviewImage; full: PreviewImage };

/**
 * Khung xem trước mẫu: ảnh chụp đặt trong khung trình duyệt trên "sân khấu" màu của chính mẫu.
 * Thiết bị có chuột: rê chuột để ảnh toàn trang tự cuộn. Chưa có ảnh → khung chữ thay thế.
 */
export function TemplateStage({
  template,
  preview,
  sizes,
  alt,
  className,
}: {
  template: DemoTemplate;
  preview?: TemplatePreview;
  sizes: string;
  /** Mô tả ảnh theo ngôn ngữ của trang */
  alt: string;
  className?: string;
}) {
  const scrollDuration = preview ? Math.max(3, (preview.full.height / preview.full.width) * 1.8) : 0;
  return (
    <div
      className={cn("template-stage relative overflow-hidden p-[6%]", className)}
      style={{ "--stage": template.stage, "--stage-ink": template.stageInk } as CSSProperties}
    >
      <div className="template-frame relative overflow-hidden rounded-sm shadow-[0_30px_80px_-30px_rgb(0_0_0/0.45)]">
        <div className="template-frame-bar flex h-6 items-center gap-1.5 px-3">
          <span className="size-1.5 rounded-full bg-current opacity-40" />
          <span className="size-1.5 rounded-full bg-current opacity-40" />
          <span className="size-1.5 rounded-full bg-current opacity-40" />
        </div>
        <div className="template-viewport relative aspect-[16/10] overflow-hidden">
          {preview ? (
            <>
              <Image
                src={preview.cover.src}
                width={preview.cover.width}
                height={preview.cover.height}
                alt={alt}
                sizes={sizes}
                className="size-full object-cover object-top"
              />
              <Image
                src={preview.full.src}
                width={preview.full.width}
                height={preview.full.height}
                alt=""
                aria-hidden
                loading="lazy"
                sizes={sizes}
                className="template-full"
                style={{ "--scroll-duration": `${scrollDuration.toFixed(1)}s` } as CSSProperties}
              />
            </>
          ) : (
            <div className="grid size-full place-items-center bg-(--stage) text-(--stage-ink)">
              <span className="text-3xl font-semibold tracking-tight">{template.brand}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
