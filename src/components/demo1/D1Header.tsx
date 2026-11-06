"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AegisLogo } from "@/components/brand/AegisLogo";
import { D1_BASE, d1 } from "@/content/demo1";
import { getLenis } from "@/lib/motion";

import { ArrowRight } from "./icons";

/**
 * Header /demo1: logo bên trái, menu chữ ở giữa (máy tính), một nút "Trao đổi nhu cầu" bên phải.
 * Điện thoại: nút ngắn + "Menu" mở danh sách chữ lớn toàn màn hình (Esc để đóng, phần trang phía sau tạm inert).
 * Viền dưới chỉ hiện khi đã cuộn khỏi đầu trang.
 */
export function D1Header() {
  const { chrome, nav, cta } = d1;
  const pathname = usePathname();
  // Menu gắn với địa chỉ đang xem: đổi trang (kể cả nút Back) là menu tự đóng, không cần effect
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const setOpen = (value: boolean) => setOpenAt(value ? pathname : null);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrolled(window.scrollY > 8));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const behind = [document.getElementById("d1-main"), document.getElementById("d1-footer")].filter((n): n is HTMLElement => !!n);
    behind.forEach((n) => (n.inert = true));
    root.style.overflow = "hidden";
    getLenis()?.stop();
    menuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenAt(null);
        toggleRef.current?.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 64rem)");
    const onDesktop = () => desktop.matches && setOpenAt(null);
    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onDesktop);
    return () => {
      behind.forEach((n) => (n.inert = false));
      root.style.overflow = "";
      getLenis()?.start();
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onDesktop);
    };
  }, [open]);

  return (
    <header className="d1-header" data-scrolled={scrolled || open}>
      <div className="d1-wrap flex h-(--d1-header) items-center justify-between gap-6">
        <Link href={D1_BASE} aria-label={chrome.home} className="shrink-0" onClick={() => setOpen(false)}>
          <AegisLogo />
        </Link>

        <nav aria-label={chrome.navLabel} className="d1-nav hidden lg:block">
          <ul className="flex items-center gap-7">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link href={cta.href} className="d1-btn d1-btn-ink max-sm:h-10 max-sm:pl-3.5" onClick={() => setOpen(false)}>
            <span className="sm:hidden">{cta.short}</span>
            <span className="max-sm:hidden">{cta.label}</span>
            <span className="d1-btn-icon max-sm:size-7">
              <ArrowRight />
            </span>
          </Link>
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={open}
            aria-controls="d1-menu"
            onClick={() => setOpen(!open)}
            className="d1-btn d1-btn-soft max-sm:h-10 lg:hidden"
          >
            {open ? chrome.close : chrome.menu}
          </button>
        </div>
      </div>

      {open && (
        <div ref={menuRef} id="d1-menu" role="dialog" aria-modal="true" aria-label={chrome.menu} className="d1-menu lg:hidden">
          <nav aria-label={chrome.navLabel} className="d1-wrap flex-1 pt-4">
            <ul>
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="d1-menu-link" onClick={() => setOpen(false)}>
                    {item.label}
                    <ArrowRight className="size-5 text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="d1-wrap pt-8 pb-10">
            <Link href={cta.href} className="d1-btn d1-btn-ink h-12 w-full justify-between" onClick={() => setOpen(false)}>
              {cta.label}
              <span className="d1-btn-icon">
                <ArrowRight />
              </span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
