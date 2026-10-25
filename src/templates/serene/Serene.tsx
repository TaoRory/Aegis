"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { DragSlider } from "@/components/fx/DragSlider";
import { MarkerHighlight } from "@/components/fx/MarkerHighlight";
import { MistCursor } from "@/components/fx/MistCursor";
import { StackCards } from "@/components/fx/StackCards";
import { gsap, MQ, SplitText, useGSAP } from "@/lib/motion";
import { tplImage } from "@/templates/_kit/images";
import { Booking } from "@/templates/serene/Booking";
import "@/templates/serene/serene.css";

const img = (name: string) => tplImage("serene", name);

const treatments = [
  { n: "room", name: "Chăm sóc da chuyên sâu", time: "75 phút", for: "Da khô, thiếu nước, xỉn màu sau thời gian dài làm việc trong phòng lạnh.", price: "từ 850.000 ₫" },
  { n: "massage", name: "Massage thảo mộc", time: "60 phút", for: "Vai gáy căng, giấc ngủ chập chờn, cần một giờ hoàn toàn tắt điện thoại.", price: "từ 650.000 ₫" },
  { n: "bath", name: "Thủy liệu khoáng", time: "90 phút", for: "Cơ thể mỏi sau chuyến đi dài; bể khoáng ấm, xông đá và trà gừng.", price: "từ 1.150.000 ₫" },
  { n: "candle", name: "Liệu trình đêm", time: "120 phút", for: "Một buổi tối riêng: tinh dầu, nến, massage nhẹ và chăm sóc da mặt.", price: "từ 1.650.000 ₫" },
];

const steps = [
  { t: "Soi da", d: "Chuyên viên soi da và hỏi về thói quen sinh hoạt." },
  { t: "Tư vấn", d: "Chọn liệu trình vừa đủ, không bán thêm thứ bạn không cần." },
  { t: "Chăm sóc", d: "Không gian riêng, nhiệt độ và âm nhạc theo ý bạn." },
  { t: "Theo dõi", d: "Ghi chú tình trạng da để lần sau tiếp tục đúng hướng." },
];

const faqs = [
  ["Tôi nên đến trước giờ hẹn bao lâu?", "Khoảng 15 phút để thay đồ, uống trà và điền phiếu tình trạng da."],
  ["Da nhạy cảm có làm được không?", "Có. Buổi soi da đầu tiên giúp chuyên viên chọn sản phẩm dịu nhẹ, không hương liệu nếu cần."],
  ["Có cần đặt cọc không?", "Mẫu demo này không có thanh toán. Website thật có thể thêm đặt cọc hoặc thanh toán tại quầy."],
  ["Tôi có thể đổi lịch không?", "Bạn có thể đổi lịch trước giờ hẹn 4 tiếng qua tin nhắn xác nhận."],
];

const phases = [
  { label: "Hít vào", secs: 4, scale: 1 },
  { label: "Giữ", secs: 4, scale: 1 },
  { label: "Thở ra", secs: 6, scale: 0.55 },
];

