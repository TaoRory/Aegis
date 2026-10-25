"use client";

import { useRef, useState } from "react";

import { cn } from "@/lib/cn";

const questions = [
  { q: "She ___ to school every day.", options: ["go", "goes", "going"], answer: 1 },
  { q: "Từ nào trái nghĩa với “cheap”?", options: ["expensive", "small", "early"], answer: 0 },
  { q: "I have lived here ___ 2019.", options: ["for", "since", "from"], answer: 1 },
  { q: "Chọn câu đúng:", options: ["If I am you, I will called her.", "If I were you, I would call her.", "If I was you, I calling her."], answer: 1 },
  { q: "“Could you give me a hand?” nghĩa là gì?", options: ["Bạn đưa tay cho mình nhé?", "Bạn vẫy tay được không?", "Bạn giúp mình một tay được không?"], answer: 2 },
];

const levels = [
  { min: 0, name: "Starter", text: "Bắt đầu từ phát âm và những mẫu câu giao tiếp hằng ngày.", course: "Lớp Khởi động" },
  { min: 2, name: "Explorer", text: "Nền tảng đã có, giờ là lúc nói nhiều hơn và tự tin hơn.", course: "Lớp Phiêu lưu" },
  { min: 4, name: "Speaker", text: "Bạn sẵn sàng tranh luận, thuyết trình và học theo dự án.", course: "Lớp Diễn giả" },
];

/** Bài kiểm tra trình độ mini: 5 câu, phản hồi tức thì, kết quả gợi ý lớp. Chạy hoàn toàn trong trình duyệt. */
export function Quiz() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const q = questions[index];
  const correct = picked !== null && picked === q.answer;
  const level = [...levels].reverse().find((l) => score >= l.min) ?? levels[0];

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (index + 1 >= questions.length) setDone(true);
    else {
      setIndex(index + 1);
      setPicked(null);
    }
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const restart = () => {
    setIndex(0);
    setPicked(null);
    setScore(0);
    setDone(false);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  return (
    <div className="pg-card bg-(--t-paper) p-6 sm:p-8 lg:p-10">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-extrabold tracking-wide text-(--t-muted) uppercase">
          {done ? "Kết quả" : `Câu ${index + 1} / ${questions.length}`}
        </p>
        <div aria-hidden className="h-3 w-40 overflow-hidden rounded-full border-2 border-(--t-line) bg-(--t-bg)">
          <div
            className="h-full bg-(--t-accent) transition-[width] duration-500"
            style={{ width: `${((done ? questions.length : index + (picked !== null ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {!done ? (
        <div className="mt-8">
          <h3 ref={headingRef} tabIndex={-1} className="text-[clamp(1.4rem,1rem+1.6vw,2.2rem)] outline-none">
            {q.q}
          </h3>
          <ul className="mt-7 grid gap-3">
            {q.options.map((opt, i) => {
              const state = picked === null ? "idle" : i === q.answer ? "right" : i === picked ? "wrong" : "dim";
              return (
                <li key={opt}>
                  <button
                    type="button"
                    onClick={() => pick(i)}
                    aria-disabled={picked !== null}
                    className={cn(
                      "flex w-full items-center gap-4 rounded-2xl border-2 border-(--t-line) px-5 py-4 text-left text-lg font-bold transition-[transform,background-color] duration-300",
                      state === "idle" && "bg-(--t-bg) hover:-translate-y-0.5 hover:bg-(--t-sun)",
                      state === "right" && "bg-(--t-mint)",
                      state === "wrong" && "bg-(--t-coral)",
                      state === "dim" && "opacity-45",
                    )}
                  >
                    <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-(--t-line) bg-(--t-paper) text-sm">
                      {state === "right" ? "✓" : state === "wrong" ? "✕" : "ABC"[i]}
                    </span>
                    {opt}
                  </button>
                </li>
              );
            })}
          </ul>
          <div aria-live="polite" className="mt-6 min-h-[3.5rem]">
            {picked !== null && (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="pg-hand text-2xl">
                  {correct ? "Chính xác! Great job!" : `Chưa đúng, đáp án là “${q.options[q.answer]}”.`}
                </p>
                <button type="button" onClick={next} className="pg-btn bg-(--t-accent) text-(--t-paper)">
                  {index + 1 >= questions.length ? "Xem kết quả" : "Câu tiếp theo"} →
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-8" aria-live="polite">
          <h3 ref={headingRef} tabIndex={-1} className="text-[clamp(2.4rem,1.6rem+3vw,4.5rem)] text-(--t-accent) outline-none">
            {level.name}
          </h3>
          <p className="mt-3 text-lg font-bold">
            Bạn trả lời đúng {score}/{questions.length} câu.
          </p>
          <p className="mt-2 max-w-[32rem] text-(--t-muted)">
            {level.text} Gợi ý: <strong className="text-(--t-fg)">{level.course}</strong>.
          </p>
          <p className="mt-2 text-sm text-(--t-muted)">Bài kiểm tra 5 câu chỉ để tham khảo; giáo viên sẽ đánh giá kỹ hơn trong buổi học thử.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#hoc-thu" className="pg-btn bg-(--t-sun)">
              Đăng ký học thử →
            </a>
            <button type="button" onClick={restart} className="pg-btn bg-(--t-paper)">
              Làm lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
