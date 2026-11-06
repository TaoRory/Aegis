"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";

import type { PreviewImage } from "@/content/types";

import { ArrowUpRight } from "./icons";

/** Tỉ lệ cao/rộng của ô xem trong khung (16:10) */
const VIEW_RATIO = 10 / 16;

/**
 * Thẻ dự án /demo1: ảnh trang chủ thật đặt trong khung trình duyệt tối giản trên tấm nền, tên miền thật ở thanh khung.
 * Máy tính: lần đầu rê chuột mới tải ảnh toàn trang, rồi ảnh trượt xuống chậm như đang cuộn website (CSS, chỉ khi không giảm chuyển động).
 */
export function D1ProjectCard({
  href,
  index,
  name,
  type,
  domain,
  cover,
  full,
  alt,
}: {
  href: string;
  index: number;
  name: string;
  type: string;
  domain: string;
  cover?: PreviewImage;
  full?: PreviewImage;
  alt: string;
}) {
  const [armed, setArmed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  // Quãng trượt (theo % chiều cao ảnh toàn trang) để đáy ảnh chạm đáy ô xem
  const scroll = full ? `${(-(1 - VIEW_RATIO / (full.height / full.width)) * 100).toFixed(2)}%` : "0%";

  return (
    <Link
      href={href}
      className="d1-card group"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setArmed(true);
      }}
    >
      <div className="d1-plate">
        <div className="d1-frame">
          <div className="d1-frame-bar">
            <span className="d1-label">{domain}</span>
          </div>
          <div className="d1-frame-view">
            {cover ? (
              <Image src={cover.src} width={cover.width} height={cover.height} alt={alt} sizes="(min-width: 48rem) 44vw, 90vw" />
            ) : (
              <span className="grid size-full place-items-center bg-bg-elevated">{name}</span>
            )}
            {armed && full && (
              <Image
                src={full.src}
                width={full.width}
                height={full.height}
                alt=""
                aria-hidden
                sizes="44vw"
                className="d1-frame-full"
                data-ready={loaded}
                onLoad={() => setLoaded(true)}
                style={{ "--d1-scroll": scroll } as CSSProperties}
              />
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-6">
        <div>
          <h3 className="flex items-center gap-2 text-[1.25rem] leading-tight font-medium tracking-[-0.018em]">
            {name}
            <ArrowUpRight className="d1-card-arrow" />
          </h3>
          <p className="mt-1 text-[0.9375rem] text-muted">{type}</p>
        </div>
        <span className="d1-label pt-1 text-muted">{String(index + 1).padStart(2, "0")}</span>
      </div>
    </Link>
  );
}
