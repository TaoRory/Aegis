"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import { SheetRise } from "@/components/fx/SheetRise";
import { TextScramble } from "@/components/fx/TextScramble";
import { VelocityMarquee } from "@/components/fx/VelocityMarquee";
import { Magnetic } from "@/components/motion/Magnetic";
import { gsap, MQ, SplitText, useGSAP } from "@/lib/motion";
import { ShaderCanvas } from "@/templates/_kit/ShaderCanvas";
import "@/templates/signal/signal.css";

/**
 * Trường sóng: 48 đường ngang nhiễu loạn. Gần con trỏ → duỗi thẳng và sáng lime; cuộn xuống → cả trường dịu dần.
 * uScroll của hero bắt đầu ở 0.5 (canvas cao bằng màn hình) → "calm" tính từ 0.5.
 */
const FIELD = `#version 300 es
precision highp float;
out vec4 outColor;
uniform float uTime; uniform vec2 uRes; uniform vec2 uMouse; uniform float uScroll;
float hash(float n){ return fract(sin(n * 12.9898) * 43758.5453); }
float noise(float x){ float i = floor(x); float f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(hash(i), hash(i + 1.0), f) * 2.0 - 1.0; }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  const float N = 46.0;
  float calm = clamp((uScroll - 0.5) * 2.4, 0.0, 1.0);
  float ink = 0.0; float lime = 0.0;
  float idx = floor(uv.y * N);
  for (int k = -5; k <= 5; k++) {
    float i = idx + float(k);
    float base = (i + 0.5) / N;
    float dm = length((vec2(uv.x, base) - uMouse) * vec2(aspect, 1.0));
    float near = smoothstep(0.3, 0.0, dm);
    float amp = (0.05 + 0.035 * hash(i)) * (1.0 - calm * 0.9) * (1.0 - near * 0.95);
    float n = noise(uv.x * 5.0 + uTime * 0.5 + i * 1.7) * 0.65 + noise(uv.x * 19.0 - uTime * 1.2 + i * 3.1) * 0.35;
    float y = base + n * amp;
    float w = 1.4 / uRes.y;
    float line = smoothstep(w * 1.6, 0.0, abs(uv.y - y));
    ink += line * (0.2 + 0.32 * hash(i + 7.0));
    lime += line * near;
  }
  vec3 fg = vec3(0.933, 0.945, 0.957);
  vec3 lc = vec3(0.776, 1.0, 0.239);
  float l = clamp(lime, 0.0, 1.0);
  float a = clamp(ink + l, 0.0, 1.0) * smoothstep(0.0, 0.12, uv.x) * smoothstep(1.0, 0.88, uv.x);
  vec3 c = mix(fg, lc, l / max(ink + l, 1e-3));
  outColor = vec4(c * a, a);
}`;

const pains = [
  "Nhân viên chép tay đơn hàng từ email sang bảng tính",
  "Báo cáo cuối tuần tổng hợp thủ công từ năm nguồn",
  "Hóa đơn đối soát chậm, sai một số là làm lại từ đầu",
  "Thông tin khách hàng nằm rải rác, không ai nắm toàn cảnh",
];

const flows = [
  {
    id: "don-hang",
    label: "Xử lý email đặt hàng",
    steps: [
      "Đọc 12 email mới trong hộp thư đơn hàng",
      "Nhận diện 9 email là đơn đặt hàng, 3 email là hỏi đáp",
      "Trích xuất: tên khách, mã sản phẩm, số lượng, địa chỉ giao",
      "Đối chiếu tồn kho: 8 đơn đủ hàng, 1 đơn thiếu 2 sản phẩm",
      "Tạo 9 phiếu xuất kho nháp, gắn cờ đơn thiếu hàng",
      "Gửi tóm tắt cho trưởng ca kho",
    ],
    result: "9 phiếu nháp chờ duyệt · 1 cảnh báo thiếu hàng",
  },
  {
    id: "hoa-don",
    label: "Đối soát hóa đơn",
    steps: [
      "Tải 46 hóa đơn đầu vào trong tháng",
      "Đọc số tiền, mã số thuế, ngày phát hành",
      "So khớp với 44 lệnh chi trong sổ phụ ngân hàng",
      "Phát hiện 2 hóa đơn chưa có lệnh chi tương ứng",
      "Lập bảng đối soát và đánh dấu chênh lệch",
    ],
    result: "44/46 khớp · 2 hóa đơn cần kế toán kiểm tra",
  },
  {
    id: "bao-cao",
    label: "Tổng hợp báo cáo tuần",
    steps: [
      "Lấy số liệu bán hàng, kho, chăm sóc khách hàng",
      "Chuẩn hóa định dạng ngày, đơn vị, tên chi nhánh",
      "Tính các chỉ số chính và so với tuần trước",
      "Viết nhận xét ngắn cho 3 điểm bất thường",
      "Xuất báo cáo PDF và gửi cho ban điều hành",
    ],
    result: "Báo cáo 4 trang · gửi lúc 08:00 thứ Hai",
  },
];