function Breath() {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(-1);
  const [cycles, setCycles] = useState(0);
  const orb = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const clear = () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
    if (!running) {
      clear();
      gsap.to(orb.current, { scale: 0.55, duration: 1.2, ease: "sine.inOut" });
      return;
    }
    const reduced = window.matchMedia(MQ.reduced).matches;
    const run = (i: number) => {
      const p = phases[i % 3];
      setPhase(i % 3);
      if (i % 3 === 0 && i > 0) setCycles((c) => c + 1);
      if (!reduced) gsap.to(orb.current, { scale: p.scale, duration: p.secs, ease: "sine.inOut" });
      timers.current.push(window.setTimeout(() => run(i + 1), p.secs * 1000));
    };
    run(0);
    return clear;
  }, [running]);

  const stop = () => {
    setRunning(false);
    setPhase(-1);
  };

  return (
    <div className="grid items-center gap-14 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <p className="text-sm text-(--t-muted)">Một phút cho bản thân</p>
        <h2 id="se-tho" className="mt-4 text-[clamp(2.4rem,1.5rem+3vw,4.6rem)] leading-[1.02]">
          Thở cùng <em>chúng tôi.</em>
        </h2>
        <p className="mt-6 max-w-[30rem] text-lg leading-relaxed text-(--t-muted)">
          Hít vào bốn nhịp, giữ bốn nhịp, thở ra sáu nhịp. Mỗi liệu trình ở SƯƠNG đều bắt đầu bằng một phút như thế này.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button type="button" onClick={() => (running ? stop() : setRunning(true))} className="se-pill bg-(--t-fg) text-(--t-surface)">
            {running ? "Dừng lại" : "Bắt đầu thở"}
          </button>
          <p className="text-sm text-(--t-muted)" aria-live="polite">
            {cycles > 0 ? `Đã hoàn thành ${cycles} nhịp thở` : ""}
          </p>
        </div>
      </div>
      <div className="relative mx-auto grid aspect-square w-full max-w-[30rem] place-items-center lg:col-span-6 lg:col-start-7">
        <div aria-hidden className="absolute inset-0 rounded-full border border-(--t-line)" />
        <div aria-hidden className="absolute inset-[12%] rounded-full border border-dashed border-(--t-line)" />
        <div ref={orb} aria-hidden className="absolute inset-[6%] scale-[0.55] rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--t-surface),var(--t-sage)_70%)] shadow-[0_40px_120px_-40px_var(--t-sage)]" />
        <p className="relative text-center font-(family-name:--t-font-display) text-[clamp(2rem,1.4rem+2vw,3.2rem)]" aria-live="polite">
          {phase >= 0 ? phases[phase].label : "Sẵn sàng"}
          {phase >= 0 && <span className="mt-1 block text-sm text-(--t-muted)">{phases[phase].secs} nhịp</span>}
        </p>
      </div>
    </div>
  );
}

