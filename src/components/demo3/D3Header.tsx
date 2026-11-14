"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FocusEvent, type PointerEvent } from "react";
import { usePathname } from "next/navigation";

import { AegisMark } from "@/components/brand/AegisLogo";
import { D1Wordmark } from "@/components/demo1/D1Wordmark";
import { ArrowRight } from "@/components/demo1/icons";
import { D3_BASE, d3Contact, d3Href, type D3Dict } from "@/content/demo3";
import { getLenis } from "@/lib/motion";

import { D3Btn } from "./D3Btn";
import { D3Link } from "./D3Link";

/** Viên chỉ mục trên thanh điều hướng: khoảng cách tới mép trái / phải của <nav> và mục nó đang nằm dưới */
type Pill = { l: number; r: number; path: string };
type PillState = Pill & { on: boolean; slide: boolean };
type MenuState = "closed" | "open" | "closing";

/**
 * Chỗ viên chỉ mục vừa đứng, dùng chung cho mọi header. Mỗi trang có header riêng (nó phụ thuộc ngôn ngữ), và Next giữ trang cũ
 * ở trạng thái ẩn rồi trả lại nguyên state khi quay về. Muốn viên TRƯỢT từ mục cũ sang mục mới khi đổi trang thì header vừa
 * hiện phải biết viên vừa đứng ở đâu, bất kể nó là header mới hay header cũ được hiện lại.
 */
let lastPill: Pill | null = null;

/** Thời gian đóng menu điện thoại (khớp với animation d3-menu-out trong shell.css) */
const MENU_OUT_MS = 320;

/** Đóng bằng nút / Esc: có animation nếu trang đang bật chuyển động, không thì gỡ ngay */
const shutMenu = (state: MenuState): MenuState => (state === "open" && document.documentElement.dataset.motion === "on" ? "closing" : "closed");

/**
 * Header /demo3: logo · 6 trang (Dịch vụ có danh sách thả xuống, mở bằng rê chuột hoặc Tab) · công tắc EN/VI · một nút lời mời.
 *
 * Chuyển động (mọi thứ dưới đây chỉ là lớp thêm; không JS thì header vẫn đủ: trang đang xem tô nền tối bằng CSS của /demo2):
 * - Viên chỉ mục: một viên tối nằm dưới mục đang xem; rê chuột sang mục khác thì viên trượt theo, rời ra thì trượt về.
 *   Đổi trang: viên trượt từ mục cũ sang mục mới (xem `lastPill`). Viên là một bản sao tối của cả thanh, chỉ lộ ra qua một cửa sổ clip-path:
 *   chữ đảo màu đúng tới đâu viên trượt tới đó, còn chữ thật bên dưới luôn đủ tương phản. Chỉ animate clip-path.
 * - Danh sách Dịch vụ: mở bằng clip-path từ trên xuống, bốn dòng so le (CSS).
 * - Điện thoại: menu là một tấm phủ kín màn hình dưới header, mở từ trên xuống, các dòng trồi lên so le; trang phía sau không cuộn;
 *   Esc đóng và trả focus về nút Menu; Tab xoay vòng trong header.
 */
