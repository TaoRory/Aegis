# Ghi chú các website tham khảo

Nghiên cứu ngày 2026-10-23 bằng `inspect-site.mjs` và các trang Awwwards. Ảnh: `sites/<tên>.jpg`.

---

## The Void (thevoid…vercel.app): văn phòng ảo, Hà Nội · `sites/thevoid.jpg`

- **Ý tưởng lớn:** "khoảng trống" như một khu vườn. Wordmark VOID khổng lồ, **ảnh lồng vào chữ O** (hero và footer lặp lại để tạo vòng khép).
- **Thị giác:** đen `#0C0C0B` + kem `#E8E6E0`, ảnh đen trắng. Font **Inter + Newsreader (serif nghiêng)**. Câu tiêu đề trộn sans thường với *serif nghiêng* ở vế cảm xúc ("Một khu vườn, *bốn cách bước vào*.").
- **Bố cục:** section có nhãn nhỏ "01 — DỊCH VỤ", "02 — VỀ THE VOID". Ảnh trong khung **vòm, tròn, oval**, nối nhau bằng đường cong mảnh. Dãy thẻ dọc dạng accordion ngang. Hàng số liệu lớn (800 m², 12 chỗ…). Danh sách đối tác dạng text có chỉ số mũ. Bản vẽ phác thảo line-art. Bản đồ tối.
- **Vi tương tác:** cursor bong bóng tròn chữ "XEM", chữ đoạn manifesto **sáng dần khi cuộn** (xám → trắng).
- **Kỹ thuật:** Next.js, không WebGL. Wow đến từ **typography + art direction ảnh + nhịp**, không cần 3D.
- **Áp dụng:** trộn serif nghiêng cho từ khóa cảm xúc; nhãn section đánh số; wordmark khổng lồ ở footer; dùng cursor label.

## EnduroSat (endurosat.com): vệ tinh · `sites/endurosat.jpg` · Awwwards Nominee, 60fps

- **Ý tưởng lớn:** hành trình "từ ý tưởng tới quỹ đạo". Một cảnh 3D **liên tục** xuyên suốt trang, đổi hình theo cuộn (vệ tinh → Trái Đất → khối cầu ghép từ ảnh vệ tinh → wireframe module).
- **Thị giác:** nền đen tuyệt đối, chữ trắng **uppercase grotesk** (Magnetik), một accent xanh `#1E90FF`-ish cho nút, cam nhỏ cho nhãn "THE CHALLENGE".
- **Nhịp:** section pin dài, **số lớn đếm/biến đổi** (3000 → 1 USD/GB) gắn với 3D, câu chữ hiện từng phần (chữ mờ dần sáng).
- **Kỹ thuật:** GSAP + ScrollTrigger + Lenis + Three.js. Điểm Awwwards Design 8.07.
- **Áp dụng:** một canvas WebGL cố định, **morph hình theo scroll** để kể chuyện các nhóm dịch vụ; chữ lớn đặt chồng lên 3D.

## Heron AI (heronaiapp.com): AI agent cho kiến trúc sư · `sites/heron.jpg` · SOTD 2026-10-12, Bearplus

- **Ý tưởng lớn:** **bản vẽ kỹ thuật**. Trang là một tờ giấy vẽ; khi cuộn, **mặt bằng được dựng lên dần từng nét tường**, rồi xuất hiện chú thích lỗi màu cam.
- **Thị giác:** nền giấy kem có noise, mực than `#282828`, **một accent cam đỏ `#F15534`**. Grotesk uppercase (BT Grotesk) + **Geist Mono** cho nhãn `[01]`. Lưới hairline, **dấu "+" ở góc khung**, đường kích thước (dimension lines).
- **Nhịp:** section pin "RIGHT THERE WITH YOU" → chữ mờ dần → bản vẽ dựng lên; timeline "OBSERVE → ACT" nằm ngang có nhãn đen.
- **Kỹ thuật:** Webflow + GSAP + ScrollTrigger + Lenis + Barba + Canvas API (không WebGL).
- **Áp dụng (rất hợp với Aegis: "nền tảng vững chắc"):** ngôn ngữ bản vẽ: lưới, dấu "+", nhãn mono, nét được "vẽ" bằng stroke-dashoffset, một accent duy nhất.

