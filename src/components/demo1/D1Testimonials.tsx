"use client";

import { useState } from "react";
import Image from "next/image";

import { d1 } from "@/content/demo1";

import { ArrowRight } from "./icons";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Lời khách hàng kiểu thanh trượt "01/03" của Komma. Chỉ dùng lời nhận xét thật đã được đồng ý đăng;
 * danh sách rỗng thì không render gì (không có chỗ trống giả).
 */
export function D1Testimonials() {
  const { testimonials } = d1;
  const items = testimonials.items;
  const [index, setIndex] = useState(0);
  if (items.length === 0) return null;
  const item = items[index];
  const go = (step: number) => setIndex((i) => (i + step + items.length) % items.length);

  return (
    <section id="khach-hang" data-d1-map={testimonials.label} aria-label={testimonials.label} className="d1-section border-t border-line">
      <div className="d1-wrap d1-grid gap-y-10">
        <div className="col-span-12 flex items-center gap-3 lg:col-span-3">
          <button type="button" className="d1-round" aria-label={testimonials.prev} onClick={() => go(-1)}>
            <ArrowRight className="size-4 rotate-180" />
          </button>
          <button type="button" className="d1-round" aria-label={testimonials.next} onClick={() => go(1)}>
            <ArrowRight className="size-4" />
          </button>
          <span className="d1-label ml-2 text-muted tabular-nums" aria-live="polite">
            {pad(index + 1)} / {pad(items.length)}
          </span>
        </div>
        <figure key={index} className="col-span-12 lg:col-span-8 lg:col-start-5">
          <blockquote className="d1-statement">“{item.quote}”</blockquote>
          <figcaption className="mt-8 flex items-center gap-4">
            {item.photo && <Image src={item.photo} alt="" width={96} height={96} className="size-12 rounded-full object-cover" />}
            <span>
              <span className="block font-medium">{item.name}</span>
              <span className="block text-[0.875rem] text-muted">
                {item.role}, {item.org}
              </span>
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
