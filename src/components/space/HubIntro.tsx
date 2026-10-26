"use client";

import Link from "next/link";
import { useRef } from "react";

import { usePanelEnter } from "@/components/space/Panel";
import { spaceStore } from "@/components/space/space-store";
import { Lines } from "@/components/ui/Rich";
import { zones } from "@/config/space";
import { spaceCopy } from "@/content/space";

/** Thẻ giới thiệu ở tổng mặt bằng (/factory): tiêu đề h1 và danh sách tất cả các khu (bao gồm Nhật ký, không có trên thanh điều hướng). */
export function HubIntro() {
  const ref = useRef<HTMLElement>(null);
  usePanelEnter(ref);
  const { hub } = spaceCopy;

  return (
    <section ref={ref} className="space-hub" aria-labelledby="space-hub-title">
      <p data-panel-in className="label text-muted">
        <span className="text-accent">{hub.label.slice(0, 5)}</span>
        {hub.label.slice(5)}
      </p>
      <h1 id="space-hub-title" data-panel-in className="mt-4 text-h3 font-semibold">
        <Lines lines={[...hub.lines]} />
      </h1>
      <p data-panel-in className="space-hub-lead mt-5 text-[0.95rem] leading-relaxed text-muted">
        {hub.lead}
      </p>
      <nav data-panel-in aria-label={hub.legend} className="space-hub-legend mt-6 border-t border-line pt-4">
        <ol className="space-legend">
          {zones
            .filter((z) => z.id !== "hub")
            .map((z) => (
              <li key={z.id}>
                <Link
                  href={z.route}
                  onClick={(event) => spaceStore.set("lastTrigger", { x: event.clientX, y: event.clientY })}
                  className="space-legend-link"
                >
                  <span className="label text-accent">{z.index ?? z.sheet}</span>
                  <span>{z.name}</span>
                  <span aria-hidden className="text-muted">
                    ↗
                  </span>
                </Link>
              </li>
            ))}
        </ol>
      </nav>
    </section>
  );
}