## Emotion Agency (emotion-agency.com) · SOTD 2026-10-22 · `sites/emotion-home.jpg`, `sites/emotion-case-study.jpg`

Nghiên cứu lại ngày 2026-10-24 (đã vượt màn intro bằng `--click "Enter without audio"`, click chuột thật theo tọa độ).

- **Ý tưởng lớn:** "Technology as emotion". Trang chủ là **một thế giới 3D liên tục** (Three.js): hồ nước phản chiếu, đá, cỏ chuyển động, mây hồng tím. Một đám hạt nổi giữa cảnh **morph theo từng chương**: logo "ə" → cây → khối lập phương → quả cầu → trái tim → vòng tròn.
- **Thị giác:** tím lavender `#F5EFFF` (nền trang nội dung) + tím đậm `#9047FF`; chữ trắng trên cảnh 3D. Font: **serif condensed uppercase** ("Emotion Serif") cho headline, **PP Neue Montreal** cho body, **IBM Plex Mono** cho nhãn nhỏ uppercase. Headline mở đầu bằng *một từ serif nghiêng* ("*Where* AMBITIOUS IDEAS…", "*We* BUILD…", "BEAUTY *With* A REASON") và ký hiệu `↳` thụt dòng.
- **Hiệu ứng chữ:** headline hero bị **biến dạng sóng + tách kênh RGB (chromatic aberration)** khi chuyển động, sau đó ổn định.
- **Vi tương tác:** nút "Let's talk ↳" pill viền tím; **trợ lý AI** dạng bong bóng chat ở góc phải ("Hi! I'm your personal AI assistant…"); menu **SETTINGS** (chỉnh chất lượng đồ họa), nút bật/tắt âm thanh; danh sách dự án có **thẻ metadata kiểu hồ sơ**: `PRJCT /01 · CREATED AT · NAME · TYPE · SCOPE · STACK`.
- **Trang case study (anatomy):** bảng meta (Type, Year, Scope, Challenge) bên trái + ảnh/visual lớn → tiêu đề dự án → câu "What we did" (1 câu dài, serif, thụt `↳`) → danh sách giải thưởng dạng bảng hairline → **màn hình thiết bị đặt trên sân khấu màu** (desktop frame, mobile frames 3 cột) → bảng **Technologies** (Animations — GSAP, Framework — Nuxt 3, Graphics — Three.js) → **Client / Industry / Emotion: "Clarity"** (gắn một cảm xúc cho mỗi dự án) → thẻ CTA tím "WORKING *on* SOMETHING SIMILAR?" → **Next project** + "(keep scrolling)" để cuộn liền sang dự án sau.
- **Kỹ thuật:** Nuxt + Three.js + GSAP + Lenis, 9 canvas trên trang case study, video thiết bị.
- **Áp dụng:** (1) thẻ metadata kiểu hồ sơ cho gallery mẫu; (2) gắn "cảm xúc" cho mỗi mẫu; (3) cấu trúc case study ở trên; (4) headline mở bằng 1 từ serif nghiêng + `↳`; (5) particle morph theo chương (Aegis đã làm, cùng hướng). **Không** copy cảnh 3D/âm thanh/màn chắn (điểm Accessibility của họ chỉ 6.6).

### Website Emotion làm cho khách hàng (`sites/emotion-client-*.jpg`)

