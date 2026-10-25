"use client";

import Image from "next/image";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { DragSlider } from "@/components/fx/DragSlider";
import { ImageDistortLayer } from "@/components/fx/ImageDistortLayer";
import { StackCards } from "@/components/fx/StackCards";
import { gsap, MQ, SplitText, useGSAP } from "@/lib/motion";
import { tplImage } from "@/templates/_kit/images";
import "@/templates/voyage/voyage.css";

gsap.registerPlugin(MotionPathPlugin);

const img = (name: string) => tplImage("voyage", name);

/** Phép chiếu đơn giản (equirectangular) lên khung 1000 × 500 */
const project = (lon: number, lat: number) => ({ x: ((lon + 180) / 360) * 1000, y: ((90 - lat) / 180) * 500 });
const HAN = project(105.8, 21);

const destinations = [
  { code: "SYD", city: "Sydney", country: "Úc", img: "sydney", lon: 151.2, lat: -33.9, fee: "25.000–45.000 AUD", visa: "4–8 tuần", dx: 14, dy: 22 },
  { code: "YYZ", city: "Toronto", country: "Canada", img: "toronto", lon: -79.4, lat: 43.7, fee: "20.000–40.000 CAD", visa: "6–12 tuần", dx: -70, dy: -14 },
  { code: "LHR", city: "London", country: "Anh", img: "london", lon: -0.1, lat: 51.5, fee: "15.000–30.000 GBP", visa: "3–6 tuần", dx: -70, dy: 0 },
  { code: "JFK", city: "New York", country: "Mỹ", img: "newyork", lon: -74, lat: 40.7, fee: "30.000–55.000 USD", visa: "4–10 tuần", dx: -14, dy: 26 },
  { code: "AMS", city: "Amsterdam", country: "Hà Lan", img: "amsterdam", lon: 4.9, lat: 52.4, fee: "9.000–20.000 EUR", visa: "4–8 tuần", dx: 14, dy: -14 },
  { code: "HND", city: "Tokyo", country: "Nhật Bản", img: "tokyo", lon: 139.7, lat: 35.7, fee: "800.000–1.500.000 JPY", visa: "2–6 tuần", dx: 14, dy: -12 },
];

const routes = destinations.map((d) => {
  const p = project(d.lon, d.lat);
  const mx = (HAN.x + p.x) / 2;
  const dist = Math.hypot(p.x - HAN.x, p.y - HAN.y);
  const my = Math.min(HAN.y, p.y) - dist * 0.28;
  return { ...d, p, d: `M${HAN.x.toFixed(1)} ${HAN.y.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}` };
});

const legs = [
  { n: "01", title: "Định hướng", time: "1–2 tuần", text: "Nói chuyện về mục tiêu, năng lực và tài chính để chọn quốc gia, ngành học phù hợp.", need: "Bảng điểm, chứng chỉ ngoại ngữ (nếu có)" },
  { n: "02", title: "Chọn trường", time: "2–4 tuần", text: "Lập danh sách trường theo ba mức: an toàn, phù hợp, thử thách; so sánh học phí và học bổng.", need: "Danh sách nguyện vọng, ngân sách dự kiến" },
  { n: "03", title: "Hồ sơ", time: "4–8 tuần", text: "Viết bài luận, xin thư giới thiệu, dịch thuật và nộp hồ sơ đúng hạn từng trường.", need: "Bài luận, thư giới thiệu, hồ sơ dịch thuật" },
  { n: "04", title: "Visa", time: "3–12 tuần", text: "Chuẩn bị chứng minh tài chính, luyện phỏng vấn và nộp hồ sơ visa du học.", need: "Thư mời nhập học, chứng minh tài chính" },
  { n: "05", title: "Lên đường", time: "2 tuần", text: "Vé máy bay, chỗ ở, bảo hiểm và buổi định hướng trước khi bay cùng các bạn cùng kỳ.", need: "Vé, xác nhận chỗ ở, bảo hiểm" },
];

const docs = ["Hộ chiếu còn hạn trên 6 tháng", "Bảng điểm 3 năm gần nhất", "Chứng chỉ ngoại ngữ", "Bài luận cá nhân", "Hai thư giới thiệu", "Chứng minh tài chính", "Ảnh thẻ nền trắng", "Giấy khám sức khỏe"];

