"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

import { CursorPreview } from "@/components/fx/CursorPreview";
import { DragSlider } from "@/components/fx/DragSlider";
import { ImageDistortLayer } from "@/components/fx/ImageDistortLayer";
import { ScrollParallax } from "@/components/fx/ScrollParallax";
import { VelocityMarquee } from "@/components/fx/VelocityMarquee";
import { cn } from "@/lib/cn";
import { gsap, MQ, SplitText, useGSAP } from "@/lib/motion";
import { tplImage } from "@/templates/_kit/images";
import { ShaderCanvas } from "@/templates/_kit/ShaderCanvas";
import "@/templates/hearth/hearth.css";

const img = (name: string) => tplImage("hearth", name);

/** Tàn than bay lên, lệch theo chuột (70 hạt, tính trong fragment shader) */
const EMBERS = `#version 300 es
precision highp float;
out vec4 outColor;
uniform float uTime; uniform vec2 uRes; uniform vec2 uMouse; uniform float uScroll;
float hash(float n){ return fract(sin(n * 12.9898) * 43758.5453); }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  float glow = 0.0;
  for (int k = 0; k < 70; k++) {
    float i = float(k);
    float sp = 0.035 + 0.07 * hash(i * 3.1);
    float y = fract(hash(i * 1.7) + uTime * sp);
    float x = hash(i * 7.3) + sin(uTime * 0.8 + i) * 0.025 * y + (uMouse.x - 0.5) * 0.12 * y;
    float size = (0.0015 + 0.0035 * hash(i * 9.1)) * (1.0 - y * 0.5);
    float d = length((uv - vec2(x, y)) * vec2(aspect, 1.0));
    float flick = 0.55 + 0.45 * sin(uTime * (4.0 + hash(i) * 6.0) + i * 2.0);
    glow += smoothstep(size * 3.0, 0.0, d) * flick * (1.0 - y);
  }
  float a = clamp(glow, 0.0, 1.0);
  vec3 c = mix(vec3(1.0, 0.36, 0.12), vec3(1.0, 0.82, 0.45), clamp(glow - 0.6, 0.0, 1.0));
  outColor = vec4(c * a, a);
}`;

type Dish = { name: string; desc: string; price: string; img: string };
const menu: { id: string; label: string; dishes: Dish[] }[] = [
  {
    id: "khai-vi",
    label: "Khai vị",
    dishes: [
      { name: "Phô mai nướng lá chanh", desc: "Phô mai dê áp than, rắc lá chanh và tiêu rừng", price: "95", img: "cheese" },
      { name: "Lạp xưởng nướng than", desc: "Lạp xưởng tươi, dưa góp, tương ớt nhà làm", price: "110", img: "sausage" },
      { name: "Cá hồi khoai nướng", desc: "Cá hồi phi lê, khoai tây đút lò, chanh vàng", price: "185", img: "salmon" },
    ],
  },
  {
    id: "tu-than",
    label: "Từ than",
    dishes: [
      { name: "Ba chỉ nướng muối hột", desc: "Ba chỉ heo quay, muối hột rang, kim chi củ cải", price: "165", img: "belly" },
      { name: "Tôm sú nướng muối ớt", desc: "Tôm sú cỡ lớn, muối ớt xanh, bơ tỏi", price: "245", img: "shrimp" },
      { name: "Sườn bò nướng lửa", desc: "Sườn bò ướp 24 giờ, nướng lửa lớn, sốt tiêu đen", price: "320", img: "steak" },
    ],
  },
  {
    id: "rau-com",
    label: "Rau & cơm",
    dishes: [
      { name: "Canh chua niêu đất", desc: "Canh chua cá, me non, bạc hà, nấu trong niêu", price: "125", img: "claypot" },
      { name: "Ớt chuông nướng mỡ hành", desc: "Ớt chuông, cà chua bi, mỡ hành, đậu phộng", price: "75", img: "peppers" },
      { name: "Hồng giòn ướp gừng", desc: "Tráng miệng: hồng giòn, siro gừng, kem dừa", price: "65", img: "persimmon" },
    ],
  },
  {
    id: "do-uong",
    label: "Đồ uống",
    dishes: [
      { name: "Chanh muối sour", desc: "Rượu gạo, chanh muối, lòng trắng trứng", price: "135", img: "sour" },
      { name: "Vang hồng ướp lạnh", desc: "Ly vang hồng khô, hợp với hải sản nướng", price: "120", img: "rose" },
    ],
  },
];