| Dự án | Ngành | Ngôn ngữ thị giác | Kỹ thuật |
|---|---|---|---|
| **Flashform** (flshfrm.com) | SaaS (gửi form → messenger) | Nền xanh đen `#10140c` + **lime** `#B4E04A`; grotesk (Neue Haas) + serif nghiêng (Recife) cho "*forms*", "*{easier}*"; bông hoa gradient WebGL; khối thủy tinh 3D; **chữ khổng lồ chạy ngang** "How you can integrate it with…" (mỗi chữ cái nảy lệch nhịp); thẻ lime bo góc chứa "Problem / Solution" | WebGL, video, GSAP |
| **Sofia Shcherbak** (phsofia.com) | Nhiếp ảnh | Nền kem, **ảnh rải tự do** như bàn làm việc, loader "Experience is loading", màn chọn âm thanh | Three.js, GT Super Display |
| **Relive by Coco** (relivebycoco.com) | E-commerce trang sức tái chế | Ảnh full-bleed, **tên thương hiệu serif khổng lồ đè ảnh**, chữ grotesk trắng đậm từng từ rải trên ảnh ("UNIQUE · CREATIVE · VEGAN · AND · JEWELRY"), **"CATALOGUE" cực lớn** + bộ lọc chữ, thẻ sản phẩm nhỏ trên nền xám, nhãn "[SOLD OUT]", giá trong ngoặc vuông | WebGL, Manrope + Recife |
| **KSH Design** (kshinfo.com) | Kiến trúc & nội thất cao cấp | Ảnh kiến trúc full-bleed, **tiêu đề serif mảnh căn giữa trên ảnh**, phần chữ biên tập 2 cột trên nền be | WebGL, video, BeausiteGrand |
| **Aura** (aura.brightid.org) | Sản phẩm Web3 | Đen/trắng + **lime**; **sơ đồ mạng lưới** ở hero; thẻ tính năng đánh số `[01]` kèm icon nét; FAQ accordion; banner lime "Open by design. *Human by connection.*" | DM Sans + DM Mono |
| **Kairos Capital** (kairosfund.io) | Quỹ đầu tư | Trắng xám mềm, **tượng đá 3D**, vòng tròn mờ; thẻ số liệu bo tròn viền mảnh; tiêu đề căn giữa nhẹ nhàng | Three.js, Bw Gradual |

**Bài học:** mỗi ngành có một "cảm xúc chủ đạo" và họ chọn **font + màu + chuyển động** theo cảm xúc đó; phần chung là kỹ thuật chế tác (typography lớn, nhịp cuộn, chi tiết hairline/mono). Xem `awwwards-art-direction/references/genre-playbook.md`.

## Cartier – Le Chœur des Pierres · SOTD 2026-10-20, makemepulse

- cartier.com chặn trình duyệt tự động (Akamai). Theo Awwwards: "hành trình nhập vai vào Cartier High Jewellery", màu `#fafafa`/`#000`, tag Luxury/Clean/WebGL. Điểm cao nhất ở **Animations/Transitions 8.6**, nổi bật là **cuộn trang nội dung có hoạt ảnh** và **hiệu ứng gouache reveal** (lộ ảnh như nét màu nước).
- Case study Cartier "365" (cùng thương hiệu): HTML là nền, **WebGL là lớp tăng cường** (biến dạng ảnh, 3D); ảnh WebGL dùng KTX2; chỉnh ngắt dòng tiêu đề bằng tay cho từng ngôn ngữ.
- **Áp dụng:** reveal ảnh bằng mask mềm; luôn giữ nội dung trong HTML; **canh ngắt dòng tiêu đề tiếng Việt thủ công**.

## basement.studio · `sites/basement.jpg`

- Nền đen, grotesk lớn (Geist), lưới logo khách hàng dạng ô, **danh sách dự án**: ảnh lớn bên trái, mô tả + tên bên phải. Footer wordmark khổng lồ "BSMNT.26". Three.js cho hiệu ứng nhỏ.
- **Áp dụng:** wordmark khổng lồ cắt mép ở footer; nhịp grid dày đặc.

## Lusion (lusion.co)

- Preloader WebGL (số đếm 000→100 + thanh), headless bị kẹt ở preloader. Bài học: **preloader phải có timeout và không phụ thuộc WebGL để hiện nội dung.**

---

## Điểm chung của các site đoạt giải

1. **Một ý tưởng lớn xuyên suốt** (khoảng trống, hành trình quỹ đạo, bản vẽ) quyết định mọi chi tiết.
2. **Hệ màu kỷ luật:** 1 nền + 1 mực + 1 accent. Không gradient tím-xanh kiểu SaaS.
3. **Typography là nhân vật chính:** cỡ cực lớn, trộn 2–3 họ (grotesk + serif nghiêng + mono), nhãn nhỏ đánh số.
4. **Cuộn có kịch bản:** pin + scrub, nội dung biến đổi tại chỗ thay vì chỉ fade-up.
5. **Chi tiết "thủ công":** dấu "+", đường kích thước, chỉ số mũ, ký hiệu ↪, cursor label.
6. **Kỹ thuật:** GSAP + ScrollTrigger + Lenis gần như mặc định; WebGL/Three.js khi có câu chuyện 3D.
7. **Điểm trừ thường gặp:** accessibility (màn chắn, nội dung chỉ có trong canvas).

