# BROADCAST: truyền thông / agency / production house

> **Đang phát sóng.** Website như một kênh đang lên sóng: chấm REC đỏ, timecode chạy, số kênh, danh sách dự án như lịch phát. Chữ to, dày, dàn kín khung: một tuyên ngôn chứ không phải một trang giới thiệu.

- **Cảm xúc:** táo bạo, nhịp nhanh, có quan điểm.
- **Học từ:** Signal-A Studio (tuyên ngôn justified trộn độ đậm, hàng dự án xáo chữ + ảnh thiết bị bám con trỏ, dải media tự chạy), Emotion (marquee theo vận tốc, con trỏ nhãn), Awwwards agency SOTD (showreel như sân khấu).
- **Demo:** thương hiệu giả định **Tần Số**, studio nội dung & truyền thông. Mã: `src/templates/broadcast/`.

## Nhận diện

```css
.tpl-broadcast {
  --t-bg: #f1efea;
  --t-fg: #0b0b0b;
  --t-muted: #6b6965;
  --t-accent: #ff2d00;  /* tín hiệu đỏ: REC, hover, con trỏ */
  --t-line: rgb(11 11 11 / 0.2);
  --t-dark: #0b0b0b;
}
```
- **Font:** `Archivo` (trục wdth 62–125 + wght): tuyên ngôn trộn chữ hẹp/rộng/đậm trên cùng dòng, justified; `IBM Plex Mono` cho timecode, nhãn, metadata.
  - Thay thế (VI): Mona Sans/Hubot Sans (wdth), Anton + Barlow Condensed.
- **Chi tiết:** timecode `00:00:12:08` chạy thật, nhãn `CH—01`, chữ uppercase dày, lưới 12 cột lộ đường kẻ, không bo góc.

## Bố cục

1. **Header**: logo, `● REC` nhấp nháy, timecode chạy (tính từ lúc mở trang), menu, giờ địa phương.
2. **Tuyên ngôn (hero)**:
   - 4–5 dòng chữ uppercase dàn kín ngang (mỗi dòng `text-align: justify` bằng flex `space-between` theo từ).
   - Từ khóa xen kẽ wdth hẹp/rộng.
   - Khi cuộn, trục wdth của từng từ "thở" (scrub).
   - Bên dưới là lưới từ khóa nhỏ dạng mono.
3. **Showreel**: khung 16:9 lớn với ảnh dựng (scanline + RGB split bằng `ImageDistortLayer`), con trỏ "Xem ↗"; bấm mở dialog xem dải ảnh khung hình (không phát video thật).
4. **Lịch phát (signature)**:
   - Danh sách dự án dạng hàng: số kênh, tên dự án, `TextScramble` khi hover, loại hình, năm.
   - `CursorPreview` hiện ảnh bám con trỏ, đổi ảnh theo hàng.
   - Mobile: ảnh trong hàng.
5. **Dịch vụ**: 5 hàng chữ khổng lồ; hover/focus một hàng mở rộng mô tả + 3 thẻ mono (accordion có nút).
6. **Marquee** `VelocityMarquee` 2 dòng ngược chiều: loại khách hàng / loại nội dung (không dùng tên thương hiệu thật).
7. **Quy trình**: 4 cột đánh số với đường kẻ dọc, mỗi cột có thời lượng (minh họa).
8. **CTA cuối**: nền đen, chữ khổng lồ "BẬT KÊNH CỦA BẠN", nút magnetic đỏ.

## Chuyển động

Cắt cảnh nhanh: 0.6–0.9s, `power4.out`; hiệu ứng "nhiễu tín hiệu" 120ms khi đổi trạng thái (RGB shift). Không dùng ease mềm kiểu spa.

## Ảnh

Hậu trường quay phim, thiết bị, sân khấu, ánh đèn. Truy vấn: `"film set camera crew" --wide`, `"studio lights" --wide`, `"concert stage lights" --wide`, `"microphone podcast" --tall`, `"video editing monitor" --wide`.

## Giọng văn

Khẳng định, động từ đầu câu, uppercase cho tuyên ngôn. Ví dụ: "KHÔNG LÀM NỘI DUNG CHO CÓ. LÀM ĐỂ NGƯỜI TA DỪNG LƯỚT." Tên dự án là giả định và ghi rõ.

## Chuyển thể

- **Agency marketing / quảng cáo:** giữ nguyên, đổi lịch phát thành "chiến dịch".
- **Production house / MV / sự kiện:** showreel là trung tâm, thêm lịch sự kiện.
- **Podcast / kênh YouTube:** danh sách tập phát, sóng âm SVG.
- **Báo chí / tạp chí online:** tuyên ngôn → tiêu đề nóng, hàng tin xáo chữ.

## Tránh

Ảnh stock "team high-five", gradient, icon dịch vụ dạng line-icon tròn, logo khách hàng không có thật.

## Mã nguồn bản demo

- `src/templates/broadcast/`: Broadcast.tsx + `fonts.ts`, `broadcast.css` (token + `:root:has(.tpl-broadcast)` cho màu con trỏ).
- Route: `src/app/(demo)/mau-giao-dien/broadcast/page.tsx` (bọc `DemoShell`).
- Ảnh: `public/templates/broadcast/*.webp`, credit trong `src/content/image-credits.json` (gọi bằng `tplImage("broadcast", "<tên>")`).