const features = [
  { name: "ĐỌC HIỂU", text: "Đọc email, PDF, ảnh chụp chứng từ và tin nhắn; hiểu ý định thay vì chỉ tìm từ khóa." },
  { name: "QUYẾT ĐỊNH", text: "Áp dụng quy tắc của doanh nghiệp, hỏi lại người phụ trách khi gặp trường hợp ngoài quy tắc." },
  { name: "HÀNH ĐỘNG", text: "Tạo phiếu, cập nhật bảng tính, gửi thông báo vào đúng công cụ đội ngũ đang dùng." },
  { name: "GIẢI TRÌNH", text: "Mỗi bước đều có nhật ký: đọc gì, quyết định vì sao, ai đã duyệt." },
];

const orbits = [
  { r: "15rem", dur: "50s", nodes: ["Email", "Bảng tính", "Lịch"] },
  { r: "25rem", dur: "80s", nodes: ["CRM", "Kho", "Kế toán", "Biểu mẫu"] },
  { r: "35rem", dur: "120s", nodes: ["Chat nội bộ", "Lưu trữ tệp", "Hóa đơn điện tử", "Website", "Chữ ký số"] },
];

const stats = [
  { value: 68, suffix: "%", label: "thời gian nhập liệu giảm" },
  { value: 9, suffix: " phút", label: "từ email tới phiếu xuất kho" },
  { value: 24, suffix: "/7", label: "luồng việc chạy không nghỉ" },
];

