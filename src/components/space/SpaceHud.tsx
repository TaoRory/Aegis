"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { SettingsMenu } from "@/components/layout/SettingsMenu";
import { engineRef } from "@/components/space/engine-ref";
import { useFactory } from "@/components/space/factory-context";
import { SpaceMode, SpaceNotice } from "@/components/space/SpaceMode";
import { ReplayIntro, ShortcutsHelp } from "@/components/space/SpaceKeys";
import { spaceStore } from "@/components/space/space-store";
import { useSpace } from "@/components/space/useSpace";
import { ZoneIcon } from "@/components/space/ZoneIcon";
import { factoryHref, isServiceZone, locales, navOthers, navServices, SPACE_BASE, stripLocale, type Zone } from "@/config/space";

/** Ghi điểm vừa bấm (panel thu về đó) */
const remember = (event: { clientX: number; clientY: number }) => spaceStore.set("lastTrigger", { x: event.clientX, y: event.clientY });

/** Hook nhỏ: đóng một lớp nổi khi bấm ra ngoài hoặc nhấn Esc, trả focus về nút mở */
function useDismiss(open: boolean, close: () => void, rootRef: React.RefObject<HTMLElement | null>, buttonRef: React.RefObject<HTMLButtonElement | null>) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      close();
      buttonRef.current?.focus();
    };
    const onDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open, close, rootRef, buttonRef]);
}

/**
 * Lớp điều khiển cố định của Factory (HUD): khối tên khu (trái dưới), thanh điều hướng dạng viên kính (giữa dưới)
 * gồm nhóm bốn dịch vụ NGANG HÀNG + các khu còn lại, đường về trang chính, đổi ngôn ngữ, 3D/phẳng, cài đặt (phải trên).
 * Mọi thứ đều là liên kết/nút thật, dùng được khi không có 3D.
 */
export function SpaceHud() {
  const zone = useSpace("zone");
  const { ui } = useFactory();
  const current = ui.zones[zone];

  return (
    <>
      <div className="space-top hidden md:flex">
        <Link href="/" className="space-home label" data-cursor="link">
          {ui.homeLink}
        </Link>
        <div className="flex items-center gap-2">
          <ResetView className="space-reset" />
          <ShortcutsHelp />
          <LangSwitch className="space-lang" />
          <SpaceMode />
          <SettingsMenu />
        </div>
      </div>
      <PhoneBar atHub={zone === "hub"} />
      <SpaceNotice />

      <div className="space-title" aria-live="polite">
        <p className="label text-muted">AEGIS / {ui.name.replace(/^Aegis\s*/i, "").replace(/\s*Aegis$/i, "").toUpperCase()}</p>
        <p className="space-title-sheet">
          <span className="text-accent">{current.tag}</span> · {current.name}
        </p>
      </div>

      <SpaceNav />
    </>
  );
}

function NavLink({ zone, className }: { zone: Zone; className?: string }) {
  const { ui, href } = useFactory();
  const active = useSpace("zone");
  return (
    <Link href={href(zone.path)} aria-current={active === zone.id ? "page" : undefined} onClick={remember} data-cursor="link" className={className}>
      <ZoneIcon zone={zone.id} className="space-nav-icon" />
      <span className="space-nav-label">{ui.zones[zone.id].short}</span>
    </Link>
  );
}

