---
name: motion-engineering
description: Hiện thực chuyển động cấp Awwwards trong Next.js App Router với GSAP 3.15 (ScrollTrigger, SplitText, useGSAP) và Lenis 1.3. Dùng khi cần smooth scroll, pin/scrub, split-text reveal, preloader, cursor tùy biến, nút magnetic, horizontal scroll, đếm số, vẽ nét SVG theo cuộn.
---

# Motion engineering

Thư viện (đã cài): `gsap@3.15` (mọi plugin miễn phí, gồm SplitText), `@gsap/react@2` (`useGSAP`), `lenis@1.3`.

## Luật bắt buộc

1. **Nội dung không phụ thuộc JS.** Trạng thái ẩn ban đầu chỉ áp dụng khi `<html data-motion="on">`. Thuộc tính này được set bởi script inline đầu `<head>` khi **không** bật reduced-motion. Thiếu JS hoặc reduced-motion thì mọi thứ hiển thị bình thường.
2. **Mọi animation đặt trong `useGSAP` (hoặc `gsap.context`)** để tự dọn khi unmount. Không tạo ScrollTrigger ngoài context.
3. **`gsap.matchMedia()`** tách logic desktop/mobile/reduced-motion. Pin + scrub dài chỉ chạy khi `(min-width: 64rem) and (prefers-reduced-motion: no-preference)`.
4. **Chỉ animate `transform`, `opacity`, `clip-path`, biến CSS.** Không animate width/height/top/left.
5. **Một vòng RAF duy nhất:** Lenis chạy bằng `gsap.ticker`, gọi `ScrollTrigger.update` trong sự kiện scroll của Lenis.
6. **Split text tiếng Việt:** split theo `words` hoặc `lines`; khi dùng `mask: "lines"`, thêm padding cho mask để không cắt dấu (xem `recipes.md`). Dùng `autoSplit: true` + `onSplit` để tự split lại khi font tải xong hoặc resize.
7. **Font phải tải xong trước khi đo:** `await document.fonts.ready` trước khi tạo ScrollTrigger phụ thuộc layout, rồi `ScrollTrigger.refresh()`.
8. **Touch:** không ép smooth-scroll trên touch (Lenis mặc định `syncTouch: false`). Cursor/magnetic chỉ bật khi `(hover: hover) and (pointer: fine)`.

## Kiến trúc trong dự án Next.js

```
src/components/motion/
  MotionProvider.tsx   ← client: đăng ký plugin, tạo Lenis, nối với ScrollTrigger, expose lenis qua context
  Reveal.tsx / SplitReveal.tsx  ← reveal tái sử dụng
  Cursor.tsx, Magnetic.tsx, Preloader.tsx
src/lib/motion.ts      ← gsap + plugin đã đăng ký (import từ đây, không import gsap trực tiếp ở nhiều nơi)
```

Công thức chi tiết: `references/recipes.md`. Ví dụ đang chạy thật trong dự án: `src/components/motion/*`, `src/components/sections/*`.

## Checklist trước khi bàn giao

- [ ] Reduced-motion: không pin, không Lenis, nội dung đầy đủ (kiểm tra bằng `page.emulateMedia({ reducedMotion: "reduce" })`).
- [ ] Resize desktop → mobile không vỡ pin (`ScrollTrigger.refresh` tự chạy; kiểm tra `invalidateOnRefresh` với giá trị tính theo kích thước).
- [ ] Anchor link vẫn tới đúng section (Lenis `anchors: { offset }` hoặc `lenis.scrollTo`).
- [ ] Không lỗi console, không cảnh báo "GSAP target not found".
- [ ] 60fps khi cuộn (Performance panel, hoặc đo `requestAnimationFrame` delta trong Playwright).

## Bộ tương tác dựng sẵn

Trước khi tự viết, kiểm tra `src/components/fx/*` (DragSlider có `bend`, CursorPreview, TextScramble, MistCursor, ImageDistortLayer, ImageTrail, VelocityMarquee, VelocitySkew, CharWave, SheetRise, ScrollParallax, StackCards, Stickers, FlipCard, MarkerHighlight). Cách dùng và thông số chuẩn: `.claude/skills/style-library/references/interaction-recipes.md`.
