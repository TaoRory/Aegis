# Công thức chuyển động (GSAP 3.15 + Lenis 1.3 + Next.js App Router)

## 1. Đăng ký plugin một lần (`src/lib/motion.ts`)

```ts
"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
export { gsap, ScrollTrigger, SplitText, useGSAP };

export const MQ = {
  desktopMotion: "(min-width: 64rem) and (prefers-reduced-motion: no-preference)",
  anyMotion: "(prefers-reduced-motion: no-preference)",
  fineHover: "(hover: hover) and (pointer: fine)",
};
```

## 2. Bật cờ motion trước khi vẽ (trong `<head>` của layout)

```tsx
<script
  dangerouslySetInnerHTML={{
    __html: `if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.dataset.motion='on'`,
  }}
/>
```
CSS chỉ ẩn khi có cờ: `[data-motion="on"] .will-reveal { opacity: 0 }`. Thêm failsafe: sau 3s nếu JS lỗi thì hiện lại (`animation: failsafe 0s 3s forwards`).

## 3. Lenis + ScrollTrigger dùng chung ticker

```tsx
useEffect(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -80 }, autoRaf: false });
  lenis.on("scroll", ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => { gsap.ticker.remove(tick); lenis.destroy(); };
}, []);
```
Khi mở modal/menu: `lenis.stop()` / `lenis.start()`.

## 4. Split-line mask reveal (an toàn với dấu tiếng Việt)

```tsx
useGSAP(() => {
  SplitText.create(ref.current, {
    type: "lines",
    mask: "lines",
    linesClass: "split-line",
    autoSplit: true,
    onSplit: (self) =>
      gsap.from(self.lines, {
        yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.08,
        scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
      }),
  });
}, { scope: ref });
```
```css
/* mask do SplitText tạo ra có class "split-line-mask" (linesClass + "-mask") */
.split-line-mask { padding-block: 0.16em; margin-block: -0.16em; }
```
`onSplit` trả về animation để SplitText tự revert/khởi tạo lại khi split lại.

## 5. Pin + scrub một chương

```ts
const mm = gsap.matchMedia();
mm.add(MQ.desktopMotion, () => {
  const tl = gsap.timeline({
    scrollTrigger: { trigger: section, start: "top top", end: "+=300%", pin: true, scrub: 1, anticipatePin: 1 },
  });
  tl.to(progressObj, { value: 1, ease: "none" });
});
```
Đọc tiến độ từ `self.progress` trong `onUpdate` để điều khiển WebGL (uniform) hoặc biến CSS.

## 6. Horizontal scroll track

```ts
mm.add(MQ.desktopMotion, () => {
  const distance = () => track.scrollWidth - window.innerWidth;
  gsap.to(track, {
    x: () => -distance(), ease: "none",
    scrollTrigger: { trigger: section, start: "top top", end: () => "+=" + distance(), pin: true, scrub: 1, invalidateOnRefresh: true },
  });
});
```

## 7. Vẽ nét SVG theo cuộn

```ts
const len = path.getTotalLength();
gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
gsap.to(path, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger, start: "top 70%", end: "bottom 60%", scrub: true } });
```
Thêm `vector-effect: non-scaling-stroke` để nét không dày lên khi SVG co giãn.

## 8. Đếm số (chỉ với số liệu thật)

```ts
const obj = { v: 0 };
gsap.to(obj, { v: target, duration: 1.6, ease: "power3.out", onUpdate: () => (el.textContent = String(Math.round(obj.v)).padStart(2, "0")),
  scrollTrigger: { trigger: el, start: "top 85%", once: true } });
```

## 9. Cursor follower có nhãn

- Dùng `gsap.quickTo(el, "x", { duration: 0.45, ease: "power3" })` cho x/y.
- Phần tử nào muốn đổi trạng thái thì gắn `data-cursor="view"` + `data-cursor-label="Xem"`. Cursor lắng nghe `pointerover` ở document (một listener).
- Chỉ mount khi `matchMedia(MQ.fineHover)`. `pointer-events: none`, `aria-hidden`.

## 10. Nút magnetic

```ts
const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
el.onpointermove = (e) => { const r = el.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.35); yTo((e.clientY - r.top - r.height / 2) * 0.35); };
el.onpointerleave = () => { xTo(0); yTo(0); };
```

## 11. Text roll (hover link)

HTML: `<span class="roll"><span data-text="Dịch vụ">Dịch vụ</span></span>`; CSS dùng `::after { content: attr(data-text) }` nằm dưới, hover thì `translateY(-100%)` cả khối. Không cần JS.

## 12. Preloader đếm số

- Overlay `position: fixed`, chỉ render khi `data-motion="on"` và chưa xem trong phiên (`sessionStorage`).
- Timeline: đếm 0→100 (≈1.2s, gắn với `document.fonts.ready`), wordmark trượt lên, overlay `clipPath: inset(0 0 100% 0)`.
- **Timeout cứng 2.5s**; khi xong thì phát event `aegis:intro-done` để hero bắt đầu animation.
- `aria-hidden="true"` cho overlay, focus không bị giữ.

## 13. Đổi màu nền theo chương

Gắn `data-theme="dark|light"` cho section; ScrollTrigger `onEnter/onEnterBack` set `document.documentElement.dataset.surface`; CSS chuyển màu biến `--bg/--fg` với `transition: background-color .6s`.

## 14. Bài học đã gặp thật (website Aegis)

- **mix-blend-mode trên header:** phần tử `fixed` có `z-index` tạo stacking context, nên con bên trong chỉ blend với nền trong suốt của chính nó. Đặt `mix-blend-mode: difference` **trên chính thẻ fixed**, và tách CTA màu (không muốn blend) ra một lớp fixed riêng.
- **Header đè nội dung khi cuộn:** ẩn khi cuộn xuống, hiện khi cuộn lên (`translateY(-110%)`, ngưỡng ≥ 6px, chỉ sau 60% viewport).
- **Mask padding chặn click:** `.split-line-mask` nới padding để không cắt dấu sẽ tràn lên phần tử phía trên. Hãy đặt phần tử phía trên `position: relative; z-index` cao hơn và chừa khoảng cách.
- **`overflow: hidden` xén glyph khi tracking âm:** dùng `clip-path: inset(-40% -30% 0 -30%)` (chỉ cắt cạnh dưới) cho hiệu ứng chữ trồi lên, kèm `padding-bottom` cho phần thò xuống (g, y, p).
- **Utility Tailwind thắng `@layer components`:** đừng đặt class `block`/`flex` trên phần tử mà CSS component cần ẩn/hiện theo media query; để CSS component quản lý `display`.
- **Track ngang `width: max-content`:** quãng chạy = `track.scrollWidth − track.parentElement.clientWidth` (không dùng `track.clientWidth`).
- **Liên kết tới nội dung bên trong đoạn ghim:** chặn click ở capture phase và cuộn tới `st.start + tỉ lệ × (st.end − st.start)`.
- **Ảnh nổi theo con trỏ:** đặt vị trí ngay từ `pointerenter` (gsap.set) để ảnh không bay từ (0,0).
- **Fit-text wordmark:** đo bằng ResizeObserver: `fontSize = current × available / scrollWidth`, gọi lại sau `document.fonts.ready`.
