"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

import { MarkerHighlight } from "@/components/fx/MarkerHighlight";
import { ScrollParallax } from "@/components/fx/ScrollParallax";
import { StackCards } from "@/components/fx/StackCards";
import { cn } from "@/lib/cn";
import { gsap, MQ, SplitText, useGSAP } from "@/lib/motion";
import { tplImage } from "@/templates/_kit/images";
import "@/templates/campus/campus.css";

const img = (name: string) => tplImage("campus", name);

const day = [
  { time: "07:30", title: "Cổng trường mở", text: "Giáo viên chủ nhiệm đón từng em ở cổng, hỏi một câu về buổi sáng của các em.", img: "arrive" },
  { time: "08:00", title: "Tiết học đầu tiên", text: "Lớp không quá 24 học sinh. Tiết đầu dành cho môn cần tập trung nhất.", img: "lesson" },
  { time: "10:30", title: "Học qua dự án", text: "Ra khỏi lớp: quan sát, ghi chép, vẽ lại. Mỗi học kỳ một dự án liên môn.", img: "project" },
  { time: "12:00", title: "Bữa trưa ở sân trong", text: "Ăn cùng thầy cô, rồi nghỉ trưa dưới hàng hiên.", img: "hero" },
  { time: "14:00", title: "Câu lạc bộ", text: "Âm nhạc, hội họa, thể thao, tranh biện: mỗi em chọn hai câu lạc bộ mỗi kỳ.", img: "club" },
  { time: "16:30", title: "Thư viện cuối ngày", text: "Một giờ đọc tự do trước khi phụ huynh đến đón.", img: "library" },
];

const levels = [
  { name: "Tiểu học", grade: "Lớp 1 – 5", img: "young", points: ["Đọc, viết và tính toán vững vàng", "Học qua trò chơi và quan sát thiên nhiên", "Sĩ số 20–24 em mỗi lớp (minh họa)"] },
  { name: "Trung học cơ sở", grade: "Lớp 6 – 9", img: "painting", points: ["Dự án liên môn mỗi học kỳ", "Câu lạc bộ học thuật và nghệ thuật", "Cố vấn học tập riêng cho từng em"] },
  { name: "Trung học phổ thông", grade: "Lớp 10 – 12", img: "teen", points: ["Định hướng ngành nghề từ lớp 10", "Môn tự chọn theo năng lực và sở thích", "Chuẩn bị hồ sơ đại học trong và ngoài nước"] },
];

const facilities = [
  { n: "atrium", cap: "Thư viện trung tâm, bốn tầng sách mở" },
  { n: "artclass", cap: "Xưởng vẽ, ánh sáng tự nhiên từ mái" },
  { n: "sport", cap: "Sân thể thao đa năng" },
  { n: "band", cap: "Phòng nhạc cụ hơi" },
  { n: "reading", cap: "Phòng đọc yên tĩnh" },
];

const months = [
  { id: "t9", label: "Tháng 9", events: [["05", "Lễ khai giảng", "Toàn trường"], ["18", "Đêm hội trăng rằm", "Tiểu học"], ["27", "Ngày hội câu lạc bộ", "Trung học"]] },
  { id: "t10", label: "Tháng 10", events: [["09", "Tham quan bảo tàng", "Lớp 4 – 6"], ["20", "Triển lãm tranh", "Toàn trường"], ["30", "Giải bóng rổ mùa thu", "Trung học"]] },
  { id: "t11", label: "Tháng 11", events: [["12", "Ngày hội đọc sách", "Toàn trường"], ["20", "Tri ân thầy cô", "Toàn trường"], ["28", "Họp phụ huynh giữa kỳ", "Phụ huynh"]] },
  { id: "t12", label: "Tháng 12", events: [["08", "Hòa nhạc mùa đông", "Câu lạc bộ âm nhạc"], ["15", "Tranh biện liên trường", "THPT"], ["22", "Hội chợ cuối năm", "Toàn trường"]] },
];

