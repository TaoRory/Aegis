"use client";

import { useRef, useState } from "react";

import { d1 } from "@/content/demo1";
import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/motion";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * "Cách làm" (nền tối): trái là tiêu đề + số bước cỡ lớn (đứng yên khi cuộn trên máy tính); phải là 4 bước xếp dọc,
 * mỗi bước có tên cỡ lớn và các việc của bước đó in cỡ chữ đọc thoải mái (không phải chữ mono nhỏ như bảng cũ).
 * Bước đang đọc sáng hẳn, kèm vạch teal bên trái; các bước còn lại mờ đi nhưng vẫn đọc được.
 * Mỗi bước cao gần một màn hình trên máy tính nên số bước đổi chậm theo nhịp đọc. Mọi chữ hiện đủ ngay; cuộn chỉ đổi mức sáng.
 * Không có số giờ/ngày (không có dữ kiện).
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
            start: "top 55%",
            end: "bottom 55%",
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
          <div className="d1-counter mt-10 max-lg:hidden lg:mt-16" aria-hidden>
            <span key={active} className="d1-counter-num">
              {pad(active + 1)}
            </span>
            <span className="d1-label text-muted">
              {ledger.counter} / {pad(ledger.steps.length)}
            </span>
          </div>
        </div>

        <ol className="col-span-12 lg:col-span-6 lg:col-start-7">
          {ledger.steps.map((step, i) => (
            <li key={step.title} data-step={i} data-active={i === active} className="d1-step">
              <p className="d1-label d1-step-no">
                {ledger.counter} {pad(i + 1)}
              </p>
              <h3 className="d1-step-title">{step.title}</h3>
              <ul className="d1-step-items">
                {step.items.map((item, j) => (
                  <li key={item} className="d1-step-item">
                    <span className="d1-label d1-step-idx">
                      {i + 1}.{j + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
