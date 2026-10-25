"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import { CursorPreview } from "@/components/fx/CursorPreview";
import { ImageDistortLayer } from "@/components/fx/ImageDistortLayer";
import { TextScramble } from "@/components/fx/TextScramble";
import { VelocityMarquee } from "@/components/fx/VelocityMarquee";
import { Magnetic } from "@/components/motion/Magnetic";
import { cn } from "@/lib/cn";
import { gsap, MQ, useGSAP } from "@/lib/motion";
import { tplImage } from "@/templates/_kit/images";
import "@/templates/broadcast/broadcast.css";

const img = (name: string) => tplImage("broadcast", name);

/** Mỗi dòng tuyên ngôn: [từ, wdth bắt đầu] — các từ giãn/co ngược nhau khi cuộn */
const manifesto: [string, number][][] = [
  [
    ["Không", 62],
    ["làm", 125],
    ["nội", 80],
    ["dung", 110],
  ],
  [
    ["cho", 125],
    ["có.", 62],
    ["Làm", 100],
    ["để", 70],
  ],
  [
    ["người", 70],
    ["ta", 125],
    ["dừng", 85],
  ],
  [
    ["lướt.", 125],
    ["▶", 62],
  ],
];

const works = [
  { name: "MÙA GIÓ LIVE", type: "Sự kiện trực tiếp", year: "2027", img: "concert" },
  { name: "CHIẾN DỊCH MẶT NẠ", type: "Quảng cáo", year: "2027", img: "campaign" },
  { name: "ÁNH ĐÈN", type: "Phim tài liệu", year: "2026", img: "documentary" },
  { name: "KHUÔN CHỮ", type: "Nhận diện", year: "2026", img: "type" },
  { name: "SÂN KHẤU MỞ", type: "Phát trực tiếp", year: "2026", img: "livestream" },
  { name: "KIM LOẠI", type: "Chụp sản phẩm", year: "2025", img: "product" },
  { name: "VŨ ĐIỆU LỬA", type: "MV ca nhạc", year: "2025", img: "mv" },
];

const services = [
  { name: "Chiến dịch", text: "Từ ý tưởng lớn tới từng bài đăng: một câu chuyện nhất quán trên mọi kênh.", tags: ["Ý tưởng", "Kịch bản", "Kế hoạch kênh"] },
  { name: "Phim & video", text: "TVC, phim ngắn, video mạng xã hội; tự quay, tự dựng, tự chỉnh màu.", tags: ["Quay phim", "Dựng", "Âm thanh"] },
  { name: "Sự kiện trực tiếp", text: "Sân khấu, ánh sáng, livestream đa nền tảng với đội kỹ thuật riêng.", tags: ["Sân khấu", "Livestream", "Kỹ thuật"] },
  { name: "Mạng xã hội", text: "Nội dung hằng tuần, đo lường mỗi tháng, điều chỉnh theo dữ liệu.", tags: ["Lịch nội dung", "Quản lý kênh", "Báo cáo"] },
  { name: "Nhận diện", text: "Logo, typography, chuyển động thương hiệu để nội dung nhận ra được ngay.", tags: ["Logo", "Bộ chữ", "Motion"] },
];

const reelFrames = ["reel", "camera", "band", "rig", "compass", "files"];

function Timecode() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const start = performance.now();
    const id = window.setInterval(() => {
      const t = (performance.now() - start) / 1000;
      const f = Math.floor((t % 1) * 25);
      const s = Math.floor(t) % 60;
      const m = Math.floor(t / 60) % 60;
      const h = Math.floor(t / 3600);
      if (ref.current) ref.current.textContent = [h, m, s, f].map((n) => String(n).padStart(2, "0")).join(":");
    }, 40);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span ref={ref} aria-hidden className="tabular-nums">
      00:00:00:00
    </span>
  );
}

