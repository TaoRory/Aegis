"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AegisMark } from "@/components/brand/AegisLogo";
import { D1Wordmark } from "@/components/demo1/D1Wordmark";
import { ArrowRight } from "@/components/demo1/icons";
import { D2_BASE, d2Contact, d2Href, type D2Dict } from "@/content/demo2";

/**
 * Header /demo2 (website nhiều trang): logo · 6 trang (Dịch vụ có danh sách thả xuống, mở bằng rê chuột hoặc Tab) ·
 * công tắc EN/VI dạng viên · một nút lời mời. Trang đang xem được đánh dấu aria-current.
 * Điện thoại: logo + nút lời mời + "Menu" (danh sách chữ lớn kèm 4 dịch vụ và công tắc ngôn ngữ).
 */
export function D2Header({ t }: { t: D2Dict }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const close = () => setOpenAt(null);

  // Phần đường dẫn sau /demo2 hoặc /demo2/vi → dùng cho công tắc ngôn ngữ và mục đang xem
  let rest = pathname.slice(D2_BASE.length).replace(/^\/vi(?=\/|$)/, "");
  // Bài blog có slug riêng theo ngôn ngữ: đổi ngôn ngữ thì về danh sách bài
  const switchRest = rest.startsWith("/blog/") ? "/blog" : rest;
  if (rest === "/") rest = "";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpenAt(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const lang = (
    <div className="d2-lang" role="group" aria-label={t.chrome.langLabel}>
      <Link href={d2Href("en", switchRest)} hrefLang="en" aria-current={t.lang === "en" ? "true" : undefined}>
        EN
      </Link>
      <Link href={d2Href("vi", switchRest)} hrefLang="vi" aria-current={t.lang === "vi" ? "true" : undefined}>
        VI
      </Link>
    </div>
  );

  return (
    <header className="d2-top" data-scrolled={scrolled} data-open={open}>
      <div className="d2-wrap d2-top-row">
        <Link href={d2Href(t.lang)} aria-label={t.chrome.home} className="d2-logo" onClick={close}>
          <AegisMark small className="h-7 w-auto" />
          <D1Wordmark className="h-[0.8rem] w-auto" />
        </Link>
        <nav aria-label={t.chrome.nav} className="d2-nav">
          <ul>
            {t.nav.map((item) => {
              const current = rest === item.path || rest.startsWith(`${item.path}/`);
              return (
                <li key={item.path} className={item.path === "/services" ? "d2-has-sub" : undefined}>
                  <Link href={d2Href(t.lang, item.path)} aria-current={current ? "page" : undefined}>
                    {item.label}
                  </Link>
                  {item.path === "/services" && (
                    <ul className="d2-sub">
                      {t.services.items.map((service) => (
                        <li key={service.id}>
                          <Link href={d2Href(t.lang, `/services/${service.id}`)}>
                            <span>{service.name}</span>
                            <span>{service.line}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="d2-top-actions">
          {lang}
          <Link href={d2Contact(t.lang)} className="d2-btn d2-btn-primary" onClick={close}>
            {t.cta}
          </Link>
          <button type="button" className="d2-menu-toggle" aria-expanded={open} aria-controls="d2-menu" onClick={() => setOpenAt(open ? null : pathname)}>
            {open ? t.chrome.close : t.chrome.menu}
          </button>
        </div>
      </div>
      {open && (
        <div id="d2-menu" className="d2-menu d2-wrap">
          <nav aria-label={t.chrome.nav}>
            {t.nav.map((item) => (
              <div key={item.path}>
                <Link href={d2Href(t.lang, item.path)} className="d2-menu-link" onClick={close}>
                  {item.label}
                  <ArrowRight className="size-5" />
                </Link>
                {item.path === "/services" && (
                  <ul className="d2-menu-sub">
                    {t.services.items.map((service) => (
                      <li key={service.id}>
                        <Link href={d2Href(t.lang, `/services/${service.id}`)} onClick={close}>
                          {service.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>
          {lang}
        </div>
      )}
    </header>
  );
}
