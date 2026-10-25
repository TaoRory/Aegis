---
name: style-library
description: Thư viện 8 style giao diện có tên (ATELIER, SIGNAL, SERENE, HEARTH, BROADCAST, PLAYGROUND, VOYAGE, CAMPUS), mỗi style là một công thức hoàn chỉnh cho một ngành (cảm xúc, font tiếng Việt, token màu, bố cục từng section, tương tác, ảnh, giọng văn) kèm bản demo chạy thật. Dùng khi người dùng gọi tên một style ("làm theo style VOYAGE", "dùng ATELIER cho shop X"), khi cần dựng website doanh nghiệp mới cho một ngành, hoặc khi cần chọn style phù hợp cho khách hàng.
---

# Style library: gọi tên style → dựng website theo style đó

Mỗi style được chắt lọc từ nghiên cứu tương tác thật (Emotion Agency, khách hàng của họ, Site of the Day trên Awwwards; xem `design-research/references/site-notes.md`) và **đã hiện thực** thành một mẫu chạy ở `/mau-giao-dien/<slug>` trên web Aegis. File md của style là "công thức"; mã nguồn mẫu là "món ăn mẫu".

## Danh mục

| Style | Ngành gốc | Cảm xúc | Signature | Công thức | Demo |
|---|---|---|---|---|---|
| **ATELIER** | Thời trang | Khao khát, kiêu kỳ | Tạp chí sống: masthead khổng lồ, lookbook kéo cong | `styles/atelier.md` | `/mau-giao-dien/atelier` |
| **SIGNAL** | Công nghệ / SaaS / AI | Chính xác, năng lượng | Trường sóng shader: nhiễu → tín hiệu theo cuộn | `styles/signal.md` | `/mau-giao-dien/signal` |
| **SERENE** | Dịch vụ (spa, phòng khám, chăm sóc) | An tâm, mềm | Sương theo chuột + bài thở + đặt lịch | `styles/serene.md` | `/mau-giao-dien/serene` |
| **HEARTH** | F&B (nhà hàng, café, bar) | Ấm, thèm | Thực đơn: ảnh món bám con trỏ, than hồng | `styles/hearth.md` | `/mau-giao-dien/hearth` |
| **BROADCAST** | Truyền thông / agency / production | Táo bạo, nhịp nhanh | Đang phát sóng: timecode, danh sách dự án xáo chữ | `styles/broadcast.md` | `/mau-giao-dien/broadcast` |
| **PLAYGROUND** | Trung tâm tiếng Anh / kỹ năng / trẻ em | Vui, tự tin | Sticker kéo thả + bài kiểm tra trình độ mini | `styles/playground.md` | `/mau-giao-dien/playground` |
| **VOYAGE** | Tư vấn du học / du lịch / visa | Khát vọng, tin cậy | Đường bay tự vẽ + điểm đến kéo được | `styles/voyage.md` | `/mau-giao-dien/voyage` |
| **CAMPUS** | Giáo dục (trường học, học viện) | Điềm tĩnh, nuôi dưỡng | "Một ngày ở trường": cuộn ngang theo đồng hồ | `styles/campus.md` | `/mau-giao-dien/campus` |

Chọn style cho ngành chưa có trong bảng: xem mục "Chuyển thể" ở cuối mỗi file style (ví dụ HEARTH hợp cả tiệm bánh, quán bar; SERENE hợp nha khoa, thú y; VOYAGE hợp công ty du lịch, logistics).

## Cách gọi một style cho doanh nghiệp khác

1. **Đọc** `styles/<style>.md` + mã mẫu `src/templates/<slug>/`.
2. **Hỏi/ghi nhận dữ kiện thật** của doanh nghiệp mới: tên, dịch vụ, ảnh có sẵn, liên hệ. Không bịa số liệu/khách hàng/lời chứng thực (quy tắc giống `aegis-context`).
3. **Sao chép khung**: thư mục mẫu → dự án mới. Giữ nguyên **cấu trúc section, nhịp, tương tác signature**.
4. **Thay lớp nhận diện** theo thứ tự:
   - Token màu trong `<slug>.css` (giữ tỷ lệ: 1 nền, 1 mực, 1 accent, 1 phụ).
   - Font: chỉ thay bằng font cùng "giọng" có subset `vietnamese` (bảng thay thế trong từng style).
   - Nội dung: theo "Giọng văn" của style.
   - Ảnh: dùng ảnh của khách; nếu chưa có, dùng `template-gallery/scripts/images.mjs` với các truy vấn gợi ý trong style.
5. **Add-on**: lấy thêm tương tác từ `references/interaction-recipes.md` khi cần, tối đa 1 signature + 2–4 tương tác phụ mỗi trang.
6. **QA** bằng skill `design-qa` (desktop + mobile + reduced motion), và tự hỏi: "Đã có ít nhất 1 tương tác chủ động ngoài cuộn chưa?"

## Phối style (mix)

Được phép lấy **bố cục** của style A + **nhận diện** của style B khi cảm xúc gần nhau (ví dụ VOYAGE + CAMPUS cho trường quốc tế có chương trình du học). Không phối hai signature trong một trang.

## Tài liệu kèm theo

- `styles/*.md`: 8 công thức.
- `references/interaction-recipes.md`: bảng tương tác đã lọc + thông số chuẩn + cách dùng bộ `src/components/fx/*`.
- `references/legacy-techniques.md` + `snippets/legacy/*.txt`: kỹ thuật từ 6 mẫu thế hệ 1 (shader hoa, tượng đá, núi thủ tục, giỏ hàng, đặt lịch, đếm ngược, tabs).