export function Broadcast() {
  const root = useRef<HTMLDivElement>(null);
  const reelRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<number | null>(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.anyMotion, () => {
        gsap.from("[data-bc-line]", { yPercent: 110, opacity: 0, duration: 0.9, ease: "power4.out", stagger: 0.09, delay: 0.15 });
        gsap.from("[data-bc-fade]", { opacity: 0, duration: 0.6, stagger: 0.05, delay: 0.7 });
        // Mỗi từ đảo trục wdth theo cuộn (hẹp ↔ rộng)
        gsap.utils.toArray<HTMLElement>("[data-bc-word]").forEach((el) => {
          const w = Number(el.dataset.w);
          gsap.fromTo(el, { "--w": w }, { "--w": 187 - w, ease: "none", scrollTrigger: { trigger: "[data-bc-hero]", start: "top top", end: "bottom top", scrub: 1 } });
        });
        gsap.utils.toArray<HTMLElement>("[data-bc-cut]").forEach((el) => {
          gsap.from(el, { clipPath: "inset(0 0 100% 0)", duration: 0.8, ease: "power4.inOut", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const reel = img("reel");

  return (
    <div ref={root} className="tpl tpl-broadcast">
      <ImageDistortLayer />
      <header className="fixed inset-x-0 top-0 z-40 border-b border-(--t-line) bg-(--t-bg)/90 backdrop-blur">
        <div className="container-page flex h-14 items-center justify-between gap-6">
          <a href="#dau-trang" className="flex items-baseline gap-3 text-lg font-black tracking-tight">
            TẦN SỐ <span className="bc-mono text-(--t-muted)">CH—07</span>
          </a>
          <p className="bc-mono hidden items-center gap-3 md:flex">
            <span className="bc-rec text-(--t-accent)" aria-hidden>
              ●
            </span>
            <span className="text-(--t-accent)">REC</span>
            <Timecode />
            <span className="sr-only">Đang phát (hiệu ứng trang trí)</span>
          </p>
          <nav aria-label="Điều hướng Tần Số">
            <ul className="bc-mono flex gap-5 md:gap-7">
              {[
                ["Dự án", "#lich-phat"],
                ["Dịch vụ", "#dich-vu"],
                ["Liên hệ", "#bat-kenh"],
              ].map(([l, h]) => (
                <li key={h}>
                  <a href={h} className="hover:text-(--t-accent)">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {/* TUYÊN NGÔN */}
      <section id="dau-trang" data-bc-hero aria-labelledby="bc-title" className="overflow-hidden px-(--gutter) pt-24 pb-10">
        <div className="bc-mono flex justify-between border-b border-(--t-line) pb-3" data-bc-fade>
          <span>[ Đang phát ] Studio nội dung & truyền thông</span>
          <span className="hidden sm:inline">Tuyên ngôn · 00:01</span>
        </div>
        <h1 id="bc-title" className="mt-6 text-[7.1vw] sm:text-[clamp(2.2rem,8.2vw,11.5rem)]" aria-label="Không làm nội dung cho có. Làm để người ta dừng lướt.">
          {manifesto.map((line, i) => (
            <span key={i} aria-hidden className="block overflow-hidden pb-[0.04em]">
              <span data-bc-line className="bc-line">
                {line.map(([word, w]) => (
                  <span key={word} data-bc-word data-w={w} className={word === "▶" ? "text-(--t-accent)" : undefined} style={{ "--w": w } as CSSProperties}>
                    {word}
                  </span>
                ))}
              </span>
            </span>
          ))}
        </h1>
        <ul data-bc-fade className="bc-mono mt-8 grid grid-cols-2 gap-px border-t border-(--t-line) pt-4 text-(--t-muted) sm:grid-cols-3 lg:grid-cols-6">
          {["Chiến dịch", "Phim ngắn", "Sự kiện trực tiếp", "Mạng xã hội", "Nhận diện", "Podcast"].map((k, i) => (
            <li key={k}>
              <span className="text-(--t-accent)">{String(i + 1).padStart(2, "0")}</span> {k}
            </li>
          ))}
        </ul>
      </section>

      {/* SHOWREEL */}
      <section aria-labelledby="bc-reel" className="px-(--gutter) pb-24">
        <h2 id="bc-reel" className="sr-only">
          Showreel
        </h2>
        <button
          type="button"
          onClick={() => reelRef.current?.showModal()}
          data-cursor="view"
          data-cursor-label="Phát ▶"
          className="group relative block w-full overflow-hidden bg-(--t-dark) text-left text-(--t-paper)"
          aria-haspopup="dialog"
        >
          <div data-distort={reel.src} className="aspect-[16/9] max-h-[85svh] w-full">
            <Image src={reel.src} width={reel.width} height={reel.height} alt="" sizes="100vw" className="size-full object-cover opacity-90 transition-opacity group-hover:opacity-100" />
          </div>
          <div aria-hidden className="bc-scan pointer-events-none absolute inset-0" />
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-5 md:p-8">
            <div className="bc-mono flex justify-between">
              <span>Showreel 2027</span>
              <span>01:32 · 25FPS</span>
            </div>
            <div className="flex items-end justify-between gap-6">
              <span className="text-[clamp(2.4rem,1rem+6vw,8rem)] leading-[0.9] font-black tracking-tight uppercase" style={{ fontVariationSettings: '"wdth" 62' }}>
                Xem showreel
              </span>
              <span className="grid size-16 shrink-0 place-items-center rounded-full bg-(--t-accent) text-xl text-(--t-dark) md:size-24">▶</span>
            </div>
          </div>
        </button>
        <dialog ref={reelRef} aria-labelledby="bc-reel-title" className="m-auto w-[min(92vw,72rem)] bg-(--t-dark) p-5 text-(--t-paper) md:p-8">
          <div className="flex items-center justify-between">
            <h3 id="bc-reel-title" className="bc-mono">
              Showreel 2027 · khung hình chọn lọc (mẫu demo, không có video thật)
            </h3>
            <form method="dialog">
              <button className="bc-mono text-(--t-accent)">Đóng ✕</button>
            </form>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-3">
            {reelFrames.map((n, i) => {
              const im = img(n);
              return (
                <li key={n} className="relative">
                  <Image src={im.src} width={im.width} height={im.height} alt="" sizes="30vw" className="aspect-video w-full object-cover" />
                  <span className="bc-mono absolute top-2 left-2 bg-(--t-dark)/70 px-1.5 py-0.5">00:00:{String(i * 13 + 4).padStart(2, "0")}:00</span>
                </li>
              );
            })}
          </ul>
        </dialog>
      </section>

      {/* LỊCH PHÁT */}
      <section id="lich-phat" aria-labelledby="bc-lich" className="pb-28">
        <div className="container-page flex items-end justify-between border-b-2 border-(--t-fg) pb-4">
          <h2 id="bc-lich" className="text-[clamp(2.4rem,1.2rem+5vw,6.5rem)] leading-none font-black tracking-tight uppercase" style={{ fontVariationSettings: '"wdth" 62' }}>
            Lịch phát
          </h2>
          <span className="bc-mono text-(--t-muted)">{works.length} dự án · giả định</span>
        </div>
        <CursorPreview ratio="4 / 3" size="clamp(16rem, 24vw, 24rem)">
          <ol>
            {works.map((w, i) => {
              const im = img(w.img);
              return (
                <li key={w.name} className="border-b border-(--t-line)">
                  <a href="#bat-kenh" data-preview={im.src} className="bc-row grid grid-cols-[3rem_1fr_auto] items-center gap-4 px-(--gutter) py-5 md:grid-cols-12 md:py-7">
                    <span className="bc-mono md:col-span-1">CH{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[clamp(1.6rem,0.9rem+3vw,4.2rem)] leading-none font-black tracking-tight md:col-span-6">
                      <TextScramble text={w.name} />
                    </span>
                    <span className="bc-mono hidden md:col-span-3 md:block">{w.type}</span>
                    <span className="bc-mono md:col-span-2 md:text-right">
                      {w.year} <span aria-hidden>↗</span>
                    </span>
                    <Image src={im.src} width={im.width} height={im.height} alt="" sizes="100vw" className="col-span-3 aspect-[16/9] w-full object-cover md:hidden" />
                  </a>
                </li>
              );
            })}
          </ol>
        </CursorPreview>
      </section>

      {/* DỊCH VỤ */}
      <section id="dich-vu" aria-labelledby="bc-dich-vu" className="bg-(--t-dark) py-24 text-(--t-paper) lg:py-32">
        <div className="container-page">
          <h2 id="bc-dich-vu" className="bc-mono text-(--t-accent)">
            [ Dịch vụ ] Bấm để mở
          </h2>
          <ul className="mt-10 border-t border-(--t-paper)/20">
            {services.map((s, i) => {
              const isOpen = open === i;
              return (
                <li key={s.name} data-open={isOpen} className="bc-service border-b border-(--t-paper)/20">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`bc-sv-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-baseline justify-between gap-6 py-5 text-left md:py-6"
                    >
                      <span className="bc-service-name text-[clamp(2rem,1rem+5vw,6.5rem)] leading-[0.95] font-black uppercase">{s.name}</span>
                      <span aria-hidden className={cn("bc-mono transition-transform duration-500", isOpen && "rotate-45 text-(--t-accent)")}>
                        +
                      </span>
                    </button>
                  </h3>
                  <div id={`bc-sv-${i}`} hidden={!isOpen} className="grid gap-6 pb-8 md:grid-cols-12">
                    <p className="max-w-[34rem] text-lg leading-relaxed text-(--t-paper)/75 md:col-span-6">{s.text}</p>
                    <ul className="flex flex-wrap gap-2 md:col-span-6 md:justify-end">
                      {s.tags.map((t) => (
                        <li key={t} className="bc-mono border border-(--t-paper)/30 px-3 py-2">
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <div aria-hidden className="space-y-2 border-b border-(--t-line) py-8">
        <VelocityMarquee speed={1.1}>
          {["TVC", "PHIM NGẮN", "LIVESTREAM", "PODCAST", "MV", "SOCIAL"].map((t) => (
            <span key={t} className="flex items-center text-[clamp(2.4rem,1rem+4vw,5.5rem)] font-black uppercase" style={{ fontVariationSettings: '"wdth" 62' }}>
              {t}
              <span className="mx-6 text-(--t-accent)">●</span>
            </span>
          ))}
        </VelocityMarquee>
        <VelocityMarquee speed={1.1} reverse>
          {["Thương hiệu tiêu dùng", "Giáo dục", "Âm nhạc", "Công nghệ", "F&B", "Thời trang"].map((t) => (
            <span key={t} className="flex items-center text-[clamp(2.4rem,1rem+4vw,5.5rem)] font-black text-transparent uppercase [-webkit-text-stroke:1.5px_var(--t-fg)]" style={{ fontVariationSettings: '"wdth" 125' }}>
              {t}
              <span className="mx-6 text-(--t-accent) [-webkit-text-stroke:0]">●</span>
            </span>
          ))}
        </VelocityMarquee>
      </div>

      {/* QUY TRÌNH */}
      <section aria-labelledby="bc-quy-trinh" className="container-page py-24 lg:py-32">
        <h2 id="bc-quy-trinh" className="bc-mono text-(--t-muted)">
          [ Quy trình ] Thời lượng minh họa
        </h2>
        <ol className="mt-10 grid border-l border-(--t-line) md:grid-cols-4">
          {[
            ["Nghe", "1 tuần", "Hiểu thương hiệu, khán giả và điều cần nói."],
            ["Viết", "1–2 tuần", "Ý tưởng, kịch bản, kế hoạch quay và kênh."],
            ["Làm", "2–4 tuần", "Quay, dựng, thiết kế, duyệt theo từng mốc."],
            ["Phát", "liên tục", "Lên sóng, đo lường, tối ưu theo dữ liệu."],
          ].map(([t, d, x], i) => (
            <li key={t} data-bc-cut className="border-r border-b border-(--t-line) p-6 md:border-b-0">
              <span className="bc-mono text-(--t-accent)">0{i + 1} · {d}</span>
              <h3 className="mt-6 text-5xl font-black uppercase" style={{ fontVariationSettings: '"wdth" 62' }}>
                {t}
              </h3>
              <p className="mt-4 leading-relaxed text-(--t-muted)">{x}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section id="bat-kenh" aria-labelledby="bc-cta" className="bg-(--t-dark) px-(--gutter) py-24 text-(--t-paper) lg:py-36">
        <p className="bc-mono text-(--t-accent)">[ Kết thúc chương trình ]</p>
        <h2 id="bc-cta" className="mt-6 text-[clamp(3rem,1rem+10vw,14rem)] leading-[0.88] font-black uppercase" style={{ fontVariationSettings: '"wdth" 62' }}>
          Bật kênh
          <br />
          của <span className="text-(--t-accent)">bạn.</span>
        </h2>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-8">
          <p className="max-w-[28rem] text-lg leading-relaxed text-(--t-paper)/70">Kể cho chúng tôi nghe về thương hiệu của bạn. Buổi gặp đầu tiên chỉ để nghe.</p>
          <Magnetic>
            <a href="#demo-ket" className="grid size-36 place-items-center rounded-full bg-(--t-accent) text-center font-black text-(--t-dark) uppercase md:size-44">
              Lên sóng
              <br />↗
            </a>
          </Magnetic>
        </div>
      </section>
    </div>
  );
}
