# Aegis — Website giới thiệu doanh nghiệp

Website giới thiệu một trang (single-page) cho **Aegis**: giải pháp AI doanh nghiệp, triển khai phần mềm quản trị, thiết kế website – web app và marketing.

**Stack:** Next.js 16 (App Router, trang chính được dựng tĩnh) · TypeScript · Tailwind CSS v4 · GSAP 3.15 (ScrollTrigger, SplitText) · Lenis · WebGL2 tự viết (không dùng Three.js) · pnpm.
Form liên hệ gửi email qua REST API của Resend, không cần SDK.

**Art direction hiện tại: "Bản vẽ nền móng".** Website là một bản vẽ kỹ thuật sống. Nền móng được dựng từ ~12.000 hạt WebGL, rồi biến hình thành bản vẽ của từng nhóm dịch vụ khi cuộn. Chi tiết: `.claude/skills/aegis-context/references/art-direction.md`.

> ⚠️ Màu sắc, font, wordmark chữ “Aegis”, favicon và đồ họa là **giao diện tạm thời**, chưa phải nhận diện thương hiệu chính thức.

## Thư viện mẫu giao diện (`/mau-giao-dien`)

Ngoài 7 dự án thực tế, website có **thư viện 6 mẫu giao diện demo** do Aegis tự thiết kế, mỗi mẫu cho một ngành và chạy thật:

| Mẫu | Ngành | Điểm nhấn |
|---|---|---|
| Kho Số | SaaS / web app | shader WebGL, chữ khổng lồ chạy theo cuộn |
| Nhà Sương | resort / kiến trúc | núi sương parallax, bản vẽ SVG tự vẽ |
| Quỹ Hành | tài chính | khối cẩm thạch raymarching, biểu đồ vẽ nét |
| Đêm Đô Thị 2027 | sự kiện | typography khổng lồ, đếm ngược, lịch trình tab |
| Mây Bạc | bán hàng online | sản phẩm SVG, bộ lọc, giỏ hàng trượt |
| Lành | phòng khám / đặt lịch | web app đặt lịch 4 bước có kiểm tra dữ liệu |

- Thương hiệu, nội dung, số liệu trong mẫu là **giả định**, được ghi rõ trên mọi trang mẫu (thanh "Mẫu demo", màn kết) và trên thư viện. Trang mẫu đặt `noindex`.
- Danh mục: `src/content/templates.ts`. Mã mẫu: `src/templates/<slug>/`. Route: `src/app/(demo)/mau-giao-dien/<slug>/page.tsx`.
- Chụp lại ảnh xem trước (server production đang chạy): `pnpm capture:templates http://localhost:3000 [slug]`, rồi build lại.
- Thêm mẫu mới: làm theo skill `.claude/skills/template-gallery/SKILL.md`.

## Bộ công cụ thiết kế (`.claude/`)

Repo kèm bộ **skills và agents cho Claude Code** để tiếp tục thiết kế/hiện thực ở chuẩn Awwwards: nghiên cứu site tham khảo, art direction chống "template AI", motion (GSAP/Lenis), WebGL, QA và chấm điểm. Xem [`.claude/README.md`](.claude/README.md).

---

## Chạy dự án

Yêu cầu Node.js ≥ 22.6 và pnpm.

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

Bản production:

```bash
pnpm build
pnpm start
```

Kiểm tra: `pnpm lint`, `pnpm typecheck`, hoặc `pnpm check` (lint + typecheck + build).

---

## Cập nhật nội dung

Toàn bộ nội dung nằm tách khỏi phần giao diện:

| Nội dung | File |
|---|---|
| Tên, thông điệp, menu, SEO, **thông tin liên hệ** | `src/config/site.ts` |
| Hero, Giới thiệu, 3 giá trị, tiêu đề các chương, Cách làm việc, Liên hệ | `src/content/about.ts` |
| 4 nhóm dịch vụ | `src/content/services.ts` |
| Portfolio (7 dự án, bộ lọc) | `src/content/projects.ts` |