const DEADLINE = new Date("2027-01-15T23:59:00+07:00").getTime();
const STORE_KEY = "voyage-demo-checklist";

function Countdown() {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, DEADLINE - Date.now()));
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);
  const parts = left === null ? null : [Math.floor(left / 864e5), Math.floor(left / 36e5) % 24, Math.floor(left / 6e4) % 60, Math.floor(left / 1e3) % 60];
  return (
    <div className="grid grid-cols-4 gap-3 md:gap-6">
      {["Ngày", "Giờ", "Phút", "Giây"].map((label, i) => (
        <div key={label} className="border-t border-(--t-bg)/25 pt-4">
          <span className="block font-(family-name:--t-font-display) text-[clamp(3rem,1.6rem+5vw,8rem)] leading-none tabular-nums">{parts ? String(parts[i]).padStart(2, "0") : "––"}</span>
          <span className="vy-mono mt-2 block opacity-60">{label}</span>
        </div>
      ))}
    </div>
  );
}

function Checklist() {
  const [checked, setChecked] = useState<boolean[]>(() => docs.map(() => false));
  const stampRef = useRef<HTMLDivElement>(null);
  const done = checked.filter(Boolean).length;
  const all = done === docs.length;

  // Khôi phục từ localStorage (bọc try/catch: trình duyệt có thể chặn)
  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        const saved = JSON.parse(window.localStorage.getItem(STORE_KEY) ?? "null");
        if (Array.isArray(saved) && saved.length === docs.length) setChecked(saved.map(Boolean));
      } catch {
        /* bỏ qua */
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  const toggle = (i: number) => {
    const next = checked.map((v, k) => (k === i ? !v : v));
    setChecked(next);
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(next));
    } catch {
      /* bỏ qua */
    }
    if (next.every(Boolean) && stampRef.current && window.matchMedia(MQ.anyMotion).matches) {
      gsap.fromTo(stampRef.current, { scale: 2.2, rotate: -40, opacity: 0 }, { scale: 1, rotate: -12, opacity: 1, duration: 0.55, ease: "back.out(2.4)" });
    }
  };

  return (
    <div className="vy-pass relative overflow-hidden p-6 md:p-10">
      <div className="flex items-center justify-between gap-6">
        <p className="vy-mono text-(--t-muted)">Hồ sơ · {done}/{docs.length}</p>
        <p className="vy-mono text-(--t-muted)">Lưu trên trình duyệt của bạn</p>
      </div>
      <div aria-hidden className="relative mt-5 h-6">
        <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-(--t-line)" />
        <div className="absolute top-1/2 h-px bg-(--t-accent) transition-[width] duration-700" style={{ width: `${(done / docs.length) * 100}%` }} />
        <svg viewBox="0 0 24 24" className="absolute top-0 size-6 -translate-x-1/2 transition-[left] duration-700" style={{ left: `${(done / docs.length) * 100}%`, fill: "var(--t-accent)" }}>
          <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" transform="rotate(90 12 12)" />
        </svg>
      </div>
      <ul className="mt-6 grid gap-x-10 sm:grid-cols-2">
        {docs.map((d, i) => (
          <li key={d}>
            <label className="vy-check flex cursor-pointer items-center gap-4 border-b border-(--t-line) py-4">
              <input type="checkbox" checked={checked[i]} onChange={() => toggle(i)} className="sr-only" />
              <span aria-hidden className="vy-box grid size-6 shrink-0 place-items-center rounded-md border border-(--t-line) text-sm transition-colors">
                {checked[i] ? "✓" : ""}
              </span>
              <span className="vy-label transition-colors">{d}</span>
            </label>
          </li>
        ))}
      </ul>
      <div aria-live="polite" className="mt-6 min-h-6 text-(--t-muted)">
        {all ? "Đủ hồ sơ! Bước tiếp theo: đặt lịch để chuyên viên kiểm tra lại." : `Còn ${docs.length - done} giấy tờ.`}
      </div>
      <div ref={stampRef} aria-hidden className={`vy-stamp pointer-events-none absolute right-6 bottom-6 grid size-32 place-items-center text-center text-sm font-medium md:right-10 md:size-40 ${all ? "opacity-100" : "opacity-0"}`} style={{ rotate: "-12deg" }}>
        SẴN SÀNG
        <br />
        BAY
      </div>
    </div>
  );
}

