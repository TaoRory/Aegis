"use client";

import { useEffect, useRef } from "react";

import { siteConfig } from "@/config/site";
import { gsap, MQ, useGSAP } from "@/lib/motion";

/**
 * Wordmark khổng lồ tràn đúng chiều ngang khung chứa (fit-text đo bằng ResizeObserver);
 * từng chữ trồi lên khi cuộn tới cuối trang.
 */
export function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  // Co giãn cỡ chữ để chữ chạm đúng hai mép khung
  useEffect(() => {
    const box = ref.current;
    const text = textRef.current;
    if (!box || !text) return;
    const fit = () => {
      const style = getComputedStyle(box);
      const available = box.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const current = parseFloat(getComputedStyle(text).fontSize);
      const width = text.scrollWidth;
      if (width > 0) text.style.fontSize = `${(current * available) / width}px`;
    };
    // Đo ở khung hình kế tiếp: đổi cỡ chữ ngay trong callback làm Safari báo "ResizeObserver loop"
    let raf = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    });
    observer.observe(box);
    document.fonts?.ready.then(fit);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.anyMotion, () => {
        gsap.from("[data-char]", {
          yPercent: 100,
          ease: "expo.out",
          stagger: 0.06,
          scrollTrigger: { trigger: ref.current, start: "top 95%", end: "bottom bottom", scrub: 1 },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} aria-hidden className="footer-wordmark container-page select-none">
      <p ref={textRef} className="inline-flex">
        {siteConfig.name.split("").map((char, index) => (
          <span key={index} className="footer-wordmark-char rise-mask inline-block">
            <span data-char className="inline-block">
              {char}
            </span>
          </span>
        ))}
      </p>
    </div>
  );
}
