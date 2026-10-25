# PLAYGROUND: trung tâm tiếng Anh / kỹ năng / trẻ em

> **Sân chơi ngôn ngữ.** Trang như một tấm bảng dán đầy sticker và bong bóng thoại mà người xem kéo đi được. Học là chơi: kiểm tra trình độ là trò chơi 5 câu, từ vựng là thẻ lật.

- **Cảm xúc:** vui, dám nói, tự tin.
- **Học từ:**
  - Awwwards SOTD giáo dục trẻ em: sticker vật lý, khối màu đậm.
  - Format (Obys): chương học dạng mô-đun.
  - Emotion: chữ highlight, con trỏ nhãn.
  - Aura: thẻ đánh số rõ ràng.
- **Demo:** thương hiệu giả định **Bập Bênh English**. Mã: `src/templates/playground/`.

## Nhận diện

```css
.tpl-playground {
  --t-bg: #fff6e6;      /* kem */
  --t-fg: #15153a;      /* mực tím than */
  --t-muted: #5b5b7a;
  --t-accent: #2f4bff;  /* xanh cobalt */
  --t-sun: #ffd23f;
  --t-coral: #ff6b57;
  --t-mint: #3dd6a5;
  --t-line: #15153a;    /* viền đậm 2px kiểu sticker */
  --marker: #ffd23f;
}
```
- **Font:** `Unbounded` (tròn rộng, display), `Nunito` (body), `Patrick Hand` (chữ viết tay cho ghi chú, bong bóng thoại).
  - Thay thế (VI): Lexend, Baloo 2, Grandstander, Itim.
- **Chi tiết:** viền 2px màu mực, bóng đổ cứng lệch (4px 4px 0), bo góc lớn, khối màu đậm xen kẽ, mũi tên vẽ tay SVG.

## Bố cục

1. **Header**: logo tròn, menu, nút vàng "Học thử miễn phí" (đi tới form).
2. **Hero (signature)**:
   - Khối cobalt lớn bo góc, tiêu đề Unbounded trắng "Nói tiếng Anh như *đi chơi*."
   - `Stickers` kéo được: "Hello!", "How are you?", "Let's talk!", ngôi sao, tia chớp, bong bóng thoại.
   - Ghi chú viết tay "kéo thử đi →".
3. **Bài kiểm tra trình độ mini (tương tác chủ động)**:
   - 5 câu trắc nghiệm, mỗi câu một thẻ.
   - Chọn đáp án → phản hồi đúng/sai tức thì (màu + biểu tượng + chữ), thanh tiến độ.
   - Kết quả: gợi ý cấp độ và khóa phù hợp.
   - Truy cập bàn phím đầy đủ, `aria-live` cho phản hồi.
4. **Khóa học**: tabs theo độ tuổi (Kids 6–10 / Teens 11–17 / Người lớn), mỗi tab 2–3 thẻ khóa màu khác nhau, có thời lượng và "học phí minh họa".
5. **Từ của tuần**: 6 `FlipCard`: mặt trước từ tiếng Anh + phiên âm, mặt sau nghĩa + câu ví dụ.
6. **Phương pháp**: 3 khối lệch nhau, có `MarkerHighlight` trên từ khóa ("nói trước, ngữ pháp sau").
7. **Marquee**: "Speak • Play • Grow • Nói • Chơi • Lớn •" nền vàng, nghiêng −2°.
8. **Học thử**: form ngắn (tên phụ huynh/học viên, độ tuổi, khung giờ) xử lý trong trình duyệt, xác nhận vui.

## Chuyển động

Nảy và vui: `back.out(1.7)`, `elastic.out(1, 0.5)` cho sticker; thời lượng ngắn (0.5–0.8s). Hover thẻ: nâng lên 4px + bóng cứng dài hơn. Reduced motion: tắt nảy, giữ phản hồi màu.

## Ảnh

Rất ít ảnh, chủ yếu màu và hình vẽ. Nếu dùng ảnh, chọn ảnh học sinh trong lớp tự nhiên (đã được phép), cắt trong khung bo tròn/blob. Truy vấn: `"children classroom learning" --wide`, `"students talking group" --wide`, `"books colorful" --square`.

## Giọng văn

Thân thiện, câu ngắn, xen tiếng Anh đơn giản có dịch. Ví dụ: "Sai cũng được. *Mistakes are welcome here.*" Không cam kết điểm số.

## Chuyển thể

- **Trung tâm kỹ năng / STEM / lập trình trẻ em:** sticker thành linh kiện, quiz thành câu đố logic.
- **Mầm non:** màu dịu hơn, font Baloo 2, bỏ quiz thay bằng lịch một ngày.
- **App học ngôn ngữ:** hero thêm mockup điện thoại HTML, quiz là demo sản phẩm.
- **Sự kiện gia đình / khu vui chơi:** giữ sticker + marquee, thêm đếm ngược.

## Tránh

Clip-art trẻ em, quá 4 màu cùng lúc trong một khối, chữ Comic Sans, cam kết "IELTS 8.0 sau 3 tháng".

## Mã nguồn bản demo

- `src/templates/playground/`: Playground.tsx Quiz.tsx + `fonts.ts`, `playground.css` (token + `:root:has(.tpl-playground)` cho màu con trỏ).
- Route: `src/app/(demo)/mau-giao-dien/playground/page.tsx` (bọc `DemoShell`).
- Ảnh: bản demo không dùng ảnh chụp (hình là shader/SVG/HTML); nếu thêm ảnh, dùng `images.mjs pick … playground` và `tplImage("playground", "<tên>")`.
