"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { AegisMark } from "@/components/brand/AegisLogo";
import { D1Wordmark } from "@/components/demo1/D1Wordmark";
import { ArrowRight } from "@/components/demo1/icons";
import { d2Contact, d2Home, type D2Dict } from "@/content/demo2";

/**
 * Header /demo2: logo · 4 liên kết neo · công tắc EN/VI dạng viên · một nút lời mời.
 * Điện thoại: logo + nút lời mời + "Menu" (mở danh sách chữ lớn kèm công tắc ngôn ngữ). Dính trên cùng, nền đặc, viền tóc khi đã cuộn.
 */
export function D2Header({ t, sub = "" }: { t: D2Dict; sub?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const home = d2Home(t.lang);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const lang = (
    <div className="d2-lang" role="group" aria-label={t.chrome.langLabel}>
      <Link href={`${d2Home("en")}${sub}`} hrefLang="en" aria-current={t.lang === "en" ? "true" : undefined}>
        EN
      </Link>
      <Link href={`${d2Home("vi")}${sub}`} hrefLang="vi" aria-current={t.lang === "vi" ? "true" : undefined}>
        VI
      </Link>
    </div>
  );

  return (
    <header className="d2-top" data-scrolled={scrolled} data-open={open}>
      <div className="d2-wrap d2-top-row">
        <Link href={home} aria-label={t.chrome.home} className="d2-logo" onClick={() => setOpen(false)}>
          <AegisMark small className="h-7 w-auto" />
          <D1Wordmark className="h-[0.8rem] w-auto" />
        </Link>
        <nav aria-label={t.chrome.nav} className="d2-nav">
          <ul>
            {t.nav.map((item) => (
              <li key={item.id}>
                <Link href={`${home}#${item.id}`}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="d2-top-actions">
          {lang}
          <Link href={d2Contact(t.lang)} className="d2-btn d2-btn-primary" onClick={() => setOpen(false)}>
            {t.cta}
          </Link>
          <button type="button" className="d2-menu-toggle" aria-expanded={open} aria-controls="d2-menu" onClick={() => setOpen(!open)}>
            {open ? t.chrome.close : t.chrome.menu}
          </button>
        </div>
      </div>
      {open && (
        <div id="d2-menu" className="d2-menu d2-wrap">
          <nav aria-label={t.chrome.nav}>
            {t.nav.map((item) => (
              <Link key={item.id} href={`${home}#${item.id}`} className="d2-menu-link" onClick={() => setOpen(false)}>
                {item.label}
                <ArrowRight className="size-5" />
              </Link>
            ))}
          </nav>
          {lang}
        </div>
      )}
    </header>
  );
}
