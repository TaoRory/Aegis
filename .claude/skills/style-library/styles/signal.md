# SIGNAL: công nghệ / SaaS / AI

> **Tín hiệu từ nhiễu.** Hero là một trường sóng đang nhiễu loạn; khi người dùng cuộn và rê chuột, các đường sóng duỗi thẳng thành tín hiệu sạch. Đó chính là sản phẩm: biến dữ liệu rời rạc thành quyết định.

- **Cảm xúc:** chính xác, năng lượng, tự tin kỹ thuật.
- **Học từ:**
  - Flashform: vật thể shader xoay theo chuột rồi chìm khi cuộn; tiêu đề lắng từng ký tự; tấm thẻ lime trồi lên.
  - Signal-A: nhãn xáo chữ.
  - Aura: thẻ đánh số, sơ đồ mạng.
  - Kairos: thẻ số liệu viền mảnh.
- **Demo:** thương hiệu giả định **MẠCH**, nền tảng tự động hóa quy trình bằng AI. Mã: `src/templates/signal/`.

## Nhận diện

```css
.tpl-signal {
  --t-bg: #0a0c10;
  --t-fg: #eef1f4;
  --t-muted: #8a93a0;
  --t-accent: #c6ff3d;   /* lime: CTA, đường tín hiệu, con trỏ */
  --t-line: rgb(238 241 244 / 0.12);
  --t-panel: #12151b;
}
```
- **Font:** `Geologica` display/body (trục SHRP: góc sắc tăng khi hover tiêu đề); `JetBrains Mono` cho nhãn, số, terminal.
  - Thay thế (VI): Space Grotesk, Hanken Grotesk, Mona Sans; mono: IBM Plex Mono.
- **Chi tiết:** lưới chấm mờ, nhãn mono `[01]`, viền 1px, góc vuông, ánh lime rất tiết chế (≤ 5% diện tích).

## Bố cục

1. **Header**: logo + 4 link + nút "Dùng thử" viền lime, nhãn trạng thái `● Hệ thống hoạt động` (minh họa).
2. **Hero (signature)**: `ShaderCanvas` "signal field": 40–60 đường sóng ngang, biên độ nhiễu giảm theo `uScroll` và quanh `uMouse` (vùng quanh con trỏ duỗi thẳng). Tiêu đề lớn trái-dưới, `CharWave`-style khi tải: "Biến dữ liệu rời rạc thành *quyết định*." Hai CTA.
3. **Vấn đề → Giải pháp**: hai cột; cột trái chữ mờ gạch ngang (vấn đề), khi cuộn qua thì `SheetRise` một tấm thẻ lime đè lên với giải pháp.
4. **Bản demo sống (tương tác chủ động)**: chọn 1 trong 3 tác vụ (chip) → khung terminal gõ từng bước workflow (đọc email → trích xuất → tạo phiếu → báo cáo) với dấu thời gian, kết quả cuối hiện dạng thẻ. Ghi rõ "mô phỏng trong trình duyệt".
5. **Tính năng**: 4 hàng lớn, số `01–04`, tên xáo chữ khi hover (`TextScramble`), mở rộng mô tả và một hình minh họa SVG nét mảnh.
6. **Tích hợp**: vòng quỹ đạo (SVG) các nhóm công cụ (Email, Bảng tính, CRM, Kho) quay chậm, hover dừng; dùng tên nhóm, **không** logo thương hiệu thật.
7. **Số liệu minh họa**: 3 thẻ viền mảnh đếm số, nhãn "minh họa".
8. **CTA cuối**: chữ khổng lồ chạy ngang + nút magnetic.

## Chuyển động

Nhanh và sắc: `expo.out` 0.8–1.1s, stagger nhỏ (0.03). Shader 60fps ở DPR ≤ 1.5, dừng khi ra khỏi màn hình. Terminal gõ 18–28ms/ký tự, `aria-live="polite"` chỉ thông báo kết quả cuối.

## Ảnh

Hầu như không dùng ảnh chụp: "ảnh" là UI dựng bằng HTML (thẻ, bảng, terminal) và shader. Nếu cần, chỉ dùng ảnh trừu tượng (`"circuit macro" --wide`, `"fiber optic light" --wide`) có xử lý duotone tối.

## Giọng văn

Động từ mạnh, câu ngắn, có số cụ thể nhưng ghi "minh họa". Ví dụ: "Một luồng việc. Không cần ai nhắc."

## Chuyển thể

- **Fintech / data:** trường sóng thành biểu đồ nến; thêm bảng điều khiển mẫu.
- **Cybersecurity:** lime → đỏ cam, terminal là log phát hiện.
- **Phần mềm quản trị (ERP/CRM):** demo sống thành kéo thả thẻ kanban.
- **Startup phần cứng / IoT:** hero shader thành sóng tín hiệu thiết bị + ảnh sản phẩm.

## Tránh

Gradient tím-xanh "AI", robot, não bộ phát sáng, mockup laptop nghiêng, logo khách hàng giả, chữ "revolutionary".

## Mã nguồn bản demo

- `src/templates/signal/`: Signal.tsx + `fonts.ts`, `signal.css` (token + `:root:has(.tpl-signal)` cho màu con trỏ).
- Route: `src/app/(demo)/mau-giao-dien/signal/page.tsx` (bọc `DemoShell`).
- Ảnh: bản demo không dùng ảnh chụp (hình là shader/SVG/HTML); nếu thêm ảnh, dùng `images.mjs pick … signal` và `tplImage("signal", "<tên>")`.
