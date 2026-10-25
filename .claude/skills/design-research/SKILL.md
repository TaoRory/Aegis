---
name: design-research
description: Nghiên cứu website tham khảo (Awwwards, FWA, studio sáng tạo) để rút ra pattern UI/UX và kỹ thuật. Dùng khi người dùng đưa link tham khảo, muốn "giống site X", cần tìm cảm hứng, hoặc trước khi lên concept thiết kế mới.
---

# Design research

Mục tiêu: hiểu **vì sao** một website gây ấn tượng (ý tưởng, nhịp, kỹ thuật), không sao chép bề mặt.

## Quy trình

1. **Thu thập.** Với mỗi URL, chạy từ thư mục gốc dự án:
   ```bash
   node .claude/skills/design-research/scripts/inspect-site.mjs <url> <outDir>             # desktop 1440×900
   node .claude/skills/design-research/scripts/inspect-site.mjs <url> <outDir> --mobile    # 390×844
   node .claude/skills/design-research/scripts/inspect-site.mjs <url> <outDir> --click "Enter without audio"   # vượt màn intro (click chuột thật theo tọa độ)
   node .claude/skills/design-research/scripts/contact-sheet.mjs <outDir> 3 560
   ```
   - `outDir` nên nằm trong scratchpad/thư mục tạm, không commit ảnh thô.
   - `report.json` cho biết: thư viện (gsap, ScrollTrigger, Lenis, THREE, barba, webflow…), số canvas/WebGL, font, màu nền, heading.
   - Site chạy cuộn ảo (Lenis/Locomotive, `scrollHeight ≈ viewport`) đã được script xử lý bằng cuộn wheel theo nhịp.
   - Site chặn bot (Akamai: "Access Denied", ví dụ cartier.com): **không cố vượt chặn**. Đọc trang Awwwards của site (`awwwards.com/sites/<slug>`), case study "behind the scenes" bằng WebFetch.
   **Nghiên cứu CHUYỂN ĐỘNG** (bắt buộc với site "wow": ảnh tĩnh bỏ lỡ hover, kéo, quán tính, chuyển cảnh):
   ```bash
   node .claude/skills/design-research/scripts/record-interactions.mjs <url> <outDir> [--click "Enter without audio"] [--fps 10] [--mobile]
   node .claude/skills/design-research/scripts/record-interactions.mjs <url> <outDir> --reprocess   # tách lại khung từ video đã quay
   ```
   - Quay video (Playwright) theo kịch bản: tải trang → vượt intro → quét chuột hình số 8 → hover từng phần tử lớn → cuộn chậm → cuộn nhanh rồi dừng → kéo thả (tự tìm slider/carousel/cursor grab) → cuộn tới cuối → hover cuối trang.
   - Kết quả: `phase-<tên>.jpg` (contact sheet từng pha, mỗi ô có thời gian và Δ = năng lượng chuyển động), `timeline.json` (mốc pha + "activeSeconds" sau mỗi hover = hiệu ứng kéo dài bao lâu), `motion.json`, `video.webm`.
   - Đọc Δ: Δ ≈ 0 khi đứng yên; Δ còn cao vài trăm ms sau khi thao tác dừng ⇒ có easing/quán tính dài; Δ cao khi đứng yên ⇒ cảnh chạy liên tục (WebGL, video).
   - ffmpeg dùng bản đi kèm Playwright (chỉ có PNG encoder, không có bộ lọc fps → script dùng `-r`).
1b. **Ghi hình tương tác** (hover, kéo, cuộn nhanh/chậm): thay cho việc người dùng quay màn hình.
   ```bash
   node .claude/skills/design-research/scripts/record-interactions.mjs <url> <outDir> --quick            # ~1–2 phút/site
   node .claude/skills/design-research/scripts/record-interactions.mjs <url> <outDir> --click "Enter"    # vượt màn intro
   node .claude/skills/design-research/scripts/record-interactions.mjs <url> <outDir> --reprocess --fps 3  # tách khung lại từ video cũ
   ```
   - Đọc `timeline.json` (hover nào có `activeSeconds`/`peak` lớn = tương tác đáng học), rồi Read `phase-<pha>.jpg` của pha đó (khung có nhãn thời gian + Δ).
   - Site chặn headless hoặc kẹt màn âm thanh: ghi vào site-notes, không cố vượt.
2. **Xem contact sheet** (Read ảnh) và ghi lại theo khung bên dưới.
3. **Tra Awwwards** để lấy tag kỹ thuật, điểm số và credit: `https://www.awwwards.com/sites/<slug>`. Danh sách Site of the Day mới: `https://www.awwwards.com/websites/sites_of_the_day/`.
4. **Tổng hợp** vào `references/site-notes.md`: thêm site mới theo cùng mẫu.

## Khung phân tích mỗi site

- **Ý tưởng lớn (big idea):** ẩn dụ / câu chuyện xuyên suốt là gì?
- **Hệ thống thị giác:** bảng màu (thường 1 nền + 1 mực + 1 accent), font (display/serif/mono), lưới, chi tiết đặc trưng (dấu "+", nhãn mono, khung ảnh vòm…).
- **Nhịp cuộn:** section nào được pin, scrub, chuyển cảnh nào, độ dài.
- **Vi tương tác:** cursor, hover, magnetic, text roll, preloader.
- **Kỹ thuật:** thư viện, WebGL hay không, fallback.
- **Có thể áp dụng cho dự án hiện tại:** pattern + lý do phù hợp. **Không được sao chép** bố cục/asset nguyên trạng.

## Tài liệu kèm theo

- `references/site-notes.md`: phân tích các site đã nghiên cứu (The Void, EnduroSat, Heron AI, **Emotion Agency + 6 website khách hàng của họ**, Cartier, basement.studio, Lusion).
- `references/sites/*.jpg`: contact sheet đã nén của các site trên. Read để xem lại.
- `scripts/inspect-site.mjs`, `scripts/contact-sheet.mjs`: cần `playwright` và `sharp` trong `node_modules` của dự án.
