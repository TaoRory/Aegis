"use client";

import Image from "next/image";
import { Flip } from "gsap/Flip";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";

import { CharWave } from "@/components/fx/CharWave";
import { DragSlider } from "@/components/fx/DragSlider";
import { ImageDistortLayer } from "@/components/fx/ImageDistortLayer";
import { ImageTrail } from "@/components/fx/ImageTrail";
import { ScrollParallax } from "@/components/fx/ScrollParallax";
import { cn } from "@/lib/cn";
import { gsap, MQ, useGSAP } from "@/lib/motion";
import { tplImage } from "@/templates/_kit/images";
import "@/templates/atelier/atelier.css";

gsap.registerPlugin(Flip);

const SLUG = "atelier";
const img = (name: string) => tplImage(SLUG, name);

const looks = [
  { n: "look-1", name: "Đầm lụa màu mận", material: "Lụa tơ tằm · may tay 42 giờ" },
  { n: "look-2", name: "Đầm kẻ ô rêu", material: "Lụa taffeta · tay loe" },
  { n: "look-3", name: "Áo dài nhung lam", material: "Nhung lụa · đính hạt" },
  { n: "look-4", name: "Đầm nâu hoa chìm", material: "Gấm dệt hoa · cổ đứng" },
  { n: "look-5", name: "Đầm hồng khói", material: "Lụa sa tanh · tay phồng" },
  { n: "look-6", name: "Áo choàng tím mận", material: "Lụa xếp ly · đuôi dài" },
  { n: "look-7", name: "Đầm lam đêm", material: "Taffeta kẻ chìm · xòe rộng" },
  { n: "look-8", name: "Bộ lửng đen trắng", material: "Len lụa · áo lửng" },
];

type Product = { id: string; name: string; cat: "dam" | "ao"; price: number; a: string; b?: string; focus?: string };
const products: Product[] = [
  { id: "p1", name: "Đầm Mận", cat: "dam", price: 3890000, a: "look-1", focus: "50% 35%" },
  { id: "p2", name: "Đầm Lam Đêm", cat: "dam", price: 4250000, a: "look-7", b: "look-7b" },
  { id: "p3", name: "Áo Gấm Nâu", cat: "ao", price: 2690000, a: "look-4", focus: "50% 30%" },
  { id: "p4", name: "Đầm Kẻ Ô Rêu", cat: "dam", price: 3450000, a: "look-2", focus: "50% 55%" },
  { id: "p5", name: "Áo Choàng Tím", cat: "ao", price: 3150000, a: "look-6", focus: "40% 40%" },
  { id: "p6", name: "Đầm Hồng Khói", cat: "dam", price: 3690000, a: "look-5", focus: "50% 30%" },
];
const filters = [
  { id: "all", label: "Tất cả" },
  { id: "dam", label: "Đầm" },
  { id: "ao", label: "Áo" },
] as const;

const vnd = (v: number) => `${v.toLocaleString("vi-VN")} ₫`;

