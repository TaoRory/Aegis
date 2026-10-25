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
- **Bộ kit thiết kế:** `.claude/skills` (design-research, awwwards-art-direction, motion-engineering, webgl-experiences, design-qa, aegis-context) và `.claude/agents`. Đọc `aegis-context` trước khi làm UI.
- **Mẫu giao diện demo** (`/mau-giao-dien`): thương hiệu giả định, luôn ghi rõ là demo, không trộn với dự án thật; làm theo skill `template-gallery`. Mỗi mẫu có token riêng `.tpl-<slug>`.
- Trước khi bàn giao: `pnpm check`, sau đó `pnpm qa <url>` trên bản build production, rồi chụp hành trình cuộn (skill `design-qa`).
