"use client";

import { useRef, useState } from "react";

import { d1 } from "@/content/demo1";
import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/motion";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * "Cách làm" kiểu bảng ước tính của contentarchitecture.dev (nền tối):
 * trái là số bước cỡ lớn (đứng yên khi cuộn trên máy tính), phải là "tờ quy trình" mono có dòng chấm, liệt kê 4 bước và việc của từng bước.
 * Tờ hiện đủ ngay; cuộn chỉ đổi số lớn và làm sáng bước đang đọc. Không có số giờ/ngày (không có dữ kiện).
 */
export function D1Ledger() {
  const { ledger } = d1;
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.anyMotion, () => {
        const triggers = [...root.querySelectorAll<HTMLElement>("[data-step]")].map((group, index) =>
          ScrollTrigger.create({
            trigger: group,
            start: "top 62%",
            end: "bottom 62%",
            onToggle: (self) => self.isActive && setActive(index),
          }),
        );
        return () => triggers.forEach((t) => t.kill());
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="cach-lam-viec" data-d1-tone="dark" data-d1-map={ledger.label} aria-labelledby="cach-lam-viec-title" className="d1-section d1-ledger">
      <div className="d1-wrap d1-grid gap-y-12">
        <div className="col-span-12 self-start lg:sticky lg:top-[calc(var(--d1-header)+2.5rem)] lg:col-span-5">
          <h2 id="cach-lam-viec-title" className="d1-h2">
            {ledger.title}
          </h2>
          <p className="mt-6 max-w-[28rem] text-muted">{ledger.lead}</p>
          <div className="d1-counter mt-10 lg:mt-16" aria-hidden>
            <span key={active} className="d1-counter-num">
              {pad(active + 1)}
            </span>
            <span className="d1-label text-muted">
              {ledger.counter} / {pad(ledger.steps.length)}
            </span>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 lg:col-start-7">
          <div className="d1-sheet">
            <div className="d1-sheet-head">
              <span>{ledger.head[0]}</span>
              <span>{ledger.head[1]}</span>
            </div>
            <ol>
              {ledger.steps.map((step, i) => (
                <li key={step.title} data-step={i} data-active={i === active} className="d1-sheet-group">
                  <h3 className="d1-sheet-row d1-sheet-step">
                    <span>
                      {ledger.counter} {pad(i + 1)}
                    </span>
                    <span>{step.title}</span>
                  </h3>
                  <ul>
                    {step.items.map((item, j) => (
                      <li key={item} className="d1-sheet-row">
                        <span>{item}</span>
                        <span aria-hidden className="d1-leader" />
                        <span className="text-muted">
                          {i + 1}.{j + 1}
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