const admissions = [
  { n: "I", t: "Tham quan trường", d: "Đi một vòng khuôn viên, dự một tiết học cùng con và gặp thầy cô." },
  { n: "II", t: "Trò chuyện cùng con", d: "Một buổi gặp nhẹ nhàng để hiểu sở thích, điểm mạnh và điều con còn ngại." },
  { n: "III", t: "Ngày học thử", d: "Con học một ngày cùng lớp tương lai; phụ huynh nhận nhận xét sau buổi học." },
  { n: "IV", t: "Nhập học", d: "Hoàn thiện hồ sơ, nhận lịch định hướng và đồng phục trước ngày khai giảng." },
];

function Clock({ progressRef }: { progressRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={progressRef} aria-hidden className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="size-20 lg:size-24">
        <circle cx="50" cy="50" r="46" style={{ fill: "var(--t-paper)", stroke: "var(--t-fg)", strokeWidth: 1.5 }} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1="50" y1="8" x2="50" y2={i % 3 === 0 ? 16 : 12} transform={`rotate(${i * 30} 50 50)`} style={{ stroke: "var(--t-fg)", strokeWidth: i % 3 === 0 ? 2 : 1 }} />
        ))}
        <line data-cp-hour x1="50" y1="50" x2="50" y2="28" style={{ stroke: "var(--t-fg)", strokeWidth: 3, strokeLinecap: "round", transformOrigin: "50px 50px" }} />
        <line data-cp-minute x1="50" y1="50" x2="50" y2="16" style={{ stroke: "var(--t-accent)", strokeWidth: 2, strokeLinecap: "round", transformOrigin: "50px 50px" }} />
        <circle cx="50" cy="50" r="3" style={{ fill: "var(--t-brass)" }} />
      </svg>
      <span data-cp-digital className="font-(family-name:--t-font-display) text-4xl tabular-nums">
        07:30
      </span>
    </div>
  );
}

