# Plan nâng cấp website Aegis: "wow" và đúng khí chất đội thực thi

> Trạng thái: **ĐÃ DUYỆT 2026-10-25 và đã triển khai đủ P0–P5** (chờ chủ dự án duyệt lần cuối + xử lý danh sách lỗi trong báo cáo). Q3 (ngân sách) mặc định không hỏi; Q5 duyệt nguyên danh sách; Q4 (kênh nhận form) cập nhật sau.
> Ngày lập: 2026-10-25 · Site hiện tại: https://aegis-nu-blush.vercel.app
> Tham chiếu: emotion-agency.com (work gallery 3D, contact), Awwwards SOTD.

---

## 0. Bối cảnh và chẩn đoán

### Mục tiêu của chủ dự án

1. Hiệu ứng chuột mượt và đẹp như Emotion.
2. Phần showcase mẫu giao diện sống động, kiểu vòng thẻ 3D của Emotion Work.
3. Chuyển trang thú vị hơn.
4. Liên hệ dạng hỏi–đáp ngắn, vào thẳng vấn đề. **Câu 1 hỏi dịch vụ quan tâm. Chọn 1 trong 4 dịch vụ thì các câu sau đổi theo dịch vụ đó.**
5. Định vị lại: **Aegis không phải công ty tư vấn, mà là đội triển khai, thực thi dự án tech.**

### Chẩn đoán từ code hiện tại

| Hạng mục | Hiện trạng (file) | Vì sao chưa "wow" |
|---|---|---|
| Con trỏ | `src/components/motion/Cursor.tsx` + CSS `effects.css:840-920`: chấm và vòng chạy bằng 2 `quickTo` riêng (0.12s / 0.5s). Con trỏ gốc vẫn hiện, trừ vùng `view`. | Có hai con trỏ cùng lúc: con trỏ gốc và vòng tròn. Vòng trễ 0.5s nên cảm giác "lê". Không biến dạng theo vận tốc. Phóng to dùng CSS transition, đánh nhau với chuyển động GSAP. Hero còn có thước ngắm và khói `MistCursor`, tổng cộng 3 hệ con trỏ không thống nhất. |
| Thư viện mẫu | Trang chủ: `TemplatesTeaser` (DragSlider cong). Trang `/mau-giao-dien`: mục lục chữ + `StyleProfiles` xen trái/phải (`TemplateGallery.tsx`). | Bố cục editorial tĩnh, giống một trang danh mục. Không có "sân khấu" hay không gian 3D, không có khoảnh khắc bước vào mẫu. |
| Chuyển trang | Link sang mẫu dùng thẻ `<a>` thường, nên **tải lại toàn trang**. Chưa dùng View Transitions. Preloader chỉ chạy ở trang chủ. | Mỗi lần chuyển trang là màn trắng, nháy, mất mạch cảm xúc. |
| Liên hệ | `ContactForm.tsx`: một form dài 5 trường; câu hỏi dịch vụ ở vị trí số 04; "Nội dung nhu cầu" bắt buộc ≥ 20 ký tự. | Khách phải tự viết đoạn mô tả, ngại bắt đầu. Không có câu hỏi theo từng dịch vụ, nên Aegis nhận thông tin chung chung. |
| Định vị | `services.ts`, `about.ts`, `aegis-context/SKILL.md`: 5 chỗ dùng "Tư vấn…" (AI, phần mềm, lựa chọn "Chưa xác định, cần tư vấn"). Giọng "đối tác đồng hành". | Đọc lên như một công ty tư vấn. Chưa thể hiện được "nhận việc, làm ra sản phẩm, bàn giao chạy được". |

Ghi chú khác:
- README ghi 6 mẫu, nhưng thực tế có **8 mẫu** (thêm `campus`, `playground`). Sẽ sửa README.
- Next 16.4 + React 19.3 có sẵn `<ViewTransition>` và `Link transitionTypes` (`node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`), không cần thêm thư viện để làm chuyển trang.
- Trang contact của Emotion thực ra là **một form đơn** (loại dự án, ngân sách, tên, liên hệ, mô tả, đính kèm brief). Bản Aegis sẽ đi xa hơn: **hỏi từng câu, có rẽ nhánh theo dịch vụ**.

### Nguyên tắc giữ nguyên (từ `AGENTS.md` và skill `aegis-context`)