export function D3Header({ t }: { t: D3Dict }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState<MenuState>("closed");
  const [hot, setHot] = useState<string | null>(null);
  const [pill, setPill] = useState<PillState | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const open = menu === "open";

  // Phần đường dẫn sau tiền tố ngôn ngữ (/vi) → dùng cho công tắc ngôn ngữ và mục đang xem
  let rest = pathname.slice(D3_BASE.length).replace(/^\/vi(?=\/|$)/, "");
  // Bài blog có slug riêng theo ngôn ngữ: đổi ngôn ngữ thì về danh sách bài
  const switchRest = rest.startsWith("/blog/") ? "/blog" : rest;
  if (rest === "/") rest = "";
  const current = t.nav.find((item) => rest === item.path || rest.startsWith(`${item.path}/`))?.path ?? null;
  const target = hot ?? current;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Header vừa được gắn, hoặc vừa được hiện lại sau khi nằm ẩn: bỏ trạng thái rê chuột cũ và đặt viên về chỗ nó vừa đứng ở trang trước
  // (không chuyển động, trước khi trình duyệt vẽ). Hiệu ứng bên dưới sẽ cho nó trượt từ đó tới mục của trang này.
  useLayoutEffect(() => {
    const start = lastPill;
    const restore = () => {
      setHot(null);
      setPill((prev) => (start ? { ...start, on: true, slide: false } : prev && { ...prev, on: false, slide: false }));
    };
    restore();
  }, []);

  // Đặt viên chỉ mục dưới mục đích (mục đang rê, nếu không thì trang đang xem). Đo lại khi thanh đổi kích thước (font tải xong, đổi cỡ cửa sổ).
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const place = (slide: boolean) => {
      const link = target ? nav.querySelector<HTMLElement>(`a[data-path="${target}"]`) : null;
      const box = nav.getBoundingClientRect();
      // Không có mục đích (trang chủ, không rê chuột) hoặc thanh đang ẩn (điện thoại): viên tắt, giữ nguyên chỗ để lần sau trượt tiếp từ đó
      if (!link || !target || box.width === 0) {
        if (box.width > 0) lastPill = null;
        setPill((prev) => (prev && prev.on ? { ...prev, on: false, slide } : prev));
        return;
      }
      const rect = link.getBoundingClientRect();
      const next: Pill = { l: Math.round(rect.left - box.left), r: Math.round(box.right - rect.right), path: target };
      lastPill = next;
      setPill((prev) => {
        if (prev && prev.on && prev.l === next.l && prev.r === next.r && prev.path === next.path) return prev;
        // Lần hiện đầu tiên sau khi tải trang: đứng sẵn dưới mục đang xem, không trượt từ đâu tới
        return { ...next, on: true, slide: slide && (prev !== null || hot !== null) };
      });
    };
    // Chờ một khung hình: viên phải được vẽ ở chỗ cũ trước thì CSS mới có điểm đầu để trượt
    const frame = requestAnimationFrame(() => place(true));
    const observer = new ResizeObserver(() => place(false));
    observer.observe(nav);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [target, hot]);

  // Menu điện thoại đang mở: khoá cuộn trang phía sau, Esc để đóng, Tab xoay vòng trong header
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.dataset.d3Menu = "open";
    getLenis()?.stop();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenu(shutMenu);
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !headerRef.current) return;
      const stops = [...headerRef.current.querySelectorAll<HTMLElement>("a[href], button")].filter((el) => el.getClientRects().length > 0);
      const first = stops[0];
      const last = stops[stops.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      delete root.dataset.d3Menu;
      getLenis()?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Đóng có chuyển động: giữ tấm menu thêm một nhịp cho animation đóng rồi mới gỡ khỏi DOM
  useEffect(() => {
    if (menu !== "closing") return;
    const timer = window.setTimeout(() => setMenu("closed"), MENU_OUT_MS);
    return () => window.clearTimeout(timer);
  }, [menu]);

  /** Bấm một liên kết: đóng menu ngay và thôi "đang rê chuột"; phần chuyển trang lo phần còn lại */
  const leave = () => {
    setMenu("closed");
    setHot(null);
  };

  const onItemEnter = (path: string) => (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse") setHot(path);
  };
  const onItemFocus = (path: string) => (event: FocusEvent<HTMLElement>) => {
    if (event.target.matches(":focus-visible")) setHot(path);
  };
  const onNavBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setHot(null);
  };

  const lang = (
    <div className="d2-lang" role="group" aria-label={t.chrome.langLabel}>
      <D3Link href={d3Href("en", switchRest)} hrefLang="en" aria-current={t.lang === "en" ? "true" : undefined} onClick={leave}>
        EN
      </D3Link>
      <D3Link href={d3Href("vi", switchRest)} hrefLang="vi" aria-current={t.lang === "vi" ? "true" : undefined} onClick={leave}>
        VI
      </D3Link>
    </div>
  );

  return (
    <header ref={headerRef} className="d2-top" data-scrolled={scrolled} data-open={menu !== "closed"}>
      <div className="d2-wrap d2-top-row">
        <D3Link href={d3Href(t.lang)} aria-label={t.chrome.home} className="d2-logo" onClick={leave}>
          <AegisMark small className="h-7 w-auto" />
          <D1Wordmark className="h-[0.8rem] w-auto" />
        </D3Link>
        <nav ref={navRef} aria-label={t.chrome.nav} className="d2-nav" data-ind={pill ? "on" : undefined} onPointerLeave={() => setHot(null)} onBlur={onNavBlur}>
          {pill && (
            <span
              aria-hidden
              className="d3-nav-pill"
              data-on={pill.on}
              data-slide={pill.slide}
              style={{ "--pl": `${pill.l}px`, "--pr": `${pill.r}px` } as CSSProperties}
            >
              {t.nav.map((item) => (
                <span key={item.path}>{item.label}</span>
              ))}
            </span>
          )}
          <ul>
            {t.nav.map((item) => (
              <li
                key={item.path}
                className={item.path === "/services" ? "d2-has-sub" : undefined}
                onPointerEnter={onItemEnter(item.path)}
                onFocus={onItemFocus(item.path)}
              >
                <D3Link
                  href={d3Href(t.lang, item.path)}
                  aria-current={current === item.path ? "page" : undefined}
                  data-path={item.path}
                  data-lit={pill?.on && pill.path === item.path ? "true" : undefined}
                  onClick={leave}
                >
                  {item.label}
                </D3Link>
                {item.path === "/services" && (
                  <ul className="d2-sub">
                    {t.services.items.map((service, index) => (
                      <li key={service.id} style={{ "--i": index } as CSSProperties}>
                        <D3Link href={d3Href(t.lang, `/services/${service.id}`)} onClick={leave}>
                          <span>{service.name}</span>
                          <span>{service.line}</span>
                        </D3Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="d2-top-actions">
          {lang}
          <D3Btn href={d3Contact(t.lang)} arrow={false} onClick={leave}>
            {t.cta}
          </D3Btn>
          <button
            ref={toggleRef}
            type="button"
            className="d2-menu-toggle"
            aria-expanded={open}
            aria-controls="d2-menu"
            onClick={() => setMenu(open ? shutMenu : "open")}
          >
            {open ? t.chrome.close : t.chrome.menu}
          </button>
        </div>
      </div>
      {menu !== "closed" && (
        <div id="d2-menu" className="d2-menu" data-state={menu} data-lenis-prevent="">
          <div className="d2-wrap">
            <nav aria-label={t.chrome.nav}>
              {t.nav.map((item, index) => (
                <div key={item.path} className="d3-menu-item" style={{ "--i": index } as CSSProperties}>
                  <D3Link href={d3Href(t.lang, item.path)} className="d2-menu-link" aria-current={current === item.path ? "page" : undefined} onClick={leave}>
                    {item.label}
                    <ArrowRight className="size-5" />
                  </D3Link>
                  {item.path === "/services" && (
                    <ul className="d2-menu-sub">
                      {t.services.items.map((service) => (
                        <li key={service.id}>
                          <D3Link href={d3Href(t.lang, `/services/${service.id}`)} onClick={leave}>
                            {service.name}
                          </D3Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </nav>
            <div className="d3-menu-item" style={{ "--i": t.nav.length } as CSSProperties}>
              {lang}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
