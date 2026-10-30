"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import { coverCopy } from "@/content/site/cover";
import { gsap, MQ } from "@/lib/motion";

/**
 * Màn chuyển trang "vẽ bản vẽ": bấm link nội bộ thì một tấm nền mực phủ từ dưới lên, lưới cột và đường dẫn ngang dọc kẻ ra,
 * chữ AEGIS được vẽ nét theo nét trong khung chọn có nhãn kích thước, đồng hồ % chạy; trang mới tải xong thì tấm phủ cuộn lên trên.
 * Đặt trong layout gốc (tồn tại xuyên suốt mọi route) nên chạy được cả khi đổi ngôn ngữ hay vào Factory.
 *
 * Cách hoạt động: bắt click ở pha capture của document, chặn điều hướng mặc định của next/link (Link bỏ qua khi event đã bị preventDefault,
 * nhưng onClick của chính link như đóng menu vẫn chạy), chạy nửa đầu hiệu ứng rồi mới router.push; thấy URL đổi thì chờ nét vẽ xong và mở màn.
 * Không áp dụng cho: giảm chuyển động, link ngoài / cùng trang / mở tab mới, điều hướng trong Factory (camera tự bay), mở mẫu từ thư viện
 * (có hiệu ứng ảnh phóng riêng), nút Back/Forward của trình duyệt (không chặn được trước khi đổi trang).
 */
const MARK = [
  "M4 37L19 3L34 37M10 25H28", // A
  "M64 3H44V37H64M44 20H61", // E
  "M99.3 8.7A16 16 0 1 0 104 20H90", // G
  "M114 3V37", // I
  "M141 12A9.5 9 0 0 0 131.5 3A9.5 9 0 0 0 122 12A9.5 9 0 0 0 131.5 21A9.5 8 0 0 1 141 29A9.5 8 0 0 1 131.5 37A9.5 8 0 0 1 122 29", // S
];
const LABEL = "AEGIS · 150×40";
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/·×-";
const COLS = 12;
const FAILSAFE_MS = 6000;