function Consult() {
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState("");
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    if (name.length < 2) return setError("Vui lòng nhập họ tên.");
    setError("");
    setSent(`${name} · ${data.get("country")} · ${data.get("level")} · ${data.get("when")}`);
  };
  if (sent) {
    return (
      <div className="vy-pass p-8 md:p-12" aria-live="polite">
        <p className="vy-mono text-(--t-accent)">Đã giữ lịch (minh họa)</p>
        <p className="mt-4 font-(family-name:--t-font-display) text-4xl">Hẹn gặp bạn ở buổi tư vấn đầu tiên.</p>
        <p className="mt-4 text-(--t-muted)">{sent}</p>
        <p className="mt-6 text-sm text-(--t-muted)">Mẫu demo: không có dữ liệu nào được gửi đi.</p>
        <button type="button" onClick={() => setSent(null)} className="vy-mono mt-6 underline underline-offset-4">
          Sửa thông tin
        </button>
      </div>
    );
  }
  return (
    <form onSubmit={submit} noValidate className="vy-pass grid gap-6 p-8 md:grid-cols-2 md:p-12">
      <label className="grid gap-1 md:col-span-2">
        <span className="vy-mono text-(--t-muted)">Họ tên học sinh / phụ huynh</span>
        <input name="name" autoComplete="name" className="vy-field text-xl" />
      </label>
      <label className="grid gap-1">
        <span className="vy-mono text-(--t-muted)">Quốc gia quan tâm</span>
        <select name="country" className="vy-field text-lg">
          {destinations.map((d) => (
            <option key={d.code}>{d.country}</option>
          ))}
          <option>Chưa chắc chắn</option>
        </select>
      </label>
      <label className="grid gap-1">
        <span className="vy-mono text-(--t-muted)">Bậc học</span>
        <select name="level" className="vy-field text-lg">
          <option>Trung học</option>
          <option>Dự bị đại học</option>
          <option>Đại học</option>
          <option>Thạc sĩ</option>
        </select>
      </label>
      <label className="grid gap-1 md:col-span-2">
        <span className="vy-mono text-(--t-muted)">Dự kiến nhập học</span>
        <select name="when" className="vy-field text-lg">
          <option>Trong năm nay</option>
          <option>Năm sau</option>
          <option>Sau hai năm nữa</option>
        </select>
      </label>
      <p role="alert" className="min-h-6 text-(--t-accent) md:col-span-2">
        {error}
      </p>
      <div className="flex flex-wrap items-center gap-5 md:col-span-2">
        <button type="submit" className="vy-mono rounded-full bg-(--t-fg) px-7 py-4 text-(--t-bg) transition-colors hover:bg-(--t-accent)">
          Đặt lịch tư vấn →
        </button>
        <span className="text-sm text-(--t-muted)">Mẫu demo: xử lý trong trình duyệt, không gửi dữ liệu.</span>
      </div>
    </form>
  );
}

