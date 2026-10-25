# Thư viện tương tác (đã lọc từ nghiên cứu Emotion + Awwwards)

Nguồn: ghi hình tương tác thật bằng `design-research/scripts/record-interactions.mjs` (quét chuột, hover, cuộn chậm/nhanh, kéo thả) trên emotion-agency.com, flshfrm.com, relivebycoco.com, signal-a.studio, phsofia.com, kshinfo.com, kairosfund.io, aura.brightid.org + bảng Site of the Day của Awwwards. Chỉ giữ những tương tác **đo được có phản hồi rõ** (Δ khung hình lớn khi hover/kéo) và **làm cảm xúc rõ hơn**, không phải hiệu ứng cho có.

Mọi thành phần nằm ở `src/components/fx/*` (client component, tự dọn dẹp, tự tắt khi `prefers-reduced-motion` hoặc không có chuột). Nội dung luôn ở HTML thật; hiệu ứng chỉ là lớp trình bày.

## Quy tắc chọn

- Mỗi trang: **1 signature** (bảng dưới, cột "Cấp" = S) + **2–4 tương tác phụ** (cấp A) + vi tương tác (cấp B) tùy ý.
- Ít nhất **1 tương tác người dùng chủ động** ngoài cuộn: kéo, chọn, lật, gõ, đặt lịch.
- Không dùng hai hiệu ứng theo chuột "nặng" (ImageDistort, MistCursor, ImageTrail) trong cùng một khung nhìn.

## Bảng tra nhanh

| Tương tác | Cấp | Thấy ở | Thành phần | Hợp với |
|---|---|---|---|---|
| Dải ảnh kéo được **cong theo vận tốc** | S | Sofia Shcherbak | `DragSlider bend` | Thời trang, ảnh, du lịch, F&B |
| Danh sách dự án: **ảnh theo con trỏ** + tên **xáo chữ** | S | Signal-A | `CursorPreview` + `TextScramble` | Agency, truyền thông, portfolio, thực đơn |
| **Sương/khói theo chuột** (feedback buffer) | S | Emotion | `MistCursor` | Wellness, mỹ phẩm, sáng tạo |
| Ảnh **phồng/méo + tách RGB** khi rê | S | Awwwards (nhiều SOTD) | `ImageDistortLayer` + `data-distort` | Thời trang, F&B, du lịch |
| Hero **vật thể shader** xoay theo chuột, chìm khi cuộn | S | Flashform | `ShaderCanvas` + `BLOOM` (legacy) | SaaS, AI |
| **Sticker kéo thả** có quán tính | S | Awwwards (edu/kid) | `Stickers` | Giáo dục trẻ, tiếng Anh, sự kiện |
| Headline **từng ký tự lắng xuống** khi cuộn | A | Flashform | `CharWave` | Mọi ngành, câu chốt |
| Section mới **trồi lên như tấm thẻ** (scale 0.9→1, bo góc→0) | A | Flashform | `SheetRise` | Chuyển chương |
| Ảnh **lộ qua clip-path** + parallax bên trong | A | KSH, Kairos | `ScrollParallax` | Kiến trúc, giáo dục, du học |
| Chữ chạy **theo tốc độ cuộn** (đảo chiều khi cuộn ngược) | A | Emotion, Signal-A | `VelocityMarquee` | Agency, F&B, sự kiện |
| Khối **nghiêng theo vận tốc cuộn** | A | Awwwards | `VelocitySkew` | Lưới ảnh, catalogue |
| **Ảnh theo đuôi chuột** rồi mờ | A | Fashion SOTD | `ImageTrail` | Thời trang, ảnh |
| **Thẻ xếp chồng** khi cuộn (sticky, thẻ cũ thu nhỏ/tối) | A | Awwwards | `StackCards` | Quy trình, lộ trình, chương trình học |
| **Bút dạ quang quét** dưới chữ khi vào khung | B | Emotion | `MarkerHighlight` | Từ khóa trong câu statement |
| **Ảnh đổi biến thể** khi hover | B | Relive by Coco | CSS `.hover-swap` (dưới) | Sản phẩm, món ăn |
| **Thẻ lật** (mặt trước/sau) | B | edu SOTD | `FlipCard` | Từ vựng, FAQ, thực đơn |
| Đường bay **tự vẽ** + vật thể chạy theo đường | A | Awwwards travel | `DrawSVG`/dashoffset + `MotionPathPlugin` | Du học, du lịch, logistics |
| Con trỏ có **nhãn** ("Kéo ↔", "Xem ↗") | B | Emotion | `data-cursor="view|drag"` + `data-cursor-label` | Mọi nơi có kéo/xem |
| Nút **magnetic** / text roll | B | Emotion | `src/components/ui/{Magnetic,Button}` | CTA |

## Công thức chi tiết

### 1. DragSlider bend (Sofia): dải ảnh cong khi kéo
```tsx
<DragSlider label="Bộ sưu tập" bend trackClassName="gap-4 px-[6vw]">
  {looks.map((l) => <figure key={l.id} className="drag-item w-[22vw] shrink-0">…</figure>)}
</DragSlider>
```
- Mỗi con trực tiếp của track nhận `--bend-y` (px) và `--bend-r` (deg) theo vị trí so với tâm viewport × vận tốc đã làm mượt; CSS sẵn `.drag-bend > * { transform: translateY(var(--bend-y)) rotate(var(--bend-r)) }`.
- Cảm giác đúng: đứng yên = phẳng; kéo nhanh = cong thành cung (hai mép bị kéo theo), thả ra thì phẳng lại trong ~0.6s.
- Kết hợp `--drag-skew` cho ảnh bên trong (`skewX(var(--drag-skew))`) nếu muốn mạnh hơn.