function Cart({ open, onClose, cart, setQty }: { open: boolean; onClose: () => void; cart: Record<string, number>; setQty: (id: string, q: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const items = products.filter((p) => cart[p.id] > 0);
  const total = items.reduce((s, p) => s + p.price * cart[p.id], 0);

  useEffect(() => {
    if (!open) return;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div className={cn("fixed inset-0 z-[60] transition-[visibility] duration-700", open ? "visible" : "invisible")} aria-hidden={!open}>
      <button type="button" tabIndex={-1} aria-label="Đóng giỏ hàng" onClick={onClose} className={cn("absolute inset-0 bg-(--t-fg)/40 transition-opacity duration-500", open ? "opacity-100" : "opacity-0")} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="at-cart-title"
        tabIndex={-1}
        className={cn(
          "absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-(--t-paper) p-8 outline-none transition-transform duration-700 ease-[cubic-bezier(0.7,0,0.2,1)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-baseline justify-between border-b border-(--t-line) pb-5">
          <h2 id="at-cart-title" className="text-3xl">
            Giỏ hàng
          </h2>
          <button type="button" onClick={onClose} className="at-label">
            <span className="at-underline">Đóng ✕</span>
          </button>
        </div>
        {items.length === 0 ? (
          <p className="mt-10 text-(--t-muted)">Giỏ đang trống. Hãy chọn một thiết kế trong catalogue.</p>
        ) : (
          <ul className="mt-6 flex-1 space-y-5 overflow-y-auto">
            {items.map((p) => {
              const i = img(p.a);
              return (
                <li key={p.id} className="grid grid-cols-[4.5rem_1fr] gap-4">
                  <Image src={i.src} width={i.width} height={i.height} alt="" sizes="72px" className="aspect-[3/4] w-full object-cover" />
                  <div>
                    <p className="text-xl">{p.name}</p>
                    <p className="at-label mt-1 text-(--t-accent)">{vnd(p.price)}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <button type="button" aria-label={`Bớt một ${p.name}`} onClick={() => setQty(p.id, cart[p.id] - 1)} className="size-8 border border-(--t-line)">
                        −
                      </button>
                      <span className="w-5 text-center tabular-nums">{cart[p.id]}</span>
                      <button type="button" aria-label={`Thêm một ${p.name}`} onClick={() => setQty(p.id, cart[p.id] + 1)} className="size-8 border border-(--t-line)">
                        +
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-auto border-t border-(--t-line) pt-5">
          <p className="flex justify-between text-lg">
            <span>Tạm tính</span>
            <span aria-live="polite">{vnd(total)}</span>
          </p>
          <p className="mt-2 text-sm text-(--t-muted)">Giá minh họa. Đây là mẫu demo: không có thanh toán và không gửi dữ liệu.</p>
          <a href="#demo-ket" onClick={onClose} className="at-label mt-5 block bg-(--t-fg) py-4 text-center text-(--t-bg)">
            Tiếp tục (demo)
          </a>
        </div>
      </div>
    </div>
  );
}

function Catalogue({ onAdd }: { onAdd: (id: string) => void }) {
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const grid = useRef<HTMLUListElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

  const change = (next: typeof filter) => {
    if (next === filter) return;
    if (grid.current && window.matchMedia(MQ.anyMotion).matches) flipState.current = Flip.getState(grid.current.children);
    setFilter(next);
  };

  useEffect(() => {
    if (!flipState.current || !grid.current) return;
    Flip.from(flipState.current, {
      duration: 0.9,
      ease: "power4.inOut",
      absolute: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: "expo.out" }),
      onLeave: (els) => gsap.to(els, { opacity: 0, duration: 0.3 }),
    });
    flipState.current = null;
  }, [filter]);

  const visible = products.filter((p) => filter === "all" || p.cat === filter);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-(--t-line) pb-6">
        <h2 id="at-catalogue" className="at-masthead text-[clamp(3.5rem,1rem+11vw,13rem)]" style={{ "--wdth": 87.5 } as CSSProperties}>
          Catalogue<sup className="ml-2 align-top font-(family-name:--t-font-body) text-[0.12em] tracking-normal">({String(visible.length).padStart(2, "0")})</sup>
        </h2>
        <div role="group" aria-label="Lọc sản phẩm" className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => change(f.id)}
              className="at-label rounded-full border border-(--t-fg) px-4 py-2 transition-colors aria-pressed:bg-(--t-fg) aria-pressed:text-(--t-bg)"
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <ul ref={grid} className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p, i) => {
          const a = img(p.a);
          const b = p.b ? img(p.b) : null;
          return (
            <li key={p.id} data-flip-id={p.id} className={cn(i % 3 === 1 && "lg:mt-24")}>
              <div className="hover-swap aspect-[3/4] overflow-hidden bg-(--t-paper)">
                <Image src={a.src} width={a.width} height={a.height} alt={`${p.name}, ảnh minh họa`} sizes="(min-width: 1024px) 30vw, 50vw" className="size-full object-cover" />
                {b ? (
                  <Image src={b.src} width={b.width} height={b.height} alt="" sizes="(min-width: 1024px) 30vw, 50vw" className="size-full object-cover" />
                ) : (
                  <Image src={a.src} width={a.width} height={a.height} alt="" sizes="(min-width: 1024px) 45vw, 75vw" className="at-detail size-full object-cover" style={{ "--focus": p.focus } as CSSProperties} />
                )}
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-4">
                <h3 className="text-2xl">{p.name}</h3>
                <p className="at-label text-(--t-accent)">{vnd(p.price)}</p>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="at-label text-(--t-muted)">{p.b ? "Rê chuột: mặt sau" : "Rê chuột: chi tiết vải"}</p>
                <button type="button" onClick={() => onAdd(p.id)} className="at-label">
                  <span className="at-underline">Thêm vào giỏ +</span>
                  <span className="sr-only">: {p.name}</span>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="at-label mt-12 text-(--t-muted)">Giá minh họa · thương hiệu giả định</p>
    </div>
  );
}

export function Atelier() {
  const root = useRef<HTMLDivElement>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const cartButton = useRef<HTMLButtonElement>(null);
  const count = Object.values(cart).reduce((s, q) => s + q, 0);

  const add = (id: string) => {
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
    setToast(`Đã thêm ${products.find((p) => p.id === id)?.name} vào giỏ`);
  };
  const setQty = (id: string, q: number) => setCart((c) => ({ ...c, [id]: Math.max(0, q) }));
  const closeCart = () => {
    setCartOpen(false);
    cartButton.current?.focus();
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.anyMotion, () => {
        // Masthead: co giãn trục wdth + tracking khi tải
        gsap.fromTo("[data-at-mast]", { "--wdth": 87.5, letterSpacing: "-0.07em", yPercent: 30, opacity: 0 }, { "--wdth": 112.5, letterSpacing: "-0.035em", yPercent: 0, opacity: 1, duration: 1.8, ease: "expo.out", delay: 0.1 });
        gsap.from("[data-at-fade]", { opacity: 0, y: 20, duration: 1.2, ease: "expo.out", stagger: 0.08, delay: 0.7 });
      });
      mm.add(MQ.desktopMotion, () => {
        // Ảnh bìa nở ra toàn khung khi cuộn (pin)
        const tl = gsap.timeline({ scrollTrigger: { trigger: "[data-at-hero]", start: "top top", end: "+=110%", scrub: 1, pin: true } });
        tl.fromTo("[data-at-cover]", { clipPath: "inset(24% 36% 4% 36%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none" }, 0)
          .fromTo("[data-at-cover] img", { scale: 1.25 }, { scale: 1, ease: "none" }, 0)
          .fromTo("[data-at-mast-out]", { yPercent: 0, opacity: 1 }, { yPercent: -60, opacity: 0, ease: "none" }, 0)
          .to("[data-at-lines]", { opacity: 0, ease: "none" }, 0)
          .fromTo("[data-at-overlay]", { opacity: 0 }, { opacity: 1, ease: "none" }, 0.5);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  const subscribe = (e: FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
  };

  const cover = img("look-1");

  return (
    <div ref={root} className="tpl tpl-atelier">
      <ImageDistortLayer />

      <header className="fixed inset-x-0 top-0 z-40 text-(--t-paper) mix-blend-difference">
        <div className="container-page grid h-20 grid-cols-[1fr_auto_1fr] items-center">
          <nav aria-label="Điều hướng Tơ Đêm">
            <ul className="at-label hidden gap-7 md:flex">
              {[
                ["Lookbook", "#lookbook"],
                ["Catalogue", "#catalogue"],
                ["Xưởng may", "#xuong-may"],
              ].map(([l, h]) => (
                <li key={h}>
                  <a href={h}>
                    <span className="at-underline">{l}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a href="#dau-trang" className="font-(family-name:--t-font-display) text-2xl tracking-tight">
            Tơ Đêm
          </a>
          <button ref={cartButton} type="button" onClick={() => setCartOpen(true)} aria-haspopup="dialog" className="at-label justify-self-end">
            <span className="at-underline">Giỏ ({count})</span>
          </button>
        </div>
      </header>
      <Cart open={cartOpen} onClose={closeCart} cart={cart} setQty={setQty} />
      <p role="status" className={cn("at-label fixed bottom-20 left-1/2 z-50 -translate-x-1/2 bg-(--t-fg) px-5 py-3 text-(--t-bg) transition-opacity duration-300", toast ? "opacity-100" : "pointer-events-none opacity-0")}>
        {toast}
      </p>

      {/* BÌA */}
      <section id="dau-trang" data-at-hero aria-labelledby="at-title" className="relative h-[100svh] min-h-[40rem] overflow-hidden">
        <div className="container-page relative z-10 pt-24">
          {/* Lớp ngoài: tween cuộn; lớp trong (h1): tween intro — tách để hai tween không giành opacity */}
          <div data-at-mast-out>
            <h1 id="at-title" data-at-mast className="at-masthead text-center text-[clamp(4.5rem,25.5vw,44rem)]">
              Tơ Đêm
            </h1>
          </div>
          <div data-at-fade className="at-label relative z-20 mt-4 flex justify-between border-y border-(--t-paper)/40 py-2.5 text-(--t-paper) mix-blend-difference">
            <span>Số 07 · Thu Đông 2027</span>
            <span className="hidden sm:inline">Lụa · Đêm · Những điều chưa nói</span>
            <span>Bộ sưu tập mới</span>
          </div>
        </div>
        <div data-at-cover className="absolute inset-0 [clip-path:inset(24%_8%_4%_8%)] md:[clip-path:inset(24%_36%_4%_36%)]">
          <Image src={cover.src} width={cover.width} height={cover.height} alt="Đầm lụa màu mận trên nền tối" priority sizes="100vw" className="size-full object-cover object-[50%_30%]" />
          <div data-at-overlay className="absolute inset-0 flex items-end bg-linear-to-t from-(--t-night)/70 to-transparent p-[var(--gutter)] opacity-0">
            <p className="max-w-[18ch] font-(family-name:--t-font-display) text-[clamp(2rem,1.2rem+3vw,4.5rem)] leading-[1.02] text-(--t-paper)">
              Lụa may tay, cho những đêm <em>không cần lý do.</em>
            </p>
          </div>
        </div>
        <div data-at-lines className="container-page pointer-events-none absolute inset-x-0 bottom-10 z-10 hidden items-end justify-between md:flex">
          <p data-at-fade className="max-w-[15rem] font-(family-name:--t-font-display) text-2xl leading-tight">
            Tám thiết kế lụa, <em>may tay</em> trong xưởng nhỏ.
          </p>
          <a data-at-fade href="#lookbook" className="at-label pointer-events-auto">
            <span className="at-underline">Xem lookbook ↓</span>
          </a>
        </div>
      </section>

      {/* TUYÊN NGÔN */}
      <section aria-label="Tuyên ngôn" className="container-page py-32 lg:py-48">
        <p className="at-label text-center text-(--t-muted)">№ 07 · Lời ngỏ</p>
        <CharWave as="p" text="Chúng tôi may lụa như người xưa viết thư: chậm, tỉ mỉ, và chỉ cho một người." className="mx-auto mt-10 max-w-[22ch] text-center font-(family-name:--t-font-display) text-[clamp(2.2rem,1.2rem+3.6vw,5.2rem)] leading-[1.05] tracking-[-0.02em]" />
      </section>

      {/* LOOKBOOK */}
      <section id="lookbook" aria-labelledby="at-lookbook" className="pb-32 lg:pb-44">
        <div className="container-page flex items-end justify-between border-b border-(--t-line) pb-5">
          <h2 id="at-lookbook" className="text-[clamp(2.4rem,1.6rem+3vw,4.5rem)] leading-none">
            Lookbook <em className="text-(--t-accent)">Thu Đông</em>
          </h2>
          <p className="at-label text-(--t-muted)">08 thiết kế · Kéo ↔</p>
        </div>
        <DragSlider label="Lookbook Thu Đông" bend className="mt-12" trackClassName="gap-5 px-(--gutter) py-10 lg:gap-8">
          {looks.map((l, i) => {
            const im = img(l.n);
            return (
              <figure key={l.n} className="at-look w-[min(72vw,24rem)] shrink-0">
                <div data-distort={im.src} className="aspect-[3/4] overflow-hidden bg-(--t-paper)">
                  <Image src={im.src} width={im.width} height={im.height} alt={l.name} sizes="(min-width: 1024px) 24rem, 72vw" draggable={false} className="size-full object-cover" />
                </div>
                <figcaption className="mt-4 flex items-baseline justify-between gap-3">
                  <span className="text-xl">
                    <span className="at-label mr-3 text-(--t-accent)">Look {String(i + 1).padStart(2, "0")}</span>
                    {l.name}
                  </span>
                </figcaption>
                <p className="at-label mt-1 text-(--t-muted)">{l.material}</p>
              </figure>
            );
          })}
        </DragSlider>
      </section>

      {/* CATALOGUE */}
      <section id="catalogue" aria-labelledby="at-catalogue" className="container-page pb-32 lg:pb-44">
        <Catalogue onAdd={add} />
      </section>

      {/* XƯỞNG MAY */}
      <section id="xuong-may" aria-labelledby="at-xuong" className="border-t border-(--t-line) py-32 lg:py-44">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ScrollParallax reveal="center" depth={10} className="aspect-[4/3]">
              <Image src={img("craft-hands").src} width={img("craft-hands").width} height={img("craft-hands").height} alt="Bàn tay thợ may đưa vải qua máy may" sizes="(min-width: 1024px) 55vw, 100vw" className="size-full object-cover" />
            </ScrollParallax>
          </div>
          <div className="flex flex-col justify-between gap-10 lg:col-span-5">
            <div>
              <p className="at-label text-(--t-muted)">Xưởng may</p>
              <h2 id="at-xuong" className="mt-5 text-[clamp(2.4rem,1.6rem+3vw,4.5rem)] leading-[1.02]">
                Một chiếc đầm, <em>bốn mươi hai giờ.</em>
              </h2>
            </div>
            <ol className="divide-y divide-(--t-line) border-y border-(--t-line)">
              {[
                ["I", "Chọn lụa", "Mỗi mùa chỉ nhập vài cây lụa tơ tằm, kiểm từng thước trước khi cắt."],
                ["II", "Cắt rập", "Rập vẽ tay theo số đo, cắt từng lớp để thớ vải rủ đúng hướng."],
                ["III", "May tay", "Đường viền, khuy và lai áo khâu tay; mỗi thiết kế mang số thứ tự riêng."],
              ].map(([n, t, d]) => (
                <li key={n} className="grid grid-cols-[3rem_1fr] gap-4 py-5">
                  <span className="font-(family-name:--t-font-display) text-2xl text-(--t-accent) italic">{n}</span>
                  <span>
                    <span className="block text-xl">{t}</span>
                    <span className="mt-1 block leading-relaxed text-(--t-muted)">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="ml-auto w-2/3">
              <ScrollParallax reveal="up" depth={18} className="aspect-[4/3]">
                <Image src={img("craft-tailor").src} width={img("craft-tailor").width} height={img("craft-tailor").height} alt="Người thợ may lớn tuổi bên máy may" sizes="30vw" className="size-full object-cover" />
              </ScrollParallax>
            </div>
          </div>
        </div>
      </section>

      {/* HẬU TRƯỜNG */}
      <section aria-labelledby="at-hau-truong" className="bg-(--t-night) text-(--t-paper)">
        <ImageTrail images={["bts-1", "look-8", "bts-2", "craft-machine", "bts-3", "look-3", "bts-4", "look-6"].map((n) => img(n).src)} className="min-h-[60svh]" size="clamp(10rem, 17vw, 16rem)">
          <div className="pointer-events-none grid min-h-[60svh] place-items-center px-(--gutter) text-center">
            <div>
              <p className="at-label opacity-60">Hậu trường</p>
              <h2 id="at-hau-truong" className="at-masthead mt-6 text-[clamp(3.5rem,1rem+12vw,15rem)]" style={{ "--wdth": 87.5 } as CSSProperties}>
                Sau ánh đèn
              </h2>
              <p className="at-label mt-6 hidden opacity-60 md:block">Rê chuột để xem hậu trường buổi chụp</p>
            </div>
          </div>
        </ImageTrail>
        <ul className="grid grid-cols-3 gap-1 px-1 pb-1 md:grid-cols-4">
          {["bts-1", "bts-2", "bts-3", "bts-4"].map((n, i) => (
            <li key={n} className={i === 3 ? "hidden md:block" : undefined}>
              <Image src={img(n).src} width={img(n).width} height={img(n).height} alt="" sizes="(min-width: 768px) 25vw, 33vw" className="aspect-[3/4] w-full object-cover" />
            </li>
          ))}
        </ul>
      </section>

      {/* CHÂN TRANG */}
      <footer className="container-page pt-28 pb-10">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 className="text-[clamp(2.2rem,1.4rem+3vw,4rem)] leading-[1.02]">
              Thư từ xưởng may, <em>mỗi mùa một lá.</em>
            </h2>
          </div>
          <form onSubmit={subscribe} className="lg:col-span-5 lg:col-start-8" aria-label="Đăng ký thư tin">
            {subscribed ? (
              <p role="status" className="text-xl">
                Cảm ơn bạn. Mẫu demo không lưu hay gửi email nào.
              </p>
            ) : (
              <div className="flex border-b border-(--t-fg)">
                <label htmlFor="at-email" className="sr-only">
                  Email
                </label>
                <input id="at-email" type="email" required placeholder="Email của bạn" className="flex-1 bg-transparent py-4 text-lg outline-none placeholder:text-(--t-muted)" />
                <button type="submit" className="at-label">
                  Đăng ký →
                </button>
              </div>
            )}
          </form>
        </div>
        <p aria-hidden className="at-masthead mt-24 text-center text-[clamp(6rem,34vw,40rem)] leading-[0.75] text-(--t-fg)" style={{ "--wdth": 87.5 } as CSSProperties}>
          TĐ
        </p>
        <div className="at-label mt-6 flex items-center gap-4 text-(--t-muted)">
          <span>Theo dõi</span>
          <span aria-hidden className="h-px flex-1 bg-(--t-line)" />
          <span>Tơ Đêm · thương hiệu giả định</span>
        </div>
      </footer>
    </div>
  );
}
