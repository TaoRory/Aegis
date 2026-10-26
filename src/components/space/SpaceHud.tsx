"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { SettingsMenu } from "@/components/layout/SettingsMenu";
import { SpaceMode, SpaceNotice } from "@/components/space/SpaceMode";
import { ShortcutsHelp } from "@/components/space/SpaceKeys";
import { spaceStore } from "@/components/space/space-store";
import { useSpace } from "@/components/space/useSpace";
import { ZoneIcon } from "@/components/space/ZoneIcon";
import { navZones, SPACE_BASE, zoneById } from "@/config/space";
import { spaceCopy } from "@/content/space";

/**
 * Lớp điều khiển cố định của Xưởng (HUD): khối tên tờ bản vẽ (trái dưới), thanh điều hướng dạng viên thuốc (giữa dưới),
 * đường về trang chính + cài đặt (phải trên). Mọi thứ đều là liên kết/nút thật, dùng được khi không có 3D.
 * Điện thoại: thanh trên gọn (tên / "Về xưởng" bên trái, một nút menu bên phải), thanh điều hướng dạng kính có biểu tượng.
 */
export function SpaceHud() {
  const zone = useSpace("zone");
  const current = zoneById[zone];

  return (
    <>
      <div className="space-top hidden md:flex">
        <Link href="/" className="space-home label" data-cursor="link" aria-label={spaceCopy.homeLink}>
          <span aria-hidden>{spaceCopy.homeLink}</span>
        </Link>
        <div className="flex items-center gap-2">
          <ShortcutsHelp />
          <SpaceMode />
          <SettingsMenu />
        </div>
      </div>
      <PhoneBar atHub={zone === "hub"} />
      <SpaceNotice />

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
                <ZoneIcon zone={z.id} className="space-nav-icon" />
                <span className="space-nav-index">{z.index}</span>
                <span className="space-nav-label">{z.short}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

/** Thanh trên của điện thoại: gọn như một HUD game, mọi thứ phụ gom vào một nút menu */
function PhoneBar({ atHub }: { atHub: boolean }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="space-top-phone md:hidden">
      {atHub ? (
        <p className="space-wordmark">
          <span className="space-wordmark-name">AEGIS</span>
          <span className="space-wordmark-sub label">XƯỞNG</span>
        </p>
      ) : (
        <Link href={SPACE_BASE} className="space-chip label" data-cursor="link">
          <span aria-hidden>◂</span> {spaceCopy.hud.toHub}
        </Link>
      )}
      <button
        ref={buttonRef}
        type="button"
        className="space-menu-btn"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? spaceCopy.hud.menuClose : spaceCopy.hud.menu}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden className="space-menu-dots">
          <i />
          <i />
          <i />
          <i />
        </span>
      </button>
      {open && (
        <div id={menuId} className="space-menu">
          <Link href="/" className="space-menu-link label" data-cursor="link">
            {spaceCopy.homeLink}
          </Link>
          <SpaceMode className="space-menu-link label" />
          <div className="space-menu-settings">
            <SettingsMenu inline />
          </div>
        </div>
      )}
    </div>
  );
}