function Levels() {
  const [open, setOpen] = useState(0);
  return (
    <ul className="border-t border-(--t-line)">
      {levels.map((l, i) => {
        const isOpen = open === i;
        const im = img(l.img);
        return (
          <li key={l.name} className="border-b border-(--t-line)">
            <h3>
              <button type="button" aria-expanded={isOpen} aria-controls={`cp-level-${i}`} onClick={() => setOpen(isOpen ? -1 : i)} className="grid w-full grid-cols-[1fr_auto] items-baseline gap-6 py-7 text-left md:grid-cols-12">
                <span className="text-[clamp(2rem,1.4rem+2.6vw,4rem)] md:col-span-7">{l.name}</span>
                <span className="cp-label hidden text-(--t-muted) md:col-span-4 md:block">{l.grade}</span>
                <span aria-hidden className={cn("text-2xl transition-transform duration-500 md:col-span-1 md:justify-self-end", isOpen && "rotate-45 text-(--t-accent)")}>
                  +
                </span>
              </button>
            </h3>
            <div id={`cp-level-${i}`} data-open={isOpen} className="cp-panel" inert={!isOpen}>
              <div>
                <div className="grid gap-8 pb-10 md:grid-cols-12">
                  <div className="aspect-[4/3] overflow-hidden md:col-span-5">
                    <Image src={im.src} width={im.width} height={im.height} alt="" sizes="(min-width: 768px) 40vw, 100vw" className="size-full object-cover" />
                  </div>
                  <ul className="space-y-4 md:col-span-6 md:col-start-7">
                    {l.points.map((p, k) => (
                      <li key={p} className="grid grid-cols-[2.5rem_1fr] border-b border-(--t-line) pb-4 text-lg">
                        <span className="cp-chapter">{k + 1}.</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Events() {
  const [tab, setTab] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = months.length;
    const map: Record<string, number> = { ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    setTab(map[e.key]);
    refs.current[map[e.key]]?.focus();
  };
  return (
    <div>
      <div role="tablist" aria-label="Chọn tháng" className="flex flex-wrap gap-2">
        {months.map((m, i) => (
          <button
            key={m.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={`cp-tab-${m.id}`}
            role="tab"
            type="button"
            aria-selected={tab === i}
            aria-controls={`cp-panel-${m.id}`}
            tabIndex={tab === i ? 0 : -1}
            onClick={() => setTab(i)}
            onKeyDown={(e) => onKey(e, i)}
            className="cp-label rounded-full border border-(--t-line) px-4 py-2.5 transition-colors"
          >
            {m.label}
          </button>
        ))}
      </div>
      {months.map((m, i) => (
        <ol key={m.id} id={`cp-panel-${m.id}`} role="tabpanel" aria-labelledby={`cp-tab-${m.id}`} hidden={tab !== i} className="mt-8 border-t border-(--t-line)">
          {m.events.map(([d, t, who]) => (
            <li key={t} className="grid grid-cols-[5rem_1fr] items-baseline gap-6 border-b border-(--t-line) py-6 md:grid-cols-12">
              <span className="font-(family-name:--t-font-display) text-5xl text-(--t-accent) tabular-nums md:col-span-2">{d}</span>
              <span className="text-2xl md:col-span-7">{t}</span>
              <span className="cp-label col-start-2 text-(--t-muted) md:col-span-3 md:col-start-auto md:justify-self-end">{who}</span>
            </li>
          ))}
        </ol>
      ))}
      <p className="cp-note mt-8">Lịch sự kiện minh họa cho năm học 2027–2028.</p>
    </div>
  );
}

function Visit() {
  const [days, setDays] = useState<{ iso: string; label: string }[]>([]);
  const [sent, setSent] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const t = window.setTimeout(() => {
      const now = new Date();
      const list: { iso: string; label: string }[] = [];
      for (let i = 1; list.length < 6 && i < 30; i++) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
        if (d.getDay() === 2 || d.getDay() === 4 || d.getDay() === 6) list.push({ iso: d.toISOString().slice(0, 10), label: d.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "numeric" }) });
      }
      setDays(list);
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const date = String(data.get("date") ?? "");
    if (name.length < 2) return setError("Vui lòng nhập tên phụ huynh.");
    if (!date) return setError("Vui lòng chọn một ngày tham quan.");
    setError("");
    setSent(`${name} · ${data.get("level")} · ${days.find((d) => d.iso === date)?.label ?? date} · ${data.get("slot")}`);
  };

  if (sent) {
    return (
      <div className="border border-(--t-line) bg-(--t-paper) p-8 md:p-12" aria-live="polite">
        <p className="cp-label text-(--t-accent)">Đã ghi nhận (minh họa)</p>
        <p className="mt-4 text-4xl">Hẹn gặp gia đình ở cổng trường.</p>
        <p className="mt-4 text-(--t-muted)">{sent}</p>
        <p className="cp-note mt-6">Mẫu demo: không có dữ liệu nào được gửi đi.</p>
        <button type="button" onClick={() => setSent("")} className="cp-label mt-6 underline underline-offset-4">
          Đổi lịch
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-8 border border-(--t-line) bg-(--t-paper) p-8 md:p-12">
      <div className="grid gap-6 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="cp-label text-(--t-muted)">Tên phụ huynh</span>
          <input name="name" autoComplete="name" className="border-b border-(--t-line) bg-transparent py-2 text-xl outline-none focus:border-(--t-accent)" />
        </label>
        <label className="grid gap-2">
          <span className="cp-label text-(--t-muted)">Cấp học quan tâm</span>
          <select name="level" className="border-b border-(--t-line) bg-transparent py-2 text-xl outline-none">
            {levels.map((l) => (
              <option key={l.name}>{l.name}</option>
            ))}
          </select>
        </label>
      </div>
      <fieldset>
        <legend className="cp-label text-(--t-muted)">Ngày tham quan (thứ Ba, Năm, Bảy)</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {days.map((d) => (
            <label key={d.iso} className="cp-chip capitalize">
              <input type="radio" name="date" value={d.iso} className="sr-only" />
              {d.label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="cp-label text-(--t-muted)">Khung giờ</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {["08:30", "10:00", "14:00"].map((s, i) => (
            <label key={s} className="cp-chip tabular-nums">
              <input type="radio" name="slot" value={s} defaultChecked={i === 0} className="sr-only" />
              {s}
            </label>
          ))}
        </div>
      </fieldset>
      <p role="alert" className="min-h-6 text-[#9a3b2a]">
        {error}
      </p>
      <div className="flex flex-wrap items-center gap-6">
        <button type="submit" className="cp-label bg-(--t-accent) px-7 py-4 text-(--t-paper) transition-colors hover:bg-(--t-fg)">
          Đăng ký tham quan
        </button>
        <span className="text-sm text-(--t-muted)">Mẫu demo: xử lý trong trình duyệt, không gửi dữ liệu.</span>
      </div>
    </form>
  );
}

export function Campus() {
  const root = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.anyMotion, () => {
        const title = root.current?.querySelector<HTMLElement>("[data-cp-title]");
        if (title) {
          SplitText.create(title, {
            type: "chars",
            autoSplit: true,
            onSplit: (self) => gsap.from(self.chars, { yPercent: 40, opacity: 0, duration: 1.6, ease: "power3.out", stagger: 0.05, delay: 0.15 }),
          });
        }
        gsap.from("[data-cp-fade]", { opacity: 0, y: 16, duration: 1.4, ease: "power3.out", stagger: 0.1, delay: 0.7 });
      });

      // Một ngày ở trường: pin + cuộn ngang, đồng hồ chạy theo tiến độ (chỉ desktop)
      mm.add(MQ.desktopMotion, () => {
        const track = root.current?.querySelector<HTMLElement>("[data-cp-track]");
        const section = root.current?.querySelector<HTMLElement>("[data-cp-day]");
        if (!track || !section) return;
        const digital = root.current?.querySelector<HTMLElement>("[data-cp-digital]");
        const distance = () => track.scrollWidth - window.innerWidth;
        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const minutes = 7.5 * 60 + self.progress * 9 * 60;
              const h = Math.floor(minutes / 60);
              const m = Math.floor(minutes % 60);
              gsap.set("[data-cp-minute]", { rotation: (minutes % 60) * 6 });
              gsap.set("[data-cp-hour]", { rotation: ((minutes / 60) % 12) * 30 });
              if (digital) digital.textContent = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
            },
          },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const hero = img("hero");

  return (
    <div ref={root} className="tpl tpl-campus">
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="container-page flex h-24 items-center justify-between gap-6">
          <a href="#dau-trang" className="flex items-center gap-3">
            <span aria-hidden className="grid size-11 place-items-center border-[3px] border-double border-(--t-accent) font-(family-name:--t-font-display) text-lg text-(--t-accent)">
              RT
            </span>
            <span className="leading-tight">
              <span className="cp-label block text-(--t-muted)">Trường Liên cấp</span>
              <span className="font-(family-name:--t-font-display) text-xl">Rặng Thông</span>
            </span>
          </a>
          <nav aria-label="Điều hướng Rặng Thông" className="hidden lg:block">
            <ul className="cp-label flex gap-8">
              {[
                ["Triết lý", "#triet-ly"],
                ["Một ngày", "#mot-ngay"],
                ["Cấp học", "#cap-hoc"],
                ["Tuyển sinh", "#tuyen-sinh"],
              ].map(([l, h]) => (
                <li key={h}>
                  <a href={h} className="hover:text-(--t-accent)">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a href="#tuyen-sinh" className="cp-label bg-(--t-accent) px-5 py-3 text-(--t-paper) transition-colors hover:bg-(--t-fg)">
            Đăng ký tham quan
          </a>
        </div>
      </header>

      {/* HERO */}
      <section id="dau-trang" aria-labelledby="cp-title" className="container-page pt-36 pb-24">
        <div data-cp-fade className="cp-label flex justify-between border-b border-(--t-line) pb-3 text-(--t-muted)">
          <span>Niên giám 2027 – 2028</span>
          <span className="cp-chapter normal-case tracking-normal">Chương I · Nơi bắt đầu</span>
        </div>
        <h1 id="cp-title" data-cp-title className="mt-8 text-[clamp(4rem,1rem+13vw,15rem)] leading-[0.9] font-light tracking-[-0.045em]">
          Rặng Thông
        </h1>
        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p data-cp-fade className="text-xl leading-relaxed">
              Trường liên cấp từ lớp 1 đến lớp 12, nơi các em được lớn lên đúng nhịp của mình, giữa sách vở, bàn tay lấm màu và những câu hỏi chưa có đáp án.
            </p>
            <p data-cp-fade className="cp-note mt-8">Thương hiệu, số liệu và lịch trong niên giám này là giả định, dùng để minh họa giao diện.</p>
          </div>
          <figure className="lg:col-span-8">
            <ScrollParallax reveal="center" depth={10} className="aspect-[16/10]">
              <Image src={hero.src} width={hero.width} height={hero.height} alt="Sân trong có hàng hiên vòm và tháp chuông" priority sizes="(min-width: 1024px) 66vw, 100vw" className="size-full object-cover" />
            </ScrollParallax>
            <figcaption className="cp-note mt-3">Hình 1. Sân trong khu học xá, nơi các em ăn trưa và nghỉ giữa giờ.</figcaption>
          </figure>
        </div>
      </section>

      {/* TRIẾT LÝ */}
      <section id="triet-ly" aria-labelledby="cp-triet-ly" className="cp-rule container-page py-28 lg:py-40">
        <p className="cp-chapter text-xl">Chương II</p>
        <h2 id="cp-triet-ly" className="sr-only">
          Triết lý giáo dục
        </h2>
        <p className="mt-6 max-w-[24ch] text-[clamp(2rem,1.2rem+3vw,4.4rem)] leading-[1.12] font-light">
          Chúng tôi không vội biến trẻ thành người lớn. Chúng tôi giúp các em <MarkerHighlight>lớn đúng nhịp</MarkerHighlight> của mình, với <MarkerHighlight delay={0.3}>sự tò mò còn nguyên vẹn.</MarkerHighlight>
        </p>
        <ol className="mt-20 grid gap-10 md:grid-cols-3">
          {[
            ["Hỏi trước, đáp sau", "Mỗi bài học bắt đầu bằng một câu hỏi thật, không bắt đầu bằng định nghĩa.", "Ghi chú: giáo viên được đánh giá cả bằng số câu hỏi học sinh đặt ra."],
            ["Tay làm, đầu nghĩ", "Xưởng vẽ, phòng thí nghiệm, khu vườn: kiến thức đi qua bàn tay trước khi vào vở.", "Ghi chú: mỗi học kỳ có ít nhất một sản phẩm làm bằng tay."],
            ["Lớn cùng nhau", "Anh chị lớp trên kèm lớp dưới; thầy cô biết tên từng em.", "Ghi chú: sĩ số lớp tối đa 24 (minh họa)."],
          ].map(([t, d, note], i) => (
            <li key={t}>
              <span className="cp-chapter text-4xl">{["I", "II", "III"][i]}.</span>
              <h3 className="mt-4 text-3xl">{t}</h3>
              <p className="mt-3 leading-relaxed text-(--t-muted)">{d}</p>
              <p className="cp-note mt-5">{note}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* MỘT NGÀY Ở TRƯỜNG */}
      <section id="mot-ngay" data-cp-day aria-labelledby="cp-mot-ngay" className="relative overflow-hidden bg-(--t-accent) text-(--t-paper) lg:h-[100svh]">
        <div className="container-page flex flex-wrap items-end justify-between gap-6 pt-20 lg:absolute lg:inset-x-0 lg:top-0 lg:z-10 lg:pt-24">
          <div>
            <p className="cp-chapter text-xl text-(--t-brass)">Chương III</p>
            <h2 id="cp-mot-ngay" className="mt-3 text-[clamp(2.4rem,1.4rem+3.4vw,5rem)] font-light">
              Một ngày <em className="text-(--t-brass) italic">ở trường.</em>
            </h2>
          </div>
          <div className="text-(--t-paper)">
            <Clock progressRef={clockRef} />
          </div>
        </div>
        <div data-cp-track className="flex snap-x snap-mandatory gap-8 overflow-x-auto px-(--gutter) pt-10 pb-20 lg:h-full lg:w-max lg:snap-none lg:items-end lg:overflow-visible lg:pt-0 lg:pb-[8vh]">
          {day.map((d) => {
            const im = img(d.img);
            return (
              <article key={d.time} className="w-[82vw] shrink-0 snap-start lg:w-[52vw]">
                <div className="grid gap-6 lg:grid-cols-5 lg:items-end">
                  <div className="aspect-[4/3] overflow-hidden lg:col-span-3 lg:aspect-[4/5] lg:max-h-[58vh]">
                    <Image src={im.src} width={im.width} height={im.height} alt="" sizes="(min-width: 1024px) 30vw, 82vw" className="size-full object-cover" />
                  </div>
                  <div className="lg:col-span-2">
                    <p className="font-(family-name:--t-font-display) text-6xl text-(--t-brass) tabular-nums">{d.time}</p>
                    <h3 className="mt-3 text-3xl">{d.title}</h3>
                    <p className="mt-3 leading-relaxed opacity-80">{d.text}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* CẤP HỌC */}
      <section id="cap-hoc" aria-labelledby="cp-cap-hoc" className="container-page py-28 lg:py-40">
        <p className="cp-chapter text-xl">Chương IV</p>
        <h2 id="cp-cap-hoc" className="mt-3 mb-12 text-[clamp(2.4rem,1.4rem+3.4vw,5rem)] font-light">
          Ba cấp học, <em className="italic">một mạch.</em>
        </h2>
        <Levels />
      </section>

      {/* CƠ SỞ VẬT CHẤT */}
      <section aria-labelledby="cp-co-so" className="cp-rule container-page py-28 lg:py-40">
        <p className="cp-chapter text-xl">Chương V</p>
        <h2 id="cp-co-so" className="mt-3 text-[clamp(2.4rem,1.4rem+3.4vw,5rem)] font-light">
          Những nơi <em className="italic">các em lớn lên.</em>
        </h2>
        <div className="mt-16 grid gap-x-8 gap-y-14 md:grid-cols-12">
          {facilities.map((f, i) => {
            const im = img(f.n);
            const layout = ["md:col-span-7", "md:col-span-4 md:col-start-9 md:mt-32", "md:col-span-5 md:col-start-2", "md:col-span-4 md:col-start-8 md:-mt-20", "md:col-span-6 md:col-start-4"][i];
            return (
              <figure key={f.n} className={layout}>
                <ScrollParallax reveal="up" depth={[8, 18, 12, 22, 10][i]} className={i % 2 ? "aspect-[4/5]" : "aspect-[4/3]"}>
                  <Image src={im.src} width={im.width} height={im.height} alt={f.cap} sizes="(min-width: 768px) 50vw, 100vw" className="size-full object-cover" />
                </ScrollParallax>
                <figcaption className="cp-note mt-3">
                  Hình {i + 2}. {f.cap}.
                </figcaption>
              </figure>
            );
          })}
        </div>
      </section>

      {/* LỊCH SỰ KIỆN */}
      <section aria-labelledby="cp-su-kien" className="bg-(--t-paper) py-28 lg:py-36">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="cp-chapter text-xl">Chương VI</p>
            <h2 id="cp-su-kien" className="mt-3 text-[clamp(2.4rem,1.4rem+3.4vw,5rem)] font-light">
              Lịch <em className="italic">năm học.</em>
            </h2>
          </div>
          <div className="lg:col-span-8">
            <Events />
          </div>
        </div>
      </section>

      {/* TUYỂN SINH */}
      <section id="tuyen-sinh" aria-labelledby="cp-tuyen-sinh" className="container-page py-28 lg:py-40">
        <p className="cp-chapter text-xl">Chương VII</p>
        <h2 id="cp-tuyen-sinh" className="mt-3 mb-14 text-[clamp(2.4rem,1.4rem+3.4vw,5rem)] font-light">
          Tuyển sinh, <em className="italic">bốn bước.</em>
        </h2>
        <StackCards
          top="14vh"
          step="1.2rem"
          cardClassName="pb-4"
          items={admissions.map((a) => (
            <article key={a.n} className="grid gap-6 border border-(--t-line) bg-(--t-paper) p-8 md:grid-cols-12 md:items-center md:p-12">
              <span className="cp-chapter text-7xl md:col-span-2">{a.n}</span>
              <h3 className="text-4xl md:col-span-4">{a.t}</h3>
              <p className="text-lg leading-relaxed text-(--t-muted) md:col-span-6">{a.d}</p>
            </article>
          ))}
        />
        <div className="mt-20 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h3 className="text-4xl">Đăng ký tham quan trường</h3>
            <p className="cp-note mt-6">Buổi tham quan kéo dài khoảng 90 phút, phụ huynh có thể đi cùng con.</p>
          </div>
          <div className="lg:col-span-8">
            <Visit />
          </div>
        </div>
      </section>

      <footer className="cp-rule container-page py-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <p className="font-(family-name:--t-font-display) text-[clamp(3rem,1.5rem+6vw,8rem)] leading-none font-light">Rặng Thông</p>
          <p className="cp-label text-(--t-muted)">Hết niên giám · thương hiệu giả định</p>
        </div>
      </footer>
    </div>
  );
}
