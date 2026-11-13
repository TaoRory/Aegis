"use client";

import { useEffect, useState } from "react";

import type { D2Dict } from "@/content/demo2";

import { Check } from "./D2Icons";

/**
 * Danh sách bàn giao (điểm nhấn chuyển động duy nhất của trang): khối Aqua lần lượt đi qua từng món được bàn giao.
 * Mọi dòng luôn hiện đủ và đã tick; có nút Tạm dừng. Giảm chuyển động / không JS: đứng yên, không có dòng nào được tô.
 */
export function D2Handover({ t }: { t: D2Dict }) {
  const { own, chrome, mock } = t;
  const [active, setActive] = useState(-1);
  const [paused, setPaused] = useState(false);
  const [canRun, setCanRun] = useState(false);

  useEffect(() => {
    // Chỉ biết được sau khi gắn vào trình duyệt (SSR luôn dựng trạng thái tĩnh)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanRun(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (!canRun || paused) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive((i) => (i + 1) % own.items.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [canRun, paused, own.items.length]);

  return (
    <div>
      <div className="d2-manifest-head">
        <span>{own.note}</span>
        {canRun && (
          <button type="button" onClick={() => setPaused(!paused)} aria-pressed={paused}>
            {paused ? chrome.play : chrome.pause}
          </button>
        )}
      </div>
      <ul className="d2-manifest">
        {own.items.map((item, index) => (
          <li key={item.name} data-active={index === active}>
            <span className="d2-tick" aria-hidden>
              <Check />
            </span>
            <span className="d2-manifest-name">{item.name}</span>
            <span className="d2-pill" data-on="true">
              {mock.handover.done}
            </span>
            <span className="d2-manifest-detail">{item.detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