function WorkflowDemo() {
  const [flowIndex, setFlowIndex] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const [typing, setTyping] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const timer = useRef<number | null>(null);
  const flow = flows[flowIndex];

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const run = (index: number) => {
    if (timer.current) window.clearTimeout(timer.current);
    setFlowIndex(index);
    const steps = flows[index].steps;
    const reduced = window.matchMedia(MQ.reduced).matches;
    if (reduced) {
      setLines(steps);
      setTyping("");
      setStatus("done");
      return;
    }
    setLines([]);
    setStatus("running");
    let line = 0;
    let char = 0;
    const tick = () => {
      const text = steps[line];
      char++;
      setTyping(text.slice(0, char));
      if (char < text.length) {
        timer.current = window.setTimeout(tick, 16 + Math.random() * 18);
        return;
      }
      setLines((prev) => [...prev, text]);
      setTyping("");
      line++;
      char = 0;
      if (line < steps.length) timer.current = window.setTimeout(tick, 380);
      else setStatus("done");
    };
    timer.current = window.setTimeout(tick, 300);
  };

  const stamp = (i: number) => `00:0${Math.floor((i * 7) / 10)}.${String((i * 7) % 10)}${i}`;

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <p className="sg-mono text-(--t-muted)">Chọn một luồng việc</p>
        <div role="group" aria-label="Luồng việc mẫu" className="mt-5 flex flex-col gap-2">
          {flows.map((f, i) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={i === flowIndex && status !== "idle"}
              onClick={() => run(i)}
              className="group flex items-center justify-between border border-(--t-line) px-4 py-3.5 text-left transition-colors hover:border-(--t-accent) aria-pressed:border-(--t-accent) aria-pressed:bg-(--t-accent) aria-pressed:text-(--t-on-accent)"
            >
              <span>{f.label}</span>
              <span aria-hidden className="sg-mono">Chạy ▶</span>
            </button>
          ))}
        </div>
        <p className="mt-6 text-sm leading-relaxed text-(--t-muted)">
          Mô phỏng chạy ngay trong trình duyệt để minh họa cách một luồng việc hoạt động. Không có dữ liệu thật nào được đọc hay gửi đi.
        </p>
      </div>

      <div className="border border-(--t-line) bg-(--t-panel) lg:col-span-8">
        <div className="sg-mono flex items-center gap-3 border-b border-(--t-line) px-4 py-3 text-(--t-muted)">
          <span aria-hidden className="flex gap-1.5">
            <span className="size-2 rounded-full bg-(--t-line)" />
            <span className="size-2 rounded-full bg-(--t-line)" />
            <span className="size-2 rounded-full bg-(--t-accent)" />
          </span>
          <span className="normal-case">mach run --flow={flow.id}</span>
          <span className="ml-auto">{status === "running" ? "đang chạy" : status === "done" ? "hoàn tất" : "sẵn sàng"}</span>
        </div>
        <div className="min-h-[22rem] p-5 font-(family-name:--t-font-mono) text-[0.85rem] leading-[1.9]">
          {status === "idle" && (
            <p className="text-(--t-muted)">
              Chọn một luồng việc bên trái để chạy thử <span className="sg-caret" />
            </p>
          )}
          <ol>
            {lines.map((l, i) => (
              <li key={i} className="flex gap-4">
                <span className="text-(--t-muted)">{stamp(i + 1)}</span>
                <span>
                  <span className="text-(--t-accent)">✓</span> {l}
                </span>
              </li>
            ))}
            {typing && (
              <li className="flex gap-4">
                <span className="text-(--t-muted)">{stamp(lines.length + 1)}</span>
                <span>
                  <span className="text-(--t-accent)">›</span> {typing}
                  <span className="sg-caret" />
                </span>
              </li>
            )}
          </ol>
          <div aria-live="polite">
            {status === "done" && (
              <p className="mt-6 inline-flex items-center gap-3 bg-(--t-accent) px-4 py-2 text-(--t-on-accent)">
                <span aria-hidden>■</span> Kết quả: {flow.result}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Signal() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.anyMotion, () => {
        const title = root.current?.querySelector<HTMLElement>("[data-sg-title]");
        if (title) {
          SplitText.create(title, {
            type: "words,chars",
            mask: "lines",
            autoSplit: true,
            onSplit(self) {
              return gsap.from(self.chars, {
                yPercent: 110,
                opacity: 0,
                duration: 1.1,
                ease: "expo.out",
                stagger: { each: 0.018, from: "random" },
                delay: 0.2,
              });
            },
          });
        }
        gsap.from("[data-sg-fade]", { opacity: 0, y: 24, duration: 1, ease: "expo.out", stagger: 0.08, delay: 0.7 });

        // Gạch ngang từng vấn đề theo cuộn
        gsap.utils.toArray<HTMLElement>(".sg-strike").forEach((el) => {
          gsap.fromTo(
            el,
            { "--strike": 0 },
            { "--strike": 1, ease: "none", scrollTrigger: { trigger: el, start: "top 75%", end: "top 45%", scrub: true } },
          );
        });

        // Đếm số (minh họa)
        gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
          const target = Number(el.dataset.count);
          const obj = { v: 0 };
          gsap.to(obj, {
            v: target,
            duration: 1.8,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
            onUpdate: () => {
              el.textContent = String(Math.round(obj.v));
            },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="tpl tpl-signal">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-(--t-line) bg-(--t-bg)/80 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between gap-6">
          <a href="#dau-trang" className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
            <span aria-hidden className="size-2.5 bg-(--t-accent)" />
            MẠCH
          </a>
          <nav aria-label="Điều hướng MẠCH" className="hidden md:block">
            <ul className="sg-mono flex gap-8 text-(--t-muted)">
              {[
                ["Vấn đề", "#van-de"],
                ["Chạy thử", "#chay-thu"],
                ["Tính năng", "#tinh-nang"],
                ["Tích hợp", "#tich-hop"],
              ].map(([label, href]) => (
                <li key={href}>
                  <a href={href} className="transition-colors hover:text-(--t-fg)">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-5">
            <span className="sg-mono hidden items-center gap-2 text-(--t-muted) lg:flex">
              <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-(--t-accent)" /> Hoạt động (minh họa)
            </span>
            <a href="#demo-ket" className="sg-mono border border-(--t-accent) px-4 py-2.5 text-(--t-accent) transition-colors hover:bg-(--t-accent) hover:text-(--t-on-accent)">
              Dùng thử
            </a>
          </div>
        </div>
      </header>

      {/* HERO: trường sóng */}
      <section id="dau-trang" aria-labelledby="sg-title" className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pt-24 pb-10">
        <ShaderCanvas fragment={FIELD} className="absolute inset-0 size-full" />
        <div aria-hidden className="sg-dots pointer-events-none absolute inset-0 opacity-40" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-linear-to-t from-(--t-bg) via-(--t-bg)/85 to-transparent" />
        <div className="container-page relative">
          <p data-sg-fade className="sg-mono text-(--t-accent)">
            [ Nền tảng tự động hóa quy trình bằng AI ]
          </p>
          <h1 id="sg-title" data-sg-title className="sg-sharp mt-6 max-w-[14ch] text-[clamp(3rem,1.2rem+7.6vw,9rem)] leading-[0.92] tracking-[-0.045em]">
            Biến dữ liệu rời rạc thành <em>quyết định.</em>
          </h1>
          <div className="mt-12 grid gap-8 border-t border-(--t-line) pt-6 md:grid-cols-12 md:items-end">
            <p data-sg-fade className="max-w-[34rem] text-lg leading-relaxed text-(--t-muted) md:col-span-6">
              MẠCH đọc email, chứng từ và bảng tính của doanh nghiệp, rồi tự chạy những luồng việc lặp lại: nhập liệu, đối soát, báo cáo.
            </p>
            <div data-sg-fade className="flex flex-wrap gap-3 md:col-span-6 md:justify-end">
              <a href="#chay-thu" className="bg-(--t-accent) px-6 py-3.5 font-medium text-(--t-on-accent) transition-transform hover:-translate-y-0.5">
                Chạy thử ngay ↓
              </a>
              <a href="#tinh-nang" className="border border-(--t-line) px-6 py-3.5 transition-colors hover:border-(--t-fg)">
                Xem tính năng
              </a>
            </div>
          </div>
          <p data-sg-fade className="sg-mono mt-8 flex flex-wrap justify-between gap-4 text-(--t-muted)">
            <span>v2.6 · bản demo</span>
            <span className="hidden md:inline">Rê chuột để lọc nhiễu · cuộn để làm dịu tín hiệu</span>
            <span>↓ Cuộn</span>
          </p>
        </div>
      </section>

      {/* VẤN ĐỀ → GIẢI PHÁP */}
      <section id="van-de" aria-labelledby="sg-van-de" className="relative py-28 lg:py-40">
        <div className="container-page grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="sg-mono text-(--t-muted)">[01] Vấn đề</p>
            <h2 id="sg-van-de" className="mt-5 text-[clamp(2.2rem,1.4rem+3vw,4.2rem)] leading-[1.02] tracking-[-0.035em]">
              Đội ngũ giỏi đang làm việc của máy.
            </h2>
            <ul className="mt-12 space-y-6 text-xl leading-snug text-(--t-muted) lg:text-2xl">
              {pains.map((p) => (
                <li key={p}>
                  <span className="sg-strike">{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-6 lg:pt-32">
            <SheetRise className="bg-(--t-accent) p-8 text-(--t-on-accent) lg:p-12" radius="2.5rem">
              <p className="sg-mono">[02] Giải pháp</p>
              <p className="mt-6 text-[clamp(1.8rem,1.2rem+2vw,3rem)] leading-[1.08] font-medium tracking-[-0.03em]">
                Một đồng nghiệp số làm phần lặp lại, để con người làm phần cần phán đoán.
              </p>
              <ul className="mt-10 space-y-3 border-t border-current/20 pt-6">
                {["Chạy theo quy tắc của chính doanh nghiệp", "Hỏi lại khi gặp trường hợp lạ", "Mọi bước đều có nhật ký để kiểm tra"].map((t) => (
                  <li key={t} className="flex gap-3">
                    <span aria-hidden>→</span>
                    {t}
                  </li>
                ))}
              </ul>
            </SheetRise>
          </div>
        </div>
      </section>

      {/* CHẠY THỬ */}
      <section id="chay-thu" aria-labelledby="sg-chay-thu" className="sg-dots border-y border-(--t-line) py-28 lg:py-36">
        <div className="container-page">
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="sg-mono text-(--t-muted)">[03] Chạy thử</p>
              <h2 id="sg-chay-thu" className="sg-sharp mt-5 text-[clamp(2.2rem,1.4rem+3vw,4.2rem)] leading-[1.02] tracking-[-0.035em]">
                Xem một luồng việc <em>tự chạy.</em>
              </h2>
            </div>
          </div>
          <WorkflowDemo />
        </div>
      </section>

      {/* TÍNH NĂNG */}
      <section id="tinh-nang" aria-labelledby="sg-tinh-nang" className="py-28 lg:py-40">
        <div className="container-page">
          <p className="sg-mono text-(--t-muted)">[04] Tính năng</p>
          <h2 id="sg-tinh-nang" className="mt-5 max-w-[18ch] text-[clamp(2.2rem,1.4rem+3vw,4.2rem)] leading-[1.02] tracking-[-0.035em]">
            Bốn việc, làm đúng thứ tự.
          </h2>
          <ol className="mt-16 border-b border-(--t-line)">
            {features.map((f, i) => (
              <li key={f.name} data-scramble-host className="sg-row grid gap-4 border-t border-(--t-line) py-8 md:grid-cols-12 md:items-baseline lg:py-10">
                <span className="sg-mono text-(--t-accent) md:col-span-1">0{i + 1}</span>
                <h3 className="text-[clamp(2rem,1.2rem+3.4vw,5rem)] leading-none tracking-[-0.04em] md:col-span-6">
                  <TextScramble text={f.name} />
                </h3>
                <p className="max-w-[30rem] leading-relaxed text-(--t-muted) md:col-span-5">{f.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* TÍCH HỢP */}
      <section id="tich-hop" aria-labelledby="sg-tich-hop" className="overflow-hidden border-t border-(--t-line) py-28 lg:py-36">
        <div className="container-page grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="sg-mono text-(--t-muted)">[05] Tích hợp</p>
            <h2 id="sg-tich-hop" className="mt-5 text-[clamp(2.2rem,1.4rem+3vw,4.2rem)] leading-[1.02] tracking-[-0.035em]">
              Nối vào công cụ đội ngũ đang dùng.
            </h2>
            <p className="mt-6 leading-relaxed text-(--t-muted)">
              Không bắt cả công ty đổi phần mềm. MẠCH đọc và ghi vào các nhóm công cụ quen thuộc. Rê chuột lên quỹ đạo để dừng lại.
            </p>
          </div>
          <div className="sg-orbits relative mx-auto aspect-square w-full max-w-[36rem] max-sm:scale-[0.62] lg:col-span-8">
            {orbits.map((o) => (
              <div key={o.r} className="sg-orbit" style={{ width: o.r, height: o.r, "--dur": o.dur } as CSSProperties}>
                {o.nodes.map((n, i) => (
                  <div key={n} className="sg-orbit-node" style={{ "--a": `${(360 / o.nodes.length) * i}deg`, "--r": o.r, "--dur": o.dur } as CSSProperties}>
                    <span className="sg-mono whitespace-nowrap border border-(--t-line) bg-(--t-bg) px-2.5 py-1.5 text-(--t-fg)">{n}</span>
                  </div>
                ))}
              </div>
            ))}
            <div className="absolute inset-0 m-auto grid size-28 place-items-center rounded-full bg-(--t-accent) font-semibold text-(--t-on-accent)">MẠCH</div>
          </div>
        </div>
      </section>

      {/* SỐ LIỆU */}
      <section aria-labelledby="sg-so-lieu" className="border-t border-(--t-line) py-24">
        <div className="container-page">
          <h2 id="sg-so-lieu" className="sg-mono text-(--t-muted)">
            [06] Kết quả điển hình · số liệu minh họa
          </h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {stats.map((s) => (
              <li key={s.label} className="border border-(--t-line) p-7">
                <p className="text-[clamp(3rem,2rem+3vw,5.5rem)] leading-none tracking-[-0.05em]">
                  <span data-count={s.value}>{s.value}</span>
                  <span className="text-(--t-accent)">{s.suffix}</span>
                </p>
                <p className="mt-4 text-(--t-muted)">{s.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section aria-labelledby="sg-cta" className="border-t border-(--t-line) py-24 lg:py-32">
        <h2 id="sg-cta" className="sr-only">
          Bắt đầu với một luồng việc
        </h2>
        <VelocityMarquee speed={0.9}>
          {["Bắt đầu với một luồng việc", "Đo trước khi mở rộng"].map((t) => (
            <span key={t} aria-hidden className="flex items-center text-[clamp(3.5rem,2rem+7vw,10rem)] leading-none tracking-[-0.05em]">
              {t}
              <span className="mx-[0.4em] text-(--t-accent)">✳</span>
            </span>
          ))}
        </VelocityMarquee>
        <div className="container-page mt-14 flex justify-center">
          <Magnetic>
            <a href="#demo-ket" className="grid size-40 place-items-center rounded-full bg-(--t-accent) text-center font-medium text-(--t-on-accent)">
              Đặt lịch
              <br />
              demo ↗
            </a>
          </Magnetic>
        </div>
      </section>
    </div>
  );
}