/** Hiện chữ dần từ trái sang, vài ký tự phía trước nhảy ngẫu nhiên */
function scramble(el: HTMLElement, text: string, duration: number) {
  const state = { p: 0 };
  return gsap.to(state, {
    p: 1,
    duration,
    ease: "none",
    onUpdate() {
      const done = Math.floor(state.p * text.length);
      let out = text.slice(0, done);
      for (let i = done; i < Math.min(text.length, done + 3); i++) out += text[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      el.textContent = out;
    },
    onComplete() {
      el.textContent = text;
    },
  });
}

const inFactory = (path: string) => {
  const parts = path.split("/").filter(Boolean);
  const rest = parts[0] === "en" ? parts.slice(1) : parts;
  return rest[0] === "factory" || (rest[0] === "web" && rest[1] === "factory");
};

export function RouteCover() {
  const pathname = usePathname();
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const copy = coverCopy[pathname === "/en" || pathname.startsWith("/en/") ? "en" : "vi"];

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const q = <T extends Element>(selector: string) => root.querySelector<T>(selector)!;
    const qa = <T extends Element>(selector: string) => [...root.querySelectorAll<T>(selector)];
    const el = {
      cols: qa(".route-cover-cols span"),
      meta: qa(".route-cover-meta"),
      stage: q(".route-cover-stage"),
      guidesH: qa(".route-cover-guide-h"),
      guidesV: qa(".route-cover-guide-v"),
      box: q(".route-cover-box"),
      label: q<HTMLElement>(".route-cover-label"),
      paths: qa<SVGPathElement>(".route-cover-mark path"),
      dot: q(".route-cover-mark circle"),
      to: q<HTMLElement>(".route-cover-to"),
      count: q<HTMLElement>(".route-cover-count"),
    };

    let busy = false;
    let timeline: gsap.core.Timeline | null = null;
    let raf = 0;
    let failsafe = 0;

    const live = root.parentElement?.querySelector<HTMLElement>(".route-cover-live") ?? null;
    const finish = () => {
      busy = false;
      root.dataset.active = "false";
      document.body.removeAttribute("aria-busy");
      if (live) live.textContent = "";
      gsap.set(root, { visibility: "hidden" });
    };

    /** Nửa đầu: phủ kín và vẽ chữ. onCovered gọi ngay khi tấm phủ che kín màn hình; resolve khi nét vẽ xong. */
    const cover = (to: string, onCovered: () => void) => {
      const n = { v: 0 };
      timeline?.kill();
      gsap.set(root, { visibility: "visible", clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(el.stage, { yPercent: 0, opacity: 1 });
      gsap.set(el.cols, { scaleY: 0, transformOrigin: "50% 100%" });
      gsap.set(el.meta, { opacity: 0 });
      gsap.set(el.guidesH, { scaleX: 0, transformOrigin: "0% 50%" });
      gsap.set(el.guidesV, { scaleY: 0, transformOrigin: "50% 0%" });
      gsap.set(el.box, { opacity: 0 });
      gsap.set(el.paths, { strokeDashoffset: 1 });
      gsap.set(el.dot, { scale: 0, transformOrigin: "50% 50%" });
      el.label.textContent = "";
      el.to.textContent = "";
      el.count.textContent = "0%";
      return new Promise<void>((resolve) => {
        timeline = gsap
          .timeline({ onComplete: resolve })
          .to(root, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55, ease: "power4.inOut", onComplete: onCovered })
          .to(el.cols, { scaleY: 1, duration: 0.65, ease: "expo.inOut", stagger: 0.022 }, 0.1)
          .to(el.meta, { opacity: 1, duration: 0.3 }, 0.32)
          .add(scramble(el.to, to.toUpperCase(), 0.45), 0.36)
          .to(n, { v: 100, duration: 0.8, ease: "power2.inOut", onUpdate: () => (el.count.textContent = `${Math.round(n.v)}%`) }, 0.32)
          .to(el.guidesH, { scaleX: 1, duration: 0.55, ease: "expo.inOut", stagger: 0.05 }, 0.28)
          .to(el.guidesV, { scaleY: 1, duration: 0.55, ease: "expo.inOut", stagger: 0.05 }, 0.34)
          .to(el.box, { opacity: 1, duration: 0.25 }, 0.5)
          .add(scramble(el.label, LABEL, 0.35), 0.5)
          .to(el.paths, { strokeDashoffset: 0, duration: 0.55, ease: "power2.inOut", stagger: 0.07 }, 0.42)
          .to(el.dot, { scale: 1, duration: 0.3, ease: "back.out(3)" }, 0.9);
      });
    };

    /** Nửa sau: vạch dẫn thu lại, chữ trôi lên, tấm phủ cuộn khỏi màn hình */
    const reveal = () => {
      timeline?.kill();
      timeline = gsap
        .timeline({ onComplete: finish })
        .to(el.guidesH, { scaleX: 0, transformOrigin: "100% 50%", duration: 0.45, ease: "expo.in" }, 0)
        .to(el.guidesV, { scaleY: 0, transformOrigin: "50% 100%", duration: 0.45, ease: "expo.in" }, 0)
        .to([el.box, ...el.meta], { opacity: 0, duration: 0.2 }, 0.1)
        .to(el.stage, { yPercent: -60, opacity: 0, duration: 0.55, ease: "power3.in" }, 0.1)
        .to(root, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.7, ease: "power4.inOut" }, 0.2);
    };

    const start = (url: URL) => {
      busy = true;
      root.dataset.active = "true";
      // Trình đọc màn hình: lớp phủ là aria-hidden nên báo bằng vùng live riêng + aria-busy
      document.body.setAttribute("aria-busy", "true");
      if (live) live.textContent = live.dataset.text ?? "";
      const from = location.pathname + location.search;
      let drawn = false;
      let arrived = false;
      const settle = () => {
        if (!drawn || !arrived) return;
        window.clearTimeout(failsafe);
        reveal();
      };
      // Chờ URL đổi (Next đã chuyển trang) rồi thêm hai khung hình cho trang mới vẽ xong
      const watch = () => {
        if (location.pathname + location.search !== from) {
          raf = requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              arrived = true;
              settle();
            }),
          );
          return;
        }
        raf = requestAnimationFrame(watch);
      };
      failsafe = window.setTimeout(() => {
        cancelAnimationFrame(raf);
        drawn = arrived = true;
        settle();
      }, FAILSAFE_MS);
      void cover(url.pathname, () => {
        router.push(url.pathname + url.search + url.hash, { transitionTypes: ["aegis-cover"] });
        raf = requestAnimationFrame(watch);
      }).then(() => {
        drawn = true;
        settle();
      });
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
      if (link.closest(".gallery, [data-no-cover]") || window.matchMedia(MQ.reduced).matches) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return; // cùng trang hoặc chỉ đổi #hash
      if (inFactory(location.pathname) && inFactory(url.pathname)) return;
      event.preventDefault();
      if (!busy) start(url);
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      timeline?.kill();
      cancelAnimationFrame(raf);
      window.clearTimeout(failsafe);
    };
  }, [router]);

  return (
    <>
      <p className="route-cover-live sr-only" aria-live="polite" data-text={copy.loading} />
    <div ref={rootRef} aria-hidden className="route-cover" data-active="false">
      <div className="route-cover-cols">
        {Array.from({ length: COLS }, (_, i) => (
          <span key={i} />
        ))}
      </div>
      <div className="route-cover-meta label">
        <span>
          {copy.plotting} <span className="route-cover-to" />
        </span>
        <span>{copy.rev}</span>
      </div>
      <div className="route-cover-stage">
        <span className="route-cover-guide route-cover-guide-h" style={{ top: 0 }} />
        <span className="route-cover-guide route-cover-guide-h" style={{ bottom: 0 }} />
        <span className="route-cover-guide route-cover-guide-v" style={{ left: 0 }} />
        <span className="route-cover-guide route-cover-guide-v" style={{ right: 0 }} />
        <div className="route-cover-box">
          <span className="route-cover-label label" />
        </div>
        <svg className="route-cover-mark" viewBox="0 0 150 40">
          {MARK.map((d) => (
            <path key={d} d={d} pathLength={1} />
          ))}
          <circle cx={146} cy={36} r={2.6} />
        </svg>
      </div>
      <div className="route-cover-meta label">
        <span>{copy.tagline}</span>
        <span className="route-cover-count">0%</span>
      </div>
    </div>
    </>
  );
}
