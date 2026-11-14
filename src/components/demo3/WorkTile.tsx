"use client";

import Image from "next/image";
import { useRef, useState, type CSSProperties, type FocusEvent, type PointerEvent } from "react";

import type { PreviewImage } from "@/content/types";
import { MQ } from "@/lib/motion";

import { D3Link } from "./D3Link";
import { Rise } from "./fx/Rise";
import { WorkShot } from "./WorkShot";

/** Tốc độ "lướt trang" khi rê chuột: giây cho mỗi lần cuộn hết một chiều cao khung */
const SECONDS_PER_SCREEN = 0.85;

/**
 * Một ô dự án trên tường /work: sân khấu màu của chính dự án + ảnh chụp trong khung trình duyệt.
 * Rê chuột (chỉ thiết bị có chuột, không giảm chuyển động):
 * - khung ảnh nhấc lên và nghiêng về phía con trỏ (hai biến CSS --rx, --ry; phần còn lại là CSS trong work.css);
 * - ảnh chụp TOÀN TRANG hiện đè lên ảnh bìa rồi tự cuộn trong khung, như đang lướt website thật. Rời chuột là dừng và quay về.
 * Ảnh toàn trang chỉ được tải khi người xem rê vào ô lần đầu (điện thoại không bao giờ tải), nên tường dự án không nặng thêm.
 * Không JS / giảm chuyển động / cảm ứng: ô là một link tĩnh bình thường, đủ nội dung.
 */
export function WorkTile({
  href,
  slug,
  name,
  type,
  viewLabel,
  bg,
  ink,
  cover,
  full,
  column,
  order,
  eager,
}: {
  href: string;
  slug: string;
  name: string;
  type: string;
  /** Chữ cho trình đọc màn hình: "Xem dự án" */
  viewLabel: string;
  bg: string;
  ink: "light" | "dark";
  cover: PreviewImage;
  full?: PreviewImage;
  /** Cột trên tường (0, 1, 2): dùng để so le lúc trồi lên */
  column: number;
  /** Thứ tự thật của dự án: điện thoại xếp một cột theo đúng thứ tự này */
  order: number;
  eager?: boolean;
}) {
  const shotRef = useRef<HTMLDivElement>(null);
  // armed: người xem đã tỏ ý (rê chuột / focus bằng bàn phím) nên mới gắn ảnh toàn trang vào DOM để tải
  const [armed, setArmed] = useState(false);
  // ready: ảnh đã tải xong. Phải tách hai bước, vì phần tử vừa gắn mà đã ở trạng thái "đang rê" thì CSS không có điểm đầu để chuyển động
  const [ready, setReady] = useState(false);

  const arm = () => {
    if (armed || !full) return;
    if (window.matchMedia(`${MQ.fineHover} and ${MQ.anyMotion}`).matches) setArmed(true);
  };

  const onPointerEnter = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse") arm();
  };

  const onFocus = (event: FocusEvent<HTMLElement>) => {
    if (event.currentTarget.matches(":focus-visible")) arm();
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const shot = shotRef.current;
    if (!shot || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    shot.style.setProperty("--rx", (((event.clientX - rect.left) / rect.width) * 2 - 1).toFixed(3));
    shot.style.setProperty("--ry", (((event.clientY - rect.top) / rect.height) * 2 - 1).toFixed(3));
  };

  const onPointerLeave = () => {
    shotRef.current?.style.removeProperty("--rx");
    shotRef.current?.style.removeProperty("--ry");
  };

  // Quãng cuộn tính bằng "số lần chiều cao khung": trang càng dài lướt càng lâu, nhưng không quá 4,4 giây
  // (cộng 0,45 giây chờ trong CSS vẫn dưới ngưỡng 5 giây phải có nút dừng; rời chuột là dừng ngay)
  const screens = full ? full.height / full.width / (cover.height / cover.width) - 1 : 0;
  const seconds = Math.min(4.4, Math.max(1.4, screens * SECONDS_PER_SCREEN));

  return (
    <Rise
      as={D3Link}
      kind="pop"
      index={column}
      href={href}
      className="d2-tile d3-tile"
      data-ink={ink}
      style={{ backgroundColor: bg, order, "--peek-dur": `${seconds.toFixed(2)}s` } as CSSProperties}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onFocus={onFocus}
    >
      <WorkShot ref={shotRef} slug={slug} cover={cover} alt="" sizes="(min-width: 48rem) 30vw, 92vw" eager={eager ? "auto" : undefined} peek={ready ? "ready" : undefined}>
        {armed && full && (
          <Image
            className="d3-peek"
            src={full.src}
            alt=""
            aria-hidden
            width={full.width}
            height={full.height}
            sizes="(min-width: 48rem) 30vw, 92vw"
            loading="eager"
            onLoad={() => setReady(true)}
          />
        )}
      </WorkShot>
      <span className="d2-tile-meta">
        <span>
          {name}
          <span className="sr-only">, {viewLabel}</span>
        </span>
        <span>{type}</span>
      </span>
    </Rise>
  );
}