- Không bịa số liệu, khách hàng, giá, lời chứng thực. Câu hỏi và lựa chọn trong form cũng không được ngầm hứa dịch vụ Aegis chưa xác nhận làm (xem mục Câu hỏi mở).
- Màu, font, bo góc lấy qua token. Chuyển động đặt trong `prefers-reduced-motion`. Không ẩn nội dung khi không có JS.
- Mẫu demo luôn ghi rõ là giả định, tách bạch với 7 dự án thật.
- Ngân sách JS: hiện ≤ 70 KB gzip. Đề xuất nới tối đa **+25 KB** cho toàn bộ nâng cấp. Mỗi phase phải đo lại.

---

## Lộ trình tổng thể

```
P0  Định vị "đội thực thi" (nội dung)            ─┐
P1  Liên hệ hỏi–đáp rẽ nhánh  ← ưu tiên cao nhất  │ có thể làm song song P0
P2  Hệ con trỏ mới                                ─┘
P3  Gallery 3D "Phòng trưng bày"
P4  Chuyển trang (cần P3 để có morph thẻ → mẫu)
P5  Đánh bóng khí chất + QA tổng
```

Thứ tự này ưu tiên chuyển đổi khách hàng (liên hệ) trước, rồi tới hiệu ứng. Kích thước ước lượng: **S** nhỏ · **M** vừa · **L** lớn.

---

## P0. Định vị lại: "Aegis dựng, chạy, bàn giao" (S)

**Mục tiêu:** đọc lướt 5 giây là hiểu Aegis là đội làm ra sản phẩm, không phải bên tư vấn.

Việc cần làm:
> **Đã chốt (Q1, Q2):** Aegis *có* tư vấn, nhưng tư vấn chỉ là **bước mở đầu của triển khai**, không phải sản phẩm bán riêng. Chuỗi giá trị là: **Tư vấn giải pháp → Triển khai → Bàn giao sản phẩm dễ dùng nhất** để chủ doanh nghiệp tự vận hành được.

1. **Đặt lại vai trò của "tư vấn"** trong `src/content/services.ts`. Tư vấn luôn đi kèm động từ thực thi phía sau, không đứng một mình làm dịch vụ:
   - AI: "Tư vấn và phát triển giải pháp AI…" → "**Tư vấn đúng bài toán, rồi dựng công cụ AI chạy thật** trong quy trình của doanh nghiệp."
   - Phần mềm quản trị: "Tư vấn, triển khai và tùy chỉnh…" → "**Tư vấn giải pháp, triển khai và tùy chỉnh** phần mềm quản trị khớp quy trình vận hành, bàn giao để đội ngũ dùng ngay."
   - Mục `scope` "Tư vấn hướng triển khai…" → "Tư vấn giải pháp và chốt phạm vi triển khai".
2. **Một lời hứa bàn giao chung cho cả 4 dịch vụ** (không liệt kê hạng mục riêng từng dịch vụ): "*Sản phẩm dễ dùng nhất* cho chủ doanh nghiệp: không cần rành công nghệ vẫn tự vận hành được." Hiển thị thành một khối nổi bật trong mục Về Aegis / Cách làm việc, và là bước cuối của quy trình 4 bước.
3. **Hero / Về Aegis / Cách làm việc** (`about.ts`): giữ concept "Bản vẽ nền móng", nhưng nhấn vào "dựng" thay vì "đồng hành". Hướng câu chữ (chờ duyệt):
   - Hero: "Bản vẽ của bạn, *Aegis dựng thật.*" hoặc giữ "Xây nền móng *vững chắc,* để tiến xa." và đổi phần mô tả thành "Đội triển khai AI, phần mềm quản trị, website – web app và marketing. Nhận bài toán, làm ra sản phẩm, bàn giao chạy được."
   - 4 bước làm việc: **Tư vấn giải pháp** → **Chốt phạm vi** → **Triển khai** → **Bàn giao sản phẩm dễ dùng**.
4. Lựa chọn "Chưa xác định, cần tư vấn" trong form → "**Nhiều hạng mục / chưa chắc, cần Aegis tư vấn**".
5. Cập nhật `.claude/skills/aegis-context/SKILL.md`, `art-direction.md` và README (8 mẫu), để các agent/skill sau này không viết lại giọng "tư vấn".

