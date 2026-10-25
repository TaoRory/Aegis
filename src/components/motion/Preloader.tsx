"use client";

import { useEffect, useRef } from "react";

import { siteConfig } from "@/config/site";
import { EASE, getLenis, gsap, INTRO_DONE_EVENT } from "@/lib/motion";

const SESSION_KEY = "aegis-intro";

/**
 * Màn mở đầu: lưới bản vẽ được kẻ, bộ đếm 000→100, wordmark trồi lên, rèm kéo lên.
 * Chỉ hiển thị khi <html data-intro="playing"> (do script trong <head> quyết định:
 * có chuyển động + chưa xem trong phiên). Có failsafe CSS tự ẩn nếu JS lỗi.
 */
export function Preloader() {
  const ref = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const el = ref.current;
    if (root.dataset.intro !== "playing" || !el) return;

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {}
      delete root.dataset.intro;
      getLenis()?.start();
      window.dispatchEvent(new Event(INTRO_DONE_EVENT));
    };

    getLenis()?.stop();
    window.scrollTo(0, 0);
    const counter = { value: 0 };
    const tl = gsap.timeline({ defaults: { ease: EASE.out } });
    tl.from(el.querySelectorAll("[data-preloader-line]"), { scaleX: 0, duration: 1, stagger: 0.08, ease: "power3.inOut" })
      .to(
        counter,
        {
          value: 100,
          duration: 1.3,
          ease: "power2.inOut",
          onUpdate: () => {
            if (countRef.current) countRef.current.textContent = String(Math.round(counter.value)).padStart(3, "0");
          },
        },
        0,
      )
      .from(el.querySelectorAll("[data-preloader-char]"), { yPercent: 110, duration: 1, stagger: 0.05 }, 0.25)
      .add(finish, "+=0.1")
      .to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.05, ease: "expo.inOut" }, "<")
      .set(el, { display: "none" });

    // Timeout cứng: không bao giờ giữ người dùng quá 3 giây
    const timeout = window.setTimeout(() => {
      tl.progress(1);
      finish();
    }, 3000);

    return () => {
      window.clearTimeout(timeout);
      tl.kill();
    };
  }, []);

  return (
    <div ref={ref} aria-hidden data-surface="dark" className="preloader fixed inset-0 z-[90] flex-col justify-between bg-bg">
      <div className="container-page flex justify-between pt-6 text-muted">
        <span className="label">BV-00 — Tổng mặt bằng</span>
        <span className="label">Đang dựng bản vẽ</span>
      </div>

      <div className="relative">
        <span data-preloader-line className="preloader-line top-0" />
        <div className="container-page overflow-hidden py-6">
          <p className="flex text-[clamp(4rem,18vw,16rem)] leading-[0.9] font-semibold tracking-[-0.06em] text-fg">
            {siteConfig.name.split("").map((char, index) => (
              <span key={index} className="rise-mask inline-block pb-[0.18em]">
                <span data-preloader-char className="inline-block">
                  {char}
                </span>
              </span>
            ))}
          </p>
        </div>
        <span data-preloader-line className="preloader-line bottom-0" />
      </div>

      <div className="container-page flex items-end justify-between pb-6">
        <span className="label text-muted">Aegis / Công nghệ &amp; Marketing</span>
        <span className="font-mono text-[clamp(2.5rem,7vw,6rem)] leading-none tabular-nums text-accent">
          <span ref={countRef}>000</span>
        </span>
      </div>
    </div>
  );
}
