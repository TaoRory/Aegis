---
name: template-gallery
description: Thiết kế và xây dựng mẫu giao diện demo (template) cho thư viện mẫu của website Aegis — mỗi mẫu là một thương hiệu giả định thuộc một ngành, có art direction riêng (font, màu, chuyển động) và chạy thật ở /mau-giao-dien/<slug>. Dùng khi cần thêm/sửa mẫu, thêm ngành mới vào thư viện, hoặc chụp lại ảnh xem trước.
---

# Thư viện mẫu giao diện (template gallery)

Mục tiêu: cho khách thấy **năng lực** của Aegis qua các mẫu chạy thật, tách bạch hoàn toàn với **dự án thực tế** (`src/content/projects.ts`).

## Quy tắc trung thực (bắt buộc)

- Mỗi mẫu là **thương hiệu giả định**. Ghi rõ ở: thanh `DemoBar` (luôn hiện), màn kết `DemoClosing`, thẻ trong thư viện ("(giả định)"), và `templateNotice`.
- Số liệu, giá, lịch, tên nghệ sĩ… trong mẫu là minh họa; ghi chú "minh họa" cạnh số liệu dạng thống kê/biểu đồ.
- **Không** dùng tên/logo/ảnh của thương hiệu, người thật; tránh tên trùng nghệ sĩ/doanh nghiệp có thật.
- **Không** sao chép bố cục/asset từ site tham khảo (Emotion và khách hàng của họ…); chỉ học pattern.
- Trang mẫu đặt `robots: noindex` (qua `demoMetadata`) để thương hiệu giả định không lên kết quả tìm kiếm.
- Form/giỏ hàng/đặt lịch trong mẫu **hoạt động trong trình duyệt** và nói rõ "không có dữ liệu nào được gửi đi"; không giả lập gửi thành công tới server.

## Cấu trúc

```
src/content/templates.ts                 ← danh mục mẫu (slug, brand, ngành, cảm xúc, kỹ thuật, màu sân khấu)
src/content/template-previews.json       ← sinh tự động bởi pnpm capture:templates
src/templates/_kit/                      ← DemoBar, DemoClosing, ShaderCanvas, Marquee, kit.css, metadata.ts
src/templates/<slug>/{fonts.ts, <slug>.css, <Comp>.tsx}
src/app/(demo)/mau-giao-dien/<slug>/page.tsx   ← route tĩnh, mỗi mẫu một trang
src/app/(site)/mau-giao-dien/page.tsx    ← trang thư viện
src/components/templates/                ← TemplateStage (khung xem trước), TemplateGallery
src/components/sections/TemplatesTeaser.tsx    ← giới thiệu trên trang chủ
src/components/fx/                       ← bộ tương tác dùng chung (DragSlider, CursorPreview, MistCursor, Stickers…)
src/content/image-credits.json           ← credit ảnh có giấy phép (sinh bởi images.mjs)
```

## Quy trình thêm một mẫu

1. **Chọn style** trong `style-library` (mỗi mẫu = một style có tên; slug = tên style viết thường). Ngành mới: viết file style mới theo cùng khung trong `style-library/styles/`, rồi mới dựng mã.
1b. **Ảnh**: `node .claude/skills/template-gallery/scripts/images.mjs search "<truy vấn>" <thư mục tạm> --tall|--wide` → xem `candidates.jpg` → `images.mjs pick <thư mục tạm> <slug> ten=chiso …` (ghi WebP vào `public/templates/<slug>/` và credit vào `src/content/image-credits.json`). Chỉ giấy phép CC0/PDM/CC BY.
2. **Font** có subset `vietnamese` (kiểm bằng font-data.json, xem `typography.md`); khai báo trong `src/templates/<slug>/fonts.ts` với biến `--font-<slug>-…`.
3. **Token riêng** trong `<slug>.css` dưới `.tpl-<slug>` (`--t-bg, --t-fg, --t-muted, --t-accent, --t-line, --t-font-display, --t-font-body, --t-font-accent`), bọc `@layer components`. Component dùng `bg-(--t-bg)`, `text-(--t-accent)`… — không viết mã màu trong JSX. SVG: màu qua `style={{ fill: "var(--t-x)" }}`, **không** qua thuộc tính `fill="var(...)"`.
4. **Component** gốc `<div className="tpl tpl-<slug>">`, header riêng của thương hiệu (link nội trang `#…`), mọi CTA dẫn tới `#demo-ket` hoặc một tương tác thật.
5. **Route** `src/app/(demo)/mau-giao-dien/<slug>/page.tsx`: `export const metadata = demoMetadata(SLUG)`, bọc biến font, render `<Comp/> <DemoClosing/> <DemoBar/>`.
6. **Đăng ký** trong `src/content/templates.ts` (stage/stageInk lấy từ bảng màu của mẫu).
7. **Chụp ảnh:** `pnpm build && pnpm start`, rồi `pnpm capture:templates http://localhost:3000 <slug>`, sau đó build lại để thư viện nhận manifest.
8. **QA:** `pnpm qa` (tự kiểm tra tràn ngang, nhãn demo, lỗi console cho mọi trang mẫu) + chụp hành trình cuộn (skill `design-qa`) và **xem ảnh**.

Công thức chi tiết, lỗi thường gặp: `references/template-recipe.md`.