Tiêu chí xong: mọi chỗ có chữ "tư vấn" đều đi kèm triển khai/bàn giao phía sau. Lời hứa "sản phẩm dễ dùng nhất" xuất hiện ở hero hoặc Về Aegis và ở bước cuối quy trình.

---

## P1. Liên hệ "Bản vẽ của bạn": hỏi từng câu, rẽ nhánh theo dịch vụ (L)

### Trải nghiệm

Mỗi màn chỉ một câu hỏi, chữ lớn, như điền một **phiếu yêu cầu bản vẽ kỹ thuật**. Thanh tiến độ mono `BƯỚC 02 / 06`. Mỗi câu trả lời được "đóng" vào một khung bản vẽ thu nhỏ ở góc màn hình. Màn cuối là bản tóm tắt dạng **phiếu BV-xx** trước khi gửi.

```
[1] Bạn cần Aegis dựng gì?          ← 4 thẻ lớn (AI · Phần mềm quản trị · Website & web app · Marketing)
                                       + "Nhiều hạng mục / chưa chắc"
        │ chọn xong tự sang bước sau
        ▼
[2–3] 2–3 câu riêng theo dịch vụ     ← chip chọn nhanh, không phải gõ
        ▼
[4] Khi nào cần bắt đầu?             ← chung cho mọi nhánh
[5] (tuỳ chọn) Mô tả thêm / link tham khảo
[6] Liên hệ: Họ tên · Email hoặc SĐT/Zalo · Công ty (không bắt buộc)
        ▼
[Xem lại phiếu BV] → Gửi → màn "Đã đóng dấu" (con dấu mực ultramarine in xuống)
```

### Bộ câu hỏi theo nhánh (BẢN NHÁP, chủ dự án duyệt từng lựa chọn)

**AI doanh nghiệp**
- Bạn muốn AI làm việc gì? *(chọn nhiều)*: Trả lời khách hàng (chatbot) · Trợ lý nội bộ tra cứu tài liệu · Tự động hoá quy trình / xử lý giấy tờ · Tổng hợp dữ liệu, báo cáo · Khác
- Dữ liệu hiện nằm ở đâu?: Excel / Google Sheets · Phần mềm đang dùng · File, giấy tờ rời rạc · Chưa có dữ liệu
- Bạn đang ở bước nào?: Đã rõ việc cần làm · Đã thử vài công cụ AI · Bắt đầu từ đầu

**Phần mềm quản trị**
- Mảng cần quản trị? *(chọn nhiều)*: Bán hàng / khách hàng · Kho · Nhân sự · Tài chính · Dự án / công việc · Khác
- Hiện đang quản lý bằng gì?: Excel / Sheets · Một phần mềm khác · Giấy tờ · Chưa có gì
- Bao nhiêu người sẽ dùng?: 1–10 · 11–50 · 51–200 · Trên 200

**Website & web app**
- Bạn cần loại nào?: Website giới thiệu doanh nghiệp · Website sự kiện / landing page · Web app / hệ thống theo yêu cầu · Bán hàng online
- Cần những tính năng nào? *(chọn nhiều)*: Form thu thập thông tin · Tự quản lý nội dung · Tài khoản và phân quyền · Đa ngôn ngữ · Khác
- **Bạn thích style nào?** Hiện 8 thẻ thu nhỏ từ thư viện mẫu, có thể bỏ qua. Đây là điểm nối giữa gallery và liên hệ, ít agency làm.

**Marketing**
- Mục tiêu chính?: Có thêm khách hàng tiềm năng · Tăng doanh số · Tăng độ nhận diện · Quảng bá sự kiện
- Kênh muốn triển khai? *(chọn nhiều)*: Quảng cáo trực tuyến · Mạng xã hội · Khác (kênh cụ thể cần chủ dự án xác nhận)
- Hiện đã có người làm marketing chưa?: Có đội riêng · Có một người kiêm · Chưa có

**Nhiều hạng mục / chưa chắc** → bỏ qua phần câu hỏi riêng, sang thẳng mô tả tự do.

**Câu chung:** Thời gian bắt đầu: Càng sớm càng tốt · Trong 1–3 tháng · Đang tìm hiểu. Ngân sách: **chưa đưa vào**, chờ quyết định ở Q3.

### Thiết kế kỹ thuật

