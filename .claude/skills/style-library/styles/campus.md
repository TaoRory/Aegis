# CAMPUS: giáo dục (trường học, học viện, đại học)

> **Niên giám.** Website như cuốn niên giám được biên tập kỹ: chương đánh số, chú thích bên lề, ảnh lớn yên tĩnh. Signature là "Một ngày ở trường": người xem cuộn và kim đồng hồ quay từ 7:30 tới 16:30, từng khoảnh khắc trong ngày trượt qua theo chiều ngang.

- **Cảm xúc:** điềm tĩnh, nuôi dưỡng, đáng tin, có chiều sâu.
- **Học từ:** Format (Obys: mô-đun chương học, nhãn số), KSH (serif căn giữa, ảnh kiến trúc lộ clip-path), Kairos (khoảng trắng, thẻ viền mảnh), Emotion (highlight, nhịp đọc).
- **Demo:** thương hiệu giả định **Trường Liên cấp Rặng Thông**. Mã: `src/templates/campus/`.

## Nhận diện

```css
.tpl-campus {
  --t-bg: #f5f1e8;      /* ngà */
  --t-fg: #1b1f1a;
  --t-muted: #5f665c;
  --t-accent: #1d4a33;  /* xanh thông */
  --t-brass: #b8932f;   /* đồng: số chương, gạch chân */
  --t-line: rgb(27 31 26 / 0.16);
  --marker: #e9dcae;
}
```
- **Font:** `Literata` (serif sách, opsz: cỡ lớn thanh mảnh, cỡ nhỏ dễ đọc), `Inter Tight` (nhãn, điều hướng).
  - Thay thế (VI): Newsreader, Spectral, Merriweather; sans: Manrope.
- **Chi tiết:** số chương La Mã (I, II, III), chú thích bên lề nhỏ, gạch chân màu đồng, ảnh không bo, đường kẻ đôi như sách.

## Bố cục

1. **Header**: huy hiệu chữ (monogram RT trong khung), menu "Triết lý · Cấp học · Một ngày · Tuyển sinh", nút "Đăng ký tham quan".
2. **Hero**:
   - Tên trường Literata rất lớn, căn trái, `CharWave` khi cuộn nhẹ.
   - Ảnh khuôn viên lớn lộ bằng `ScrollParallax reveal="center"`.
   - Chú thích bên lề: "Chương I: Nơi bắt đầu".
3. **Triết lý**: 1 đoạn statement lớn có 2–3 `MarkerHighlight`; bên cạnh là 3 nguyên tắc đánh số với chú thích nhỏ.
4. **Một ngày ở trường (signature)**:
   - Section pin, dải ngang 6 khoảnh khắc (7:30 đón, 8:00 tiết học, 10:30 dự án, 12:00 ăn trưa, 14:00 CLB, 16:30 về).
   - Đồng hồ SVG cố định ở góc quay kim theo tiến độ cuộn; giờ số mono cập nhật.
   - Mobile: dải `DragSlider` thay vì pin.
5. **Cấp học**: accordion lớn 3 cấp (Tiểu học / THCS / THPT), mở ra thấy ảnh + 3 điểm chính + "sĩ số lớp minh họa".
6. **Cơ sở vật chất**: lưới ảnh lệch cột với parallax khác tốc độ, chú thích kiểu sách ("Hình 3: Thư viện").
7. **Lịch sự kiện**: tabs theo tháng (ARIA), mỗi sự kiện một dòng với ngày lớn.
8. **Tuyển sinh**: 4 bước `StackCards` + form đăng ký tham quan trường (chọn cấp học, ngày, khung giờ), không gửi dữ liệu.

## Chuyển động

Điềm tĩnh: 1.2–1.5s `power3.out`, không nảy, không xáo chữ. Pin ngang chỉ ở desktop (`MQ.desktopMotion`). Kim đồng hồ dùng `rotation` scrub, không quay quá 360°.

## Ảnh

Kiến trúc trường, thư viện, phòng thí nghiệm, sân trường, bàn tay học sinh làm việc (tránh khuôn mặt nhận diện). Truy vấn: `"school library" --wide`, `"school building architecture" --wide`, `"science lab classroom" --wide`, `"students hands writing" --wide`, `"school sports field" --wide`, `"art class painting" --wide`.

## Giọng văn

Trang trọng vừa phải, như thư của hiệu trưởng: câu hoàn chỉnh, ít khẩu hiệu. Ví dụ: "Chúng tôi không vội biến trẻ thành người lớn. Chúng tôi giúp các em lớn đúng nhịp của mình." Không xếp hạng, không giải thưởng bịa.

## Chuyển thể

- **Đại học / học viện:** cấp học → ngành học; "Một ngày" → "Một học kỳ".
- **Trung tâm đào tạo doanh nghiệp:** niên giám → giáo trình; lịch sự kiện → lịch khai giảng.
- **Thư viện / bảo tàng / tổ chức văn hóa:** giữ niên giám + chú thích, "Một ngày" → "Một thế kỷ" (timeline).
- **Mầm non cao cấp:** phối với PLAYGROUND (màu ấm hơn, font Lexend).

## Tránh

Ảnh học sinh xếp hàng chào cờ stock, banner "Top 1", khung slider tin tức, quá nhiều logo chứng nhận.

## Mã nguồn bản demo

- `src/templates/campus/`: Campus.tsx + `fonts.ts`, `campus.css` (token + `:root:has(.tpl-campus)` cho màu con trỏ).
- Route: `src/app/(demo)/mau-giao-dien/campus/page.tsx` (bọc `DemoShell`).
- Ảnh: `public/templates/campus/*.webp`, credit trong `src/content/image-credits.json` (gọi bằng `tplImage("campus", "<tên>")`).
