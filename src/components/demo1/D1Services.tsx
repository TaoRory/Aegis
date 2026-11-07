"use client";

import { useRef, useState } from "react";

import { d1, d1ContactHref } from "@/content/demo1";
import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/motion";

import { AsciiBlueprint } from "./ascii/AsciiBlueprint";
import { D1Button } from "./D1Button";
import { Plus } from "./icons";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Dịch vụ kiểu danh sách chữ lớn của Komma + "bản vẽ" bằng ký tự:
 * - mục đang đọc (theo cuộn, hoặc rê chuột) màu mực, mục khác xám; tóm tắt luôn hiện, phạm vi chi tiết mở bằng nút;
 * - cột phải dính khi cuộn (máy tính): bản vẽ nét in bằng 0/1 của mảng đó, đổi mục thì bản vẽ mới được "in" lại bằng dòng quét.
 */
export function D1Services() {
  const { services } = d1;
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const current = services.items[active];

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.anyMotion, () => {
        const triggers = [...root.querySelectorAll<HTMLElement>("[data-svc]")].map((item, index) =>
          ScrollTrigger.create({
            trigger: item,
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
    <section ref={ref} id="dich-vu" data-d1-map={services.label} aria-labelledby="dich-vu-title" className="d1-section">
      <div className="d1-wrap">
        <div className="d1-grid items-end gap-y-6">
          <h2 id="dich-vu-title" className="d1-h2 col-span-12 lg:col-span-7">
            {services.title}
          </h2>
          <p className="col-span-12 max-w-[30rem] text-muted lg:col-span-4 lg:col-start-9">{services.lead}</p>
        </div>

        <div className="d1-grid mt-12 gap-y-10 lg:mt-16">
          <ol className="col-span-12 lg:col-span-7">
            {services.items.map((service, index) => (
              <li
                key={service.id}
                id={`dich-vu-${service.id}`}
                data-svc={index}
                data-active={index === active}
                className="d1-svc2"
                onPointerEnter={(event) => event.pointerType === "mouse" && setActive(index)}
              >
                <div className="d1-svc2-head">
                  <span className="d1-label pt-[0.85em] text-muted">({pad(index + 1)})</span>
                  <h3 className="d1-svc-title">{service.title}</h3>
                </div>
                <div className="d1-svc2-body">
                  {service.hook && <p className="d1-lead">{service.hook}</p>}
                  <p className="mt-3 max-w-[36rem] text-muted">{service.summary}</p>
                  <details className="d1-svc2-more mt-5">
                    <summary>
                      <span className="d1-svc2-more-label" data-more={services.more} data-less={services.less} />
                      <span className="d1-plus">
                        <Plus />
                      </span>
                    </summary>
                    <div className="grid gap-8 pt-4 pb-2 sm:grid-cols-2">
                      <div>
                        <h4 className="d1-label mb-3 text-muted">{services.needs}</h4>
                        <ul className="d1-bullets text-[0.9375rem] leading-relaxed">
                          {service.needs.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="d1-label mb-3 text-muted">{services.scope}</h4>
                        <ul className="d1-bullets text-[0.9375rem] leading-relaxed">
                          {service.scope.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="d1-label text-muted">{services.value}</p>
                        <p className="mt-2 max-w-[36rem] text-[0.9375rem] leading-relaxed">{service.value}</p>
                      </div>
                    </div>
                  </details>
                  <div className="mt-6">
                    <D1Button href={d1ContactHref(service.id)} variant="soft">
                      {services.talk}
                    </D1Button>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div aria-hidden className="col-span-12 max-lg:hidden lg:col-span-5 lg:col-start-8">
            <div className="lg:sticky lg:top-[calc(var(--d1-header)+2rem)]">
              <AsciiBlueprint index={active} className="aspect-[4/5]" />
              <p className="d1-label mt-3 flex justify-between text-muted">
                <span>
                  {services.drawing} {pad(active + 1)} / {pad(services.items.length)}
                </span>
                <span>{current.shortTitle}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
