---
name: aegis-context
description: Ngữ cảnh doanh nghiệp Aegis (dữ kiện đã xác nhận, 4 nhóm dịch vụ, 7 dự án portfolio, những điều không được bịa) và art direction hiện tại của website. Luôn nạp khi viết nội dung, thiết kế hoặc code cho website Aegis.
---

# Aegis: ngữ cảnh dự án

## Doanh nghiệp

- **Tên:** Aegis. Cung cấp giải pháp công nghệ và marketing cho doanh nghiệp.
- **4 nhóm dịch vụ:** (1) Giải pháp AI doanh nghiệp: tư vấn giải pháp, phát triển, triển khai sản phẩm AI và tùy chỉnh; (2) Triển khai phần mềm quản trị doanh nghiệp: tư vấn giải pháp, triển khai, tùy chỉnh theo quy trình; (3) Thiết kế, phát triển website và web app: có thể có cơ sở dữ liệu, thu thập thông tin, phân quyền theo phạm vi dự án; (4) Marketing: quảng cáo trực tuyến, social media, hoạt động khác theo phạm vi thống nhất.
- **Định vị (chốt 2026-10-25):** Aegis là **đội triển khai, thực thi** dự án tech, **không phải công ty tư vấn**. Tư vấn chỉ là bước mở đầu của triển khai, không bán riêng. Chuỗi giá trị: *tư vấn giải pháp → triển khai → bàn giao sản phẩm dễ dùng nhất* để chủ doanh nghiệp tự vận hành. Khi viết, chữ "tư vấn" luôn đi kèm triển khai/bàn giao, không đứng một mình.
- **Lời hứa bàn giao (chung cho 4 dịch vụ):** sản phẩm dễ dùng nhất cho chủ doanh nghiệp, không cần rành công nghệ vẫn tự vận hành. Không tự liệt kê hạng mục bàn giao cụ thể khi chưa được xác nhận.
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
- Không định vị là công ty an ninh mạng; không chủ đề thần thoại Hy Lạp; không hình lá chắn lớn, matrix, robot, neon tràn lan. **Ngoại lệ (quyết định 27/10/2026):** riêng cảnh Factory (`/factory`) được dùng cánh tay máy công nghiệp làm đạo cụ chế tác; vẫn không robot hình người, không bộ giáp, không hình ảnh Marvel, màu theo token ultramarine. Cũng trong Factory, theo yêu cầu của chủ dự án, cổng Liên hệ có một nhân vật lễ tân người thật cách điệu (không mặt, vest xanh theo token) đứng chắp tay, vẫy chào khi chuột tìm tới.

## Cấu trúc trang chính và quy tắc "không khoe sản phẩm" (chốt 27/10/2026)

- **Sản phẩm đã làm (7 dự án, thư viện mẫu giao diện) chỉ hiện khi khách đã quan tâm tới mảng Web & web app**, để không khiến Aegis trông chỉ mạnh về web. Trang chủ `/` không có mục Dự án hay Mẫu giao diện; menu chỉ Giới thiệu · Dịch vụ · Liên hệ.
- Mỗi dịch vụ có trang riêng, dùng id làm đường dẫn: `/web`, `/ai`, `/software`, `/marketing` (VI) và `/en/...` (EN). Trang AI, Phần mềm, Marketing: nhu cầu, phạm vi, giá trị, "cách làm việc" chung 4 bước và bộ câu hỏi liên hệ chọn sẵn dịch vụ; **không có sản phẩm, không có demo**. Trang `/web` thêm: dự án đã thực hiện, thư viện mẫu, và câu hỏi "Muốn tham quan Factory không?" với nút tới `/web/factory`.
- **Factory có hai bản cùng mã nguồn:** `/factory` (trung tính, không có khu Dự án và Studio mẫu; web bay dẫn sang `/web`) và `/web/factory` (bản sao đầy đủ, có Dự án + Studio, đường về là `/web`). Biến `Variant` ("neutral" | "web") trong `src/config/space.ts`, `useFactory().variant`, `SceneManifest.showcase`. `/factory/work`, `/factory/studio` chuyển 308 sang `/web/factory/...`.
- **Song ngữ trang chính:** tiếng Việt ở gốc, tiếng Anh ở `/en` (`/en/contact`, `/en/templates`). Nội dung: `src/content/site/{vi,en}.ts` (`getSiteDict(lang)`); EN dịch sát nội dung đã xác nhận, dùng chung `services-en.ts`, `templates-en.ts` với Factory. Form liên hệ: `contact-flow-i18n.ts` (câu hỏi), `contact-copy.ts` (chữ giao diện, thông báo lỗi), API nhận `lang` chỉ để đổi chữ thông báo lỗi. Các mẫu demo (`/mau-giao-dien/<slug>`) vẫn tiếng Việt.
- Nút VI | EN dùng liên kết thường (tải lại trang) để `html[lang]` đúng; script đầu trang trong `app/layout.tsx` đặt `lang="en"` cho mọi địa chỉ dưới `/en` (không dùng regex trong chuỗi đó).

