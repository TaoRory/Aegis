---
name: Aegis
description: Bản vẽ nền móng sống: website công nghệ cho doanh nghiệp, ngôn ngữ bản vẽ kỹ thuật trên nền teal đậm.
colors:
  deep-ink-teal: "#071F1E"
  ink-raised: "#062E30"
  transformative-teal: "#13B5A5"
  aqua-glow: "#84E4D6"
  soft-aqua: "#C9F8F0"
  cloud-dancer: "#F5F7F6"
  ink-neutral: "#0B0F14"
  paper: "color-mix(in oklab, #C9F8F0 28%, #F5F7F6)"
  paper-deep: "color-mix(in oklab, #C9F8F0 46%, #F5F7F6)"
  paper-light: "color-mix(in oklab, #C9F8F0 12%, #F5F7F6)"
  blend-fg: "#E7FFFE"
  mineral-grey: "#8B9CA1"
  graphite-mid: "#7D8F94"
  graphite: "#4A5B59"
  graphite-subtle: "#5C6D6B"
  teal-deep: "#0A7369"
  teal-darker: "#075E56"
  danger: "#C2362F"
  danger-light: "#FF8A80"
  success: "#1D7A4F"
  success-light: "#6FDCAA"
  warning: "#8A5A00"
  warning-light: "#F5C66B"
typography:
  hero:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3.4rem, 0.9rem + 8.8vw, 11.5rem)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 1.2rem + 4.4vw, 6.25rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.7rem, 1.2rem + 2.4vw, 3.7rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  statement:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 1.05rem + 2.75vw, 4rem)"
    lineHeight: 1.16
    letterSpacing: "-0.025em"
  accent-italic:
    fontFamily: "Newsreader, ui-serif, Georgia, serif"
    fontWeight: 400
    letterSpacing: "-0.01em"
  lead:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.15rem, 1.02rem + 0.5vw, 1.55rem)"
    lineHeight: 1.6
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.12em"
rounded:
  sm: "2px"
  md: "4px"
  lg: "6px"
  sheet: "3rem"
  pill: "999px"
spacing:
  gutter: "clamp(1rem, 0.4rem + 2.6vw, 3rem)"
  section-y: "clamp(6rem, 4rem + 8vw, 12rem)"
  header-h: "4.75rem"
  layout-max: "96rem"
components:
  button-primary:
    backgroundColor: "{colors.transformative-teal}"
    textColor: "{colors.deep-ink-teal}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    height: "48px"
    padding: "0 20px"
  button-primary-hover:
    backgroundColor: "{colors.aqua-glow}"
  button-outline:
    textColor: "{colors.cloud-dancer}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    height: "48px"
    padding: "0 20px"
  round-button:
    backgroundColor: "{colors.transformative-teal}"
    textColor: "{colors.deep-ink-teal}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    width: "9.5rem"
---

# Design System: Aegis

> Ghi lại hệ thống **đang chạy** (nguồn: `src/styles/tokens.css`, `globals.css`, `effects.css`, `fonts.ts`), không đề xuất thay đổi. Phần "Hệ thống" trong `.claude/skills/aegis-context/references/art-direction.md` còn ghi màu ultramarine cũ; file này và `tokens.css` là bản đúng.

## Overview

**Creative North Star: "Bản vẽ nền móng"**

Aegis là người dựng nền móng. Website là một tờ bản vẽ kỹ thuật sống: nền móng dựng lên từ hàng nghìn hạt WebGL rồi biến hình thành bản vẽ của từng nhóm dịch vụ khi cuộn. Giọng thị giác là sự chính xác của kỹ sư (lưới hairline, dấu "+" ở góc, nhãn mono `[02] — DỊCH VỤ`) gặp typography editorial (grotesk cực lớn, một từ nhấn bằng serif nghiêng).

Mật độ thoáng, nhịp section xen kẽ nền mực teal và nền giấy aqua nhạt. Accent teal chiếm khoảng 10% diện tích: nhãn, dấu "+", hạt nhấn, CTA. Không shadow mềm, bo góc gần như vuông; chiều sâu đến từ lớp nền xen kẽ và tấm giấy bo 3rem trồi lên.

Không dùng: hình lá chắn lớn, thần thoại, matrix, robot, neon tràn lan.

**Key Characteristics:**
- Hạt WebGL là chữ ký (hero + chương Dịch vụ), có fallback tĩnh và tắt bớt trên máy yếu.
- Ngôn ngữ bản vẽ: lưới, dấu góc, nhãn mono đánh số.
- Một từ nhấn serif nghiêng trong tiêu đề lớn.
- Nút cạnh vuông chữ mono có dấu góc; CTA chính là nút tròn magnetic.

## Colors

