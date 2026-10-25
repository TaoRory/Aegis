---
name: aegis-context
description: Ngữ cảnh doanh nghiệp Aegis (dữ kiện đã xác nhận, 4 nhóm dịch vụ, 7 dự án portfolio, những điều không được bịa) và art direction hiện tại của website. Luôn nạp khi viết nội dung, thiết kế hoặc code cho website Aegis.
---

# Aegis: ngữ cảnh dự án

## Doanh nghiệp

- **Tên:** Aegis. Cung cấp giải pháp công nghệ và marketing cho doanh nghiệp.
- **4 nhóm dịch vụ:** (1) Giải pháp AI doanh nghiệp: tư vấn ứng dụng AI, phát triển sản phẩm AI và tùy chỉnh; (2) Triển khai phần mềm quản trị doanh nghiệp: tư vấn, triển khai, tùy chỉnh theo quy trình; (3) Thiết kế, phát triển website và web app: có thể có cơ sở dữ liệu, thu thập thông tin, phân quyền theo phạm vi dự án; (4) Marketing: quảng cáo trực tuyến, social media, hoạt động khác theo phạm vi thống nhất.
- **Tinh thần:** Tin cậy · Vững chắc · Đồng hành. Thông điệp: "Aegis xây dựng nền tảng công nghệ vững chắc, giúp doanh nghiệp tự tin tiến xa."
- **Người đọc:** chủ doanh nghiệp, người phụ trách công nghệ/vận hành/marketing; viết tiếng Việt dễ hiểu.
- **Nguồn nội dung trong code:** `src/config/site.ts`, `src/content/*.ts`. Portfolio: `src/content/projects.ts` (7 dự án, URL cố định).

## Không được bịa (bắt buộc)

- Không tên sản phẩm AI, không tuyên bố sản phẩm thương mại cụ thể.
- Không gắn với nhà cung cấp phần mềm hay chứng nhận đối tác.
- Không năm thành lập, quy mô, địa chỉ, thành tích, số liệu kinh doanh, khách hàng, lời chứng thực, logo đối tác.
- Không giá/gói dịch vụ. Không thông tin liên hệ khi chưa được cung cấp (`siteConfig.contact` đang `null`).
- Portfolio: chỉ ghi tính năng đã xác nhận. Database: Handle Vietnam, VIDI26. Phân quyền admin: chỉ VIDI26. Không nói Aegis là đối tác chính thức của VinUni.
- Số liệu được phép hiển thị: chỉ những số đếm hiển nhiên từ nội dung (4 nhóm dịch vụ, 7 dự án trong portfolio, 4 bước làm việc).
- Không định vị là công ty an ninh mạng; không chủ đề thần thoại Hy Lạp; không hình lá chắn lớn, matrix, robot, neon tràn lan.

## Thư viện mẫu giao diện (demo)

- Trang `/mau-giao-dien` và 6 mẫu `/mau-giao-dien/<slug>` (`src/content/templates.ts`). Đây là **mẫu demo do Aegis tự thiết kế**, thương hiệu và số liệu là **giả định**, phải luôn ghi rõ (DemoBar, DemoClosing, nhãn thư viện). Không trộn với 7 dự án thật.
- Thêm/sửa mẫu: skill `template-gallery`, agent `template-builder`.

## Nhận diện

Logo, màu, font chính thức **chưa chốt**. Mọi lựa chọn hiện tại là tạm thời, tập trung trong `src/styles/tokens.css` và `src/styles/fonts.ts`.

## Art direction hiện tại

Xem `references/art-direction.md`: concept **"Bản vẽ nền móng"**.