## Thư viện mẫu giao diện (demo)

- Trang `/mau-giao-dien` và 6 mẫu `/mau-giao-dien/<slug>` (`src/content/templates.ts`). Đây là **mẫu demo do Aegis tự thiết kế**, thương hiệu và số liệu là **giả định**, phải luôn ghi rõ (DemoBar, DemoClosing, nhãn thư viện). Không trộn với 7 dự án thật.
- Thêm/sửa mẫu: skill `template-gallery`, agent `template-builder`.

## Factory "Aegis Forge" (`/factory` trung tính và `/web/factory`, cùng bản `/en`; phiên bản UI 3, chạy song song)

- Không gian 3D nhiều khu thay cho trang cuộn dài: **Lõi Aegis ở giữa, 4 khu dịch vụ NGANG HÀNG** (AI, Phần mềm quản trị, Web, Marketing) toả ra bốn hướng, Gallery (dự án thật), Studio (thí nghiệm + kệ 8 style + ghi chép) và Gate (liên hệ). Dòng năng lượng nối mọi khu về lõi.
- **Bốn dịch vụ không bao giờ đánh số hay xếp thứ tự "bước"**: cùng cỡ, cùng kiến trúc, nav theo vị trí. Không dùng mã "BV-xx". Trước/sau giữa dịch vụ đi vòng tròn, không có bộ đếm.
- Song ngữ VI + EN: tiếng Việt ở `/factory/...` (rewrite sang `/vi/factory/...` trong `next.config.ts`), tiếng Anh ở `/en/factory/...`. Slug tiếng Anh cho cả hai (`services/ai`, `work/<slug>`, `studio/lab/<id>`, `contact`). Slug cũ (`trung-bay`, `thi-nghiem`…) chuyển hướng 308.
- Nội dung: `src/config/space.ts` (khu, route, `servicesWithDemo`), `src/content/factory/{vi,en}.ts` (chữ giao diện + nội dung theo ngôn ngữ; EN dịch sát nội dung đã xác nhận, không thêm tuyên bố), `src/content/demos.ts` (3 demo), `lab.ts`, `journal.ts`. noindex, không vào sitemap. Trang chủ cũ ở `/` giữ nguyên (tag `option-1`).
- **Demo minh họa** cho 3 dịch vụ chưa có dự án thật (AI, Phần mềm, Marketing): thương hiệu "Minh Phát" và mọi dữ liệu là GIẢ ĐỊNH, luôn có nhãn `demoBadge`; demo AI là kịch bản soạn sẵn (không gọi mô hình), demo Marketing không có số liệu hiệu quả. Web dùng dự án thật (`Project.services`).
- Phòng thí nghiệm chỉ mô tả điều code làm thật; `usedIn` không được ghi chỗ không dùng. Ghi chép chỉ hiện bài `confirmed: true`, kể về cách dựng website, không số liệu hay ngày tháng.
- Kỹ thuật và bài học: skill `webgl-experiences`, `references/spatial-site.md`.

## Nhận diện

Logo, màu, font chính thức **chưa chốt**. Mọi lựa chọn hiện tại là tạm thời, tập trung trong `src/styles/tokens.css` và `src/styles/fonts.ts`.

## Art direction hiện tại

Xem `references/art-direction.md`: concept **"Bản vẽ nền móng"**.
