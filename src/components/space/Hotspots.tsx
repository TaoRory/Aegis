"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { engineRef } from "@/components/space/engine-ref";
import { hotspotsFor } from "@/components/space/hotspot-data";
import { spaceStore } from "@/components/space/space-store";
import { useSpace } from "@/components/space/useSpace";

/**
 * Điểm chạm trong cảnh 3D: kim cương ultramarine kèm dấu "+" bám vào vật thể. Là <Link> thật trong <nav>
 * (bàn phím, trình đọc màn hình dùng được); engine chiếu vị trí 3D xuống DOM mỗi khung hình bằng transform.
 * Chỉ hiện khi cảnh đã vào vị trí (staged). Rê chuột lên vật thể 3D làm nhãn hiện lên.
 */
export function Hotspots() {
  const mode = useSpace("mode");
  const staged = useSpace("staged");
  const zone = useSpace("zone");
  const hover = useSpace("hover");
  const navRef = useRef<HTMLElement>(null);
  const visible = mode === "3d" && staged;
  const items = visible ? hotspotsFor(zone) : [];

  // Đăng ký phần tử với engine sau mỗi lần danh sách đổi
  useEffect(() => {
    const nav = navRef.current;
    const engine = engineRef.current;
    if (!nav || !engine) return;
    const map = new Map<string, HTMLElement>();
    nav.querySelectorAll<HTMLElement>("[data-hotspot]").forEach((el) => map.set(el.dataset.hotspot!, el));
    engine.setHotspots(map);
    return () => engine.setHotspots(new Map());
  }, [zone, visible]);

  if (!visible || items.length === 0) return null;
  return (
    <nav ref={navRef} className="space-hotspots" aria-label="Các điểm trong cảnh">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          data-hotspot={item.id}
          data-hover={hover === item.id}
          data-always={zone === "hub"}
          className="space-hotspot"
          data-cursor="view"
          data-cursor-label="Mở"
          onClick={(event) => spaceStore.set("lastTrigger", { x: event.clientX, y: event.clientY })}
        >
          <span aria-hidden className="space-diamond" />
          <span className="space-hotspot-label">
            <span className="space-hotspot-tag">{item.tag}</span>
            <span className="space-hotspot-name">{item.label}</span>
          </span>
        </Link>
      ))}
    </nav>
  );
}