export function Serene() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.anyMotion, () => {
        const title = root.current?.querySelector<HTMLElement>("[data-se-title]");
        if (title) {
          SplitText.create(title, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) => gsap.from(self.lines, { yPercent: 105, duration: 1.8, ease: "power3.out", stagger: 0.14, delay: 0.3 }),
          });
        }
        gsap.from("[data-se-fade]", { opacity: 0, y: 16, duration: 1.6, ease: "power2.out", stagger: 0.12, delay: 1 });
        gsap.fromTo("[data-se-hero-img]", { scale: 1.12 }, { scale: 1, duration: 3.2, ease: "power2.out" });
        // Đường cong quy trình tự vẽ
        const path = root.current?.querySelector<SVGPathElement>("[data-se-path]");
        if (path) {
          const len = path.getTotalLength();
          gsap.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: path, start: "top 80%", end: "bottom 50%", scrub: 1 } });
        }
        gsap.utils.toArray<HTMLElement>("[data-se-rise]").forEach((el) => {
          gsap.from(el, { opacity: 0, y: 40, duration: 1.6, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const hero = img("hero");

  return (
    <div ref={root} className="tpl tpl-serene">
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="container-page flex h-24 items-center justify-between">
          <a href="#dau-trang" className="font-(family-name:--t-font-display) text-2xl tracking-[0.18em]">
            SƯƠNG
          </a>
          <nav aria-label="Điều hướng SƯƠNG" className="hidden md:block">
            <ul className="flex gap-9 text-sm">
              {[
                ["Liệu trình", "#lieu-trinh"],
                ["Quy trình", "#quy-trinh"],
                ["Không gian", "#khong-gian"],
                ["Hỏi đáp", "#hoi-dap"],
              ].map(([l, h]) => (
                <li key={h}>
                  <a href={h} className="transition-colors hover:text-(--t-accent)">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a href="#dat-lich" className="se-pill bg-(--t-fg) text-sm text-(--t-surface)">
            Đặt lịch
          </a>
        </div>
      </header>

      {/* HERO: ảnh + sương theo chuột */}
      <section id="dau-trang" aria-labelledby="se-title" className="relative flex min-h-[100svh] items-end overflow-hidden pb-16">
        <div className="absolute inset-0">
          <Image data-se-hero-img src={hero.src} width={hero.width} height={hero.height} alt="Bể thủy liệu yên tĩnh trong không gian trắng" priority sizes="100vw" className="size-full object-cover" />
          <div aria-hidden className="absolute inset-0 bg-linear-to-t from-(--t-bg) via-(--t-bg)/70 to-(--t-bg)/10" />
        </div>
        <MistCursor color="#ffffff" opacity={0.9} />
        <div className="container-page relative">
          <p data-se-fade className="text-sm tracking-[0.2em] text-(--t-muted) uppercase">
            Skin & Wellness
          </p>
          <h1 id="se-title" data-se-title className="mt-5 max-w-[13ch] text-[clamp(3rem,1.4rem+6.4vw,8.5rem)] leading-[0.98]">
            Làn da cũng cần <em>được thở.</em>
          </h1>
          <div className="mt-10 flex flex-wrap items-end justify-between gap-8">
            <p data-se-fade className="max-w-[30rem] text-lg leading-relaxed text-(--t-muted)">
              Không gian chăm sóc da và thư giãn, nơi mỗi liệu trình bắt đầu bằng việc lắng nghe. Rê chuột để xua làn sương.
            </p>
            <div data-se-fade className="flex flex-wrap gap-3">
              <a href="#dat-lich" className="se-pill bg-(--t-fg) text-(--t-surface)">
                Đặt lịch hẹn
              </a>
              <a href="#tho" className="se-pill border border-(--t-line) bg-(--t-surface)/60 backdrop-blur">
                Thở cùng chúng tôi
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* TUYÊN NGÔN */}
      <section aria-label="Triết lý" className="container-page py-32 lg:py-44">
        <p data-se-rise className="mx-auto max-w-[26ch] text-center font-(family-name:--t-font-display) text-[clamp(1.9rem,1.2rem+2.6vw,3.8rem)] leading-[1.18]">
          Chúng tôi không vội. Mỗi liệu trình bắt đầu bằng việc <MarkerHighlight>lắng nghe làn da</MarkerHighlight> và kết thúc khi bạn{" "}
          <MarkerHighlight delay={0.3}>thật sự thả lỏng.</MarkerHighlight>
        </p>
      </section>

      {/* BÀI THỞ */}
      <section id="tho" aria-labelledby="se-tho" className="bg-(--t-mist) py-28 lg:py-36">
        <div className="container-page">
          <Breath />
        </div>
      </section>

      {/* LIỆU TRÌNH */}
      <section id="lieu-trinh" aria-labelledby="se-lieu-trinh" className="container-page py-28 lg:py-40">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <h2 id="se-lieu-trinh" className="text-[clamp(2.4rem,1.5rem+3vw,4.6rem)] leading-[1.02]">
            Bốn liệu trình, <em>một nhịp chậm.</em>
          </h2>
          <p className="text-sm text-(--t-muted)">Giá minh họa · thương hiệu giả định</p>
        </div>
        <StackCards
          top="14vh"
          step="1.5rem"
          cardClassName="pb-6"
          items={treatments.map((t, i) => {
            const im = img(t.n);
            return (
              <article key={t.n} className="se-card grid gap-8 p-5 md:grid-cols-12 md:items-center md:p-8">
                <div className="se-arch aspect-[4/5] md:col-span-4 md:max-h-[60vh]">
                  <Image src={im.src} width={im.width} height={im.height} alt="" sizes="(min-width: 768px) 30vw, 100vw" className="size-full object-cover" />
                </div>
                <div className="md:col-span-7 md:col-start-6">
                  <p className="text-sm text-(--t-muted)">
                    {String(i + 1).padStart(2, "0")} · {t.time}
                  </p>
                  <h3 className="mt-3 text-[clamp(2rem,1.4rem+2vw,3.4rem)] leading-[1.05]">{t.name}</h3>
                  <p className="mt-5 max-w-[32rem] text-lg leading-relaxed text-(--t-muted)">{t.for}</p>
                  <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-(--t-line) pt-5">
                    <span className="font-(family-name:--t-font-display) text-2xl">{t.price}</span>
                    <a href="#dat-lich" className="se-pill bg-(--t-fg) text-sm text-(--t-surface)">
                      Đặt liệu trình này
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        />
      </section>

      {/* QUY TRÌNH */}
      <section id="quy-trinh" aria-labelledby="se-quy-trinh" className="border-t border-(--t-line) py-28 lg:py-36">
        <div className="container-page">
          <h2 id="se-quy-trinh" className="text-[clamp(2.4rem,1.5rem+3vw,4.6rem)] leading-[1.02]">
            Bốn bước, <em>không bước nào thừa.</em>
          </h2>
          <div className="relative mt-16">
            <svg aria-hidden viewBox="0 0 1200 200" preserveAspectRatio="none" className="absolute inset-x-0 top-6 hidden h-40 w-full md:block">
              <path data-se-path d="M40 60 C 220 180, 360 -40, 520 80 S 820 170, 900 60 S 1120 -10, 1170 90" style={{ fill: "none", stroke: "var(--t-accent)", strokeWidth: 1.5 }} />
            </svg>
            <ol className="relative grid gap-10 md:grid-cols-4">
              {steps.map((s, i) => (
                <li key={s.t} data-se-rise className={i % 2 === 1 ? "md:mt-28" : ""}>
                  <span className="grid size-14 place-items-center rounded-full border border-(--t-line) bg-(--t-surface) font-(family-name:--t-font-display) text-xl">{i + 1}</span>
                  <h3 className="mt-5 text-3xl">{s.t}</h3>
                  <p className="mt-3 max-w-[16rem] leading-relaxed text-(--t-muted)">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* KHÔNG GIAN */}
      <section id="khong-gian" aria-labelledby="se-khong-gian" className="bg-(--t-mist) py-28 lg:py-36">
        <div className="container-page flex items-end justify-between">
          <h2 id="se-khong-gian" className="text-[clamp(2.4rem,1.5rem+3vw,4.6rem)] leading-[1.02]">
            Không gian <em>của riêng bạn.</em>
          </h2>
          <p className="hidden text-sm text-(--t-muted) md:block">Kéo để xem ↔</p>
        </div>
        <DragSlider label="Không gian SƯƠNG" className="mt-14" trackClassName="gap-6 px-(--gutter)">
          {["tub", "lounge", "arch", "robes", "pool", "room-2"].map((n, i) => {
            const im = img(n);
            return (
              <figure key={n} className={i % 2 ? "mt-16 w-[min(70vw,22rem)] shrink-0" : "w-[min(70vw,22rem)] shrink-0"}>
                <div className="se-arch aspect-[3/4]">
                  <Image src={im.src} width={im.width} height={im.height} alt="" sizes="22rem" draggable={false} className="size-full object-cover" />
                </div>
              </figure>
            );
          })}
        </DragSlider>
      </section>

      {/* HỎI ĐÁP */}
      <section id="hoi-dap" aria-labelledby="se-hoi-dap" className="container-page grid gap-12 py-28 lg:grid-cols-12 lg:py-36">
        <h2 id="se-hoi-dap" className="text-[clamp(2.4rem,1.5rem+3vw,4.6rem)] leading-[1.02] lg:col-span-4">
          Bạn có thể <em>hỏi.</em>
        </h2>
        <div className="divide-y divide-(--t-line) border-y border-(--t-line) lg:col-span-7 lg:col-start-6">
          {faqs.map(([q, a]) => (
            <details key={q} className="group py-6">
              <summary className="flex items-center justify-between gap-6 text-xl">
                {q}
                <span aria-hidden className="se-plus grid size-9 shrink-0 place-items-center rounded-full border border-(--t-line)">
                  +
                </span>
              </summary>
              <p className="mt-4 max-w-[34rem] leading-relaxed text-(--t-muted)">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ĐẶT LỊCH */}
      <section id="dat-lich" aria-labelledby="se-dat-lich" className="bg-(--t-mist) py-28 lg:py-36">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="se-dat-lich" className="text-[clamp(2.4rem,1.5rem+3vw,4.6rem)] leading-[1.02]">
              Hẹn một <em>buổi chậm.</em>
            </h2>
            <p className="mt-6 leading-relaxed text-(--t-muted)">Bốn bước, chưa tới một phút. Khung giờ đã kín được gạch đi.</p>
          </div>
          <div className="lg:col-span-8">
            <Booking />
          </div>
        </div>
      </section>
    </div>
  );
}
