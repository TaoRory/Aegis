# SERENE: dịch vụ chăm sóc (spa, phòng khám da, wellness)

> **Sương sớm.** Một lớp sương mỏng phủ trang; người xem rê chuột là sương tan dần, giống cảm giác bước vào một không gian yên. Mọi chuyển động chậm như hơi thở.

- **Cảm xúc:** an tâm, mềm, được chăm sóc.
- **Học từ:** Emotion Agency (làn khói theo chuột, nút "Enter" tròn mềm, chữ highlight), KSH (serif mảnh căn giữa, ảnh lộ chậm), Kairos (bảng màu trung tính dịu, khoảng trắng lớn).
- **Demo:** thương hiệu giả định **SƯƠNG**: Skin & Wellness. Mã: `src/templates/serene/`.

## Nhận diện

```css
.tpl-serene {
  --t-bg: #eef0ec;      /* sương */
  --t-fg: #1f2a26;      /* rêu đậm */
  --t-muted: #66736d;
  --t-accent: #c98d78;  /* đất hồng: điểm nhấn, nút */
  --t-sage: #a9b8ad;
  --t-line: rgb(31 42 38 / 0.14);
  --marker: #f1d9cf;
}
```
- **Font:** `Fraunces` (trục SOFT 100, opsz) cho display, nghiêng cho từ cảm xúc; `Lexend` cho body (dễ đọc, rộng).
  - Thay thế (VI): Newsreader, Lora; body: Manrope, Be Vietnam Pro.
- **Chi tiết:** bo góc lớn (2rem) và hình vòm cho ảnh, nút pill, nhãn chữ thường thay vì uppercase.

## Bố cục

1. **Header**: logo chữ mềm, link, nút pill "Đặt lịch".
2. **Hero (signature)**: ảnh full-bleed tông sáng (da, nước, đá) + `MistCursor` trắng phủ lên; tiêu đề Fraunces căn giữa "Làn da cũng cần *được thở*." Hai dòng mô tả, nút "Đặt lịch" và "Thở cùng chúng tôi".
3. **Bài thở (tương tác chủ động)**: vòng tròn lớn "thở" theo nhịp 4–4–6 (hít, giữ, thở ra), có nhãn hướng dẫn thay đổi, nút bắt đầu/dừng. Không tự chạy; reduced motion thì đổi nhãn theo giây, không phóng to.
4. **Liệu trình**: `StackCards`, mỗi thẻ là một liệu trình (ảnh vòm + tên + thời lượng + "giá minh họa" + ai phù hợp).
5. **Quy trình 4 bước** (soi da → tư vấn → trị liệu → theo dõi) dạng đường cong SVG tự vẽ nối 4 điểm.
6. **Không gian**: dải ảnh `DragSlider` (không cong, nhẹ nhàng), ảnh bo vòm.
7. **Câu hỏi thường gặp**: accordion `<details>` mượt, mỗi câu trả lời ngắn.
8. **Đặt lịch**: form 4 bước (từ `legacy/Booking.tsx.txt`): chọn liệu trình → ngày/giờ → thông tin → xác nhận; nói rõ không gửi dữ liệu.

## Chuyển động

Chậm: 1.4–1.8s, `power2.inOut`/`sine.inOut`. Không xáo chữ, không nghiêng theo vận tốc. Sương: bán kính lớn, suy giảm chậm.

## Ảnh

Sáng, tông kem/xanh xám, nhiều chi tiết vật liệu (khăn, đá, lá, nước). Truy vấn: `"spa stones water" --wide`, `"skincare hands" --tall`, `"wellness interior plants" --wide`, `"eucalyptus leaves" --square`, `"towel spa" --tall`.

## Giọng văn

Ngôi "chúng tôi – bạn", câu dài vừa, nhịp chậm, không hứa hẹn kết quả y khoa. Ví dụ: "Không vội. Mỗi liệu trình bắt đầu bằng việc lắng nghe làn da của bạn." Luôn có ghi chú "kết quả khác nhau tùy cơ địa" khi nói về hiệu quả.

## Chuyển thể

- **Nha khoa / phòng khám:** thêm khối bác sĩ (ảnh thật của khách), bài thở thành "chuẩn bị trước khi khám".
- **Thú y / chăm sóc thú cưng:** đổi accent sang vàng ấm, Fraunces WONK cho vui hơn.
- **Yoga / thiền / retreat:** giữ bài thở làm trung tâm, thêm lịch lớp dạng tabs.
- **Dịch vụ gia đình (dọn nhà, giặt ủi cao cấp):** đổi sương thành "lau sạch" (cùng shader, màu trắng xanh).

## Tránh

Ảnh người mẫu nhắm mắt cười giả, màu hồng neon, chữ "cam kết 100%", trước/sau (before/after) không có sự đồng ý.

## Mã nguồn bản demo

- `src/templates/serene/`: Booking.tsx Serene.tsx + `fonts.ts`, `serene.css` (token + `:root:has(.tpl-serene)` cho màu con trỏ).
- Route: `src/app/(demo)/mau-giao-dien/serene/page.tsx` (bọc `DemoShell`).
- Ảnh: `public/templates/serene/*.webp`, credit trong `src/content/image-credits.json` (gọi bằng `tplImage("serene", "<tên>")`).
