"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AegisMark } from "@/components/brand/AegisLogo";
import { D1_BASE, d1 } from "@/content/demo1";
import { getLenis } from "@/lib/motion";

import { D1Wordmark } from "./D1Wordmark";
import { ArrowRight } from "./icons";

/**
 * Header nổi /demo1 (không có thanh nền):
 * - trái: dấu Möbius + chữ AEGIS của bộ nhận diện;
 * - giữa (máy tính): "viên thuốc" tối chứa menu chữ mono, mục đang xem đổi nền, kèm dải chữ chạy BUILD / DEPLOY / SCALE · bốn mảng;
 * - phải: nút "Trao đổi nhu cầu"; điện thoại thêm "Menu" mở danh sách chữ lớn toàn màn hình.
 * Khi phần trang phía sau là vùng tối, header tự đổi sang tông sáng (đọc data-d1-tone của phần tử dưới mép trái header).
 */
export function D1Header() {
  const { chrome, nav, cta } = d1;
  const pathname = usePathname();
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const setOpen = (value: boolean) => setOpenAt(value ? pathname : null);
  const [onDark, setOnDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Tông của phần trang nằm dưới header
  useEffect(() => {
    let raf = 0;
    const root = document.documentElement;
    const check = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const under = document.elementFromPoint(6, 30);
        setOnDark(under?.closest("[data-d1-tone]")?.getAttribute("data-d1-tone") === "dark");
        setScrolled(window.scrollY > 8);
        // Bản đồ trang + nút lối tắt chỉ hiện sau màn đầu (trang không có màn đầu: hiện luôn)
        const hero = document.getElementById("mo-dau");
        const past = !hero || hero.getBoundingClientRect().bottom < window.innerHeight * 0.35;
        if (past) root.dataset.d1PastHero = "";
        else delete root.dataset.d1PastHero;
      });
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    // Hero đổi tông khi cuộn (cánh cửa tối): theo dõi thay đổi thuộc tính
    const observer = new MutationObserver(check);
    observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ["data-d1-tone"] });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      observer.disconnect();
      delete root.dataset.d1PastHero;
    };
  }, [pathname]);

  // Mục đang xem (chỉ trang chủ /demo1)
  useEffect(() => {
    const sections = nav.map((item) => document.getElementById(item.id)).filter((n): n is HTMLElement => !!n);
    if (!sections.length) return;
    // Màn đầu và footer cũng được theo dõi để bỏ đánh dấu khi ra ngoài các mục của menu
    const extra = [document.getElementById("mo-dau"), document.getElementById("lien-he"), document.getElementById("d1-footer")].filter((n): n is HTMLElement => !!n);
    const ids = new Set(nav.map((item) => item.id));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(ids.has(entry.target.id) ? entry.target.id : null);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    extra.forEach((section) => observer.observe(section));
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname, nav]);

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
    <header className="d1-top" data-d1-tone={onDark && !open ? "dark" : undefined} data-open={open} data-scrolled={scrolled}>
      <div className="d1-wrap d1-top-row">
        <Link href={D1_BASE} aria-label={chrome.home} className="d1-top-logo" onClick={() => setOpen(false)}>
          <AegisMark small className="h-7 w-auto" />
          <D1Wordmark className="h-[0.78rem] w-auto" />
        </Link>

        <nav aria-label={chrome.navLabel} className="d1-pill">
          <ul>
            {nav.map((item) => (
              <li key={item.id}>
                <Link href={item.href} aria-current={active === item.id ? "true" : undefined}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div aria-hidden className="d1-ticker">
            <span>
              {chrome.ticker}
              {chrome.ticker}
            </span>
          </div>
        </nav>

        <div className="d1-top-actions">
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
                <li key={item.id}>
                  <Link href={item.href} className="d1-menu-link" onClick={() => setOpen(false)}>
                    {item.label}
                    <ArrowRight className="size-5 text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div aria-hidden className="d1-ticker d1-ticker-menu">
            <span>
              {chrome.ticker}
              {chrome.ticker}
            </span>
          </div>
          <div className="d1-wrap pt-6 pb-10">
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
