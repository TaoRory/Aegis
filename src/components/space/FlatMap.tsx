"use client";

import Link from "next/link";
import type { MouseEvent } from "react";

import { useFactory } from "@/components/space/factory-context";
import { CAROUSEL, hallSlot, SHOWROOM } from "@/components/space/engine/layout";
import { HALL, links, outlinePoints, planBounds, rooms, type Room } from "@/components/space/plan";
import { spaceStore } from "@/components/space/space-store";
import { useSpace } from "@/components/space/useSpace";
import { zoneById } from "@/config/space";

/** Đơn vị SVG = 10 × mét (để cỡ chữ nằm trên ngưỡng tối thiểu của trình duyệt) */
const U = 10;
const p = (v: number) => v * U;

/** Hình nhỏ trong từng khu: cho biết khu đó có gì (trang trí, không mang dữ liệu). Bốn trạm dịch vụ dùng cùng bố cục hình. */
function Glyphs({ room }: { room: Room }) {
  const { x, z } = room;
  switch (room.zone) {
    case "about":
      return (
        <g className="space-glyph">
          <circle cx={p(x)} cy={p(z)} r={p(2.45)} />
          <circle cx={p(x)} cy={p(z)} r={p(1.45)} />
          <circle cx={p(x)} cy={p(z)} r={p(0.55)} />
        </g>
      );
    case "ai":
    case "software":
    case "web":
    case "marketing": {
      // bàn xoay, hai cánh tay máy từ hai trụ phía sau, cổng vòm
      const back = z - 1.9;
      return (
        <g className="space-glyph">
          <circle cx={p(x)} cy={p(z)} r={p(1.55)} />
          <circle cx={p(x)} cy={p(z)} r={p(0.5)} />
          <path d={`M ${p(x - 2.4)} ${p(back)} L ${p(x - 0.9)} ${p(z - 0.7)} M ${p(x + 2.4)} ${p(back)} L ${p(x + 0.9)} ${p(z - 0.7)}`} />
          <path d={`M ${p(x - 2.4)} ${p(back)} A ${p(2.4)} ${p(1.4)} 0 0 1 ${p(x + 2.4)} ${p(back)}`} />
        </g>
      );
    }
    case "work":
      return (
        <g className="space-glyph">
          {Array.from({ length: SHOWROOM.count }, (_, i) => {
            const s = hallSlot(i);
            return <rect key={i} x={p(s.x - 0.8)} y={p(s.z - 0.1)} width={p(1.6)} height={p(0.2)} transform={`rotate(${(s.yaw * 180) / Math.PI} ${p(s.x)} ${p(s.z)})`} />;
          })}
        </g>
      );
    case "studio":
      return (
        <g className="space-glyph">
          <circle cx={p(x)} cy={p(z)} r={p(0.5)} />
          {Array.from({ length: CAROUSEL.count }, (_, i) => {
            const phi = (i / CAROUSEL.count) * Math.PI * 2;
            const cx = x + Math.sin(phi) * CAROUSEL.r;
            const cz = z + Math.cos(phi) * CAROUSEL.r;
            return <rect key={i} x={p(cx - 0.7)} y={p(cz - 0.1)} width={p(1.4)} height={p(0.2)} transform={`rotate(${(-phi * 180) / Math.PI} ${p(cx)} ${p(cz)})`} />;
          })}
        </g>
      );
    case "contact":
      return (
        <g className="space-glyph">
          <circle cx={p(x)} cy={p(z)} r={p(1.4)} />
          <path d={`M ${p(x - 0.9)} ${p(z + 2.1)} V ${p(z + 1.2)} A ${p(0.9)} ${p(0.9)} 0 0 1 ${p(x + 0.9)} ${p(z + 1.2)} V ${p(z + 2.1)}`} />
        </g>
      );
  }
}

/** Vị trí chữ nhãn của một khu (góc, neo) */
function labelAt(room: Room): { x: number; z: number; anchor: "start" | "middle" } {
  if (room.shape === "arc") return { x: 0, z: -room.r - HALL.band - 1.6, anchor: "middle" };
  if (room.zone === "about") return { x: room.x, z: room.z + room.r + 1.7, anchor: "middle" };
  return { x: room.x, z: room.z + room.r + 1.7, anchor: "middle" };
}

const pathOf = (room: Room) => `M ${outlinePoints(room)
  .map(([x, z]) => `${p(x).toFixed(1)} ${p(z).toFixed(1)}`)
  .join(" L ")} Z`;

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
          const at = labelAt(room);
          return (
            <Link key={room.zone} href={href(zone.path)} onClick={remember} aria-label={label.name} className="space-room" data-active={active === room.zone} data-kind={zone.kind}>
              <path className="space-room-box" d={pathOf(room)} />
              <Glyphs room={room} />
              <text className="space-room-index" x={p(at.x)} y={p(at.z)} textAnchor={at.anchor}>
                {label.tag}
              </text>
              <text className="space-room-name" x={p(at.x)} y={p(at.z + 0.9)} textAnchor={at.anchor}>
                {label.name}
              </text>
            </Link>
          );
        })}
      </svg>
    </div>
  );
}
