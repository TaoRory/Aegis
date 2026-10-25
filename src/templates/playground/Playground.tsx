"use client";

import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";

import { FlipCard } from "@/components/fx/FlipCard";
import { MarkerHighlight } from "@/components/fx/MarkerHighlight";
import { Sticker, Stickers } from "@/components/fx/Stickers";
import { VelocityMarquee } from "@/components/fx/VelocityMarquee";
import { cn } from "@/lib/cn";
import { gsap, MQ, SplitText, useGSAP } from "@/lib/motion";
import { Quiz } from "@/templates/playground/Quiz";
import "@/templates/playground/playground.css";

const courses = [
  {
    id: "kids",
    label: "Kids · 6–10 tuổi",
    items: [
      { name: "Lớp Khởi động", text: "Phát âm qua bài hát, trò chơi và kể chuyện bằng tranh.", meta: "2 buổi/tuần · 8 bạn/lớp", color: "bg-(--t-sun)" },
      { name: "Lớp Nhà thám hiểm", text: "Học từ vựng theo chủ đề, làm dự án nhỏ mỗi tháng.", meta: "2 buổi/tuần · 10 bạn/lớp", color: "bg-(--t-mint)" },
    ],
  },
  {
    id: "teens",
    label: "Teens · 11–17 tuổi",
    items: [
      { name: "Lớp Phiêu lưu", text: "Giao tiếp tự tin, tranh luận theo nhóm, đọc hiểu báo chí.", meta: "3 buổi/tuần · 12 bạn/lớp", color: "bg-(--t-lilac)" },
      { name: "Lớp Diễn giả", text: "Thuyết trình, viết luận và chuẩn bị cho các kỳ thi quốc tế.", meta: "3 buổi/tuần · 12 bạn/lớp", color: "bg-(--t-coral)" },
      { name: "Câu lạc bộ Podcast", text: "Cùng nhau lên kịch bản, thu âm và phát hành một tập podcast.", meta: "1 buổi/tuần · 8 bạn/nhóm", color: "bg-(--t-sun)" },
    ],
  },
  {
    id: "adults",
    label: "Người lớn",
    items: [
      { name: "Tiếng Anh công sở", text: "Họp, email, thuyết trình: luyện tình huống thật của công việc.", meta: "Tối 2–4–6 · 10 người/lớp", color: "bg-(--t-mint)" },
      { name: "Giao tiếp 1 kèm 1", text: "Lộ trình riêng theo mục tiêu, lịch học linh hoạt.", meta: "Linh hoạt · 1 kèm 1", color: "bg-(--t-lilac)" },
    ],
  },
];

const words = [
  { word: "Brave", ipa: "/breɪv/", vi: "dũng cảm", ex: "Be brave, try again!", color: "bg-(--t-sun)" },
  { word: "Curious", ipa: "/ˈkjʊə.ri.əs/", vi: "tò mò", ex: "Curious minds ask good questions.", color: "bg-(--t-mint)" },
  { word: "Teamwork", ipa: "/ˈtiːm.wɜːk/", vi: "làm việc nhóm", ex: "Teamwork makes it fun.", color: "bg-(--t-coral)" },
  { word: "Confident", ipa: "/ˈkɒn.fɪ.dənt/", vi: "tự tin", ex: "I feel confident when I speak.", color: "bg-(--t-lilac)" },
  { word: "Adventure", ipa: "/ədˈven.tʃər/", vi: "chuyến phiêu lưu", ex: "Every lesson is an adventure.", color: "bg-(--t-paper)" },
  { word: "Mistake", ipa: "/mɪˈsteɪk/", vi: "lỗi sai", ex: "Mistakes are welcome here.", color: "bg-(--t-sun)" },
];

const slots = ["Sáng thứ Bảy", "Chiều thứ Bảy", "Sáng Chủ nhật", "Tối trong tuần"];

