# Thư viện pattern (rút từ các site đoạt giải)

Mỗi pattern: **khi nào dùng · cách làm · lưu ý**. Code mẫu: skill `motion-engineering`.

## Mở đầu

- **Preloader đếm số** (Lusion, Emotion): mono `000 → 100`, wordmark trượt lên, rèm tách đôi. *Dùng* khi có WebGL/ảnh nặng hoặc muốn tạo nghi thức. *Lưu ý:* ≤ 2 giây, mỗi phiên chỉ 1 lần (sessionStorage), timeout cứng, bỏ qua khi reduced-motion. Nội dung bên dưới đã có sẵn trong HTML.
- **Hero typographic khổng lồ** (The Void, EnduroSat): chữ 10–14vw, ngắt dòng thủ công, xen serif nghiêng.
- **Ảnh/hình lồng trong chữ** (The Void "VOID"): `background-clip: text`, SVG mask, hoặc đặt hình vào lỗ chữ O.
- **Canvas WebGL nền** (Emotion, EnduroSat): particles/3D phản ứng chuột, chữ HTML chồng lên.

## Thân trang

- **Manifesto sáng dần theo từ** (The Void): opacity theo tiến độ cuộn từng từ.
- **Chương pin + morph** (EnduroSat): một canvas cố định, hình biến đổi theo chương; text chương trượt qua bên cạnh; thanh tiến độ chương `01—04`.
- **Bản vẽ tự dựng** (Heron): SVG path `stroke-dashoffset` scrub theo cuộn; dimension lines; dấu "+".
- **Horizontal scroll track** (nhiều agency): section pin, nội dung chạy ngang theo cuộn dọc. Trên mobile chuyển thành dọc.
- **Số liệu lớn đếm** (EnduroSat, The Void): chỉ dùng **số liệu thật** đã xác nhận.
- **Danh sách giá trị chữ khổng lồ:** mỗi từ một dòng, hover/cuộn để mở mô tả.

## Dự án / portfolio

- **Index list + cursor preview** (basement, nhiều studio): mỗi dòng tên dự án cỡ lớn, số thứ tự, loại; rê chuột thì ảnh nổi theo con trỏ (lerp + xoay nhẹ theo vận tốc). Mobile: ảnh hiện inline.
- **Ảnh lớn xen mô tả** (basement): ảnh 60%, mô tả 40%, hairline giữa các dự án.
- **Mask reveal ảnh** (Cartier gouache): `clip-path` hoặc mask gradient mềm khi vào khung.

## Kết thúc

- **Footer màn kết:** CTA cực lớn, nút magnetic tròn, wordmark khổng lồ tràn mép, metadata mono, "Lên đầu trang".

## Toàn cục

- **Smooth scroll Lenis** (gần như mọi site).
- **Cursor follower có nhãn** (The Void "XEM"): chỉ trên thiết bị có chuột; giữ con trỏ gốc ở vùng form và link thường.
- **Text roll trên link nav:** chữ trượt lên, bản sao trượt vào.
- **Nút magnetic:** dịch theo chuột trong bán kính, lerp quay về.
- **HUD chương:** nhãn cố định `02 / 06 — Dịch vụ`, thanh tiến độ mảnh.
- **Grain/noise overlay** cho nền giấy (SVG feTurbulence, opacity 4–7%).
- **Đổi màu nền theo chương** (sáng ↔ tối) bằng ScrollTrigger, thay vì section cứng nhắc.

## Học từ Emotion Agency (2026-10)

- **Headline mở bằng một từ serif nghiêng + `↳`:** "*Where* / ↳ Ý TƯỞNG LỚN…". Tạo nhịp đọc và cá tính ngay cả khi không có hình.
- **Chữ biến dạng + tách kênh RGB** khi hero xuất hiện: dùng SVG `feDisplacementMap` hoặc 3 lớp chữ lệch màu, chỉ trong 1–1.5s đầu rồi ổn định. Tắt khi reduced-motion.
- **Thẻ metadata kiểu hồ sơ** cho danh sách dự án/mẫu (xem `case-study-anatomy.md`).
- **Gắn một "cảm xúc" cho mỗi dự án** để người xem hiểu ý đồ thiết kế.
- **Chữ khổng lồ chạy ngang theo cuộn** (Flashform): một câu ngắn, cỡ 20–30vw, các chữ cái lệch nhịp theo trục Y.
- **Thiết bị trên sân khấu màu** cho ảnh chụp sản phẩm.
- **Next project + "(tiếp tục cuộn)"** cuối trang chi tiết.
- **Tùy chọn chất lượng đồ họa** (Settings) cho site WebGL nặng. Nên có ít nhất chế độ tự giảm trên máy yếu.
- **Không học:** màn chắn bắt buộc chọn âm thanh (Accessibility 6.6).