---

## Nghiên cứu tương tác (ghi hình bằng Playwright, 2026-10)

Công cụ: `scripts/record-interactions.mjs` (quay video + tách khung + đo Δ thay đổi theo pha: quét chuột, hover lớn nhất, cuộn chậm/nhanh, kéo thả). Kết quả đã lọc thành `style-library/references/interaction-recipes.md`.

| Site | Phát hiện (đo được) | Đưa vào |
|---|---|---|
| **Sofia Shcherbak** (phsofia.com) | Dải ảnh hero: kéo thì **cả dải cong thành cung** + ảnh nghiêng theo vận tốc (Δ tới 21); bấm ảnh → ảnh bay vào bố cục chi tiết (Flip); hover ảnh đổi đen trắng ↔ màu | `DragSlider bend` (ATELIER, VOYAGE) |
| **Signal-A** (signal-a.studio) | Hàng dự án: tên **xáo chữ** từ ký tự ngẫu nhiên ("AGGK" → "AGGRESSIVE"), **ảnh thiết bị bám con trỏ** có trễ, đổi theo hàng (Δ 17–26) | `CursorPreview` + `TextScramble` (BROADCAST, HEARTH) |
| **Emotion** (emotion-agency.com) | Màn vào có **làn khói trắng hồng theo chuột** (mô phỏng chất lỏng), dòng tagline được **tô highlight tím** quét qua | `MistCursor` (SERENE), `MarkerHighlight` |
| **Flashform** (flshfrm.com) | Hoa shader xoay theo chuột, chìm sau đường chân trời khi cuộn; headline từng ký tự lắng; thẻ lime trồi lên bo góc | `CharWave`, `SheetRise`, `BLOOM` (SIGNAL) |
| **Relive by Coco** | Hover đổi ảnh biến thể; catalogue lệch cột, parallax khác tốc độ; footer monogram | `.hover-swap` (ATELIER) |
| **KSH Design** | Hover menu có hoạt ảnh mạnh nhất (Δ 46–68): chữ menu trượt/đổi lớp | Text roll trong nav |
| **Kairos** | Cuộn: tượng đá lớn trượt lên, thẻ số liệu viền mảnh, **ảnh kiến trúc cửa vòm lộ dần** (parallax) | `ScrollParallax` (CAMPUS, VOYAGE) |
| **Aura** | Link chữ hover mạnh (Δ 118: đổi nền cả khối) | Hover đảo màu cả hàng |

**Không ghi hình được** (ghi lại để lần sau khỏi thử): santionispirits.com (báo "trình duyệt không hỗ trợ" với headless), format.obys.agency (403), immersivebags.miumiu.com (kẹt ở màn bật âm thanh dù đã `--click`), otsuka-air.jp (pha hover quá dài; dùng `--quick`).

---

## Rao Muhammad Hamza (raomuhammadhamza.tech): phòng 3D đo bằng thao tác chạm (2026-10)

Nghiên cứu để dựng bản mobile của Xưởng Aegis. Dựng bằng Astro + Three.js, model Blender bake sẵn (`room-lit.glb`, `lightmap-*.ktx2`, `desk/monitor/chair…glb`); **không dùng lại asset của họ**, Aegis dựng vật thể riêng bằng code.

