"use client";

import { useEffect, useRef, useState } from "react";

import type { D3Dict } from "@/content/demo3";
import { MQ } from "@/lib/motion";

import { Rise } from "./fx/Rise";

/**
 * Bảng so sánh: cột Aegis là một khối Aqua liền (không tô từng ô), tự vẽ từ trên xuống khi CHÍNH CỘT ĐÓ vào màn hình.
 * Quan sát ô tiêu đề của cột chứ không phải cả bảng, vì trên điện thoại bảng rộng hơn màn hình và cột Aegis nằm khuất bên phải:
 * vẽ lúc bảng vừa tới thì không ai thấy. IntersectionObserver tính cả phần bị vùng cuộn ngang che, nên cột chỉ vẽ khi vuốt tới.
 *
 * Ba trạng thái: không có data-drawn (HTML gốc, không JS, giảm chuyển động: khối hiện sẵn) → "false" (đang chờ) → "true" (vẽ).
 * Lần gọi đầu của observer quyết định: cột đã ở trong màn hình thì để yên, không ẩn rồi vẽ lại thứ người xem đang nhìn.
 */
export function PlansCompare({ compare, labelledBy, hint }: { compare: D3Dict["compare"]; labelledBy: string; hint: string }) {
  const usRef = useRef<HTMLTableCellElement>(null);
  const [drawn, setDrawn] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const cell = usRef.current;
    if (!cell || typeof IntersectionObserver === "undefined" || !window.matchMedia(MQ.anyMotion).matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Tự so tỉ lệ thay vì tin isIntersecting: các trình duyệt hiểu cờ này khác nhau khi ngưỡng không có số 0
        const inView = entry.isIntersecting && entry.intersectionRatio >= 0.6;
        if (inView) observer.disconnect();
        setDrawn((prev) => (inView ? (prev === false ? true : prev) : (prev ?? false)));
      },
      // Chờ ô tiêu đề lên cao khoảng một phần tư màn hình (và lộ quá nửa theo chiều ngang): lúc đó phần lớn cột đã trong tầm mắt
      { rootMargin: "0px 0px -24% 0px", threshold: [0, 0.6] },
    );
    observer.observe(cell);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <p className="d3-plans-hint d2-small" aria-hidden>
        {hint}
      </p>
      <Rise className="d2-compare" tabIndex={0} role="region" aria-labelledby={labelledBy}>
        <div className="d3-plans-sheet" data-drawn={drawn}>
          <table>
            <thead>
              <tr>
                <td />
                {compare.cols.map((col, i) => (
                  <th key={col} scope="col" ref={i === 2 ? usRef : undefined} className={i === 2 ? "d2-col-us" : undefined}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compare.rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {row.cells.map((cell, i) => (
                    <td key={i} className={i === 2 ? "d2-col-us" : undefined}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Rise>
    </>
  );
}
