# Kỹ thuật giữ lại từ 6 mẫu thế hệ 1 (đã xóa khỏi web)

Mã gốc lưu nguyên văn ở `../snippets/legacy/*.txt`. Đuôi `.txt` để tsc/eslint bỏ qua; import trong đó trỏ tới `@/templates/_kit/*` và `@/lib/motion`, nên khi tái dùng chỉ cần đổi đuôi và chỉnh đường dẫn. Mỗi mục dưới đây ghi: dùng khi nào, file nào, dòng chính.

| Kỹ thuật | File | Dùng lại cho |
|---|---|---|
| **Shader "nở hoa"**: cánh hoa xoay theo chuột, chìm xuống khi cuộn (Flashform) | `KhoSo.tsx.txt` (hằng `BLOOM`, dùng với `ShaderCanvas`) | SIGNAL, mọi hero SaaS cần "vật thể sống" |
| **Chữ khổng lồ chạy ngang theo cuộn**, từng ký tự lệch nhịp | `KhoSo.tsx.txt` (`GIANT`) + `src/components/fx/CharWave.tsx` | Câu chốt cuối trang, marquee lớn |
| **Núi thủ tục**: `ridge(seed, base, amp)` cộng các sóng sin → path SVG, 5 lớp parallax `depth` khác nhau | `NhaSuong.tsx.txt` dòng 11–31, màu `--t-ridge-1..5` trong `nha-suong.css.txt` | Resort, du lịch, VOYAGE (chân trời), trang "về chúng tôi" |
| **Bản vẽ tự vẽ theo cuộn** (`strokeDasharray = getTotalLength()`, scrub `strokeDashoffset → 0`) | `NhaSuong.tsx.txt` dòng ~80–95 | Kiến trúc, đường bay, sơ đồ quy trình |
| **Shader tượng đá raymarch** (SDF + noise vân đá, ánh sáng mềm) | `QuyHanh.tsx.txt` (hằng `SCULPTURE`) | Tài chính, luật, tư vấn: "điềm tĩnh, vững" |
| **Đếm số** `data-count` + **biểu đồ vẽ nét** (path `CHART`, area mờ dần vào) | `QuyHanh.tsx.txt` dòng 77–110 | Báo cáo, số liệu (luôn ghi "minh họa" nếu không phải số thật) |
| **Đếm ngược** tới mốc giờ cố định (+07:00), cập nhật mỗi giây, `aria-live` theo phút | `DemDoThi.tsx.txt` hàm `Countdown` | Hạn nộp hồ sơ, sự kiện, khai giảng |
| **Tabs đúng chuẩn ARIA** (roving tabindex, ←/→/Home/End, `hidden` panel) | `DemDoThi.tsx.txt` dòng ~100–240 | Lịch trình, khóa học theo cấp độ, thực đơn theo bữa |
| **Tách lớp inner/outer** để hai tween (intro + scrub) không giành cùng thuộc tính | `DemDoThi.tsx.txt` hero | Bất cứ khi một phần tử vừa có intro vừa có scroll scrub |
| **Trang sức vẽ bằng SVG** (gradient kim loại, `<defs>` theo id, xích lặp) | `Jewelry.tsx.txt` | Sản phẩm minh họa khi không có ảnh |
| **Giỏ hàng trượt** (dialog, trả focus về nút mở, Esc đóng, `aria-live` số lượng) | `MayBac.tsx.txt` dòng ~50–220 | ATELIER, HEARTH (đặt món), mọi e-commerce demo |
| **Đặt lịch 4 bước** (validate từng bước, focus vào tiêu đề bước mới, `aria-live`, SĐT `^(0|\+84)\d{9}$`, nói rõ không gửi dữ liệu) | `Booking.tsx.txt` + phần `.booking` trong `lanh.css.txt` | SERENE, HEARTH (giữ bàn), VOYAGE (đặt lịch tư vấn), PLAYGROUND (học thử) |

## Bài học từ thế hệ 1: vì sao người dùng chê "chán"

1. **Tĩnh khi rê chuột.** Có reveal khi cuộn nhưng gần như không phản hồi khi hover/kéo. Các site được khen (Sofia, Signal-A, Relive) đều có **phản hồi tức thì với chuột**: ảnh đổi, chữ xáo trộn, dải ảnh cong khi kéo.
2. **Không có ảnh thật.** Toàn hình vẽ SVG/shader → trông như "demo kỹ thuật", không giống thương hiệu. Thế hệ 2 dùng ảnh có giấy phép (`template-gallery/scripts/images.mjs`) làm nhân vật chính, shader chỉ làm lớp phụ.
3. **Bố cục đều đặn.** Lưới 3 cột, khoảng cách đều. Site đẹp phá nhịp: ảnh lệch cột, chữ tràn mép, một section thật đặc rồi một section gần như trống.
4. **Thiếu "khoảnh khắc chạm tay".** Mỗi mẫu thế hệ 2 phải có ít nhất **một tương tác người dùng chủ động** (kéo, chọn, gõ, lật) ngoài cuộn.