- **Nội dung tách khỏi giao diện:** toàn bộ câu hỏi, lựa chọn và nhánh khai báo trong `src/content/contact-flow.ts` (dữ liệu thuần). Sửa câu hỏi không cần đụng component.
- **Validation dùng chung** (`src/lib/contact/schema.ts`): `answers: Record<questionId, string | string[]>`. Server kiểm tra lại từng giá trị phải nằm trong danh sách lựa chọn của đúng nhánh. `message` chuyển thành **không bắt buộc**. Liên hệ chấp nhận email **hoặc** số điện thoại (định dạng VN).
- **Email gửi về** (`delivery.ts`): bảng câu hỏi → trả lời theo nhánh. Tiêu đề: `[Aegis] Website & web app – Nguyễn Văn A – trong 1–3 tháng`.
- **API** (`route.ts`): giữ nguyên các lớp chống spam (honeypot, thời gian điền, rate-limit, same-origin). Chỉ mở rộng phần schema.
- **Tương tác:** phím `Enter` sang bước sau, phím số `1–5` chọn nhanh, `Esc` / nút ← để quay lại. Trạng thái lưu `sessionStorage` để tải lại trang không mất bài. Chuyển giữa các bước dùng GSAP (câu cũ trượt lên mờ dần, câu mới tách dòng hiện ra).
- **Không có JS:** server render toàn bộ câu hỏi thành một form dài, nhóm theo dịch vụ bằng `<fieldset>`. JS nâng cấp thành dạng từng bước (progressive enhancement, đúng quy ước "không ẩn nội dung khi không có JS").
- **A11y:** mỗi bước là `<fieldset>` có `<legend>`; focus chuyển vào câu hỏi mới; tiến độ đọc bằng `aria-live`; chip là radio/checkbox thật.
- **Vị trí:**
  - Tạo **trang riêng `/lien-he`** (như Emotion `/contact`). Nút CTA ở header ("Trao đổi nhu cầu") trỏ về đây, có chuyển trang P4.
  - Ở trang chủ, mục Liên hệ giữ màn kết chữ khổng lồ, nhưng **câu 1 (4 thẻ dịch vụ) nằm ngay trên trang chủ**. Bấm một thẻ thì sang `/lien-he?dv=web` với câu 1 đã chọn sẵn.
  - Nút "Chọn dịch vụ này" ở chương Dịch vụ (`SelectServiceLink`, đang phát `SELECT_SERVICE_EVENT`) cũng đi thẳng vào nhánh tương ứng.
- **Kênh nhận (Q4: cập nhật sau):** vẫn làm đầy đủ form và luồng gửi. Khi chưa có email nhận, form hiện trạng thái "chờ kết nối" như bây giờ, không giả lập gửi thành công. Khi chủ dự án gửi email nhận và key Resend thì chỉ cần đặt biến môi trường `RESEND_API_KEY`, `CONTACT_TO_EMAIL` trên Vercel, không phải sửa code.

Tiêu chí xong: đi hết 4 nhánh và nhánh "chưa chắc" bằng chuột, bằng bàn phím, và khi tắt JS. Server từ chối giá trị không thuộc nhánh. Email nhận về đọc được ngay mà không cần hỏi lại khách.

---

## P2. Hệ con trỏ mới: "Đầu bút kỹ thuật" (M)

**Ý tưởng:** một con trỏ duy nhất, như đầu bút vẽ kỹ thuật lướt trên bản vẽ. Mượt kiểu Emotion nhưng mang ngôn ngữ Aegis.