Teal đậm gần đen làm nền, teal tươi làm điểm nhấn, giấy aqua nhạt cho các mục sáng. Màu dùng theo **vai trò** (`--bg`, `--fg`, `--accent`…), gán lại theo `data-surface="dark|light|accent"`.

### Primary
- **Transformative Teal** (#13B5A5): nền nút, hạt nhấn, nhãn và dấu "+" trên nền tối. Trên nền sáng chỉ 2.4:1 nên chữ/link dùng **Teal Deep** (#0A7369, 5.2:1).
- **Aqua Glow** (#84E4D6): trạng thái hover của nút, accent mạnh trên nền tối.

### Neutral
- **Deep Ink Teal** (#071F1E): nền tối chính, chữ trên nền sáng.
- **Ink Raised** (#062E30): mặt nổi trên nền tối.
- **Cloud Dancer** (#F5F7F6): chữ trên nền tối; pha với Soft Aqua (#C9F8F0) thành nền giấy.
- **Mineral Grey** (#8B9CA1, 6.0:1 trên nền tối) / **Graphite** (#4A5B59, 6.5:1 trên nền sáng): chữ phụ.
- **Paper / Paper Deep / Paper Light** (Cloud Dancer pha Soft Aqua 28% / 46% / 12%): nền giấy mặc định, nền nổi và mặt sáng nhất.
- **Blend FG** (#E7FFFE): chữ header và con trỏ dùng `mix-blend-mode: difference`; mint-white thay trắng thuần để ra xám trung tính trên Deep Ink Teal.

### Named Rules
- Không mã màu trực tiếp trong component; bảng màu mặc định của Tailwind đã tắt.
- `prefers-contrast: more` làm đậm viền và chữ phụ.
- Theme sáng (`html[data-theme="light"]`) đổi vùng tối sang Cloud Dancer.

## Typography

- **Bricolage Grotesque** (trục opsz, wdth): tiêu đề và thân bài. Tiêu đề 600, tracking âm mạnh (-0.045em hero, -0.035em h2/h3), `text-wrap: balance`.
- **Newsreader nghiêng** 400: chỉ cho `<em>` trong tiêu đề (một từ cảm xúc mỗi tiêu đề). Không dùng làm tiêu đề toàn câu.
- **JetBrains Mono** 400/500: nhãn 12px viết hoa, tracking 0.12em; nút.
- Thang: hero → mega → h2 → h3 → statement → lead → label. Thân bài `text-wrap: pretty`.

## Layout

- Lưới 12 cột, `container-page` tối đa 96rem + gutter co giãn.
- Nhịp section `--section-y` (6–12rem). Header 4.75rem.
- Mục Dịch vụ ghim (pin) trên desktop đủ cao; điện thoại là danh sách dọc.
- Điện thoại: artwork hạt chiếm nửa trên hero, chữ nửa dưới.

## Elevation & Depth

Phẳng. Không box-shadow mềm. Chiều sâu bằng: xen kẽ nền tối/sáng, tấm giấy bo 3rem trồi lên đè mục tối (`SheetRise`), và lớp hạt WebGL phía sau.

## Shapes

Bo góc 2–6px (ngôn ngữ bản vẽ). Ngoại lệ: tấm `SheetRise` 3rem, nút tròn (pill). Hairline 1px `color-mix(mực 13%)`.

## Components

- **Nút `btn-box`**: cao 48px, chữ mono viết hoa, dấu góc 6px ở hai góc chéo, chữ cuộn lên khi hover (`Roll`). Biến thể primary (nền teal) và outline (viền).
- **Nút tròn `round-btn`**: 9.5rem (lớn 12rem), nền teal, lớp phủ trượt lên khi hover, magnetic theo con trỏ.
- **Nhãn `label`**: mono 12px, dạng `[02] — DỊCH VỤ`.
- **Danh mục dự án `ProjectIndex`**: danh sách chữ lớn, ảnh xem trước theo con trỏ trên desktop, ảnh inline trên điện thoại.
- **Form liên hệ `ContactWizard`**: nhiều bước, dịch vụ chọn sẵn theo trang.
- Focus: viền 2px `--focus-ring`, offset 3px.

## Do's and Don'ts

- **Do** lấy mọi màu, font, bo góc, chuyển động từ token.
- **Do** đặt chuyển động trong `@media (prefers-reduced-motion: no-preference)`; trạng thái ẩn chỉ dưới `[data-motion="on"]`.
- **Do** giữ nội dung đọc được khi không có JS.
- **Don't** thêm shadow mềm, gradient chữ, glow neon.
- **Don't** dùng serif nghiêng cho cả câu tiêu đề.
- **Don't** để chữ chỉ hiện sau khi cuộn ở màn đầu.
