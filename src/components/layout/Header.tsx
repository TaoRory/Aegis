"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { flushSync } from "react-dom";

import { SettingsMenu } from "@/components/layout/SettingsMenu";
import { ButtonLink, Roll } from "@/components/ui/Button";
import { localizeHref, SmartLink } from "@/components/ui/SmartLink";
import { Wordmark } from "@/components/ui/Wordmark";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import { getLenis, scrollToTarget } from "@/lib/motion";

/** id section trên trang chủ ứng với từng mục menu dạng "/#id" */
const sectionIds = siteConfig.nav.filter((item) => item.href.includes("#")).map((item) => item.href.split("#")[1]);

function isActive(href: string, active: string | null, pathname: string) {
  return href.includes("#") ? pathname === "/" && active === href.split("#")[1] : pathname.startsWith(href);
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [hidden, setHidden] = useState(false);

  // Đánh dấu mục đang xem: theo dõi mọi chương; chương không có trên menu (hero, cách làm việc) thì bỏ đánh dấu
  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>("[data-chapter]")];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(sectionIds.includes(entry.target.id) ? entry.target.id : null);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Ẩn header khi cuộn xuống, hiện lại khi cuộn lên hoặc gần đầu trang (không đè nội dung khi đọc)
  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (Math.abs(y - last) < 6) return;
        setHidden(y > last && y > window.innerHeight * 0.6);
        last = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Menu toàn màn hình: khóa cuộn, Esc để đóng, đóng khi chuyển sang desktop
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    getLenis()?.stop();
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 64rem)");
    const onChange = () => desktop.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onChange);
    return () => {
      document.body.style.overflow = overflow;
      getLenis()?.start();
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onChange);
    };
  }, [open]);

  // Liên kết trong menu: đóng menu (mở khóa cuộn) trước, rồi cuộn và chuyển focus tới section.
  // Link sang trang khác thì chỉ đóng menu và để trình duyệt điều hướng.
  const navigateFromMenu = (event: MouseEvent<HTMLAnchorElement>) => {
    const href = event.currentTarget.getAttribute("href");
    const hash = href?.includes("#") ? `#${href.split("#")[1]}` : null;
    const target = hash && window.location.pathname === "/" ? document.querySelector<HTMLElement>(hash) : null;
    if (!href || !hash || !target) return setOpen(false);
    event.preventDefault();
    event.stopPropagation();
    flushSync(() => setOpen(false));
    document.body.style.overflow = "";
    getLenis()?.start();
    scrollToTarget(target);
    history.pushState(null, "", hash);
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  };

  return (
    <>
      {/* Lớp blend (difference): luôn tương phản trên cả nền giấy lẫn nền mực */}
      <header
        data-hidden={hidden && !open}
        className="site-header fixed inset-x-0 top-0 z-50 text-blend mix-blend-difference"
      >
        <div className="container-page flex h-(--header-h) items-center justify-between gap-6">
          <SmartLink
            href={pathname === "/" ? "#trang-chu" : "/"}
            aria-label={`${siteConfig.name} – về trang chủ`}
            onClick={() => setOpen(false)}
          >
            <Wordmark />
          </SmartLink>

          <nav aria-label="Điều hướng chính" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {siteConfig.nav.map((item) => {
                const current = isActive(item.href, active, pathname);
                return (
                  <li key={item.href}>
                    <SmartLink
                      href={localizeHref(item.href, pathname)}
                      aria-current={current ? (item.href.includes("#") ? "location" : "page") : undefined}
                      className={cn("nav-link label inline-flex items-baseline gap-2", current && "is-active")}
                    >
                      <Roll>{item.label}</Roll>
                    </SmartLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Chừa chỗ cho nút CTA (nằm ở lớp riêng, không blend) */}
          <span aria-hidden className="hidden w-[11.5rem] lg:block xl:w-[18.5rem]" />

          <button
            ref={toggleRef}
            type="button"
            className="label inline-flex h-11 items-center gap-2 lg:hidden"
            aria-expanded={open}
            aria-controls="menu-di-dong"
            aria-label={open ? "Đóng menu" : "Mở menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span aria-hidden>{open ? "Đóng" : "Menu"}</span>
            <span aria-hidden className="relative block h-2 w-5">
              <span className={cn("absolute left-0 h-px w-5 bg-current transition-transform duration-300", open ? "top-1 rotate-45" : "top-0")} />
              <span className={cn("absolute left-0 h-px w-5 bg-current transition-transform duration-300", open ? "top-1 -rotate-45" : "top-2")} />
            </span>
          </button>
        </div>
      </header>

      <div
        data-surface="light"
        data-hidden={hidden && !open}
        className="site-header header-cta fixed top-0 z-50 hidden h-(--header-h) items-center sm:flex"
      >
        <SettingsMenu className="mr-3 hidden lg:block" />
        <ButtonLink href={localizeHref(siteConfig.cta.href, pathname)} className="h-10 px-4">
          {siteConfig.cta.label}
        </ButtonLink>
      </div>

      <div
        id="menu-di-dong"
        ref={panelRef}
        inert={!open}
        data-open={open}
        data-surface="dark"
        className="mobile-menu fixed inset-0 z-40 flex flex-col bg-bg pt-(--header-h) lg:hidden"
      >
        <nav aria-label="Điều hướng di động" className="container-page flex flex-1 flex-col justify-between py-8">
          <ul>
            {siteConfig.nav.map((item, index) => (
              <li key={item.href} className="mobile-menu-item border-b border-line" style={{ "--i": index } as CSSProperties}>
                <SmartLink
                  href={localizeHref(item.href, pathname)}
                  onClick={navigateFromMenu}
                  aria-current={isActive(item.href, active, pathname) ? "location" : undefined}
                  className="flex items-baseline justify-between py-4 text-[clamp(2.5rem,12vw,4rem)] leading-none font-semibold tracking-[-0.04em] aria-[current]:text-accent"
                >
                  {item.label}
                  <span aria-hidden className="label text-muted">
                    0{index + 1}
                  </span>
                </SmartLink>
              </li>
            ))}
          </ul>
          <div className="mobile-menu-item" style={{ "--i": siteConfig.nav.length } as CSSProperties}>
            <ButtonLink href={localizeHref(siteConfig.cta.href, pathname)} className="w-full" onClick={navigateFromMenu}>
              {siteConfig.cta.label}
            </ButtonLink>
            <p className="label mt-6 text-muted">{siteConfig.tagline}</p>
            <SettingsMenu inline className="mt-8" />
          </div>
        </nav>
      </div>
    </>
  );
}
