"use client";

import { useEffect, useRef, useState } from "react";

import { d1 } from "@/content/demo1";
import { fill } from "@/lib/fill";
import { scrollToTarget } from "@/lib/motion";

type Block = { id: string; label: string; top: number; height: number; dark: boolean };

/**
 * Bản đồ thu nhỏ của trang (kiểu contentarchitecture.dev), góc phải màn hình máy tính:
 * mỗi phần [data-d1-map] là một khối theo đúng tỉ lệ chiều cao (tối/sáng theo tông), khung viền là vùng đang xem.
 * Bấm một khối để nhảy tới phần đó.
 */
export function D1Minimap() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const viewRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const measure = () => {
      const doc = document.documentElement.scrollHeight;
      const list = [...document.querySelectorAll<HTMLElement>("[data-d1-map]")].map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          id: el.id,
          label: el.dataset.d1Map ?? el.id,
          top: (rect.top + window.scrollY) / doc,
          height: rect.height / doc,
          dark: el.dataset.d1Tone === "dark" || el.dataset.d1MapTone === "dark",
        };
      });
      setBlocks(list);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    measure();

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const view = viewRef.current;
        const track = trackRef.current;
        if (!view || !track) return;
        const doc = document.documentElement.scrollHeight;
        const h = track.clientHeight;
        view.style.transform = `translateY(${((window.scrollY / doc) * h).toFixed(1)}px)`;
        view.style.height = `${Math.max(6, (window.innerHeight / doc) * h).toFixed(1)}px`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <nav aria-label={d1.chrome.mapLabel} className="d1-map">
      <div ref={trackRef} className="d1-map-track">
        {blocks.map((block) => (
          <button
            key={block.id}
            type="button"
            className="d1-map-block"
            data-dark={block.dark}
            style={{ top: `${block.top * 100}%`, height: `${block.height * 100}%` }}
            aria-label={fill(d1.chrome.mapGo, { name: block.label })}
            title={block.label}
            onClick={() => {
              const el = document.getElementById(block.id);
              if (el) scrollToTarget(el);
            }}
          />
        ))}
        <div ref={viewRef} aria-hidden className="d1-map-view" />
      </div>
    </nav>
  );
}
