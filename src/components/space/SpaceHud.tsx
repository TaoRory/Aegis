"use client";

import Link from "next/link";

import { SettingsMenu } from "@/components/layout/SettingsMenu";
import { SpaceMode } from "@/components/space/SpaceMode";
import { ShortcutsHelp } from "@/components/space/SpaceKeys";
import { spaceStore } from "@/components/space/space-store";
import { useSpace } from "@/components/space/useSpace";
import { navZones, zoneById } from "@/config/space";
import { spaceCopy } from "@/content/space";

/**
 * Lớp điều khiển cố định của Xưởng (HUD): khối tên tờ bản vẽ (trái dưới), thanh điều hướng dạng viên thuốc (giữa dưới),
 * đường về trang chính + cài đặt (phải trên). Mọi thứ đều là liên kết/nút thật, dùng được khi không có 3D.
 */
export function SpaceHud() {
  const zone = useSpace("zone");
  const current = zoneById[zone];

  return (
    <>
      <div className="space-top">
        <Link href="/" className="space-home label" data-cursor="link" aria-label={spaceCopy.homeLink}>
          <span aria-hidden className="sm:hidden">
            {spaceCopy.homeLinkShort}
          </span>
          <span aria-hidden className="hidden sm:inline">
            {spaceCopy.homeLink}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ShortcutsHelp />
          <SpaceMode />
          <SettingsMenu />
        </div>
      </div>

      <div className="space-title" aria-live="polite">
        <p className="label text-muted">AEGIS / XƯỞNG</p>
        <p className="space-title-sheet">
          <span className="text-accent">{current.sheet}</span> · {current.name}
        </p>
      </div>

      <nav className="space-nav" aria-label={spaceCopy.hud.nav}>
        <ul>
          {navZones.map((z) => (
            <li key={z.id}>
              <Link
                href={z.route}
                aria-current={zone === z.id ? "page" : undefined}
                onClick={(event) => spaceStore.set("lastTrigger", { x: event.clientX, y: event.clientY })}
                data-cursor="link"
              >
                <span className="space-nav-index">{z.index}</span> {z.short}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
