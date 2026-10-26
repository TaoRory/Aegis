"use client";

import { useEffect, useRef, useState } from "react";

import { experiments } from "@/components/space/lab/registry";
import { useFactory } from "@/components/space/factory-context";
import type { LabItem } from "@/content/lab";

/**
 * Khung "sản phẩm thử" cho một nguyên mẫu: sân chơi (có nút toàn màn hình), cách chơi, ghi chú kỹ thuật, nơi đang dùng.
 */
export function LabFrame({ item }: { item: LabItem }) {
  const { ui } = useFactory();
  const copy = ui.lab;
  const Experiment = experiments[item.id];
  const stageRef = useRef<HTMLDivElement>(null);
  const [full, setFull] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);

  useEffect(() => {
    // Sau khi hydrate mới biết trình duyệt có hỗ trợ không (tránh lệch HTML giữa server và client)
    const t = window.setTimeout(() => setCanFullscreen(document.fullscreenEnabled), 0);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const onChange = () => setFull(document.fullscreenElement === stageRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void stageRef.current?.requestFullscreen?.();
  };

  return (
    <div data-panel-in className="space-lab">
      <div ref={stageRef} className="space-lab-stage" data-lenis-prevent="" data-surface="dark">
        {Experiment ? <Experiment /> : <p className="label text-muted">{copy.missing}</p>}
        {canFullscreen && (
          <button type="button" onClick={toggleFullscreen} className="space-lab-full label">
            {full ? copy.exitFullscreen : copy.fullscreen}
          </button>
        )}
      </div>
      <p className="label mt-3 text-muted">{copy.notice}</p>

      <div className="space-lab-notes">
        <section>
          <h2 className="label text-accent">{copy.how}</h2>
          <ul className="space-list">
            {item.howTo.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="label text-accent">{copy.tech}</h2>
          <ul className="space-list">
            {item.techNotes.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
        {item.usedIn.length > 0 && (
          <section>
            <h2 className="label text-accent">{copy.usedIn}</h2>
            <ul className="space-list">
              {item.usedIn.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