### 2. CursorPreview (Signal-A): hàng danh sách + ảnh bám con trỏ
```tsx
<CursorPreview>
  {items.map((it) => (
    <a key={it.slug} href="#…" data-preview={it.image} className="row …">
      <TextScramble text={it.name} />
    </a>
  ))}
</CursorPreview>
```
- Một khung ảnh duy nhất (fixed), bám con trỏ với `quickTo(duration 0.6, power3)`, xoay nhẹ theo vận tốc ngang.
- Đổi hàng → ảnh mới lộ bằng `clip-path inset(100% 0 0 0) → 0` 0.5s; rời danh sách → scale 0.6 + opacity 0.
- Không có chuột: khung ẩn; hãy hiển thị ảnh nhỏ trong hàng ở mobile (`md:hidden`).

### 3. MistCursor (Emotion): sương mờ theo chuột
```tsx
<MistCursor color="#ffffff" className="absolute inset-0" />   // đặt trong hero có position: relative
```
- WebGL2, 2 framebuffer ping-pong: mỗi frame đọc khung trước, **dịch theo nhiễu cuộn** (advection rẻ), **nhân suy giảm 0.975**, cộng "splat" Gaussian tại con trỏ (bán kính tăng theo tốc độ).
- Độ phân giải 1/4 màn hình là đủ (sương vốn mờ). Không có WebGL2 / không chuột / giảm chuyển động → không render gì.
- Đặt **dưới** chữ (z thấp hơn), chữ màu đậm để đọc được khi sương trắng phủ qua.

### 4. Stickers: kéo thả có quán tính
```tsx
<Stickers className="absolute inset-0">
  <Sticker x="12%" y="20%" rotate={-8}>Hello!</Sticker>
</Stickers>
```
- GSAP `Draggable` + `InertiaPlugin`, `bounds` = vùng cha, `edgeResistance 0.7`, khi nhấc lên scale 1.08 + bóng đổ, thả xuống rung nhẹ (`elastic.out`).
- Trang trí nên `aria-hidden`; nội dung thật không nằm trong sticker.

### 5. StackCards: thẻ xếp chồng
- Mỗi thẻ `position: sticky; top: calc(10vh + i * 1.2rem)`; ScrollTrigger scrub làm thẻ **phía dưới** scale 1 → 0.92 và tối dần khi thẻ kế tiếp trồi lên.
- Không cần pin JS, nên mượt trên mobile. Reduced motion: chỉ còn sticky.

### 6. MarkerHighlight
```tsx
<p>Chúng tôi <MarkerHighlight>đồng hành</MarkerHighlight> từ ngày đầu.</p>
```
- `background: linear-gradient(var(--marker), var(--marker)) no-repeat 0 85% / 0% 40%` → `100% 40%` khi vào khung (IntersectionObserver, 0.9s `cubic-bezier(.7,0,.2,1)`). Màu đặt bằng `--marker` ở token của mẫu.

### 7. Hover swap (Relive), chỉ CSS
```css
.hover-swap { display: grid; }
.hover-swap > * { grid-area: 1 / 1; }
.hover-swap > :last-child { clip-path: inset(0 0 100% 0); transition: clip-path .7s cubic-bezier(.7,0,.2,1); }
@media (hover: hover) { .hover-swap:hover > :last-child { clip-path: inset(0); } }
```

### 8. FlipCard
- `<button aria-pressed>` bọc 2 mặt; `transform-style: preserve-3d; rotateY(180deg)` khi bật; mặt sau `backface-visibility: hidden`. Reduced motion: đổi mặt bằng cross-fade.

### 9. Đường bay tự vẽ + máy bay chạy theo
```ts
gsap.registerPlugin(MotionPathPlugin);
const tl = gsap.timeline({ scrollTrigger: { trigger: map, start: "top 70%", end: "bottom 40%", scrub: 1 } });
tl.fromTo(path, { strokeDashoffset: len }, { strokeDashoffset: 0, ease: "none" }, 0)
  .to(plane, { motionPath: { path, align: path, autoRotate: true, alignOrigin: [0.5, 0.5] }, ease: "none" }, 0);
```

## Thông số chuyển động chuẩn (dùng lại cho nhất quán)

| Loại | Thời lượng | Ease |
|---|---|---|
| Reveal chữ theo dòng | 1.1–1.3s, stagger 0.08 | `expo.out` |
| Clip-path ảnh | 1.2–1.6s | `expo.out` hoặc `power4.inOut` |
| Hover đổi trạng thái | 0.4–0.7s | `cubic-bezier(.7,0,.2,1)` |
| Bám con trỏ | quickTo 0.5–0.7s | `power3` |
| Quán tính kéo | lerp 0.085/frame | (tự tính) |
| Scrub | `scrub: 1` (có độ trễ mượt) | `none` |
