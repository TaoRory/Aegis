"use client";

import { useState } from "react";

import type { OpsDemo as OpsDemoContent } from "@/content/demos";

type Decision = "approved" | "rejected";

/**
 * Demo bảng điều phối vận hành: đơn hàng chuyển bước, duyệt phiếu, lọc tồn kho. Dữ liệu giả định, trạng thái chỉ nằm
 * trong trình duyệt (không lưu đâu cả). Mỗi thao tác là một nút thật, dùng được bằng bàn phím.
 */
export function OpsDemo({ content }: { content: OpsDemoContent }) {
  const initialOrders = () => Object.fromEntries(content.orders.map((o) => [o.id, o.column]));
  const [placement, setPlacement] = useState<Record<string, string>>(initialOrders);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [lowOnly, setLowOnly] = useState(false);

  const columnIds = content.columns.map((c) => c.id);
  const move = (id: string, delta: 1 | -1) =>
    setPlacement((p) => {
      const at = columnIds.indexOf(p[id]);
      const next = columnIds[Math.min(columnIds.length - 1, Math.max(0, at + delta))];
      return { ...p, [id]: next };
    });
  const decide = (id: string, value: Decision) => setDecisions((d) => ({ ...d, [id]: value }));
  const reset = () => {
    setPlacement(initialOrders());
    setDecisions({});
    setLowOnly(false);
  };
  const stock = content.stock.filter((s) => !lowOnly || s.qty < s.min);

  return (
    <div className="space-demo grid gap-8">
      <div className="space-board" data-lenis-prevent="">
        {content.columns.map((column) => (
          <section key={column.id} aria-label={column.name} className="space-board-col">
            <h2 className="label text-accent">{column.name}</h2>
            <ul className="mt-3 grid gap-2">
              {content.orders
                .filter((o) => placement[o.id] === column.id)
                .map((order) => (
                  <li key={order.id} className="space-order">
                    <p className="label text-muted">{order.id}</p>
                    <p className="font-semibold">{order.customer}</p>
                    <p className="text-[0.9rem] text-muted">{order.items}</p>
                    <div className="mt-2 flex gap-1.5">
                      <button
                        type="button"
                        className="space-mini-btn"
                        aria-label={`${content.moveBack}: ${order.id}`}
                        disabled={columnIds.indexOf(column.id) === 0}
                        onClick={() => move(order.id, -1)}
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        className="space-mini-btn"
                        aria-label={`${content.moveLabel}: ${order.id}`}
                        disabled={columnIds.indexOf(column.id) === columnIds.length - 1}
                        onClick={() => move(order.id, 1)}
                      >
                        ›
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>

      <section aria-label={content.approvalsTitle}>
        <h2 className="label text-accent">{content.approvalsTitle}</h2>
        <ul className="mt-3 grid gap-2">
          {content.approvals.map((item) => {
            const decision = decisions[item.id];
            return (
              <li key={item.id} className="space-approval" data-decision={decision ?? "pending"}>
                <div>
                  <p className="label text-muted">
                    {item.id} · {item.by}
                  </p>
                  <p className="font-medium">{item.what}</p>
                </div>
                {decision ? (
                  <p className="label" role="status">
                    {decision === "approved" ? content.approved : content.rejected}
                  </p>
                ) : (
                  <div className="flex gap-2">
                    <button type="button" className="space-mini-btn space-mini-btn-wide" onClick={() => decide(item.id, "approved")}>
                      {content.approve}
                    </button>
                    <button type="button" className="space-mini-btn space-mini-btn-wide" onClick={() => decide(item.id, "rejected")}>
                      {content.reject}
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-label={content.stockTitle}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="label text-accent">{content.stockTitle}</h2>
          <div role="group" aria-label={content.stockFilter} className="flex gap-1.5">
            <button type="button" className="space-mini-btn space-mini-btn-wide" aria-pressed={!lowOnly} onClick={() => setLowOnly(false)}>
              {content.all}
            </button>
            <button type="button" className="space-mini-btn space-mini-btn-wide" aria-pressed={lowOnly} onClick={() => setLowOnly(true)}>
              {content.low}
            </button>
          </div>
        </div>
        <ul className="mt-3 grid gap-2">
          {stock.map((row) => (
            <li key={row.sku} className="space-stock" data-low={row.qty < row.min}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-medium">
                  <span className="label mr-2 text-muted">{row.sku}</span>
                  {row.name}
                </p>
                <p className="label text-muted" aria-label={`${content.qtyLabel}: ${row.qty} / ${row.min}`}>
                  {row.qty} / {row.min}
                </p>
              </div>
              <span aria-hidden className="space-stock-bar">
                <i style={{ width: `${Math.min(100, (row.qty / (row.min * 2)) * 100)}%` }} />
              </span>
            </li>
          ))}
        </ul>
      </section>

      <button type="button" className="space-demo-reset label" onClick={reset}>
        {content.reset}
      </button>
    </div>
  );
}
