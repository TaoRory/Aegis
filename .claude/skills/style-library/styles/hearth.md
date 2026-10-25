# HEARTH: F&B (nhà hàng, café, bar)

> **Bếp lửa.** Trang tối như gian bếp lúc tối, ánh than hồng hắt lên. Món ăn hiện ra khi người xem lướt qua thực đơn: thèm trước, đọc sau.

- **Cảm xúc:** ấm, thèm, hiếu khách.
- **Học từ:**
  - Signal-A: ảnh bám con trỏ khi rê từng hàng; ở đây là ảnh món ăn.
  - Santioni, Otsuka: chữ condensed lớn, ánh sáng kịch tính.
  - Emotion: marquee chạy theo vận tốc.
  - Relive: ảnh lệch cột.
- **Demo:** thương hiệu giả định **Than & Muối**, quán nướng than kiểu Việt. Mã: `src/templates/hearth/`.

## Nhận diện

```css
.tpl-hearth {
  --t-bg: #15110e;      /* than */
  --t-fg: #f3e9dc;      /* kem */
  --t-muted: #a8998a;
  --t-accent: #ff5b1f;  /* than hồng */
  --t-gold: #e0b25b;
  --t-line: rgb(243 233 220 / 0.14);
}
```
- **Font:** `Noto Serif Display` (trục wdth: condensed ở cỡ lớn, nghiêng cho tên món) + `Archivo` cho body/nhãn.
  - Thay thế (VI): Playfair Display, Oswald (condensed sans), Anton (tiêu đề cực lớn).
- **Chi tiết:** giá căn phải bằng đường chấm (leader dots), số thứ tự món, hạt than bay (shader nhẹ), viền mảnh màu kem.

## Bố cục

1. **Header**: logo, "Thực đơn · Không gian · Giữ bàn", giờ mở cửa (minh họa) hiện "Đang mở" theo giờ máy.
2. **Hero**:
   - Ảnh món nướng full-bleed, tối và tương phản cao.
   - Lớp `ShaderCanvas` tạo **tàn than bay lên** và lệch theo chuột.
   - Tên quán cỡ cực lớn, condensed, tràn ngang.
   - Dòng mô tả và nút "Giữ bàn tối nay".
3. **Marquee** `VelocityMarquee`: "Nướng chậm — Ăn nóng — Than hồng — Muối hột —".
4. **Thực đơn (signature)**:
   - Tabs ARIA (Khai vị / Từ than / Rau & cơm / Đồ uống).
   - Mỗi món là một hàng: tên món serif nghiêng, mô tả, leader dots, giá.
   - Rê chuột vào hàng thì `CursorPreview` hiện ảnh món bám con trỏ.
   - Mobile: ảnh thumbnail nhỏ trong hàng.
5. **Câu chuyện bếp**: ảnh lệch cột 2 tầng với parallax khác tốc (`ScrollParallax depth`) + đoạn ngắn.
6. **Không gian**: `DragSlider` ảnh ngang với `ImageDistortLayer`.
7. **Giữ bàn (tương tác chủ động)**: chọn ngày (7 ngày tới), khung giờ (chip), số khách (−/+), ghi chú; xác nhận hiện "phiếu giữ bàn" dạng vé xé, nói rõ không gửi dữ liệu.
8. **Chân trang**: địa chỉ/giờ (minh họa), chữ lớn "Hẹn bạn tối nay."

## Chuyển động

Ấm và có quán tính: ảnh món vào khung với scale 1.15 → 1 (1.4s), tàn than chậm. Hover hàng thực đơn: tên món dịch phải 0.5rem, giá đổi màu accent.

## Ảnh

Ánh sáng thấp, nền tối, hơi khói, cận cảnh. Truy vấn: `"grilled meat charcoal" --wide`, `"vietnamese food" --square`, `"restaurant interior night" --wide`, `"cocktail bar dark" --tall`, `"chef cooking fire" --wide`.

## Giọng văn

Gợi giác quan (mùi, tiếng xèo, độ giòn), câu ngắn. Ví dụ: "Lửa than, muối hột, và một tối không ai nhìn đồng hồ." Giá ghi "giá minh họa".

## Chuyển thể

- **Café / tiệm bánh:** nền kem sáng, accent nâu caramel, tàn than → hơi nước bay.
- **Bar / cocktail:** giữ tối, accent đổi sang hổ phách, thực đơn theo "hương vị".
- **Fine dining:** bỏ marquee, thêm "menu nếm thử" theo chương (StackCards).
- **Chuỗi F&B nhiều chi nhánh:** thêm bộ chọn chi nhánh trước khi giữ bàn.

## Tránh

Ảnh món nền trắng kiểu delivery app, emoji, nút "Order now" khắp nơi, font viết tay rẻ tiền.

## Mã nguồn bản demo

- `src/templates/hearth/`: Hearth.tsx + `fonts.ts`, `hearth.css` (token + `:root:has(.tpl-hearth)` cho màu con trỏ).
- Route: `src/app/(demo)/mau-giao-dien/hearth/page.tsx` (bọc `DemoShell`).
- Ảnh: `public/templates/hearth/*.webp`, credit trong `src/content/image-credits.json` (gọi bằng `tplImage("hearth", "<tên>")`).
