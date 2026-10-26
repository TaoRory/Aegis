"use client";

import Link from "next/link";
import type { MouseEvent } from "react";

import { useFactory } from "@/components/space/factory-context";
import { CORE_RADIUS, links, planBounds, rooms, type Room } from "@/components/space/plan";
import { spaceStore } from "@/components/space/space-store";
import { useSpace } from "@/components/space/useSpace";
import { zoneById } from "@/config/space";

/** Đơn vị SVG = 10 × mét (để cỡ chữ nằm trên ngưỡng tối thiểu của trình duyệt) */
const U = 10;
const p = (v: number) => v * U;

/** Hình nhỏ trong từng khu: cho biết khu đó có gì (trang trí, không mang dữ liệu). Bốn dịch vụ dùng cùng cỡ hình. */
function Glyphs({ room }: { room: Room }) {
  const { x, z, d } = room;
  switch (room.zone) {
    case "about":
      return (
        <g className="space-glyph">
          <circle cx={p(x)} cy={p(z)} r={p(1.3)} />
          <circle cx={p(x)} cy={p(z)} r={p(0.55)} />
        </g>
      );
    case "ai":
      return (
        <g className="space-glyph">
          {[
            [-1, -0.7],
            [-1, 0.7],
            [0, 0],
            [1, -0.7],
            [1, 0.7],
          ].map(([dx, dz]) => (
            <circle key={`${dx}${dz}`} cx={p(x + dx)} cy={p(z + dz)} r={p(0.2)} />
          ))}
          <path d={`M ${p(x - 1)} ${p(z - 0.7)} L ${p(x)} ${p(z)} L ${p(x + 1)} ${p(z - 0.7)} M ${p(x - 1)} ${p(z + 0.7)} L ${p(x)} ${p(z)} L ${p(x + 1)} ${p(z + 0.7)}`} />
        </g>
      );
    case "software":
      return (
        <g className="space-glyph">
          {[-0.6, 0.6].flatMap((dx) => [-0.6, 0.6].map((dz) => <rect key={`${dx}${dz}`} x={p(x + dx - 0.45)} y={p(z + dz - 0.45)} width={p(0.9)} height={p(0.9)} />))}
        </g>
      );
    case "web":
      return (
        <g className="space-glyph">
          <rect x={p(x - 1.3)} y={p(z - 0.85)} width={p(2.6)} height={p(1.7)} />
          <line x1={p(x - 1.3)} y1={p(z - 0.45)} x2={p(x + 1.3)} y2={p(z - 0.45)} />
        </g>
      );
    case "marketing":
      return (
        <g className="space-glyph">
          {[0.3, 0.7, 1.1].map((r) => (
            <circle key={r} cx={p(x)} cy={p(z)} r={p(r)} />
          ))}
        </g>
      );
    case "work":
      return Array.from({ length: 7 }, (_, i) => (
        <g key={i} className="space-glyph">
          <rect x={p(-6.15 + i * 2.05 - 0.75)} y={p(z - d / 2 + 0.5)} width={p(1.5)} height={p(0.14)} />
          <rect x={p(-6.15 + i * 2.05 - 0.45)} y={p(z - d / 2 + 0.85)} width={p(0.9)} height={p(0.9)} />
        </g>
      ));
    case "studio":
      return (
        <g className="space-glyph">
          {Array.from({ length: 4 }, (_, i) => (
            <rect key={i} x={p(-8.4 + i * 1.95)} y={p(z - d / 2 + 0.25)} width={p(1.4)} height={p(0.14)} />
          ))}
          {Array.from({ length: 4 }, (_, i) => (
            <circle key={i} cx={p(-0.75 + i * 0.9)} cy={p(z + 0.15)} r={p(0.26)} />
          ))}
        </g>
      );
    case "contact":
      return (
        <g className="space-glyph">
          <path d={`M ${p(x - 0.9)} ${p(z - d / 2 + 2.2)} V ${p(z - d / 2 + 1)} A ${p(0.9)} ${p(0.9)} 0 0 1 ${p(x + 0.9)} ${p(z - d / 2 + 1)} V ${p(z - d / 2 + 2.2)}`} />
        </g>
      );
  }
}

/**
 * Mặt bằng phẳng của Factory (SVG): vừa là giao diện khi không có JS / không có WebGL / người dùng chọn bản phẳng,
 * vừa là khung hình đầu tiên mà cảnh 3D "dựng lên" từ đó. Mỗi khu là một liên kết thật; dòng năng lượng nối mọi khu về lõi.
 */
export function FlatMap() {
  const active = useSpace("zone");
  const { ui, href } = useFactory();
  const b = planBounds;

  const remember = (event: MouseEvent) => spaceStore.set("lastTrigger", { x: event.clientX, y: event.clientY });

  return (
    <div className="space-map" data-active-zone={active}>
      <svg className="space-map-svg" viewBox={`${p(b.x)} ${p(b.z)} ${p(b.w)} ${p(b.d)}`} role="group" aria-label={ui.hud.planLabel} preserveAspectRatio="xMidYMid meet">
        {/* Khung ngoài + dấu "+" ở bốn góc */}
        <g className="space-plan-frame" aria-hidden>
          <rect x={p(b.x + 0.3)} y={p(b.z + 0.3)} width={p(b.w - 0.6)} height={p(b.d - 0.6)} />
          {[
            [b.x + 0.3, b.z + 0.3],
            [b.x + b.w - 0.3, b.z + 0.3],
            [b.x + 0.3, b.z + b.d - 0.3],
            [b.x + b.w - 0.3, b.z + b.d - 0.3],
          ].map(([cx, cz]) => (
            <path key={`${cx}${cz}`} d={`M ${p(cx) - 4} ${p(cz)} H ${p(cx) + 4} M ${p(cx)} ${p(cz) - 4} V ${p(cz) + 4}`} />
          ))}
        </g>

        {/* Dòng năng lượng nối các khu về lõi */}
        <g className="space-links" aria-hidden>
          {links.map((link) => (
            <polyline key={link.zone} points={link.points.map(([lx, lz]) => `${p(lx)},${p(lz)}`).join(" ")} data-active={active === link.zone} />
          ))}
        </g>

        {rooms.map((room) => {
          const zone = zoneById[room.zone];
          const label = ui.zones[room.zone];
          const isActive = active === room.zone;
          const left = room.shape === "circle" ? room.x - 1.6 : room.x - room.w / 2 + 0.5;
          const top = room.shape === "circle" ? room.z + 1.9 : room.z - room.d / 2 + 0.9;
          return (
            <Link key={room.zone} href={href(zone.path)} onClick={remember} aria-label={label.name} className="space-room" data-active={isActive} data-kind={zone.kind}>
              {room.shape === "circle" ? (
                <circle className="space-room-box" cx={p(room.x)} cy={p(room.z)} r={p(CORE_RADIUS)} />
              ) : (
                <rect className="space-room-box" x={p(room.x - room.w / 2)} y={p(room.z - room.d / 2)} width={p(room.w)} height={p(room.d)} />
              )}
              <Glyphs room={room} />
              <text className="space-room-index" x={p(left)} y={p(top)}>
                {label.tag}
              </text>
              <text className="space-room-name" x={p(left)} y={p(top + 0.8)}>
                {label.name}
              </text>
            </Link>
          );
        })}
      </svg>
    </div>
  );
}
