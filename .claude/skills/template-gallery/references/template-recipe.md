# Công thức & bài học khi dựng mẫu demo

## Mẫu hiện có

8 mẫu thế hệ 2, mỗi mẫu = một style trong skill `style-library` (slug = tên style viết thường): `atelier`, `signal`, `serene`, `hearth`, `broadcast`, `playground`, `voyage`, `campus`. Công thức đầy đủ: `.claude/skills/style-library/styles/<slug>.md`. 6 mẫu thế hệ 1 đã gỡ; kỹ thuật của chúng lưu ở `style-library/references/legacy-techniques.md`.

## Tiêu chuẩn thế hệ 2 (rút từ phản hồi "mẫu còn chán")

- **Ảnh thật có giấy phép** là nhân vật chính (`scripts/images.mjs`), credit hiện trong DemoClosing của mẫu.
- **Ít nhất 1 tương tác chủ động** ngoài cuộn (kéo, chọn, lật, gõ, đặt lịch, quiz).
- **Phản hồi tức thì với chuột** ở hero hoặc section signature (MistCursor, CursorPreview, ImageDistort, Stickers, DragSlider bend).
- Bố cục **phá nhịp**: ít nhất một section tràn mép và một section rất thoáng.

## ShaderCanvas (fragment shader dùng lại)

`src/templates/_kit/ShaderCanvas.tsx` cung cấp `uTime`, `uRes`, `uMouse` (lerp), `uScroll` (tiến độ phần tử qua màn hình). Shader trả **màu premultiplied** (`vec4(col * a, a)`) cho nền trong suốt. Raymarching: giới hạn ~90 bước, `maxDpr` 1–1.25, canvas không full màn hình.

## Lỗi đã gặp và cách tránh

- **Hai tween GSAP cùng một thuộc tính** (intro `from xPercent` + scroll `scrub xPercent`) → chữ văng khỏi khung. Tách 2 lớp: lớp ngoài scrub, lớp trong intro.
- **Khoảng trắng trong span inline-block** bị co về 0 → dùng `" "`.
- **`fill="var(--x)"` trên SVG** không đảm bảo hoạt động → dùng `style={{ fill: "var(--x)" }}` (cả `stopColor`).
- **CSS mẫu không bọc `@layer components`** sẽ thắng utility Tailwind → luôn bọc layer.
- **Ngày giờ (`new Date()`) trong render** của client component bị prerender → chỉ tính sau tương tác (bước 2 của Booking) hoặc trong callback `setInterval`/`setTimeout` (Countdown). Không gọi setState đồng bộ trong effect (lint `react-hooks/set-state-in-effect`).
- **Accessible name** với span `sr-only` định vị tuyệt đối sẽ thêm khoảng trắng ("Thêm vào giỏ : Tên") — chấp nhận được; viết test với regex `\s*`.
- **Font không có tiếng Việt** (Syne, Bebas Neue, DM Serif Display, Bodoni Moda, Instrument Serif…) → `next/font` báo lỗi subset; chọn font khác.
- **Anton/condensed uppercase**: dấu tiếng Việt chồng cao → line-height ≥ 1.0, tránh mask overflow cắt dấu.
- **Ảnh xem trước** phải chụp từ bản production và **build lại** sau khi chụp (manifest JSON được nhúng lúc build).
- **Không có màu mặc định của Tailwind** (`bg-white`, `text-black`, `bg-red-500`…): `@theme` của Aegis xóa bảng màu gốc, các class này không sinh CSS. Luôn dùng token của mẫu (`bg-(--t-paper)`).
- **`cn()` không gộp class xung đột** (không dùng tailwind-merge): component fx có class mặc định về vị trí (`relative`) phải để caller thay hẳn (`className ?? "relative"`), nếu không `relative` và `absolute` cùng tồn tại và thứ tự CSS quyết định.
- **WebGL + React Strict Mode (dev)**: effect chạy 2 lần; context đã `loseContext()` không dùng lại được trên cùng canvas → tạo canvas mới trong effect và `remove()` khi dọn (đã áp dụng cho ShaderCanvas, MistCursor, ImageDistortLayer).
- **Nguồn ảnh (2026-10):** Openverse trả 401/Cloudflare cho truy cập tự động → `images.mjs` mặc định dùng Wikimedia Commons API (ưu tiên danh mục *Quality images*, bổ sung từ toàn Commons). Giấy phép nhận: CC0, PD, CC BY, CC BY-SA (BY-SA: dùng nguyên ảnh, ghi công + link giấy phép, không nướng filter màu vào file). `upload.wikimedia.org` giới hạn tần suất (429): `pick` lấy bản thumbnail **1920px** (cỡ chuẩn; cỡ lạ như 2000 trả file gốc, bị chặn gắt hơn), tự chờ tăng dần và ghi credit sau mỗi ảnh. Đừng chạy `search` và `pick` song song.
- **Ảnh có người:** ưu tiên ảnh bàn tay/công việc, tránh ảnh trẻ em nhìn rõ mặt; không dùng ảnh có logo thương hiệu thật nổi bật.
- **Dev server + JSON:** sau khi `pick`, Turbopack đôi khi giữ bản `image-credits.json` cũ ở lần render server đầu (lỗi "Thiếu ảnh mẫu") → tải lại trang; bản `pnpm build` không bị.
