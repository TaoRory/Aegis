# ATELIER: thời trang

> **Tạp chí sống.** Website là một số tạp chí thời trang: masthead khổng lồ, ảnh bìa, lookbook lật như dải phim. Mọi thứ chậm, chính xác, tự tin, rồi bất ngờ "sống" khi người xem chạm vào.

- **Cảm xúc:** khao khát, kiêu kỳ, gợi cảm vừa đủ.
- **Học từ:** Sofia Shcherbak (dải ảnh cong khi kéo, chi tiết mở ra), Relive by Coco (ảnh đổi biến thể khi hover, catalogue lệch cột, monogram chân trang), Miu Miu Immersive (chữ dàn đều justified, màn mở đầu tối giản), fashion SOTD trên Awwwards (ảnh theo đuôi chuột).
- **Demo:** thương hiệu giả định **Tơ Đêm**, nhãn lụa may đo. Mã: `src/templates/atelier/`.

## Nhận diện

```css
.tpl-atelier {
  --t-bg: #ece8e1;      /* bone */
  --t-fg: #121110;      /* mực */
  --t-muted: #6f6a63;
  --t-accent: #9e1b32;  /* đỏ sơn mài: chỉ cho giá, số giỏ, 1 từ nghiêng */
  --t-line: rgb(18 17 16 / 0.16);
  --t-paper: #f6f3ee;   /* nền thẻ sản phẩm */
}
```
- **Font:** `Playfair` (trục opsz + wdth + wght) cho display và tên sản phẩm; `Epilogue` cho body/nhãn (uppercase 11px, tracking 0.14em).
  - Thay thế cùng giọng (có VI): Playfair Display, Noto Serif Display (wdth), Cormorant Garamond.
- **Chi tiết đặc trưng:** số trang/look dạng "№ 07", đường kẻ hairline, nhãn hai đầu dòng (trái/phải), ảnh không bo góc, không bóng đổ.

## Bố cục (theo thứ tự cuộn)

1. **Header mỏng**: trái "Bộ sưu tập · Lookbook · Xưởng may", giữa logo chữ, phải "Giỏ (n)". Nền trong suốt, `mix-blend-mode: difference` trên ảnh.
2. **Bìa (hero)**: masthead tên thương hiệu **tràn đủ chiều ngang** (font-size tính theo vw, trục wdth co/giãn khi tải trang), ảnh bìa dọc ở giữa đè lên chữ, "cover lines" hai bên ("Số 07: Thu Đông", "Lụa, đêm và những điều chưa nói"). Cuộn: ảnh bìa nở ra full-bleed (pin + scale) và chữ masthead trượt lên.
3. **Tuyên ngôn**: 1 câu serif lớn căn giữa, 2–3 từ nghiêng màu accent, chữ lắng xuống theo cuộn (`CharWave`).
4. **Lookbook (signature)**: `DragSlider bend` gồm 8 look dọc, mỗi look có "Look 01", tên, chất liệu; hover ảnh = `ImageDistortLayer`; con trỏ "Kéo ↔". Có thanh tiến độ mảnh bên dưới (`--drag-progress`).
5. **Catalogue**: chữ "CATALOGUE" cỡ cực lớn + chip lọc (Tất cả/Đầm/Áo/Phụ kiện). Lọc bằng **GSAP Flip** (thẻ trượt về vị trí mới), thẻ sản phẩm dùng `.hover-swap` (ảnh 2 lộ từ dưới lên), giá màu accent, nút "Thêm vào giỏ" mở **giỏ hàng trượt** (dialog, lấy từ `legacy/MayBac.tsx.txt`).
6. **Xưởng may**: ảnh lớn `ScrollParallax reveal="center"` + 3 đoạn ngắn về quy trình (chọn lụa → cắt → may tay), số thứ tự La Mã.
7. **Hậu trường**: vùng tối `ImageTrail`, chữ giữa "Rê chuột để xem hậu trường"; mobile hiển thị lưới ảnh nhỏ.
8. **Chân trang**: monogram cực lớn (chữ cái đầu thương hiệu), đăng ký thư tin (chỉ trong trình duyệt), hai dòng chữ dàn hai mép kiểu "THEO DÕI ——— TƠ ĐÊM".

## Chuyển động

- **Tải trang:** masthead `font-variation-settings "wdth" 87.5 → 112.5` + `letter-spacing -0.06em → -0.02em` (1.6s, `expo.out`), ảnh bìa clip-path từ giữa ra.
- **Cuộn:** chậm và có trọng lượng; không dùng bounce.
- **Hover:** ảnh đổi biến thể (0.7s), tên sản phẩm gạch chân chạy từ trái.
- **Kéo:** dải cong (bend) là cảm giác chủ đạo; giữ vận tốc lớn → cung rõ.

## Ảnh

- Ảnh dọc 4:5 hoặc 2:3, ánh sáng có hướng, phông trơn hoặc kiến trúc, tông ấm/trung tính. Tránh ảnh studio cười tươi kiểu catalogue rẻ.
- Truy vấn `images.mjs`: `"fashion editorial portrait" --tall`, `"silk dress model" --tall`, `"runway backstage" --wide`, `"tailor sewing atelier" --wide`, `"fabric silk texture" --square`.

## Giọng văn

Ngắn, gợi, ít tính từ, nhiều danh từ cụ thể (lụa, đêm, đường may). Ví dụ: "Lụa may tay. Mặc cho những đêm không cần lý do." Giá viết đầy đủ "1.890.000 ₫" và ghi "giá minh họa".

## Chuyển thể

- **Trang sức / phụ kiện:** giữ bìa + lookbook; catalogue thêm chế độ phóng to chi tiết.
- **Mỹ phẩm cao cấp:** đổi ảnh dọc thành ảnh sản phẩm trên nền màu; ImageTrail → bảng màu son.
- **Nhiếp ảnh / người mẫu / studio cưới:** bỏ giỏ hàng, lookbook thành album, chi tiết mở bằng Flip.
- **Nội thất boutique:** đổi Playfair → Cormorant, ảnh ngang nhiều hơn.

## Tránh

Banner sale đỏ chót, carousel tự chạy có chấm tròn, nhiều hơn 1 màu accent, bo góc thẻ sản phẩm, icon giỏ hàng to.

## Mã nguồn bản demo

- `src/templates/atelier/`: Atelier.tsx + `fonts.ts`, `atelier.css` (token + `:root:has(.tpl-atelier)` cho màu con trỏ).
- Route: `src/app/(demo)/mau-giao-dien/atelier/page.tsx` (bọc `DemoShell`).
- Ảnh: `public/templates/atelier/*.webp`, credit trong `src/content/image-credits.json` (gọi bằng `tplImage("atelier", "<tên>")`).