**Cú pháp nhấn mạnh:** trong `about.ts`, phần đặt giữa `*dấu sao*` hiển thị bằng serif nghiêng màu accent. Mảng `lines` là các dòng được ngắt chủ đích của tiêu đề lớn.

**Thông tin liên hệ:** điền `email`, `phone`, `address` trong `src/config/site.ts`. Mục nào có giá trị sẽ tự hiển thị ở phần Liên hệ và Footer. Mục để `null` sẽ không hiển thị.

### Portfolio và ảnh preview

- Thêm hoặc sửa dự án trong `src/content/projects.ts`. Thứ tự trong mảng là thứ tự hiển thị, dự án đầu tiên được làm nổi bật.
- Chụp lại ảnh preview từ website thật (cần chạy `pnpm exec playwright install chromium` một lần trước đó):

  ```bash
  pnpm capture:previews               # tất cả dự án
  pnpm capture:previews vidi26 rethink  # chỉ một số slug
  ```

  Ảnh được lưu vào `public/portfolio/` và kích thước được ghi vào `src/content/project-previews.json`. Dự án chưa có ảnh sẽ tự hiển thị khung thay thế có tên và loại dự án.
- Chỉ ghi những tính năng đã được xác nhận vào `description` và `highlights`.

---

## Đổi theme và nhận diện thương hiệu

| Muốn đổi | Sửa ở |
|---|---|
| Màu, bo góc, cỡ chữ, khoảng cách, chuyển động | `src/styles/tokens.css` |
| Font (display, serif nghiêng, mono) | `src/styles/fonts.ts` (giữ tên các `variable`) |
| Màu hạt WebGL | tự đọc `--palette-paper` và `--palette-ultramarine-light` từ tokens.css |
| Logo (đang là wordmark chữ) | `src/components/ui/Wordmark.tsx` |
| Favicon | `src/app/icon.svg` |
| Màu thanh trình duyệt di động | `src/styles/theme-meta.ts` |
| Ảnh chia sẻ mạng xã hội | chạy `pnpm og:generate` (lấy màu từ tokens.css, nội dung từ src/content) |

Cách tổ chức màu:

- `tokens.css` gồm **bảng màu gốc** (`--palette-*`) và **màu theo vai trò** (`--bg`, `--fg`, `--accent`…).
- Section dùng `data-surface="dark"` (nền mực) hoặc `data-surface="light"` (nền giấy) để gán lại các màu vai trò, nên component chỉ cần một bộ class cho cả hai nền.
- Bảng màu mặc định của Tailwind đã bị tắt (`src/styles/globals.css`). Component chỉ dùng được các class theo token như `bg-surface`, `text-muted`, `text-accent`, `border-line`… Nhờ vậy không có mã màu nằm rải rác trong component.
- Hiệu ứng thị giác nằm trong `src/styles/effects.css` và cũng chỉ dùng biến token.

### Chuyển động và khả năng truy cập

- Script trong `<head>` đặt `data-motion="on"` khi người dùng **không** bật giảm chuyển động. Mọi trạng thái "ẩn chờ animation" chỉ áp dụng dưới cờ này, nên khi tắt JS hoặc bật reduced-motion thì nội dung vẫn hiển thị đầy đủ.
- Bật reduced-motion: không preloader, không smooth scroll, không ghim section, hạt WebGL chỉ vẽ một khung tĩnh.
- Preloader chạy 1 lần mỗi phiên, tối đa 3 giây, có failsafe CSS.
- WebGL được nạp lười khi trình duyệt rảnh; máy không hỗ trợ WebGL2 thì giao diện vẫn đầy đủ.

---

## Form liên hệ

Form kiểm tra dữ liệu ở trình duyệt **và** ở server (`src/app/api/contact/route.ts`). Các biện pháp chống spam:

