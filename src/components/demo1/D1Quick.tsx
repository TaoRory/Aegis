"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { d1, d1ContactHref } from "@/content/demo1";

import { ArrowRight, Plus } from "./icons";

/**
 * Nút nổi "+" góc dưới phải (máy tính): mở bảng lối tắt "Bắt đầu nhanh" — gửi phiếu yêu cầu, hoặc chọn sẵn một mảng.
 * Esc hoặc bấm ra ngoài để đóng.
 */
export function D1Quick() {
  const { chrome, cta, contact } = d1;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="d1-quick" data-open={open}>
      {open && (
        <div id="d1-quick-panel" role="dialog" aria-label={chrome.quickTitle} className="d1-quick-panel">
          <p className="d1-label text-muted">{chrome.quickTitle}</p>
          <Link href={cta.href} className="d1-btn d1-btn-ink mt-3 w-full justify-between" onClick={() => setOpen(false)}>
            {cta.label}
            <span className="d1-btn-icon">
              <ArrowRight />
            </span>
          </Link>
          <ul className="mt-3">
            {contact.options.slice(0, 4).map((option) => (
              <li key={option.value}>
                <Link href={d1ContactHref(option.value)} className="d1-quick-link" onClick={() => setOpen(false)}>
                  {option.label}
                  <ArrowRight className="size-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="d1-quick-panel"
        aria-label={open ? chrome.quickClose : chrome.quickOpen}
        onClick={() => setOpen(!open)}
        className="d1-quick-btn"
      >
        <Plus />
      </button>
    </div>
  );
}