1. **Một vòng lặp chung:** chuyển từ 2 `quickTo` sang một vòng lerp trên `gsap.ticker`, chuẩn hoá theo delta-time (mượt như nhau ở 60/120/144 Hz). Chấm bám sát con trỏ thật; vòng theo sau với độ trễ ngắn hơn (khoảng 0.15–0.2s) thay vì 0.5s.
2. **Co giãn theo vận tốc:** vòng kéo dài theo hướng di chuyển (scaleX theo tốc độ, xoay theo góc), hồi về tròn khi dừng. Đây là "cảm giác lỏng" của Emotion.
3. **Ẩn con trỏ gốc** trên toàn site khi bật con trỏ phụ (chỉ thiết bị có chuột, không giảm chuyển động), để hết cảnh hai con trỏ chồng nhau. Trên `input`/`textarea` trả lại con trỏ chữ.
4. **Bám dính vào nút (sticky):** rê lên nút tròn / nút CTA thì vòng **ôm lấy hình dạng nút** (nội suy width/height/radius theo `getBoundingClientRect`), nút nhích theo chuột (dùng lại `Magnetic`).
5. **Trạng thái theo ngữ cảnh** (giữ API `data-cursor` hiện có, 11 chỗ đang dùng): `view` "Xem ↗" · `drag` "Kéo ↔" · `open` "Mở mẫu" · `send` "Gửi" · `text` (ẩn vòng). Nhãn đổi bằng hiệu ứng xáo chữ (`TextScramble`).
6. **Bấm chuột:** vòng co lại rồi nảy ra, để lại một dấu "+" hairline mờ dần tại điểm bấm (chữ ký bản vẽ).
7. **Gộp hệ con trỏ trong hero:** thước ngắm và khói `MistCursor` đọc toạ độ từ cùng một store của con trỏ mới, không tự nghe `pointermove` riêng, để chuyển động đồng bộ và nhẹ hơn.
8. Tắt khi màn hình cảm ứng hoặc khi giảm chuyển động. Chỉ animate `transform`/`opacity`. Không layout thrash (đo kích thước nút một lần khi bước vào).

Tiêu chí xong: so cạnh nhau với Emotion ở 60 Hz và 120 Hz. Không còn hiện 2 con trỏ cùng lúc. Lượng JS tăng ≤ 3 KB.

---

## P3. Gallery 3D "Phòng trưng bày bản vẽ" (L)

**Ý tưởng:** lấy cảm hứng từ vòng thẻ 3D của Emotion, nhưng chuyển sang ngôn ngữ Aegis. Các mẫu giao diện là **những tấm bản vẽ xếp thành vòng cung** trong một xưởng vẽ tối: sàn phản chiếu, lưới trần hairline phối cảnh, viền thẻ phát sáng ultramarine nhạt (accent vẫn ≤ 5%).

### Hành vi

- **Vòng cung 3D:** 8 thẻ mẫu đặt trên một cung tròn, camera nhìn từ tâm. Cuộn chuột, kéo, hoặc phím ←/→ để xoay vòng, có quán tính.
- **Biến dạng theo tốc độ:** quay nhanh thì thẻ cong mạnh hơn, tách kênh RGB nhẹ và ảnh nhoè dọc (khớp với `ScrollChroma` đang có). Dừng thì thẻ ở giữa "vào nét".
- **Hover thẻ:** thẻ nhô ra, ảnh chụp toàn trang của mẫu **tự cuộn bên trong thẻ** (tận dụng ảnh `*-full.webp` đã có), con trỏ đổi sang "Mở mẫu ↗".
- **Lọc:** nút "Lọc" ở dưới (theo ngành / cảm xúc). Thẻ không khớp lùi ra sau và mờ, thẻ khớp dồn lại.
- **Thước tiến độ** dạng vạch như Emotion `12 |||||█|||| 16`, nhưng bằng nhãn mono kiểu bản vẽ: `STYLE 03 / 08 · SIGNAL`.
- **Click thẻ:** thẻ phóng ra phủ màn hình, morph sang hero của mẫu (nối với P4).
- **Thông tin thẻ đang chọn** hiện ở dải dưới (DOM, không nằm trong canvas): tên style, ngành, cảm xúc, nhãn "Mẫu demo – thương hiệu giả định".

### Kỹ thuật

- **WebGL2 tự viết** (đúng stack, không dùng Three.js), dùng chung khung với `particle-engine.ts`. Mỗi thẻ là một mặt lưới (khoảng 32×32 đỉnh) uốn cong trong vertex shader theo tốc độ. Phản chiếu sàn = vẽ lại lật ngược, kèm gradient mờ dần. Texture lấy từ `public/templates/*.webp` (ảnh bìa trước, ảnh toàn trang tải lười khi hover).
- **DOM là nguồn sự thật:** danh sách thẻ thật (`<a href>`) vẫn nằm trong DOM để tab, đọc màn hình và SEO hoạt động. Canvas chỉ trang trí (`aria-hidden`), đồng bộ vị trí theo thẻ đang focus.
- **Fallback:** không có WebGL2, hoặc giảm chuyển động, hoặc mobile yếu → dùng dải thẻ CSS 3D (`perspective` + `rotateY`) với cùng dữ liệu. Không có JS → lưới thẻ tĩnh hiện tại.
- **Vị trí áp dụng:**
  - `/mau-giao-dien`: gallery 3D chiếm màn đầu (thay mục lục chữ). Phần "hồ sơ style" chi tiết giữ bên dưới.
  - Trang chủ `TemplatesTeaser`: bản thu nhỏ, 3–4 thẻ giữa vòng, nút "Bước vào phòng trưng bày" → `/mau-giao-dien` (chuyển trang P4).