- **Chụp được bản 3D:** site chặn GPU phần mềm bằng `detect-gpu` (báo "Flat version / WebGL isn't available"). Trình duyệt thử nghiệm phải chạy `--use-angle=swiftshader` và đổi tên `UNMASKED_RENDERER_WEBGL` thành tên GPU di động (Adreno…) bằng `addInitScript`. Cần bấm "Enter without sound" ở màn boot (giả lập huấn luyện mô hình, có thanh tiến độ).
- **Mobile = cảnh toàn màn hình, camera áp sát.** Không có sheet nội dung che cảnh: chọn mục thì camera **bay sát vật thể và vật thể chính là nội dung** (màn hình hiện dự án, thẻ tên treo bảng ghim lật được, robot là khung chat, điện thoại là trang liên hệ).
- **HUD tối giản:** tên góc trái (đổi thành "◂ Back to the room" khi vào mục), một nút menu "····" góc phải, bộ chuyển mục `‹ 01 / 05 ›` nổi phía trên, thanh nav kính 4 mục có icon + nhãn, mục đang chọn tô đặc màu accent.
- **Kéo quanh rất rộng:** giới hạn yaw `[-0.8, 1.3]` rad khi màn dọc (≈120°), pitch cho phép nhìn từ trên xuống; có gợi ý "Drag to look around" kèm chevron. Camera tự căn để bounding box của vật thể nằm trong vùng trống giữa các HUD (margin 32px phải, 128px trên, 88px dưới trên điện thoại).
- **Sống động nhỏ:** xe chạy ngoài cửa sổ, ánh đèn bàn, loa rung, hotspot hình thoi nhấp nháy.
- **Áp dụng cho Aegis:** `references/spatial-site.md` mục "Điện thoại kiểu game".

---

## Tối giản kiểu studio: contentarchitecture.dev, kommakomma.is và site khách hàng của họ (2026-11)

Nghiên cứu cho bản /demo1 (người dùng: "thích tối giản và tinh gọn như các mẫu này", đồng ý dựng lại toàn bộ). Ảnh chụp hành trình cuộn desktop + mobile ở scratchpad, không commit.

- **The Content Architecture** (Edoardo Lunardi, Next.js + Sanity, Lenis, Geist Sans/Mono): nền giấy ấm `#F1EEE7` + than `#232323`, một chấm cam nhỏ. Hero chia đôi: chữ trái cỡ vừa (~40px), panel tối phải có **chữ xếp xoắn ốc bằng chính tên thương hiệu** (WebGL). Số lớn kiểu "~00 / ~31 giờ", danh sách đánh số `001 /`, khung code repo thật, lưới dự án 2 cột ảnh dither, FAQ dài dạng `+`. Nav viên thuốc giữa trên có ticker.
- **Komma Komma** (Reykjavík, BDO Grotesk, Lenis + Three): nền xám nhạt `#EAEAEA`, mực đen, một nhãn đỏ. Header chỉ có dấu logo + "Book a call [→]" + hamburger. Hero là ảnh dự án tiêu biểu tràn màn hình kèm hàng metadata; "We only design what's important" đổi màu xám/đen theo từ; nhãn cột trái kiểu "Introduction" đặt **cạnh** nội dung; danh sách dịch vụ chữ lớn (mục đang chọn đen, còn lại xám); footer 4 cột chữ nhỏ + **wordmark khổng lồ**. Trang dự án: tên cực lớn, hàng Client/Category/Year/Scope, ảnh toàn khổ, "Project Description" trái/phải, bảng màu, typography.
- **Site khách hàng của CA:** Good Fella (đen + cam, ảnh dot-matrix, "How we work." 4 bước, FAQ, footer wordmark), Aspen Search (lưới ô vuông, mint, số lớn, chữ in hoa nặng), blink (giấy ấm, gradient mờ cam/xanh rêu, mono), Prism (tím, protein 3D, chuyển nền sáng/tối), Anuc Home (serif + lưới hairline, logo khối), Muralia (ô bo tròn, ảnh tranh tường, khối màu xanh/lá/vàng).
- **Mẫu số chung:** một nền trung tính + một mực + **một** điểm nhấn diện tích nhỏ; một grotesk trung tính + mono cho nhãn; lưới 12 cột, nhiều khoảng trống; danh sách thay cho thẻ; hai sắc độ chữ (đen/xám) thay cho chữ nghiêng; **một** chữ ký (chữ ASCII / dot-matrix / ảnh dự án); không preloader, không ẩn nội dung chờ cuộn; footer wordmark khổng lồ.
- **Áp dụng cho Aegis (/demo1):** Mona Sans + Geist Mono, Cloud/giấy + Deep Ink Teal + Transformative Teal; chữ ký là **dấu Aegis dựng bằng tên bốn mảng dịch vụ** (canvas 2D, không WebGL); dịch vụ dạng danh sách chữ lớn mở bằng `<details>`; dự án là ảnh thật trong khung trình duyệt tối giản, rê chuột thì ảnh toàn trang trượt như đang cuộn; trang dự án kiểu case study chỉ với dữ kiện đã xác nhận.
