"use client";

import Link from "next/link";
import { useRef } from "react";

import { useFactory } from "@/components/space/factory-context";
import { usePanelEnter } from "@/components/space/Panel";
import { spaceStore } from "@/components/space/space-store";
import { ZoneIcon } from "@/components/space/ZoneIcon";
import { Lines } from "@/components/ui/Rich";
import { navOthersFor, navServices } from "@/config/space";

const remember = (event: { clientX: number; clientY: number }) => spaceStore.set("lastTrigger", { x: event.clientX, y: event.clientY });

/**
 * Thẻ tổng quan (/factory): tiêu đề h1, bốn dịch vụ xếp lưới 2 × 2 cùng cỡ (ngang hàng, không số thứ tự),
 * rồi các khu còn lại (Dự án, Studio, Về Aegis, Liên hệ).
 */
export function HubIntro() {
  const ref = useRef<HTMLElement>(null);
  usePanelEnter(ref);
  const { ui, href, variant } = useFactory();
  const { hub } = ui;

  return (
    <section ref={ref} className="space-hub" aria-labelledby="space-hub-title">
      <p data-panel-in className="label text-accent">
        {hub.label}
      </p>
      <h1 id="space-hub-title" data-panel-in className="mt-4 text-h3 font-semibold">
        <Lines lines={[...hub.lines]} />
      </h1>
      <p data-panel-in className="space-hub-lead mt-5 text-[0.95rem] leading-relaxed text-muted">
        {hub.lead}
      </p>
      <nav data-panel-in aria-label={hub.legend} className="space-hub-legend mt-6 border-t border-line pt-4">
        <p className="label text-muted">{hub.servicesLabel}</p>
        <ul className="space-hub-services">
          {navServices.map((z) => (
            <li key={z.id}>
              <Link href={href(z.path)} onClick={remember} className="space-service-tile">
                <ZoneIcon zone={z.id} className="size-6" />
                <span className="space-service-tile-name">{ui.zones[z.id].name}</span>
              </Link>
            </li>
          ))}
        </ul>
        <ul className="space-legend mt-3">
          {navOthersFor(variant).map((z) => (
            <li key={z.id}>
              <Link href={href(z.path)} onClick={remember} className="space-legend-link">
                <ZoneIcon zone={z.id} className="size-5 text-accent" />
                <span>{ui.zones[z.id].name}</span>
                <span aria-hidden className="text-muted">
                  ↗
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
