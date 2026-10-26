"use client";

import { useState } from "react";

import type { CalendarDemo as CalendarDemoContent } from "@/content/demos";

/**
 * Demo lịch nội dung đa kênh: chọn một ý tưởng, đặt vào ô (ngày × kênh), bấm bài đã đặt để xem trước.
 * Không có số liệu hiệu quả nào (reach, tương tác…), chỉ minh họa cách lập kế hoạch. Nội dung giả định.
 */
export function CalendarDemo({ content }: { content: CalendarDemoContent }) {
  // Ô lịch: khóa "ngày|kênh" → id ý tưởng
  const [slots, setSlots] = useState<Record<string, string>>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState<string | null>(null);

  const placed = new Set(Object.values(slots));
  const backlog = content.ideas.filter((i) => !placed.has(i.id));
  const idea = (id: string) => content.ideas.find((i) => i.id === id);
  const pickedIdea = picked ? idea(picked) : undefined;

  const clickCell = (key: string) => {
    if (slots[key]) {
      setPreviewKey(key);
      return;
    }
    if (!picked) return;
    setSlots((s) => ({ ...s, [key]: picked }));
    setPreviewKey(key);
    setPicked(null);
  };
  const remove = (key: string) => {
    setSlots((s) => {
      const { [key]: _removed, ...rest } = s;
      void _removed;
      return rest;
    });
    setPreviewKey(null);
  };
  const reset = () => {
    setSlots({});
    setPicked(null);
    setPreviewKey(null);
  };

  const previewIdea = previewKey ? idea(slots[previewKey]) : undefined;
  const [previewDay, previewChannel] = previewKey ? previewKey.split("|") : [];
  const channelName = (id?: string) => content.channels.find((c) => c.id === id)?.name ?? "";

  return (
    <div className="space-demo grid gap-8">
      <section aria-label={content.backlogTitle}>
        <h2 className="label text-accent">{content.backlogTitle}</h2>
        <ul className="mt-3 grid gap-2">
          {backlog.map((item) => (
            <li key={item.id}>
              <button type="button" className="space-chip-btn" aria-pressed={picked === item.id} onClick={() => setPicked(picked === item.id ? null : item.id)}>
                <span className="font-medium">{item.title}</span>
                <span className="label text-muted">{picked === item.id ? content.picked : `${content.pick} · ${channelName(item.channel)}`}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label={content.title}>
        <div className="space-cal" data-lenis-prevent="" role="group" aria-label={content.title}>
          <span aria-hidden />
          {content.days.map((day) => (
            <span key={day} className="label text-center text-muted">
              {day}
            </span>
          ))}
          {content.channels.map((channel) => (
            <div key={channel.id} className="contents">
              <span className="label self-center text-muted">{channel.name}</span>
              {content.days.map((day) => {
                const key = `${day}|${channel.id}`;
                const filled = slots[key] ? idea(slots[key]) : undefined;
                const suggested = pickedIdea?.channel === channel.id && !filled;
                return (
                  <button
                    key={key}
                    type="button"
                    className="space-cal-cell"
                    data-filled={Boolean(filled)}
                    data-suggested={suggested}
                    data-selected={previewKey === key}
                    disabled={!filled && !picked}
                    aria-label={filled ? `${day}, ${channel.name}: ${filled.title}` : `${content.place} ${day}, ${channel.name}`}
                    onClick={() => clickCell(key)}
                  >
                    {filled ? <span aria-hidden className="space-cal-dot" /> : null}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      <section aria-label={content.previewTitle} aria-live="polite">
        <h2 className="label text-accent">{content.previewTitle}</h2>
        {previewIdea && previewKey ? (
          <article className="space-post mt-3">
            <p className="label text-muted">
              {content.brand} · {channelName(previewChannel)} · {previewDay}
            </p>
            <h3 className="mt-2 text-[1.2rem] font-semibold">{previewIdea.title}</h3>
            <p className="mt-2 leading-relaxed">{previewIdea.caption}</p>
            <button type="button" className="space-mini-btn space-mini-btn-wide mt-4" onClick={() => remove(previewKey)}>
              {content.remove}
            </button>
          </article>
        ) : (
          <p className="mt-3 text-muted">{content.previewEmpty}</p>
        )}
      </section>

      <button type="button" className="space-demo-reset label" onClick={reset}>
        {content.reset}
      </button>
    </div>
  );
}
