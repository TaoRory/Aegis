---
name: design-qa
description: Kiểm tra chất lượng thiết kế và chuyển động bằng trình duyệt thật, chấm điểm theo tiêu chí Awwwards (Design 40%, Usability 30%, Creativity 20%, Content 10%), kiểm tra hiệu năng, a11y, reduced-motion. Dùng sau mỗi vòng hiện thực UI, trước khi bàn giao, hoặc khi cần đánh giá "đã wow chưa".
---

# Design QA

## 1. Chụp theo hành trình cuộn (không chỉ full-page)

Ảnh full-page **không phản ánh** hiệu ứng scroll-driven/pin. Luôn chụp theo viewport khi cuộn bằng wheel:

```bash
node .claude/skills/design-research/scripts/inspect-site.mjs http://localhost:3000 <outDir>
node .claude/skills/design-research/scripts/inspect-site.mjs http://localhost:3000 <outDir>-m --mobile
node .claude/skills/design-research/scripts/contact-sheet.mjs <outDir> 3 560
```

Sau đó Read contact sheet và từng shot quan trọng (hero, signature moment, project list, footer).

### Hành trình khu (website không gian như `/factory`)

Không có cuộn dài: chụp theo hành trình **khu**. Với desktop và mobile (từng nấc bottom sheet), chụp: tổng mặt bằng → từng khu → một sản phẩm → một thí nghiệm → liên hệ, cả bản 3D lẫn bản phẳng. Kiểm bằng đo, không chỉ nhìn ảnh: vị trí hotspot nằm trong vùng còn trống, `renderer.info` (lệnh vẽ ≤ 120, tam giác ≤ 150k) qua `?debug-space`. Script: `pnpm qa:factory <url>` (bản build production, cổng không phải 3000 nếu bị chiếm).

## 2. Chạy QA chức năng của dự án

`pnpm qa <url>` (scripts/qa.mjs): tràn ngang, anchor, link ngoài, ảnh, menu mobile, bộ lọc, form/API, lỗi console.

## 3. Reduced-motion và không-JS

- Playwright `emulateMedia({ reducedMotion: "reduce" })`: mọi nội dung hiện đủ, không pin, không canvas chạy vòng lặp.
- `javaScriptEnabled: false`: nội dung chính vẫn đọc được.

## 4. Hiệu năng

- Đo LCP, CLS bằng PerformanceObserver (xem `scripts/qa.mjs` hoặc đoạn đo trong README).
- Đo FPS khi cuộn: đếm frame bằng `requestAnimationFrame` trong 2 giây cuộn wheel liên tục; mục tiêu ≥ 50fps trên máy dev.
- JS bundle: xem kích thước chunk trong `.next/static/chunks` sau build.

## 5. Chấm điểm kiểu Awwwards

Dùng `references/rubric.md`. Viết kết quả dạng:

```
Design 7.5 · Usability 8 · Creativity 7 · Content 7.5 → Overall 7.5
Top 5 việc cần sửa (ưu tiên theo tác động):
1. …
```

Mục tiêu bàn giao: Design ≥ 8, Usability ≥ 8, không có lỗi chức năng.

## Giới hạn của công cụ chụp (đừng tính là lỗi)

- `inspect-site.mjs` cuộn bằng wheel và giữ chuột cố định ở (700, 450). Cursor tùy biến hoặc ảnh nổi theo chuột có thể "kẹt" trạng thái vì không có pointermove.
- Ảnh full-page không phản ánh scroll-driven/pin. Với trang có pin, hành trình cuộn có thể dừng trước footer (scrollHeight tăng sau khi pin-spacer được thêm) → chụp footer riêng bằng `scrollTo(0, scrollHeight)`.
- Chromium giả lập mobile trong ảnh full-page có thể báo `hover: hover`. Kiểm tra media query bằng `matchMedia` trong context mobile thay vì nhìn ảnh full-page.