- **Hiệu năng:** chỉ render khi section trong viewport (IntersectionObserver), DPR ≤ 2, texture ≤ 1024px cạnh dài cho ảnh bìa, dừng vòng lặp khi tab ẩn. Mục tiêu 60 fps trên laptop tầm trung, bundle ≤ +12 KB gzip.
- **Tách bạch thật/demo:** gallery 3D chỉ dành cho mẫu demo. 7 dự án thật giữ danh sách chữ lớn + ảnh theo con trỏ (có thể đánh bóng ở P5), để không lẫn hai loại.

Tiêu chí xong: xoay, lọc, hover và mở mẫu chạy mượt trên Chrome, Safari, Firefox. Bàn phím đi được hết 8 thẻ. Fallback CSS chạy đúng khi tắt WebGL.

---

## P4. Chuyển trang "Lật bản vẽ" (M)

Dùng React `<ViewTransition>` + `Link transitionTypes` (có sẵn trong Next 16.4 / React 19.3). Trình duyệt không hỗ trợ thì chuyển trang bình thường, không lỗi.

1. **Đổi các link nội bộ sang `next/link`** (template, thư viện, `/lien-he`), để chuyển trang không tải lại toàn bộ. Cần kiểm tra Lenis/ScrollTrigger được dọn và khởi tạo lại đúng khi đổi route, và preloader không chạy lại.
2. **Ba kiểu chuyển cảnh, theo ý nghĩa:**
   - **Trang Aegis ↔ trang Aegis** (Trang chủ ↔ Thư viện ↔ Liên hệ): "**rèm bản vẽ**". Một tấm giấy kẻ lưới quét ngang, nét lưới được vẽ ra, nhãn mono `BV-05 → THƯ VIỆN STYLE` chạy giữa màn. Khoảng 700ms. Thoát ra theo chiều ngược lại khi bấm Back (`transitionTypes` dạng `forward`/`back`).
   - **Thẻ gallery → trang mẫu:** **morph phần tử chung**. Ảnh thẻ phóng thành hero của mẫu (`<ViewTransition name="tpl-<slug>">` ở cả hai đầu). Đây là khoảnh khắc wow chính. Quay lại thì thu ngược về thẻ.
   - **Trang mẫu → về Aegis:** thanh "Mẫu demo" thu lại thành nhãn, rèm bản vẽ đóng.
3. Prefetch trang mẫu khi hover thẻ, để morph luôn có cặp phần tử (theo hướng dẫn của Next: trang đích phải render cùng commit).
4. Reduced motion: chỉ crossfade 150ms.
5. Con trỏ (P2) giữ trạng thái xuyên suốt khi chuyển trang (nằm ở root layout).

Tiêu chí xong: không còn màn trắng hay nháy giữa các trang. Morph thẻ → mẫu chạy trên Chrome và Safari. Firefox fallback êm. Back/Forward đúng chiều.

---

## P5. Đánh bóng khí chất + QA tổng (M)

Đề xuất thêm, **làm hay không tuỳ chủ dự án duyệt**:
- **Chương Dịch vụ:** thêm dải "Bàn giao" (từ P0) hiện dạng **danh mục bản vẽ đóng dấu**, mỗi mục được "đóng dấu" khi cuộn tới. Nhấn mạnh "làm ra sản phẩm".
- **Dự án thật:** khi hover tên dự án, ảnh preview dùng hiệu ứng méo nước (`ImageDistortLayer` đã có) thay vì ảnh phẳng. Click mở trang dự án thật trong tab mới, kèm hiệu ứng thoát.
- **Menu toàn màn hình:** mở menu = rèm bản vẽ (dùng chung P4), các mục menu xáo chữ.
- **Nút "Cài đặt" kiểu Emotion** (chất lượng hiệu ứng Cao/Thấp, tắt chuyển động). Hữu ích cho máy yếu. **Không** làm âm thanh (art direction đã cấm âm thanh tự phát).

