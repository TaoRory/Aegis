# Product

<!-- impeccable:product-schema 1 -->

> Viết từ dữ kiện đã xác nhận trong `.claude/skills/aegis-context`, `AGENTS.md` và `src/config/site.ts` (11/2026). Mục nào chưa được xác nhận ghi rõ là "chưa có", không suy diễn.

## Platform

web

## Users

- **Chủ doanh nghiệp vừa và nhỏ tại Việt Nam**: cần một đội làm trọn phần công nghệ hoặc marketing, không có đội IT riêng. Họ muốn biết trong vài giây Aegis làm gì, đã làm cho ai, và liên hệ thế nào.
- **Người phụ trách công nghệ / vận hành / marketing** trong doanh nghiệp: so sánh vài đơn vị trước khi đề xuất lên cấp trên; cần phạm vi dịch vụ, cách làm việc và dự án đã bàn giao.
- Đọc chủ yếu bằng tiếng Việt; có bản tiếng Anh (`/en`). Nhiều lượt xem đến từ điện thoại (link chia sẻ qua Zalo, Messenger).

## Product Purpose

Website giới thiệu của Aegis (aegisgrp.co): cho khách thấy Aegis làm được gì, bằng chứng là các dự án đã bàn giao, và dẫn tới form trao đổi nhu cầu. Thành công = khách hiểu đúng 4 nhóm dịch vụ và gửi form/liên hệ.

## Positioning

Một đội làm trọn từ tư vấn đến bàn giao ở cả 4 mảng: (1) giải pháp AI cho doanh nghiệp, (2) triển khai phần mềm quản trị, (3) website và web app, (4) marketing. Tinh thần: Tin cậy · Vững chắc · Đồng hành. Thông điệp: "Aegis xây dựng nền tảng công nghệ vững chắc, giúp doanh nghiệp tự tin tiến xa." Tagline tiếng Anh: "Stands behind every stage of your business growth."

## Operating Context

- Trang chính: trang chủ, 4 trang dịch vụ (`/ai`, `/software`, `/web`, `/marketing`), `/lien-he` (form nhiều bước), thư viện mẫu giao diện demo (`/mau-giao-dien`, thương hiệu giả định, luôn ghi là demo), Factory (`/web/factory`) và Studio 3D (`/demo`).
- Form liên hệ gửi thật qua `src/lib/contact/delivery.ts`; không được giả lập gửi thành công.

## Capabilities and Constraints

- Nội dung nằm trong `src/config/site.ts` và `src/content/*`, không viết trong component.
- Portfolio 7 dự án thật (`src/content/projects.ts`): VIDI26, Handle Vietnam, Integritas Vu Legal, TEDxVinUniversity 2026, Rethink, TEDxVinUniversity 2025, Rethink Halloween. Chỉ ghi tính năng đã xác nhận (database: Handle Vietnam, VIDI26; phân quyền admin: chỉ VIDI26). Không nói Aegis là đối tác chính thức của VinUni.
- Số được phép hiển thị: chỉ số đếm hiển nhiên (4 nhóm dịch vụ, 7 dự án, 4 bước làm việc).
- **Chưa có:** email, số điện thoại, địa chỉ (`siteConfig.contact` đang `null`), năm thành lập, quy mô, khách hàng/logo đối tác, lời chứng thực, giá/gói dịch vụ, số liệu kinh doanh.

## Brand Commitments

- Tên: Aegis. Brand guideline "Transformative Teal" (`Brand-guideline/`, 11/2026): Deep Ink Teal, Transformative Teal, Aqua Glow, Cloud Dancer, Ink.
- Không định vị là công ty an ninh mạng; không chủ đề thần thoại Hy Lạp; không hình lá chắn lớn, matrix, robot, neon tràn lan.
- Chủ sở hữu muốn **giữ giao diện hiện tại** (hạt WebGL, ngôn ngữ bản vẽ kỹ thuật, chữ serif nghiêng nhấn, nhãn mono, nền tối teal). Hai bản thiết kế lại hoàn toàn (11/2026) đã bị từ chối. Góp ý cần xử lý: bớt cảm giác "AI slop", nội dung không được bắt cuộn mới hiện, nhẹ trên điện thoại.

## Evidence on Hand

- 7 dự án thật kèm ảnh chụp (`public/portfolio/`), mô tả trong `src/content/projects.ts`.
- 4 nhóm dịch vụ với nhu cầu, phạm vi, giá trị (`src/content/services.ts`, `services-en.ts`).
- Quy trình 4 bước (`src/content/site/vi.ts` → `process`).
- Không có testimonial, logo khách, số liệu: không được tạo ra.

## Product Principles

1. **Nói thẳng ngay màn đầu:** Aegis làm gì, cho ai, liên hệ ở đâu, không cần cuộn.
2. **Bằng chứng thật thay lời hứa:** dự án đã bàn giao đứng trước tính từ.
3. **Không bịa:** thiếu dữ kiện thì để trống, không lấp bằng số liệu hay lời khen.
4. **Hiệu ứng phục vụ nội dung:** chuyển động không được che hay trì hoãn chữ; điện thoại ưu tiên tốc độ.

## Accessibility & Inclusion

WCAG 2.2 AA: tương phản đạt AA (token đã chỉnh cho từng nền), hỗ trợ `prefers-reduced-motion` và `prefers-contrast: more`, điều hướng bằng bàn phím, nội dung hiển thị được khi không có JS.
