---
name: awwwards-art-direction
description: Lên concept và art direction cho website đạt chuẩn Awwwards (sáng tạo, có cá tính, không "template AI"). Dùng khi thiết kế mới/redesign website, khi người dùng chê giao diện "nhàm", "giống template", "không wow", hoặc khi cần review thẩm mỹ.
---

# Awwwards art direction

Website "wow" không đến từ việc thêm hiệu ứng, mà từ **một ý tưởng lớn được thực thi nhất quán** ở mọi cấp: chữ, lưới, màu, chuyển động, microcopy.

## Quy trình bắt buộc

1. **Nạp ngữ cảnh.** Đọc skill `aegis-context` (hoặc brief của dự án) và `design-research/references/site-notes.md`.
2. **Tìm ý tưởng lớn (big idea).** Viết 3 ẩn dụ ứng viên từ bản chất doanh nghiệp. Mỗi ẩn dụ gồm 1 câu mô tả, cách nó điều khiển hero, cuộn, chi tiết thị giác và microcopy. Chọn 1 theo tiêu chí: *đúng bản chất doanh nghiệp, chưa bị dùng nhàm, hiện thực được trong ngân sách hiệu năng*.
3. **Viết art direction ngắn** (`references/art-direction-template.md`): palette 1+1+1, bộ font, lưới, 5–7 "chữ ký thị giác", kịch bản cuộn theo section, danh sách vi tương tác, ngân sách hiệu năng, fallback reduced-motion.
4. **Kiểm tra chống template** bằng `references/anti-template-checklist.md` **trước** khi code và **sau** mỗi vòng QA.
5. **Hiện thực** bằng skill `motion-engineering` / `webgl-experiences`.
6. **Chấm điểm** bằng skill `design-qa` (agent `awwwards-juror`), sửa đến khi Design ≥ 8.

## Nguyên tắc cốt lõi

- **Typography là nhân vật chính.** Headline hero chiếm 50–70% chiều ngang. Trộn tối đa 3 họ: grotesk có cá tính (display + body), serif nghiêng (từ khóa cảm xúc), mono (nhãn, chỉ số, metadata). Chi tiết ở `references/typography.md`.
- **Kỷ luật màu:** 1 nền, 1 mực, 1 accent dùng tiết kiệm (≤ 5% diện tích). Đảo nền sáng/tối giữa các chương để tạo nhịp. Không gradient tím-xanh, không glassmorphism tràn lan, không "glow" ở mọi thẻ.
- **Lưới lộ diện:** hairline, dấu "+" tại giao điểm, nhãn `[01]`, số trang `02/06`. Thiết kế trông như được *dàn trang*, không phải *xếp thẻ*.
- **Kể chuyện bằng cuộn:** ít nhất 2 section pin + scrub, nơi nội dung **biến đổi tại chỗ** (morph, dựng hình, đếm số, ghép chữ). Fade-up đơn thuần không tính là chuyển động có chủ đích.
- **Một khoảnh khắc "signature"** mà người xem sẽ kể lại (ví dụ: nền móng dựng lên bằng hạt, ảnh lồng vào chữ). Đầu tư 40% công sức vào đó.
- **Bất đối xứng có chủ đích:** lệch cột, chữ tràn mép, khoảng trắng lớn bất ngờ. Tránh lưới 3 thẻ bằng nhau lặp lại.
- **Vi tương tác có cá tính:** text roll khi hover, nút magnetic, cursor có nhãn, preloader đếm số. Mỗi cái phải phục vụ ý tưởng lớn.
- **Microcopy cũng là thiết kế:** nhãn kỹ thuật, chỉ số, chú thích nhỏ ("Bản vẽ số 02 — Phần mềm"). Nhưng **không bịa dữ kiện**.
- **Tôn trọng người dùng:** nội dung luôn có trong HTML, không màn chắn bắt buộc, có `prefers-reduced-motion`, Lighthouse Performance ≥ 85 trên desktop.

## Tài liệu

- `references/anti-template-checklist.md`: dấu hiệu "template AI" và cách thay.
- `references/typography.md`: font hỗ trợ tiếng Việt, cỡ chữ, xử lý dấu khi làm mask/split.
- `references/pattern-library.md`: thư viện pattern (hero, section, project list, footer, cursor…) kèm khi nào dùng.
- `references/art-direction-template.md`: mẫu tài liệu art direction.
- `references/genre-playbook.md`: mỗi ngành ứng với cảm xúc, font (có tiếng Việt), màu, chuyển động.
- `references/case-study-anatomy.md`: cấu trúc trang case study / trang mẫu (theo Emotion).