export function Voyage() {
  const root = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLSpanElement>(null);

  // Mã điểm đến trên thẻ lên máy bay đổi vòng
  useEffect(() => {
    let i = 0;
    const id = window.setInterval(() => {
      i = (i + 1) % destinations.length;
      const el = codeRef.current;
      if (!el) return;
      if (window.matchMedia(MQ.reduced).matches) {
        el.textContent = destinations[i].code;
        return;
      }
      gsap.to(el, {
        yPercent: -100,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          el.textContent = destinations[i].code;
          gsap.fromTo(el, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: "power3.out" });
        },
      });
    }, 2200);
    return () => window.clearInterval(id);
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.anyMotion, () => {
        const title = root.current?.querySelector<HTMLElement>("[data-vy-title]");
        if (title) {
          SplitText.create(title, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) => gsap.from(self.lines, { yPercent: 110, duration: 1.5, ease: "power3.out", stagger: 0.12, delay: 0.2 }),
          });
        }
        gsap.from("[data-vy-pass]", { y: 80, rotate: 6, opacity: 0, duration: 1.4, ease: "expo.out", delay: 0.6 });
        gsap.from("[data-vy-fade]", { opacity: 0, y: 16, duration: 1.2, ease: "power3.out", stagger: 0.1, delay: 0.8 });
        // Kim la bàn xoay theo cuộn
        gsap.to("[data-vy-needle]", { rotate: 720, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 1 } });

        // Đường bay: vẽ lần lượt từng tuyến, máy bay chạy theo
        const pinned = window.matchMedia(MQ.desktopMotion).matches;
        const tl = gsap.timeline({
          scrollTrigger: pinned
            ? { trigger: "[data-vy-map]", start: "top top", end: "+=220%", scrub: 1, pin: true }
            : { trigger: "[data-vy-map]", start: "top 70%", end: "bottom 30%", scrub: 1 },
        });
        gsap.utils.toArray<SVGPathElement>("[data-vy-route]").forEach((path, i) => {
          const len = path.getTotalLength();
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
          tl.to(path, { strokeDashoffset: 0, ease: "none", duration: 1 }, i)
            .to("[data-vy-plane]", { motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: true }, ease: "none", duration: 1, immediateRender: false }, i)
            .fromTo(`[data-vy-city="${i}"]`, { opacity: 0.25 }, { opacity: 1, duration: 0.2 }, i + 0.85)
            .fromTo(`[data-vy-list="${i}"]`, { opacity: 0.3 }, { opacity: 1, duration: 0.2 }, i + 0.85);
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const sky = img("sky");

  return (
    <div ref={root} className="tpl tpl-voyage">
      <ImageDistortLayer />
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="container-page flex h-24 items-center justify-between gap-6">
          <a href="#dau-trang" className="flex items-center gap-3 font-(family-name:--t-font-display) text-3xl">
            <svg aria-hidden viewBox="0 0 40 40" className="size-9">
              <circle cx="20" cy="20" r="18" style={{ fill: "none", stroke: "var(--t-fg)", strokeWidth: 1.2 }} />
              <g data-vy-needle style={{ transformOrigin: "20px 20px" }}>
                <path d="M20 5 L24 20 L20 35 L16 20 Z" style={{ fill: "var(--t-fg)" }} />
                <path d="M20 5 L24 20 L16 20 Z" style={{ fill: "var(--t-accent)" }} />
              </g>
            </svg>
            La Bàn
          </a>
          <nav aria-label="Điều hướng La Bàn" className="hidden lg:block">
            <ul className="vy-mono flex gap-8">
              {[
                ["Đường bay", "#duong-bay"],
                ["Điểm đến", "#diem-den"],
                ["Lộ trình", "#lo-trinh"],
                ["Hồ sơ", "#ho-so"],
              ].map(([l, h]) => (
                <li key={h}>
                  <a href={h} className="hover:text-(--t-accent)">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a href="#tu-van" className="vy-mono rounded-full border border-(--t-fg) px-5 py-3 transition-colors hover:bg-(--t-fg) hover:text-(--t-bg)">
            Đặt lịch tư vấn
          </a>
        </div>
      </header>

      {/* HERO */}
      <section id="dau-trang" aria-labelledby="vy-title" className="container-page grid min-h-[100svh] items-end gap-12 pt-32 pb-16 lg:grid-cols-12">
        <div className="lg:col-span-7 lg:pb-10">
          <p data-vy-fade className="vy-mono text-(--t-accent)">
            Tư vấn du học · từ định hướng tới ngày bay
          </p>
          <h1 id="vy-title" data-vy-title className="mt-6 text-[clamp(3.4rem,1.4rem+7vw,9.5rem)] font-light">
            Bản đồ cho <em className="italic">chương tiếp theo.</em>
          </h1>
          <p data-vy-fade className="mt-8 max-w-[32rem] text-lg leading-relaxed text-(--t-muted)">
            Bạn lo phần mơ ước. Giấy tờ, hạn nộp và những lần lo lắng trước giờ phỏng vấn visa, để chúng tôi đi cùng.
          </p>
        </div>
        <div className="relative lg:col-span-5">
          <div className="aspect-[4/5] overflow-hidden rounded-t-full">
            <Image src={sky.src} width={sky.width} height={sky.height} alt="Cánh máy bay trên biển mây lúc hoàng hôn" priority sizes="(min-width: 1024px) 40vw, 100vw" className="size-full object-cover" />
          </div>
          <div data-vy-pass className="vy-pass absolute -bottom-8 -left-4 grid w-[min(92%,26rem)] grid-cols-[1fr_auto] lg:-left-24">
            <div className="p-5">
              <p className="vy-mono text-(--t-muted)">Thẻ lên máy bay · Boarding pass</p>
              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <p className="vy-mono text-(--t-muted)">Từ</p>
                  <p className="font-(family-name:--t-font-display) text-5xl leading-none">HAN</p>
                  <p className="text-sm text-(--t-muted)">Hà Nội</p>
                </div>
                <span aria-hidden className="mb-4 text-(--t-accent)">
                  ✈
                </span>
                <div className="text-right">
                  <p className="vy-mono text-(--t-muted)">Đến</p>
                  <p className="overflow-hidden font-(family-name:--t-font-display) text-5xl leading-none text-(--t-accent)">
                    <span ref={codeRef} className="inline-block" aria-live="off">
                      SYD
                    </span>
                  </p>
                  <p className="text-sm text-(--t-muted)">Chương mới</p>
                </div>
              </div>
              <dl className="vy-mono mt-5 grid grid-cols-3 gap-2 border-t border-dashed border-(--t-line) pt-3">
                <div>
                  <dt className="text-(--t-muted)">Hành khách</dt>
                  <dd>Bạn</dd>
                </div>
                <div>
                  <dt className="text-(--t-muted)">Cổng</dt>
                  <dd>09/2027</dd>
                </div>
                <div>
                  <dt className="text-(--t-muted)">Ghế</dt>
                  <dd>Cửa sổ</dd>
                </div>
              </dl>
            </div>
            <div className="vy-perf flex w-14 items-center justify-center">
              <div aria-hidden className="vy-barcode h-[70%] w-6" />
            </div>
          </div>
        </div>
      </section>

      {/* ĐƯỜNG BAY */}
      <section id="duong-bay" data-vy-map aria-labelledby="vy-duong-bay" className="relative flex min-h-[100svh] items-center overflow-hidden bg-(--t-night) py-20 text-(--t-bg)">
        <div className="container-page grid w-full gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-3">
            <p className="vy-mono text-(--t-brass)">Đường bay</p>
            <h2 id="vy-duong-bay" className="mt-5 text-[clamp(2.2rem,1.4rem+2vw,3.4rem)] font-light text-balance">
              Sáu điểm đến, <em className="text-(--t-brass) italic">một điểm xuất phát.</em>
            </h2>
            <ol className="vy-mono mt-10 space-y-3">
              {routes.map((r, i) => (
                <li key={r.code} data-vy-list={i} className="flex justify-between border-b border-(--t-bg)/15 pb-2">
                  <span>HAN → {r.code}</span>
                  <span className="opacity-60">{r.country}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="lg:col-span-9">
            <svg viewBox="0 0 1000 500" className="w-full" role="img" aria-label="Bản đồ đường bay từ Hà Nội tới Sydney, Toronto, London, New York, Amsterdam và Tokyo">
              <defs>
                <pattern id="vy-dots" width="12" height="12" patternUnits="userSpaceOnUse">
                  <circle cx="1.5" cy="1.5" r="1" style={{ fill: "rgb(244 239 230 / 0.12)" }} />
                </pattern>
              </defs>
              <rect width="1000" height="500" style={{ fill: "url(#vy-dots)" }} />
              {Array.from({ length: 11 }, (_, i) => (
                <line key={`v${i}`} x1={(i + 1) * 83.33} y1="0" x2={(i + 1) * 83.33} y2="500" style={{ stroke: "rgb(244 239 230 / 0.08)" }} />
              ))}
              {Array.from({ length: 5 }, (_, i) => (
                <line key={`h${i}`} x1="0" y1={(i + 1) * 83.33} x2="1000" y2={(i + 1) * 83.33} style={{ stroke: i === 2 ? "rgb(176 141 87 / 0.35)" : "rgb(244 239 230 / 0.08)", strokeDasharray: i === 2 ? "4 6" : undefined }} />
              ))}
              {routes.map((r) => (
                <path key={`ghost-${r.code}`} d={r.d} style={{ fill: "none", stroke: "rgb(244 239 230 / 0.16)", strokeWidth: 1, strokeDasharray: "3 6" }} />
              ))}
              {routes.map((r) => (
                <path key={r.code} data-vy-route d={r.d} style={{ fill: "none", stroke: "var(--t-brass)", strokeWidth: 1.5 }} />
              ))}
              {routes.map((r, i) => (
                <g key={`c${r.code}`} data-vy-city={i}>
                  <circle cx={r.p.x} cy={r.p.y} r="5" style={{ fill: "var(--t-bg)" }} />
                  <text x={r.p.x + r.dx} y={r.p.y + r.dy} style={{ fill: "var(--t-bg)", fontFamily: "var(--t-font-mono)", fontSize: 13, letterSpacing: 1 }}>
                    {r.code}
                  </text>
                </g>
              ))}
              <circle cx={HAN.x} cy={HAN.y} r="7" style={{ fill: "var(--t-accent)" }} />
              <circle cx={HAN.x} cy={HAN.y} r="16" style={{ fill: "none", stroke: "var(--t-accent)", opacity: 0.5 }} />
              <text x={HAN.x + 14} y={HAN.y + 22} style={{ fill: "var(--t-accent)", fontFamily: "var(--t-font-mono)", fontSize: 13, letterSpacing: 1 }}>
                HAN
              </text>
              <g data-vy-plane transform={`translate(${HAN.x} ${HAN.y})`}>
                <path d="M-10 0 L6 -2 L10 0 L6 2 Z M-2 -1 L-6 -9 L-3 -9 L4 -1 Z M-2 1 L-6 9 L-3 9 L4 1 Z M-9 -1 L-11 -5 L-9 -5 L-6 -1 Z M-9 1 L-11 5 L-9 5 L-6 1 Z" style={{ fill: "var(--t-bg)" }} />
              </g>
            </svg>
            <p className="vy-mono mt-4 text-right opacity-50">Cuộn để bay · bản đồ minh họa</p>
          </div>
        </div>
      </section>

      {/* ĐIỂM ĐẾN */}
      <section id="diem-den" aria-labelledby="vy-diem-den" className="py-28 lg:py-40">
        <div className="container-page flex flex-wrap items-end justify-between gap-6">
          <h2 id="vy-diem-den" className="text-[clamp(2.6rem,1.6rem+3.4vw,5rem)] font-light">
            Điểm đến <em className="italic">kéo để xem.</em>
          </h2>
          <p className="vy-mono max-w-[22rem] text-(--t-muted)">Học phí và thời gian xét visa chỉ để tham khảo, thay đổi theo trường và từng năm.</p>
        </div>
        <DragSlider label="Các điểm đến du học" bend className="mt-14" trackClassName="gap-6 px-(--gutter) py-10">
          {destinations.map((d) => {
            const im = img(d.img);
            return (
              <article key={d.code} className="w-[min(78vw,22rem)] shrink-0">
                <div data-distort={im.src} className="relative aspect-[3/4] overflow-hidden rounded-t-full bg-(--t-night)">
                  <Image src={im.src} width={im.width} height={im.height} alt={`${d.city}, ${d.country}`} sizes="22rem" draggable={false} className="size-full object-cover" />
                  <span className="absolute bottom-4 left-5 font-(family-name:--t-font-display) text-6xl text-(--t-bg) drop-shadow">{d.code}</span>
                </div>
                <h3 className="mt-5 text-4xl">
                  {d.country} <span className="vy-mono text-(--t-muted)">· {d.city}</span>
                </h3>
                <dl className="vy-mono mt-4 grid gap-2 border-t border-(--t-line) pt-3 text-(--t-muted)">
                  <div className="flex justify-between gap-3">
                    <dt>Học phí/năm</dt>
                    <dd className="text-(--t-fg)">{d.fee}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Xét visa</dt>
                    <dd className="text-(--t-fg)">{d.visa}</dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </DragSlider>
      </section>

      {/* LỘ TRÌNH */}
      <section id="lo-trinh" aria-labelledby="vy-lo-trinh" className="container-page pb-28 lg:pb-40">
        <h2 id="vy-lo-trinh" className="mb-14 text-[clamp(2.6rem,1.6rem+3.4vw,5rem)] font-light">
          Năm chặng, <em className="italic">một vé.</em>
        </h2>
        <StackCards
          top="12vh"
          step="1.4rem"
          cardClassName="pb-5"
          items={legs.map((l) => (
            <article key={l.n} className="vy-pass grid md:grid-cols-[1fr_auto]">
              <div className="grid gap-6 p-7 md:grid-cols-12 md:p-10">
                <div className="md:col-span-5">
                  <p className="vy-mono text-(--t-accent)">Chặng {l.n}</p>
                  <h3 className="mt-3 text-[clamp(2.6rem,1.8rem+3vw,5rem)]">{l.title}</h3>
                </div>
                <div className="md:col-span-7">
                  <p className="text-lg leading-relaxed text-(--t-muted)">{l.text}</p>
                  <dl className="vy-mono mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-(--t-muted)">Thời gian</dt>
                      <dd className="mt-1">{l.time}</dd>
                    </div>
                    <div>
                      <dt className="text-(--t-muted)">Cần chuẩn bị</dt>
                      <dd className="mt-1 normal-case tracking-normal">{l.need}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              <div className="vy-perf hidden w-28 flex-col items-center justify-center gap-3 md:flex">
                <span className="vy-mono text-(--t-muted)">{l.n}/05</span>
                <div aria-hidden className="vy-barcode h-24 w-10" />
              </div>
            </article>
          ))}
        />
      </section>

      {/* HẠN NỘP */}
      <section aria-labelledby="vy-han-nop" className="bg-(--t-night) py-24 text-(--t-bg) lg:py-32">
        <div className="container-page grid gap-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-4">
            <p className="vy-mono text-(--t-brass)">Hạn nộp hồ sơ · minh họa</p>
            <h2 id="vy-han-nop" className="mt-5 text-[clamp(2.4rem,1.6rem+3vw,4.4rem)] font-light">
              Kỳ nhập học <em className="text-(--t-brass) italic">tháng 9/2027</em>
            </h2>
          </div>
          <div className="lg:col-span-8">
            <Countdown />
          </div>
        </div>
      </section>

      {/* CHECKLIST */}
      <section id="ho-so" aria-labelledby="vy-ho-so" className="container-page grid gap-12 py-28 lg:grid-cols-12 lg:py-40">
        <div className="lg:col-span-4">
          <h2 id="vy-ho-so" className="text-[clamp(2.6rem,1.6rem+3.4vw,5rem)] font-light">
            Hồ sơ của bạn <em className="italic">đã đủ chưa?</em>
          </h2>
          <p className="mt-6 leading-relaxed text-(--t-muted)">Tích từng giấy tờ đã có. Đủ cả tám, tấm vé sẽ được đóng dấu.</p>
          <div className="mt-10 hidden aspect-[4/5] overflow-hidden rounded-t-full lg:block">
            <Image src={img("campus").src} width={img("campus").width} height={img("campus").height} alt="Tòa nhà đại học kiểu cổ điển" sizes="30vw" className="size-full object-cover" />
          </div>
        </div>
        <div className="lg:col-span-8">
          <Checklist />
        </div>
      </section>

      {/* TƯ VẤN */}
      <section id="tu-van" aria-labelledby="vy-tu-van" className="border-t border-(--t-line) py-28 lg:py-40">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="vy-tu-van" className="text-[clamp(2.6rem,1.6rem+3.4vw,5rem)] font-light">
              Bắt đầu từ <em className="italic">một cuộc trò chuyện.</em>
            </h2>
            <div className="mt-10 aspect-[4/3] overflow-hidden rounded-[2rem]">
              <Image src={img("tower").src} width={img("tower").width} height={img("tower").height} alt="Tháp đồng hồ đại học dưới bầu trời xanh" sizes="40vw" className="size-full object-cover" />
            </div>
          </div>
          <div className="lg:col-span-7">
            <Consult />
          </div>
        </div>
      </section>
    </div>
  );
}