- trường ẩn (honeypot);
- thời gian điền form tối thiểu;
- kiểm tra origin;
- giới hạn kích thước request;
- giới hạn 5 lần gửi / 10 phút / IP. Giới hạn này lưu trong bộ nhớ của từng instance nên chỉ mang tính tương đối trên môi trường serverless.

### Cấu hình gửi email (Resend)

1. Tạo tài khoản tại [resend.com](https://resend.com) (có gói miễn phí) và tạo API key.
2. Khai báo biến môi trường, xem `.env.example`:

   ```bash
   RESEND_API_KEY=re_xxx
   CONTACT_TO_EMAIL=email-nhan@congty.vn
   # Tùy chọn, sau khi xác minh tên miền trên Resend:
   CONTACT_FROM_EMAIL="Aegis Website <no-reply@ten-mien.vn>"
   ```

   Khi chưa xác minh tên miền, Resend chỉ cho gửi từ `onboarding@resend.dev` tới email của chính tài khoản Resend.
3. **Build lại / deploy lại.** Trang được dựng tĩnh nên trạng thái “đã kết nối” của form được xác định lúc build.

Khi chưa cấu hình, form hiển thị rõ là “đang chờ kết nối kênh tiếp nhận”, nút gửi bị vô hiệu hóa và API trả về `503 NOT_CONFIGURED`. Form không giả lập gửi thành công và không lưu dữ liệu vào trình duyệt.

Muốn đổi sang dịch vụ khác (Formspree, Google Sheets, CRM…), chỉ cần viết lại `src/lib/contact/delivery.ts`.

---

## Triển khai

- Khai báo `NEXT_PUBLIC_SITE_URL` (ví dụ `https://ten-mien.vn`) để metadata, ảnh OG, `robots.txt` và `sitemap.xml` dùng đúng tên miền. Website không hardcode tên miền nào.
- Phù hợp với Vercel hoặc bất kỳ nền tảng chạy được Next.js (Node.js).

---

## Kiểm thử giao diện tự động

```bash
pnpm build && pnpm start          # cửa sổ 1
pnpm qa http://localhost:3000     # cửa sổ 2
```

Script `scripts/qa.mjs` mở website ở 375px, 768px và 1440px rồi kiểm tra:

- tràn ngang, anchor nội bộ, liên kết ngoài (`target`/`rel`), ảnh lỗi, lỗi console;
- menu mobile, bộ lọc dự án, chọn sẵn dịch vụ, skip link;
- các phản hồi của API liên hệ.

Ảnh chụp và kết quả nằm trong `qa-output/`.

---

## Cấu trúc thư mục

```
src/
  app/            layout gốc, (site)/ trang chủ + thư viện mẫu, (demo)/ trang mẫu, API liên hệ, robots/sitemap, icon, ảnh OG
  components/
    layout/       Header (lớp blend + CTA + menu toàn màn hình), Footer, FooterWordmark
    sections/     Hero, About, Services, Process, Projects, Contact
    motion/       MotionProvider (Lenis), Preloader, SplitReveal, Cursor, Magnetic, ChapterHud
    webgl/        particle-engine (WebGL2), shapes (hình đích thủ tục), ParticleStage, stage-store
    services/ projects/ contact/   thành phần riêng của từng phần
    templates/    TemplateStage (khung xem trước), TemplateGallery
    ui/           Button (Roll, RoundButton), SmartLink, Rich/Lines (*nghiêng*), Wordmark, ScrollRevealText
  templates/      _kit/ (DemoBar, DemoClosing, ShaderCanvas, Marquee) + 6 mẫu demo
  config/site.ts  cấu hình chung
  content/        nội dung doanh nghiệp, dịch vụ, portfolio
  lib/            motion (gsap + plugin), validation form, gửi email, rate limit
  styles/         tokens.css, globals.css, effects.css, fonts.ts
scripts/          capture-previews, capture-templates, generate-og, qa
public/portfolio/ ảnh chụp các website trong portfolio
public/templates/ ảnh chụp các mẫu giao diện demo
```