/** Thanh điều hướng: 4 dịch vụ (cùng cỡ, không số thứ tự) | Dự án · Studio · Về Aegis · Liên hệ */
function SpaceNav() {
  const { ui, href } = useFactory();
  const zone = useSpace("zone");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  useDismiss(open, () => setOpen(false), rootRef, buttonRef);
  // Đổi khu thì đóng bảng chọn dịch vụ
  useEffect(() => {
    const t = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(t);
  }, [zone]);

  return (
    <nav ref={rootRef} className="space-nav" aria-label={ui.hud.nav}>
      <ul>
        {navServices.map((z) => (
          <li key={z.id} className="space-nav-service">
            <NavLink zone={z} />
          </li>
        ))}
        {/* Điện thoại: 4 dịch vụ gom vào một nút mở bảng chọn 2 × 2 */}
        <li className="space-nav-services-toggle">
          <button
            ref={buttonRef}
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            data-active={isServiceZone(zone)}
            onClick={() => setOpen((v) => !v)}
          >
            <ZoneIcon zone="services" className="space-nav-icon" />
            <span className="space-nav-label">{ui.hud.servicesNav}</span>
          </button>
        </li>
        <li aria-hidden className="space-nav-divider" />
        {navOthers.map((z) => (
          <li key={z.id}>
            <NavLink zone={z} />
          </li>
        ))}
      </ul>
      <div id={panelId} hidden={!open} className="space-services-sheet">
        <p className="label text-muted">{ui.hub.servicesLabel}</p>
        <div className="space-services-grid">
          {navServices.map((z) => (
            <Link key={z.id} href={href(z.path)} onClick={remember} aria-current={zone === z.id ? "page" : undefined} className="space-service-tile">
              <ZoneIcon zone={z.id} className="size-6" />
              <span className="space-service-tile-name">{ui.zones[z.id].name}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

/**
 * Đổi ngôn ngữ, giữ nguyên khu đang xem. Dùng liên kết thường (tải lại trang) thay vì điều hướng phía client: Next giữ lại
 * khung của ngôn ngữ cũ ở trạng thái ẩn, và hai khung sẽ giành nhau một engine 3D. Đổi ngôn ngữ là thao tác hiếm nên chấp nhận.
 */
function LangSwitch({ className }: { className?: string }) {
  const { ui, lang } = useFactory();
  const pathname = useSpace("pathname");
  const sub = stripLocale(pathname).slice(SPACE_BASE.length).replace(/^\//, "");
  return (
    <div role="group" aria-label={ui.language.label} className={className}>
      {locales.map((l) => (
        <a
          key={l}
          href={factoryHref(l, sub)}
          hrefLang={l}
          lang={l}
          aria-current={l === lang ? "true" : undefined}
          aria-label={l === lang ? undefined : ui.language.switchTo}
          className="space-lang-link label"
        >
          {ui.language[l]}
        </a>
      ))}
    </div>
  );
}

/** Nút "Về góc nhìn" (⟲): đưa camera về góc nhìn mặc định của khu đang xem. Chỉ có tác dụng khi cảnh 3D đang chạy. */
function ResetView({ className, label = false }: { className: string; label?: boolean }) {
  const { ui } = useFactory();
  const mode = useSpace("mode");
  if (mode !== "3d") return null;
  return (
    <button type="button" className={className} aria-label={ui.hud.resetView} title={ui.hud.resetView} onClick={() => engineRef.current?.resetView()}>
      <span aria-hidden>⟲</span>
      {label && <span className="ml-2">{ui.hud.resetView}</span>}
    </button>
  );
}

/** Thanh trên của điện thoại: gọn như một HUD game, mọi thứ phụ gom vào một nút menu */
function PhoneBar({ atHub }: { atHub: boolean }) {
  const { ui, href } = useFactory();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  useDismiss(open, () => setOpen(false), rootRef, buttonRef);

  let left: ReactNode;
  if (atHub) {
    left = (
      <p className="space-wordmark">
        <span className="space-wordmark-name">AEGIS</span>
        <span className="space-wordmark-sub label">{ui.zones.hub.tag}</span>
      </p>
    );
  } else {
    left = (
      <Link href={href()} className="space-chip label" data-cursor="link">
        <span aria-hidden>◂</span> {ui.hud.toHub}
      </Link>
    );
  }

  return (
    <div ref={rootRef} className="space-top-phone md:hidden">
      {left}
      <button
        ref={buttonRef}
        type="button"
        className="space-menu-btn"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? ui.hud.menuClose : ui.hud.menu}
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
            {ui.homeLink}
          </Link>
          <LangSwitch className="space-lang space-lang-menu" />
          <ResetView className="space-menu-link label" label />
          <ReplayIntro className="space-menu-link label" />
          <SpaceMode className="space-menu-link label" />
          <div className="space-menu-settings">
            <SettingsMenu inline />
          </div>
        </div>
      )}
    </div>
  );
}