const slots = ["17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"];

function Menu() {
  const [tab, setTab] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = menu.length;
    const map: Record<string, number> = { ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    setTab(map[e.key]);
    refs.current[map[e.key]]?.focus();
  };
  return (
    <div>
      <div role="tablist" aria-label="Nhóm món" className="flex flex-wrap gap-x-8 gap-y-3 border-b border-(--t-line)">
        {menu.map((m, i) => (
          <button
            key={m.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={`ht-tab-${m.id}`}
            role="tab"
            type="button"
            aria-selected={tab === i}
            aria-controls={`ht-panel-${m.id}`}
            tabIndex={tab === i ? 0 : -1}
            onClick={() => setTab(i)}
            onKeyDown={(e) => onKey(e, i)}
            className="relative pb-4 font-(family-name:--t-font-display) text-[clamp(1.4rem,1rem+1.4vw,2.2rem)] italic transition-colors hover:text-(--t-accent)"
          >
            {m.label}
            <span aria-hidden className="ht-tab-line absolute inset-x-0 -bottom-px h-0.5 bg-(--t-accent)" />
          </button>
        ))}
      </div>
      <CursorPreview ratio="4 / 5" size="clamp(15rem, 22vw, 22rem)">
        {menu.map((m, i) => (
          <div key={m.id} id={`ht-panel-${m.id}`} role="tabpanel" aria-labelledby={`ht-tab-${m.id}`} hidden={tab !== i}>
            <ol>
              {m.dishes.map((d, k) => {
                const im = img(d.img);
                return (
                  <li key={d.name} data-preview={im.src} className="ht-dish grid grid-cols-[4.5rem_1fr] items-center gap-5 border-b border-(--t-line) py-6 md:grid-cols-[3rem_1fr] md:py-8">
                    <Image src={im.src} width={im.width} height={im.height} alt="" sizes="72px" className="aspect-square w-full rounded-full object-cover md:hidden" />
                    <span className="ht-label hidden text-(--t-muted) md:block">{String(k + 1).padStart(2, "0")}</span>
                    <div>
                      <div className="flex items-baseline gap-4">
                        <h3 className="ht-name font-(family-name:--t-font-display) text-[clamp(1.6rem,1.1rem+2vw,3.2rem)] leading-tight italic">{d.name}</h3>
                        <span aria-hidden className="ht-dots hidden md:block" />
                        <span className="shrink-0 font-(family-name:--t-font-display) text-2xl text-(--t-gold)">
                          {d.price}
                          <span className="ht-label ml-1 text-(--t-muted)">k</span>
                        </span>
                      </div>
                      <p className="mt-2 text-(--t-muted)">{d.desc}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </CursorPreview>
      <p className="ht-label mt-8 text-(--t-muted)">Giá minh họa, đơn vị nghìn đồng · Rê chuột trên món để xem ảnh</p>
    </div>
  );
}

type Day = { iso: string; label: string; day: number };

function Reservation() {
  const [days, setDays] = useState<Day[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  // Ngày tính trên trình duyệt (không tính lúc prerender)
  useEffect(() => {
    const t = window.setTimeout(() => {
      const now = new Date();
      setDays(
        Array.from({ length: 7 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
          return { iso: d.toISOString().slice(0, 10), label: i === 0 ? "Hôm nay" : ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][d.getDay()], day: d.getDate() };
        }),
      );
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!date || !time) return setError("Chọn ngày và giờ trước nhé.");
    if (name.trim().length < 2) return setError("Cho chúng tôi biết tên của bạn.");
    setError("");
    setDone(true);
    requestAnimationFrame(() => {
      ticketRef.current?.focus();
      if (window.matchMedia(MQ.anyMotion).matches) gsap.from(ticketRef.current, { y: 60, rotate: -4, opacity: 0, duration: 0.9, ease: "expo.out" });
    });
  };

  const chosen = days.find((d) => d.iso === date);

  if (done) {
    return (
      <div ref={ticketRef} tabIndex={-1} aria-live="polite" className="ht-ticket mx-auto max-w-xl bg-(--t-fg) px-10 py-10 text-(--t-bg) outline-none">
        <p className="ht-label">Phiếu giữ bàn · minh họa</p>
        <p className="mt-4 font-(family-name:--t-font-display) text-5xl italic">{name}</p>
        <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-dashed border-(--t-bg)/30 pt-6">
          {[
            ["Ngày", chosen ? `${chosen.label} ${chosen.day}` : date],
            ["Giờ", time],
            ["Khách", String(guests)],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="ht-label opacity-60">{k}</dt>
              <dd className="mt-1 font-(family-name:--t-font-display) text-3xl">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 text-sm opacity-70">Mẫu demo: không có dữ liệu nào được gửi đi. Website thật sẽ gửi xác nhận qua tin nhắn.</p>
        <button type="button" onClick={() => setDone(false)} className="ht-label mt-6 underline underline-offset-4">
          Đổi thông tin
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-10">
      <fieldset>
        <legend className="ht-label text-(--t-muted)">Ngày</legend>
        <div className="mt-4 flex flex-wrap gap-2">
          {days.map((d) => (
            <label key={d.iso} className="ht-chip text-center">
              <input type="radio" name="date" value={d.iso} checked={date === d.iso} onChange={() => setDate(d.iso)} className="sr-only" />
              {d.label} · <span className="font-semibold">{d.day}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="ht-label text-(--t-muted)">Giờ</legend>
        <div className="mt-4 flex flex-wrap gap-2">
          {slots.map((s) => (
            <label key={s} className="ht-chip tabular-nums">
              <input type="radio" name="time" value={s} checked={time === s} onChange={() => setTime(s)} className="sr-only" />
              {s}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <p id="ht-guests-label" className="ht-label text-(--t-muted)">
            Số khách
          </p>
          <div role="group" aria-labelledby="ht-guests-label" className="mt-4 flex items-center gap-5">
            <button type="button" aria-label="Bớt một khách" onClick={() => setGuests((g) => Math.max(1, g - 1))} className="grid size-11 place-items-center rounded-full border border-(--t-line) text-xl hover:border-(--t-accent)">
              −
            </button>
            <span className="w-8 text-center font-(family-name:--t-font-display) text-4xl tabular-nums" aria-live="polite">
              {guests}
            </span>
            <button type="button" aria-label="Thêm một khách" onClick={() => setGuests((g) => Math.min(12, g + 1))} className="grid size-11 place-items-center rounded-full border border-(--t-line) text-xl hover:border-(--t-accent)">
              +
            </button>
          </div>
        </div>
        <label className="grid gap-4">
          <span className="ht-label text-(--t-muted)">Tên người đặt</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="border-b border-(--t-line) bg-transparent py-2 text-2xl outline-none focus:border-(--t-accent)" />
        </label>
      </div>
      <p role="alert" className="min-h-6 text-(--t-accent)">
        {error}
      </p>
      <div className="flex flex-wrap items-center gap-6">
        <button type="submit" className="ht-label rounded-full bg-(--t-accent) px-8 py-4 text-(--t-bg) transition-transform hover:-translate-y-0.5">
          Giữ bàn →
        </button>
        <span className="text-sm text-(--t-muted)">Mẫu demo: xử lý trong trình duyệt, không gửi dữ liệu.</span>
      </div>
    </form>
  );
}

export function Hearth() {
  const root = useRef<HTMLDivElement>(null);
  const [openNow, setOpenNow] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => {
      const h = new Date().getHours();
      setOpenNow(h >= 17 && h < 23);
    };
    const first = window.setTimeout(check, 0);
    const id = window.setInterval(check, 60000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.anyMotion, () => {
        const title = root.current?.querySelector<HTMLElement>("[data-ht-title]");
        if (title) {
          SplitText.create(title, {
            type: "chars",
            autoSplit: true,
            onSplit: (self) => gsap.from(self.chars, { yPercent: 60, opacity: 0, filter: "blur(12px)", duration: 1.4, ease: "expo.out", stagger: { each: 0.04, from: "center" }, delay: 0.2 }),
          });
        }
        gsap.from("[data-ht-fade]", { opacity: 0, y: 20, duration: 1.2, ease: "expo.out", stagger: 0.1, delay: 0.9 });
        gsap.fromTo("[data-ht-hero-img]", { scale: 1.15 }, { scale: 1, duration: 2.6, ease: "power3.out" });
        gsap.to("[data-ht-hero-img]", { yPercent: 18, ease: "none", scrollTrigger: { trigger: "[data-ht-hero]", start: "top top", end: "bottom top", scrub: true } });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const hero = img("hero");

  return (
    <div ref={root} className="tpl tpl-hearth">
      <ImageDistortLayer />
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="container-page flex h-24 items-center justify-between gap-6">
          <a href="#dau-trang" className="font-(family-name:--t-font-display) text-2xl italic">
            Than <span className="text-(--t-accent)">&</span> Muối
          </a>
          <nav aria-label="Điều hướng Than & Muối" className="hidden md:block">
            <ul className="ht-label flex gap-8">
              {[
                ["Thực đơn", "#thuc-don"],
                ["Bếp", "#bep"],
                ["Không gian", "#khong-gian"],
              ].map(([l, h]) => (
                <li key={h}>
                  <a href={h} className="transition-colors hover:text-(--t-accent)">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-5">
            <span className="ht-label hidden items-center gap-2 text-(--t-muted) lg:flex">
              <span aria-hidden className={cn("size-2 rounded-full", openNow ? "bg-(--t-accent)" : "bg-(--t-muted)")} />
              {openNow === null ? "17:00 – 23:00" : openNow ? "Đang mở cửa" : "Mở lúc 17:00"}
              <span className="normal-case tracking-normal opacity-70">(minh họa)</span>
            </span>
            <a href="#giu-ban" className="ht-label rounded-full border border-(--t-accent) px-5 py-3 text-(--t-accent) transition-colors hover:bg-(--t-accent) hover:text-(--t-bg)">
              Giữ bàn
            </a>
          </div>
        </div>
      </header>

      {/* HERO: than hồng + tàn lửa */}
      <section id="dau-trang" data-ht-hero aria-labelledby="ht-title" className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pb-12">
        <div className="absolute inset-0">
          <Image data-ht-hero-img src={hero.src} width={hero.width} height={hero.height} alt="Than hồng đang cháy trong lò nướng" priority sizes="100vw" className="size-full object-cover" />
          <div aria-hidden className="absolute inset-0 bg-linear-to-t from-(--t-bg) via-(--t-bg)/55 to-(--t-bg)/30" />
        </div>
        <ShaderCanvas fragment={EMBERS} className="absolute inset-0" maxDpr={1.25} />
        <div className="container-page relative">
          <p data-ht-fade className="ht-label text-(--t-gold)">
            Quán nướng than hồng · từ 17:00
          </p>
          <h1 id="ht-title" data-ht-title className="ht-condensed mt-6 text-[clamp(4.5rem,1rem+15vw,19rem)]">
            Than <span className="text-(--t-accent)">&</span> Muối
          </h1>
          <div className="mt-10 flex flex-wrap items-end justify-between gap-8 border-t border-(--t-line) pt-6">
            <p data-ht-fade className="max-w-[30rem] text-lg leading-relaxed text-(--t-muted)">
              Lửa than, muối hột, và một tối <em className="font-(family-name:--t-font-display) text-xl">không ai nhìn đồng hồ.</em>
            </p>
            <div data-ht-fade className="flex gap-3">
              <a href="#thuc-don" className="ht-label rounded-full border border-(--t-line) px-6 py-4 transition-colors hover:border-(--t-fg)">
                Xem thực đơn
              </a>
              <a href="#giu-ban" className="ht-label rounded-full bg-(--t-accent) px-6 py-4 text-(--t-bg)">
                Giữ bàn tối nay
              </a>
            </div>
          </div>
        </div>
      </section>

      <div aria-hidden className="border-y border-(--t-line) py-6">
        <VelocityMarquee speed={0.8}>
          {["Nướng chậm", "Ăn nóng", "Than hồng", "Muối hột", "Không vội"].map((w) => (
            <span key={w} className="flex items-center font-(family-name:--t-font-display) text-[clamp(2.4rem,1.4rem+3.4vw,5rem)] italic">
              {w}
              <span className="mx-8 text-(--t-accent) not-italic">✺</span>
            </span>
          ))}
        </VelocityMarquee>
      </div>

      {/* THỰC ĐƠN */}
      <section id="thuc-don" aria-labelledby="ht-thuc-don" className="container-page py-28 lg:py-40">
        <div className="mb-14 grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 id="ht-thuc-don" className="ht-condensed text-[clamp(3.5rem,1.5rem+7vw,9rem)] lg:col-span-7">
            Thực đơn
          </h2>
          <p className="max-w-[26rem] text-lg leading-relaxed text-(--t-muted) lg:col-span-5 lg:justify-self-end">
            Mười một món, đổi theo mùa. Mọi thứ đều qua lửa than, kể cả tráng miệng.
          </p>
        </div>
        <Menu />
      </section>

      {/* BẾP */}
      <section id="bep" aria-labelledby="ht-bep" className="border-t border-(--t-line) py-28 lg:py-40">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="ht-label text-(--t-gold)">Câu chuyện bếp</p>
            <h2 id="ht-bep" className="mt-6 font-(family-name:--t-font-display) text-[clamp(2.4rem,1.4rem+3.4vw,5rem)] leading-[1.02]">
              Than đỏ trước, <em>khách đến sau.</em>
            </h2>
            <p className="mt-8 max-w-[30rem] text-lg leading-relaxed text-(--t-muted)">
              Bếp nhóm lửa từ ba giờ chiều để than kịp chín đều. Mỗi món được nướng khi khách gọi, không làm sẵn, không hâm lại.
            </p>
            <div className="mt-12 w-3/4">
              <ScrollParallax reveal="up" depth={22} className="aspect-[4/3]">
                <Image src={img("tongs").src} width={img("tongs").width} height={img("tongs").height} alt="Tôm nướng trên vỉ than, kẹp gắp bốc khói" sizes="35vw" className="size-full object-cover" />
              </ScrollParallax>
            </div>
          </div>
          <div className="lg:col-span-6 lg:col-start-7 lg:pt-32">
            <ScrollParallax reveal="center" depth={10} className="aspect-[4/5]">
              <Image src={img("knife").src} width={img("knife").width} height={img("knife").height} alt="Dao bếp, hành tím và hương thảo trên thớt gỗ" sizes="(min-width: 1024px) 45vw, 100vw" className="size-full object-cover" />
            </ScrollParallax>
          </div>
        </div>
      </section>

      {/* KHÔNG GIAN */}
      <section id="khong-gian" aria-labelledby="ht-khong-gian" className="border-t border-(--t-line) py-28 lg:py-36">
        <div className="container-page flex items-end justify-between">
          <h2 id="ht-khong-gian" className="ht-condensed text-[clamp(3rem,1.5rem+5vw,7rem)]">
            Không gian
          </h2>
          <p className="ht-label text-(--t-muted)">Kéo ↔ · rê chuột lên ảnh</p>
        </div>
        <DragSlider label="Không gian quán" className="mt-12" trackClassName="gap-5 px-(--gutter)">
          {["room-night", "veranda", "coals", "hall", "bar", "grate"].map((n, i) => {
            const im = img(n);
            return (
              <figure key={n} className={cn("shrink-0", i % 3 === 1 ? "w-[min(70vw,24rem)]" : "w-[min(82vw,36rem)]")}>
                <div data-distort={im.src} className={cn("overflow-hidden", i % 3 === 1 ? "aspect-[3/4]" : "aspect-[4/3]")}>
                  <Image src={im.src} width={im.width} height={im.height} alt="" sizes="36rem" draggable={false} className="size-full object-cover" />
                </div>
              </figure>
            );
          })}
        </DragSlider>
      </section>

      {/* GIỮ BÀN */}
      <section id="giu-ban" aria-labelledby="ht-giu-ban" className="bg-(--t-panel) py-28 lg:py-40">
        <div className="container-page grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="ht-giu-ban" className="ht-condensed text-[clamp(3.5rem,1.5rem+6vw,8rem)]">
              Giữ bàn
            </h2>
            <p className="mt-6 max-w-[22rem] text-lg leading-relaxed text-(--t-muted)">Bàn được giữ 15 phút sau giờ hẹn. Nhóm trên 12 người, hãy nhắn trước.</p>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <Reservation />
          </div>
        </div>
      </section>

      <footer className="container-page py-24">
        <p className="ht-condensed text-center text-[clamp(3.5rem,1rem+11vw,14rem)]">
          Hẹn bạn <span className="text-(--t-accent)">tối nay.</span>
        </p>
        <p className="ht-label mt-10 text-center text-(--t-muted)">Than & Muối · thương hiệu giả định · giờ mở cửa minh họa</p>
      </footer>
    </div>
  );
}
