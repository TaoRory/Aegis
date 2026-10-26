"use client";

import Link from "next/link";
import type { MouseEvent } from "react";

import { zoneById } from "@/config/space";
import { planBounds, rooms, type Room } from "@/components/space/plan";
import { spaceStore } from "@/components/space/space-store";
import { useSpace } from "@/components/space/useSpace";

/** Đơn vị SVG = 10 × mét (để cỡ chữ nằm trên ngưỡng tối thiểu của trình duyệt) */
const U = 10;
const p = (v: number) => v * U;

/** Hình khối nhỏ trong từng phòng: cho biết phòng đó trưng bày gì (trang trí, không mang dữ liệu) */
function Glyphs({ room }: { room: Room }) {
  const { x, z, w, d } = room;
  switch (room.zone) {
    case "trung-bay":
      return Array.from({ length: 7 }, (_, i) => (
        <g key={i} className="space-glyph">
          <rect x={p(x - 7.2 + i * 2.4 - 0.8)} y={p(z + 0.3)} width={p(1.6)} height={p(0.14)} />
          <rect x={p(x - 7.2 + i * 2.4 - 0.5)} y={p(z + 0.65)} width={p(1)} height={p(1.1)} />
        </g>
      ));
    case "thi-nghiem":
      return (
        <g className="space-glyph">
          <rect x={p(x - 0.45)} y={p(z - 1.8)} width={p(0.9)} height={p(3.6)} />
          {Array.from({ length: 4 }, (_, i) => (
            <circle key={i} cx={p(x)} cy={p(z - 1.2 + i * 0.8)} r={p(0.26)} />
          ))}
        </g>
      );
    case "mau-giao-dien":
      return (
        <g className="space-glyph">
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={p(x - w / 2 + 0.5 + i * 1)} y={p(z + d / 2 - 0.9)} width={p(0.72)} height={p(0.14)} />
          ))}
        </g>
      );
    case "dich-vu":
      return (
        <g className="space-glyph">
          {Array.from({ length: 4 }, (_, i) => (
            <rect key={i} x={p(x - 1.9 + i * 1)} y={p(z - 0.6)} width={p(0.8)} height={p(1.3)} transform={`rotate(-8 ${p(x - 1.5 + i)} ${p(z)})`} />
          ))}
        </g>
      );
    case "ve-aegis":
      return (
        <g className="space-glyph">
          <circle cx={p(x)} cy={p(z)} r={p(1.3)} />
          <circle cx={p(x)} cy={p(z)} r={p(0.55)} />
        </g>
      );
    case "nhat-ky":
      return (
        <g className="space-glyph">
          <rect x={p(x - 0.7)} y={p(z - 0.4)} width={p(1.4)} height={p(0.9)} />
          <line x1={p(x)} y1={p(z - 0.4)} x2={p(x)} y2={p(z + 0.5)} />
        </g>
      );
    case "lien-he":
      return (
        <g className="space-glyph">
          <path d={`M ${p(x - 0.9)} ${p(z + d / 2)} V ${p(z + d / 2 - 1.8)} A ${p(0.9)} ${p(0.9)} 0 0 1 ${p(x + 0.9)} ${p(z + d / 2 - 1.8)} V ${p(z + d / 2)}`} />
        </g>
      );
  }
}

/**
 * Mặt bằng phẳng của Xưởng (SVG): vừa là giao diện khi không có JS / không có WebGL / người dùng chọn bản phẳng,
 * vừa là khung hình đầu tiên mà cảnh 3D "dựng lên" từ đó. Mỗi phòng là một liên kết thật.
 */
export function FlatMap() {
  const active = useSpace("zone");
  const b = planBounds;

  const remember = (event: MouseEvent) => spaceStore.set("lastTrigger", { x: event.clientX, y: event.clientY });

  return (
    <div className="space-map" data-active-zone={active}>
      <svg
        className="space-map-svg"
        viewBox={`${p(b.x)} ${p(b.z)} ${p(b.w)} ${p(b.d)}`}
        role="group"
        aria-label="Mặt bằng Xưởng Aegis"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Khung ngoài + dấu "+" ở bốn góc + thước kích thước */}
        <g className="space-plan-frame" aria-hidden>
          <rect x={p(-10.4)} y={p(-7.9)} width={p(20.8)} height={p(15.8)} />
          {[
            [-10.4, -7.9],
            [10.4, -7.9],
            [-10.4, 7.9],
            [10.4, 7.9],
          ].map(([cx, cz]) => (
            <path key={`${cx}${cz}`} d={`M ${p(cx) - 4} ${p(cz)} H ${p(cx) + 4} M ${p(cx)} ${p(cz) - 4} V ${p(cz) + 4}`} />
          ))}
          <line x1={p(-10)} y1={p(8.2)} x2={p(10)} y2={p(8.2)} />
          <line x1={p(-10)} y1={p(8.2) - 3} x2={p(-10)} y2={p(8.2) + 3} />
          <line x1={p(10)} y1={p(8.2) - 3} x2={p(10)} y2={p(8.2) + 3} />
          <text x={0} y={p(8.2) - 3} textAnchor="middle" className="space-dim">
            20 m
          </text>
        </g>

        {rooms.map((room) => {
          const zone = zoneById[room.zone];
          const isActive = active === room.zone;
          return (
            <Link key={room.zone} href={zone.route} onClick={remember} aria-label={`${zone.index ? `${zone.index}. ` : ""}${zone.name}`} className="space-room" data-active={isActive}>
              <rect className="space-room-box" x={p(room.x - room.w / 2)} y={p(room.z - room.d / 2)} width={p(room.w)} height={p(room.d)} />
              <Glyphs room={room} />
              <text className="space-room-index" x={p(room.x - room.w / 2 + 0.5)} y={p(room.z - room.d / 2 + 0.9)}>
                {zone.index ?? zone.sheet}
              </text>
              <text className="space-room-name" x={p(room.x - room.w / 2 + 0.5)} y={p(room.z - room.d / 2 + 1.7)}>
                {zone.name}
              </text>
            </Link>
          );
        })}
      </svg>
    </div>
  );
}