function CourseTabs() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const map: Record<string, number> = { ArrowRight: (i + 1) % courses.length, ArrowLeft: (i - 1 + courses.length) % courses.length, Home: 0, End: courses.length - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    setActive(map[e.key]);
    refs.current[map[e.key]]?.focus();
  };
  return (
    <div>
      <div role="tablist" aria-label="Khóa học theo độ tuổi" className="flex flex-wrap gap-3">
        {courses.map((c, i) => (
          <button
            key={c.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={`pg-tab-${c.id}`}
            role="tab"
            type="button"
            aria-selected={active === i}
            aria-controls={`pg-panel-${c.id}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKey(e, i)}
            className="rounded-full border-2 border-(--t-line) bg-(--t-paper) px-5 py-2.5 font-extrabold transition-colors aria-selected:bg-(--t-fg) aria-selected:text-(--t-bg)"
          >
            {c.label}
          </button>
        ))}
      </div>
      {courses.map((c, i) => (
        <div key={c.id} id={`pg-panel-${c.id}`} role="tabpanel" aria-labelledby={`pg-tab-${c.id}`} hidden={active !== i} className="mt-10">
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {c.items.map((item, k) => (
              <li key={item.name} className={cn("pg-card pg-lift flex min-h-[19rem] flex-col p-7", item.color, k % 2 === 1 && "md:mt-10")}>
                <span className="pg-hand text-xl">Khóa {String(k + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 text-[clamp(1.5rem,1.1rem+1.2vw,2.1rem)]">{item.name}</h3>
                <p className="mt-4 leading-relaxed">{item.text}</p>
                <p className="mt-auto pt-6 text-sm font-extrabold">{item.meta}</p>
                <p className="text-sm text-(--t-fg)/70">Học phí: liên hệ (minh họa)</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function TrialForm() {
  const [sent, setSent] = useState<{ name: string; slot: string } | null>(null);
  const [error, setError] = useState("");
  const confirmRef = useRef<HTMLDivElement>(null);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const slot = String(data.get("slot") ?? "");
    if (name.length < 2) {
      setError("Vui lòng nhập tên (ít nhất 2 ký tự).");
      return;
    }
    if (!slot) {
      setError("Vui lòng chọn một khung giờ.");
      return;
    }
    setError("");
    setSent({ name, slot });
    requestAnimationFrame(() => {
      confirmRef.current?.focus();
      if (window.matchMedia(MQ.anyMotion).matches && confirmRef.current) {
        gsap.from(confirmRef.current, { scale: 0.85, rotate: -3, duration: 0.7, ease: "back.out(2)" });
        gsap.from(confirmRef.current.querySelectorAll("[data-confetti]"), { y: 40, opacity: 0, rotate: () => gsap.utils.random(-90, 90), stagger: 0.04, duration: 0.8, ease: "back.out(2)" });
      }
    });
  };

  if (sent) {
    return (
      <div ref={confirmRef} tabIndex={-1} className="pg-card relative overflow-hidden bg-(--t-mint) p-8 outline-none lg:p-12" aria-live="polite">
        {["bg-(--t-sun) left-[8%] top-6", "bg-(--t-coral) right-[12%] top-10", "bg-(--t-accent) right-[30%] bottom-8", "bg-(--t-paper) left-[40%] bottom-6"].map((c) => (
          <span key={c} data-confetti aria-hidden className={cn("absolute size-5 rounded-md border-2 border-(--t-line)", c)} />
        ))}
        <p className="pg-hand text-3xl">Yay! See you soon,</p>
        <h3 className="mt-2 text-[clamp(2rem,1.4rem+2.4vw,3.6rem)]">{sent.name}!</h3>
        <p className="mt-4 max-w-[32rem] text-lg">
          Buổi học thử dự kiến: <strong>{sent.slot}</strong>. Đây là mẫu demo nên không có dữ liệu nào được gửi đi; website thật sẽ gửi xác nhận qua tin nhắn.
        </p>
        <button type="button" onClick={() => setSent(null)} className="pg-btn mt-8 bg-(--t-paper)">
          Đăng ký thêm
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="pg-card bg-(--t-paper) p-8 lg:p-12">
      <div className="grid gap-6 md:grid-cols-2">
        <label className="grid gap-2 font-extrabold">
          Tên học viên / phụ huynh
          <input name="name" autoComplete="name" className="rounded-2xl border-2 border-(--t-line) bg-(--t-bg) px-4 py-3.5 font-normal" />
        </label>
        <label className="grid gap-2 font-extrabold">
          Độ tuổi học viên
          <select name="age" className="rounded-2xl border-2 border-(--t-line) bg-(--t-bg) px-4 py-3.5 font-normal">
            <option>6–10 tuổi</option>
            <option>11–17 tuổi</option>
            <option>Người lớn</option>
          </select>
        </label>
      </div>
      <fieldset className="mt-7">
        <legend className="font-extrabold">Khung giờ học thử</legend>
        <div className="mt-3 flex flex-wrap gap-3">
          {slots.map((s) => (
            <label key={s} className="cursor-pointer">
              <input type="radio" name="slot" value={s} className="peer sr-only" />
              <span className="inline-block rounded-full border-2 border-(--t-line) bg-(--t-bg) px-4 py-2 font-bold transition-colors peer-checked:bg-(--t-sun) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--t-accent)">
                {s}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <p role="alert" className="mt-5 min-h-6 font-bold text-[#c2321f]">
        {error}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-5">
        <button type="submit" className="pg-btn bg-(--t-accent) text-(--t-paper)">
          Giữ chỗ học thử →
        </button>
        <p className="text-sm text-(--t-muted)">Mẫu demo: dữ liệu chỉ xử lý trong trình duyệt, không gửi đi.</p>
      </div>
    </form>
  );
}

export function Playground() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.anyMotion, () => {
        const title = root.current?.querySelector<HTMLElement>("[data-pg-title]");
        if (title) {
          SplitText.create(title, {
            type: "words",
            autoSplit: true,
            onSplit(self) {
              return gsap.from(self.words, { y: 60, rotate: () => gsap.utils.random(-12, 12), opacity: 0, duration: 0.9, ease: "back.out(1.8)", stagger: 0.07, delay: 0.15 });
            },
          });
        }
        gsap.from("[data-sticker]", { scale: 0, rotate: -40, duration: 0.8, ease: "back.out(2.2)", stagger: 0.08, delay: 0.6 });
        gsap.utils.toArray<HTMLElement>("[data-pg-pop]").forEach((el) => {
          gsap.from(el, { y: 50, rotate: gsap.utils.random(-4, 4), opacity: 0, duration: 0.8, ease: "back.out(1.6)", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="tpl tpl-playground">
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="container-page flex h-24 items-center justify-between gap-6">
          <a href="#dau-trang" className="flex items-center gap-2.5 font-(family-name:--t-font-display) text-lg font-bold">
            <svg aria-hidden viewBox="0 0 48 32" className="h-7 w-10">
              <rect x="2" y="9" width="44" height="6" rx="3" transform="rotate(-12 24 12)" style={{ fill: "var(--t-coral)", stroke: "var(--t-line)", strokeWidth: 2 }} />
              <path d="M18 30 L24 14 L30 30 Z" style={{ fill: "var(--t-sun)", stroke: "var(--t-line)", strokeWidth: 2, strokeLinejoin: "round" }} />
            </svg>
            Bập Bênh <span className="hidden text-(--t-accent) sm:inline">English</span>
          </a>
          <nav aria-label="Điều hướng Bập Bênh" className="hidden lg:block">
            <ul className="flex gap-8 font-bold">
              {[
                ["Kiểm tra trình độ", "#kiem-tra"],
                ["Khóa học", "#khoa-hoc"],
                ["Từ của tuần", "#tu-vung"],
                ["Phương pháp", "#phuong-phap"],
              ].map(([label, href]) => (
                <li key={href}>
                  <a href={href} className="underline-offset-4 hover:underline">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a href="#hoc-thu" className="pg-btn bg-(--t-sun) text-sm">
            Học thử miễn phí
          </a>
        </div>
      </header>

      {/* HERO: sticker kéo được */}
      <section id="dau-trang" aria-labelledby="pg-title" className="px-3 pt-24 pb-6 sm:px-5">
        <div className="pg-card relative min-h-[calc(100svh-8rem)] overflow-hidden bg-(--t-accent) text-(--t-paper)">
          <Stickers className="absolute inset-0 z-10">
            <Sticker x="56%" y="9%" rotate={-6}>
              <span className="pg-bubble block bg-(--t-paper) text-(--t-fg)">Hello!</span>
            </Sticker>
            <Sticker x="70%" y="25%" rotate={5}>
              <span className="pg-bubble block bg-(--t-coral) text-(--t-fg)">How are you?</span>
            </Sticker>
            <Sticker x="58%" y="36%" rotate={-3} className="hidden md:block">
              <span className="pg-bubble block bg-(--t-mint) text-(--t-fg)">Let&apos;s talk!</span>
            </Sticker>
            <Sticker x="84%" y="50%" rotate={12} className="hidden md:block">
              <svg viewBox="0 0 100 100" className="size-24 drop-shadow-[4px_4px_0_var(--t-line)]">
                <path d="M50 4 L62 36 L96 38 L69 59 L79 94 L50 74 L21 94 L31 59 L4 38 L38 36 Z" style={{ fill: "var(--t-sun)", stroke: "var(--t-line)", strokeWidth: 3, strokeLinejoin: "round" }} />
              </svg>
            </Sticker>
            <Sticker x="76%" y="70%" rotate={-10} className="hidden md:block">
              <span className="grid size-20 place-items-center rounded-full border-2 border-(--t-line) bg-(--t-sun) font-(family-name:--t-font-display) text-2xl font-bold text-(--t-fg) shadow-[4px_4px_0_var(--t-line)]">
                A+
              </span>
            </Sticker>
            <Sticker x="84%" y="7%" rotate={8}>
              <span className="block rounded-xl border-2 border-(--t-line) bg-(--t-lilac) px-4 py-2 font-(family-name:--t-font-display) text-xl font-bold tracking-widest text-(--t-fg) shadow-[4px_4px_0_var(--t-line)]">
                ABC
              </span>
            </Sticker>
            <Sticker x="90%" y="78%" rotate={-4} className="hidden md:block">
              <svg viewBox="0 0 60 100" className="h-20 w-12 drop-shadow-[4px_4px_0_var(--t-line)]">
                <path d="M36 2 L6 56 L28 56 L20 98 L54 38 L32 38 Z" style={{ fill: "var(--t-coral)", stroke: "var(--t-line)", strokeWidth: 3, strokeLinejoin: "round" }} />
              </svg>
            </Sticker>
          </Stickers>

          <div className="pointer-events-none relative z-20 flex min-h-[calc(100svh-8rem)] flex-col justify-end p-6 sm:p-10 lg:p-16">
            <p className="pg-hand pointer-events-auto mb-4 text-2xl text-(--t-sun)">Trung tâm tiếng Anh cho 6 tuổi tới người đi làm</p>
            <h1 id="pg-title" data-pg-title className="max-w-[11ch] text-[clamp(2.8rem,1.2rem+6.4vw,7.5rem)] leading-[0.98]">
              Nói tiếng Anh như{" "}
              <em className="relative inline-block text-(--t-sun)">
                đi chơi.
                <svg aria-hidden viewBox="0 0 300 20" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-4 w-full">
                  <path d="M3 14 C 60 2, 120 18, 180 8 S 270 6, 297 12" style={{ fill: "none", stroke: "var(--t-coral)", strokeWidth: 6, strokeLinecap: "round" }} />
                </svg>
              </em>
            </h1>
            <div className="pointer-events-auto mt-10 flex flex-wrap items-center gap-4">
              <a href="#kiem-tra" className="pg-btn bg-(--t-sun) text-(--t-fg)">
                Kiểm tra trình độ (2 phút)
              </a>
              <a href="#khoa-hoc" className="pg-btn bg-(--t-paper) text-(--t-fg)">
                Xem khóa học
              </a>
              <span className="pg-hand hidden text-xl text-(--t-paper)/85 md:inline">← kéo thử mấy cái sticker kia đi!</span>
            </div>
          </div>
        </div>
      </section>

      <div aria-hidden className="relative z-10 -my-2 -rotate-2 border-y-2 border-(--t-line) bg-(--t-sun) py-4">
        <VelocityMarquee speed={1}>
          {["Speak", "Nói", "Play", "Chơi", "Grow", "Lớn"].map((w) => (
            <span key={w} className="flex items-center font-(family-name:--t-font-display) text-[clamp(1.6rem,1rem+2vw,3rem)] font-bold">
              {w}
              <span className="mx-6 text-(--t-coral)">✦</span>
            </span>
          ))}
        </VelocityMarquee>
      </div>

      {/* KIỂM TRA TRÌNH ĐỘ */}
      <section id="kiem-tra" aria-labelledby="pg-kiem-tra" className="container-page grid gap-12 py-28 lg:grid-cols-12 lg:py-36">
        <div className="lg:col-span-5">
          <p className="pg-hand text-2xl text-(--t-accent)">2 phút, 5 câu hỏi</p>
          <h2 id="pg-kiem-tra" className="mt-3 text-[clamp(2.4rem,1.4rem+3.6vw,5rem)]">
            Bạn đang ở <em className="text-(--t-accent)">level</em> nào?
          </h2>
          <p className="mt-6 max-w-[28rem] text-lg leading-relaxed text-(--t-muted)">
            Làm thử bài kiểm tra mini để biết lớp nào hợp với bạn. Sai cũng không sao, ở đây mình học từ lỗi sai mà.
          </p>
        </div>
        <div data-pg-pop className="lg:col-span-7">
          <Quiz />
        </div>
      </section>

      {/* KHÓA HỌC */}
      <section id="khoa-hoc" aria-labelledby="pg-khoa-hoc" className="border-y-2 border-(--t-line) bg-(--t-paper) py-28 lg:py-36">
        <div className="container-page">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <h2 id="pg-khoa-hoc" className="text-[clamp(2.4rem,1.4rem+3.6vw,5rem)]">
              Khóa học <em className="text-(--t-coral)">vừa vặn</em>
            </h2>
            <p className="pg-hand max-w-[22rem] text-xl text-(--t-muted)">Dùng phím ← → để chuyển nhóm tuổi</p>
          </div>
          <CourseTabs />
        </div>
      </section>

      {/* TỪ CỦA TUẦN */}
      <section id="tu-vung" aria-labelledby="pg-tu-vung" className="container-page py-28 lg:py-36">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 id="pg-tu-vung" className="text-[clamp(2.4rem,1.4rem+3.6vw,5rem)]">
            Từ của <em className="text-(--t-accent)">tuần.</em>
          </h2>
          <p className="pg-hand text-2xl">Bấm vào thẻ để lật ↻</p>
        </div>
        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {words.map((w, i) => (
            <li key={w.word} data-pg-pop style={{ rotate: `${[-2, 1.5, -1, 2, -1.5, 1][i]}deg` }}>
              <FlipCard
                label={`Lật thẻ từ “${w.word}”`}
                className="h-60"
                front={
                  <span className={cn("pg-card flex h-full flex-col justify-between p-7", w.color)}>
                    <span className="text-sm font-extrabold uppercase">Word #{i + 1}</span>
                    <span>
                      <span className="block font-(family-name:--t-font-display) text-[clamp(2rem,1.4rem+1.6vw,2.8rem)] font-bold">{w.word}</span>
                      <span className="mt-1 block text-(--t-muted)">{w.ipa}</span>
                    </span>
                  </span>
                }
                back={
                  <span className="pg-card flex h-full flex-col justify-between bg-(--t-fg) p-7 text-(--t-paper)">
                    <span className="text-sm font-extrabold text-(--t-sun) uppercase">{w.word}</span>
                    <span>
                      <span className="block font-(family-name:--t-font-display) text-3xl font-bold">{w.vi}</span>
                      <span className="pg-hand mt-3 block text-xl text-(--t-paper)/85">“{w.ex}”</span>
                    </span>
                  </span>
                }
              />
            </li>
          ))}
        </ul>
      </section>

      {/* PHƯƠNG PHÁP */}
      <section id="phuong-phap" aria-labelledby="pg-phuong-phap" className="bg-(--t-fg) py-28 text-(--t-paper) lg:py-36">
        <div className="container-page">
          <h2 id="pg-phuong-phap" className="max-w-[16ch] text-[clamp(2.4rem,1.4rem+3.6vw,5rem)]">
            <MarkerHighlight className="text-(--t-fg)">Nói trước,</MarkerHighlight> ngữ pháp sau.
          </h2>
          <ol className="mt-16 grid gap-6 lg:grid-cols-3">
            {[
              ["Nói ngay buổi đầu", "Mỗi buổi học, mỗi học viên nói ít nhất 15 phút. Giáo viên sửa nhẹ nhàng, không ngắt lời."],
              ["Học qua dự án", "Làm podcast, đóng kịch, phỏng vấn người thật: tiếng Anh trở thành công cụ, không phải môn học."],
              ["Phụ huynh cùng theo dõi", "Báo cáo ngắn mỗi tháng kèm đoạn ghi âm để thấy con tiến bộ thế nào."],
            ].map(([t, d], i) => (
              <li key={t} data-pg-pop className={cn("pg-card bg-(--t-paper) p-8 text-(--t-fg)", i === 1 && "lg:mt-16", i === 2 && "lg:mt-8")}>
                <span className="grid size-14 place-items-center rounded-full border-2 border-(--t-line) bg-(--t-sun) font-(family-name:--t-font-display) text-xl font-bold">
                  {i + 1}
                </span>
                <h3 className="mt-6 text-2xl">{t}</h3>
                <p className="mt-3 leading-relaxed text-(--t-muted)">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* HỌC THỬ */}
      <section id="hoc-thu" aria-labelledby="pg-hoc-thu" className="container-page grid gap-12 py-28 lg:grid-cols-12 lg:py-36">
        <div className="lg:col-span-4">
          <p className="pg-hand text-2xl text-(--t-coral)">Miễn phí · 45 phút</p>
          <h2 id="pg-hoc-thu" className="mt-3 text-[clamp(2.4rem,1.4rem+3.6vw,5rem)]">Đến chơi một buổi nhé!</h2>
        </div>
        <div className="lg:col-span-8">
          <TrialForm />
        </div>
      </section>
    </div>
  );
}
