"use client";

import { useEffect, useRef, useState } from "react";

import type { AiDemo as AiDemoContent } from "@/content/demos";

interface Turn {
  q: string;
  a: string;
  cite: string;
}

/**
 * Demo trợ lý tài liệu: kịch bản soạn sẵn, KHÔNG gọi mô hình AI. Bấm một câu hỏi, câu trả lời hiện ra kèm đoạn tài liệu
 * được dùng (đoạn đó được tô sáng). Nội dung và thương hiệu là giả định (xem content/demos.ts).
 */
export function AiDemo({ content }: { content: AiDemoContent }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [pending, setPending] = useState<number | null>(null);
  const [cite, setCite] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, pending]);

  const ask = (index: number) => {
    if (pending !== null) return;
    const item = content.questions[index];
    setPending(index);
    setCite(null);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = window.setTimeout(
      () => {
        setTurns((t) => [...t, item]);
        setCite(item.cite);
        setPending(null);
      },
      reduced ? 0 : 800,
    );
  };

  const reset = () => {
    window.clearTimeout(timer.current);
    setTurns([]);
    setPending(null);
    setCite(null);
  };

  return (
    <div className="space-demo">
      <p className="label text-muted">{content.scripted}</p>
      <div className="space-demo-split">
        <section aria-label={content.docTitle} className="space-demo-doc">
          <h2 className="label text-accent">{content.docTitle}</h2>
          {content.sections.map((section) => (
            <div key={section.id} className="space-demo-passage" data-cited={cite === section.id}>
              <h3 className="font-semibold">{section.heading}</h3>
              <p className="mt-1 leading-relaxed text-muted">{section.body}</p>
            </div>
          ))}
        </section>

        <section aria-label={content.title} className="space-demo-chat">
          <div ref={logRef} className="space-demo-log" role="log" aria-live="polite" data-lenis-prevent="">
            {turns.map((turn, i) => (
              <div key={i} className="grid gap-2">
                <p className="space-bubble" data-from="you">
                  <span className="label block text-muted">{content.you}</span>
                  {turn.q}
                </p>
                <p className="space-bubble" data-from="assistant">
                  <span className="label block text-accent">{content.assistant}</span>
                  {turn.a}
                  <span className="label mt-2 block text-muted">
                    {content.sourceLabel}: {content.sections.find((s) => s.id === turn.cite)?.heading}
                  </span>
                </p>
              </div>
            ))}
            {pending !== null && (
              <p className="space-bubble" data-from="assistant">
                <span className="label block text-accent">{content.assistant}</span>
                <span className="text-muted">{content.thinking}</span>
              </p>
            )}
          </div>

          <p className="label mt-4 text-muted">{content.askLabel}</p>
          <ul className="mt-2 grid gap-2">
            {content.questions.map((item, i) => (
              <li key={item.q}>
                <button type="button" className="space-chip-btn" disabled={pending !== null} onClick={() => ask(i)}>
                  {item.q}
                </button>
              </li>
            ))}
          </ul>
          {turns.length > 0 && (
            <button type="button" className="space-demo-reset label" onClick={reset}>
              {content.reset}
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