QA bắt buộc trước bàn giao mỗi phase (theo `AGENTS.md`):
- `pnpm check` (lint + typecheck + build).
- `pnpm qa <url>` trên bản build production; chụp hành trình cuộn (skill `design-qa`).
- Kiểm tra trên Chrome / Safari / Firefox, mobile 375px, bàn phím, giảm chuyển động, tắt JS.
- Ngân sách: LCP ≤ 2.5s, CLS = 0, không lỗi console, JS tăng không quá mức đã nêu.
- Chấm điểm bằng agent `awwwards-juror` (Design / Usability / Creativity / Content) trước và sau, để đo tiến bộ.

---

## Câu hỏi mở: cần chủ dự án trả lời trước khi làm

| # | Câu hỏi | Ảnh hưởng | Đề xuất mặc định |
|---|---|---|---|
| Q1 | Hướng câu chữ "đội thực thi" | P0 | ✅ **Đã chốt:** giữ "tư vấn" nhưng chỉ là bước mở đầu của triển khai |
| Q2 | Aegis bàn giao gì? | P0, P5 | ✅ **Đã chốt:** một lời hứa chung: sản phẩm dễ dùng nhất để chủ doanh nghiệp tự vận hành |
| Q3 | Form có hỏi **ngân sách dự kiến** không? | P1 | Chưa trả lời → mặc định **không hỏi** |
| Q4 | Kênh nhận form (email, SĐT/Zalo, key Resend) | P1 | ✅ **Cập nhật sau.** Form vẫn làm đủ, hiện "chờ kết nối" tới khi có env |
| Q5 | Duyệt các lựa chọn trong bộ câu hỏi theo nhánh: lựa chọn nào Aegis **thực sự làm**? | P1 | **Đang chờ.** Chỉ giữ lựa chọn được xác nhận |
| Q6 | Gallery WebGL đầy đủ hay CSS 3D | P3 | ✅ **Đã chốt:** 3D đầy đủ (WebGL), fallback CSS 3D cho máy không hỗ trợ |
| Q7 | Làm trang riêng `/lien-he` như Emotion, hay chỉ giữ ở cuối trang chủ? | P1, P4 | Cả hai: câu 1 ở trang chủ, đầy đủ ở `/lien-he` |
| Q8 | Thứ tự phase như trên có ổn không, hay ưu tiên hiệu ứng (P2–P4) trước? | Tất cả | P0+P1 → P2 → P3 → P4 → P5 |

---

## File dự kiến chạm tới

| Phase | Sửa | Thêm mới |
|---|---|---|
| P0 | `src/content/services.ts`, `about.ts`, `types.ts`, `src/config/site.ts`, `.claude/skills/aegis-context/*`, `README.md` | — |
| P1 | `src/lib/contact/schema.ts`, `delivery.ts`, `src/app/api/contact/route.ts`, `src/components/sections/Contact.tsx`, `SelectServiceLink.tsx` | `src/content/contact-flow.ts`, `src/components/contact/ContactWizard.tsx` (+ các bước), `src/app/(site)/lien-he/page.tsx` |
| P2 | `src/components/motion/Cursor.tsx`, `effects.css` (mục Cursor), `MistCursor.tsx`, `HeroFx.tsx`, `Magnetic.tsx` | `src/lib/pointer-store.ts` |
| P3 | `src/app/(site)/mau-giao-dien/page.tsx`, `TemplatesTeaser.tsx`, `TemplateGallery.tsx` | `src/components/webgl/gallery-engine.ts`, `src/components/templates/GalleryRing.tsx` (+ fallback CSS) |
| P4 | Các link nội bộ, `src/app/(demo)/mau-giao-dien/*/page.tsx` (đặt `ViewTransition` ở hero), `MotionProvider.tsx`, `globals.css` | `src/components/motion/PageTransition.tsx` |
| P5 | Theo hạng mục được duyệt | — |

---

## Cách triển khai sau khi duyệt

- Làm **từng phase một**, mỗi phase một commit/nhánh riêng. Hết phase thì gửi ảnh chụp, video ngắn và kết quả `pnpm check` / `pnpm qa` để chủ dự án duyệt rồi mới sang phase tiếp.
- Mỗi phase bắt đầu bằng đọc skill `aegis-context`, rồi `motion-engineering` / `webgl-experiences` / `design-qa` tương ứng (bộ kit trong `.claude/`).
- Không đẩy lên Vercel production khi chưa được đồng ý.
