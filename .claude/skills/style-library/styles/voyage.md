# VOYAGE: tư vấn du học / du lịch / visa

> **Thẻ lên máy bay.** Mỗi section là một chặng của hành trình, từ tấm vé đầu tiên đến ngày nhập học. Đường bay tự vẽ khi cuộn, các điểm đến là những tấm ảnh kéo được, lộ trình là các tấm boarding pass xếp chồng.

- **Cảm xúc:** khát vọng, tin cậy, được dẫn đường.
- **Học từ:**
  - KSH: serif mảnh, ảnh lộ chậm.
  - Kairos: thẻ số liệu viền mảnh, ảnh kiến trúc parallax.
  - Sofia: dải ảnh kéo.
  - Awwwards travel SOTD: đường bay MotionPath, bản đồ chấm.
  - NhaSuong (legacy): núi thủ tục làm đường chân trời.
- **Demo:** thương hiệu giả định **La Bàn**, tư vấn du học. Mã: `src/templates/voyage/`.

## Nhận diện

```css
.tpl-voyage {
  --t-bg: #f4efe6;      /* giấy */
  --t-fg: #0f1f3d;      /* xanh hộ chiếu */
  --t-muted: #5d6578;
  --t-accent: #c4382b;  /* đỏ dấu mộc */
  --t-brass: #b08d57;
  --t-line: rgb(15 31 61 / 0.18);
  --t-night: #0f1f3d;
}
```
- **Font:** `Cormorant Garamond` (display mảnh, nghiêng đẹp), `Manrope` (body), `IBM Plex Mono` (mã chuyến bay, ngày, cổng).
  - Thay thế (VI): Playfair Display, EB Garamond; body: Hanken Grotesk.
- **Chi tiết:** đường răng cưa xé vé, dấu mộc tròn xoay, mã sân bay 3 chữ (HAN → MEL), tọa độ, nét đứt.

## Bố cục

1. **Header**: logo la bàn (kim xoay theo cuộn), menu, nút "Đặt lịch tư vấn".
2. **Hero**:
   - Tiêu đề Cormorant cỡ lớn "Bản đồ cho *chương tiếp theo*."
   - Dưới là tấm boarding pass lớn: HÀ NỘI HAN → ? (mã điểm đến xoay vòng các nước), tên "Hành khách: Bạn".
   - Nền ảnh bầu trời/cửa sổ máy bay mờ.
3. **Đường bay (signature)**:
   - Bản đồ thế giới bằng lưới chấm (SVG).
   - Khi cuộn (pin), đường bay cong từ Việt Nam tới điểm đến tự vẽ (`strokeDashoffset`).
   - Máy bay chạy theo đường (`MotionPathPlugin`); các điểm đến sáng lên lần lượt.
4. **Điểm đến**:
   - `DragSlider bend` gồm 6 thẻ ảnh dọc (Úc, Canada, Anh, Mỹ, Hà Lan, Nhật).
   - Mỗi thẻ có mã quốc gia, "học phí tham khảo/năm (minh họa)", thời gian xét visa (minh họa).
   - Hover `ImageDistortLayer`.
5. **Lộ trình**: `StackCards` 5 tấm boarding pass: Định hướng → Chọn trường → Hồ sơ → Visa → Bay; mỗi tấm có số "Chặng 0X", thời gian, việc cần làm.
6. **Hạn nộp hồ sơ**: đếm ngược tới kỳ nhập học (minh họa, từ `legacy/DemDoThi.tsx.txt` `Countdown`).
7. **Checklist hồ sơ (tương tác chủ động)**:
   - Danh sách 8 giấy tờ có checkbox, thanh tiến độ hình máy bay chạy.
   - Dấu mộc "SẴN SÀNG" đóng xuống khi đủ.
   - Lưu tạm trong trình duyệt (localStorage, bọc try/catch).
8. **Đặt lịch tư vấn**: form ngắn (quốc gia quan tâm, bậc học, thời gian dự kiến), không gửi dữ liệu.

## Chuyển động

Mượt và rộng: 1.2–1.6s `power3.inOut`; đường bay scrub 1; dấu mộc đóng xuống bằng scale 1.6 → 1 + xoay, kèm rung nhẹ.

## Ảnh

Kiến trúc trường đại học, thành phố, cửa sổ máy bay, sinh viên trong khuôn viên (không nhận diện được người). Truy vấn: `"university campus building" --tall`, `"airplane window sky" --wide`, `"sydney opera house" --tall`, `"toronto skyline" --tall`, `"amsterdam canal" --tall`, `"kyoto street" --tall`, `"london street" --tall`, `"boston campus" --tall`.

## Giọng văn

Bình tĩnh, rõ từng bước, xưng "chúng tôi – bạn". Ví dụ: "Bạn lo phần mơ ước. Giấy tờ để chúng tôi." Không cam kết tỷ lệ đậu visa; số liệu ghi "tham khảo/minh họa".

## Chuyển thể

- **Công ty du lịch / tour:** điểm đến → tour, checklist → hành lý, đếm ngược → ngày khởi hành.
- **Dịch vụ visa / định cư:** lộ trình là trung tâm, thêm bảng so sánh diện visa.
- **Logistics / vận chuyển quốc tế:** đường bay thành tuyến hàng, boarding pass thành vận đơn.
- **Trường quốc tế có chương trình liên kết:** phối với CAMPUS.

## Tránh

Ảnh sinh viên tung mũ cử nhân stock, cờ các nước dàn hàng, "đậu visa 100%", bản đồ Google nhúng làm signature.

## Mã nguồn bản demo

- `src/templates/voyage/`: Voyage.tsx + `fonts.ts`, `voyage.css` (token + `:root:has(.tpl-voyage)` cho màu con trỏ).
- Route: `src/app/(demo)/mau-giao-dien/voyage/page.tsx` (bọc `DemoShell`).
- Ảnh: `public/templates/voyage/*.webp`, credit trong `src/content/image-credits.json` (gọi bằng `tplImage("voyage", "<tên>")`).
