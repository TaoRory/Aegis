<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Quy ước dự án Aegis

- **Nội dung tách khỏi giao diện.** Văn bản, dịch vụ, portfolio, liên hệ nằm trong `src/config/site.ts` và `src/content/*`. Không viết nội dung doanh nghiệp trực tiếp trong component.
- **Không bịa thông tin.** Không thêm số liệu, khách hàng, lời chứng thực, logo đối tác, công nghệ dự án, giá/gói dịch vụ hay thông tin liên hệ chưa được xác nhận. Portfolio chỉ ghi tính năng đã xác nhận.
- **Theme qua token.** Màu, font, bo góc, đổ bóng, chuyển động lấy từ `src/styles/tokens.css`. Bảng màu mặc định của Tailwind đã bị tắt; dùng class theo vai trò (`bg-surface`, `text-muted`, `text-accent`, `border-line`…). Không dùng mã màu trực tiếp trong component. Vùng nền tối dùng `data-surface="dark"`.
- **Chuyển động** đặt trong `@media (prefers-reduced-motion: no-preference)` (xem `src/styles/effects.css`).
- **Form liên hệ** không được giả lập gửi thành công. Tích hợp gửi nằm ở `src/lib/contact/delivery.ts`; validation dùng chung ở `src/lib/contact/schema.ts`.
- **Chuyển động:** import gsap từ `src/lib/motion.ts`; animation trong `useGSAP`/`gsap.matchMedia`; trạng thái ẩn chỉ dưới `[data-motion="on"]`.
- **Bộ kit thiết kế:** `.claude/skills` (design-research, awwwards-art-direction, motion-engineering, webgl-experiences, design-qa, aegis-context, apple-design, impeccable) và `.claude/agents`. Đọc `aegis-context` trước khi làm UI. `impeccable` đọc `PRODUCT.md` và `DESIGN.md` ở gốc dự án; chỉ dùng các lệnh tinh chỉnh (critique, audit, harden, adapt, optimize, typeset, layout, clarify, polish), không dùng lệnh đổi phong cách khi chưa được yêu cầu.
- **Mẫu giao diện demo** (`/mau-giao-dien`): thương hiệu giả định, luôn ghi rõ là demo, không trộn với dự án thật; làm theo skill `template-gallery`. Mỗi mẫu có token riêng `.tpl-<slug>`.
- Trước khi bàn giao: `pnpm check`, sau đó `pnpm qa <url>` (chạy `scripts/qa-demo3.mjs`, bài kiểm của website chính) trên bản build production, rồi chụp hành trình cuộn (skill `design-qa`).
- **Bản /demo2** (hướng Growth: website + marketing + AI thành một "tài sản số", gói Own / Grow / Amplify; website nhiều trang, tiếng Anh là chính, tiếng Việt ở `/demo2/vi`): nội dung ở `src/content/demo2.ts`, component ở `src/components/demo2`, kiểu ở `src/styles/demo2.css`, kiểm bằng `node scripts/qa-demo2.mjs <url>`. Blog: thêm file Markdown theo `src/content/blog/README.md`. Làm giao diện mới thì đọc `DESIGN-PLAYBOOK.md` (nguyên tắc chống "AI slop", dùng lại được cho dự án khác).
- **Website chính** (trước là bản /demo3; từ 2026-11-15 nằm ở gốc: tiếng Anh ở `/`, tiếng Việt ở `/vi`; trang chính cũ đã gỡ, địa chỉ cũ chuyển 308 trong `next.config.ts`; /demo1, /demo2, thư viện mẫu, Factory, Studio vẫn giữ): route ở `src/app/(demo3)` (nhóm route, không có tiền tố), component ở `src/components/demo3` (mỗi trang một file, công thức chuyển động ở `fx/`), chữ riêng ở `src/content/demo3/<khu vực>.ts` (chữ chung lấy từ `demo2.ts` qua `getD3`), kiểu riêng ở `src/styles/demo3/<khu vực>.css` trong phạm vi `.d3` (class nền `.d2-*` vẫn ở `demo2.css`), form "Get a quote" dùng ContactWizard chung, giao diện riêng ở `src/styles/demo3/contact.css`, metadata (canonical + hreflang) qua `d3Meta(title, description, lang, path)`, kiểm bằng `node scripts/qa-demo3.mjs <url>`. Khối trồi lên dùng `<Rise>`, tiêu đề hiện theo dòng dùng `<SplitReveal>`, nút viên dùng `D3Btn`, liên kết nội bộ dùng `D3Link` (gắn sẵn loại chuyển trang; view transition được kích hoạt ở layout bằng `RouteTick`, vì Next chỉ "bật hiện" trang dựng sẵn nên `<ViewTransition>` đặt trong trang không bao giờ chạy); nhãn con trỏ khai báo bằng `data-cursor="view|drag|open|read"`; không tự gắn thuộc tính lên phần tử của React. Next giữ trang cũ ở trạng thái ẩn trong DOM khi đổi trang: bộ chọn trong script và bài QA phải lấy phần tử đang hiện.
