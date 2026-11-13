# Blog của /demo2: cách đăng bài

Mỗi bài là một file Markdown:

- Tiếng Anh: `src/content/blog/en/<slug>.md` → hiện ở `/demo2/blog/<slug>`
- Tiếng Việt: `src/content/blog/vi/<slug>.md` → hiện ở `/demo2/vi/blog/<slug>`

`<slug>` là tên file, chỉ dùng chữ thường không dấu, số và dấu gạch ngang (ví dụ `ai-trong-marketing.md`).
File bắt đầu bằng dấu gạch dưới (như `_template.md`) không bao giờ được đăng.

## Phần đầu file (bắt buộc)

```
---
title: Tiêu đề bài viết
date: 2026-12-01
excerpt: Một hai câu tóm tắt, hiện ở trang danh sách và thẻ mô tả.
tags: AI trong marketing, SEO
published: true
---
```

- `date` theo dạng `YYYY-MM-DD`; bài mới nhất hiện trên cùng.
- `published: false` (hoặc bỏ dòng này) thì bài chưa hiện: dùng khi đang viết nháp.

## Nội dung hỗ trợ

`## Tiêu đề mục`, `### Tiêu đề nhỏ`, đoạn văn, danh sách `- ` và `1. `, trích dẫn `> `, khối mã giữa hai dòng ```` ``` ````,
và trong dòng: `**đậm**`, `*nghiêng*`, `` `mã` ``, `[chữ](https://đường-dẫn)`.
Ảnh và bảng chưa hỗ trợ; cần thì báo để bổ sung vào `src/lib/demo2-blog.ts`.

Sau khi thêm bài: `pnpm build` rồi kiểm bằng `node scripts/qa-demo2.mjs <url>`.
