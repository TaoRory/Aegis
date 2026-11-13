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

---

## Agency tăng trưởng / dịch vụ đóng gói: cảm giác "digital marketing", nội dung thẳng (2026-11-13)

Nghiên cứu cho bản thiết kế lại Aegis (chủ dự án: /demo1 "quá tech", thiếu chất marketing/tăng trưởng). Định vị mới: bán "tài sản số", 3 gói (mua đứt / đồng hành tăng trưởng / chỉ marketing). Chụp bằng `inspect-site.mjs` desktop + mobile, ảnh ở scratchpad (`research2/`), không commit. Số liệu, logo, lời chứng thực nêu dưới đây là của chính các site đó, **không dùng lại**.

### Superside (superside.com): dịch vụ sáng tạo thuê bao · gần bảng màu Aegis nhất

- **Ý tưởng lớn:** "Your creative team's creative team": một câu định vị, đặt mình là phần nối dài của đội khách.
- **Thị giác:** xanh rêu đậm `#0A211F` + kem `#F7F9F2` + **lime** làm accent (nút, hàng được chọn). Inter Tight + **Instrument Serif nghiêng** cho vế nhấn ("*creative team's*", "*Neither.*"). Hero: chữ trái, phải là **tường ảnh sản phẩm thật nhiều màu** trượt dọc. Ảnh người thật màu ấm.
- **Bố cục/Nhịp:** hero → dải logo → 3 thẻ lợi thế (thẻ đang chọn tô lime) → số liệu → video khách → sơ đồ "dịch vụ → logo → người" → lưới dự án → **bảng so sánh "Hiring or traditional outsourcing? *Neither.*"** (hàng của mình tô accent, dấu ✓/✕) → lời khách → bento tính năng → CTA. Nền đổi tối/sáng theo chương.
- **Gói:** trang pricing có 3 thẻ **không ghi giá**: tên gói + 1 câu + nhãn **"Best for …"** + nút; con số chỉ nằm trong FAQ.
- **Kỹ thuật:** không GSAP/WebGL, 14 video ngắn; nav dính có nút pill accent "Book a demo".
- **Áp dụng:** nhãn "Phù hợp nếu…" cho 3 gói khi chưa có giá; bảng so sánh 3 lựa chọn; hero chữ + tường ảnh dự án thật; serif nghiêng cho vế nhấn; đổi nền tối/sáng theo chương bằng `data-surface="dark"`.

### Flow Ninja (flowninja.com; flow.ninja chuyển hướng): "website operator" cho đội marketing

- **Ý tưởng lớn:** website là **kênh được vận hành hằng tuần**, không phải dự án làm một lần: "We transform, build, operate and grow modern websites".
- **Thị giác:** navy đậm `#08163C` + xanh điện + xanh lá gradient; TWK Lausanne. Thẻ gradient bo góc, ảnh thiết bị, video khách hàng dạng chân dung.
- **Gói:** tên gói thành động từ (flowTransform / Build / Operate / Growth), **tab viên thuốc** chuyển giữa các gói, mỗi tab một thẻ lớn có chip "Included services". Trang pricing chia **"One-time projects" và "Ongoing retainers"** với câu nối "Start with a project. Stay for ongoing WebOps."; mỗi thẻ có "Best for" + "What's included"; bảng so sánh In-house / Agency truyền thống / Flow Ninja.
- **Bằng chứng:** hàng số ngay dưới case, lưới 6 lợi ích viết theo góc khách ("Your own strategist", "Pipeline you see"), **công cụ chấm điểm website miễn phí** làm mồi (lead magnet).
- **Kỹ thuật:** Webflow + GSAP/ScrollTrigger, 10 video, không WebGL.
- **Áp dụng:** khung "Làm một lần / Đồng hành liên tục" khớp đúng 3 gói Aegis; tab gói; chip hạng mục bao gồm; câu nối giữa các gói.

### Hey Digital (heydigital.co): performance marketing cho B2B SaaS · Framer

- **Ý tưởng lớn:** nói thẳng kết quả cho đúng một nhóm khách: "Run ads that drive pipeline and revenue for your B2B SaaS."
- **Thị giác:** trắng + navy + **một xanh cobalt**; Easy Grotesk + IBM Plex Sans. Không ảnh nghệ thuật: **mockup giao diện tự vẽ** (dashboard, thẻ kênh, kế hoạch 30 ngày, tin nhắn báo cáo tuần).
- **Bố cục/Nhịp:** eyebrow nêu loại hình → H1 kết quả → 2 nút (Book a call / Explore results) → logo → khối tối "You know paid ads can work… But so far, they just haven't." với **4 thẻ nỗi đau** → "That's exactly where we come in." → **tab 4 mảng** (mỗi tab: mockup + tiêu đề + danh sách "Includes:" + trích dẫn) → lời khách → **quy trình 4 cột, mỗi cột một mockup nhỏ + 3–4 đầu việc có icon** → FAQ → dải CTA.
- **Áp dụng:** chuỗi Nỗi đau → "Đó là lúc chúng tôi vào việc" → Giải pháp; quy trình minh họa bằng mockup nhỏ thay vì số thứ tự trừu tượng; mockup UI tự vẽ bằng HTML/CSS (nhẹ, sắc nét trên mobile, không cần ảnh).

### Single Grain (singlegrain.com): agency tăng trưởng

- **Thị giác:** than `#2B2B30` + xám nhạt + **một cam**; hero là thẻ tối bo góc lớn nằm trong trang sáng. Nhãn section dạng **pill viền accent** ("↪ How We Work").
- **Bố cục:** H1 hai câu ngắn → 2 nút → hàng số → logo; lưới 6 dịch vụ (icon nét + đoạn ngắn + nút riêng); **thư của người sáng lập kèm ảnh chân dung**; lưới kết quả có bộ lọc pill; **quy trình "From First Call to Pipeline Growth in 90 Days": 4 cột 01–04, tiêu đề 2–3 từ, mô tả 2–3 dòng, gói trong một thẻ trắng**; khối CTA cuối "No pitch deck, no overpromises".
- **Áp dụng:** quy trình có **mốc thời gian trong tiêu đề** (chỉ ghi khi Aegis xác nhận được); thư người sáng lập là bằng chứng thay thế khi chưa có lời chứng thực; nhãn pill cho section.

### Ladder (ladder.io): growth marketing · Webflow

- **Ý tưởng lớn:** "Growth Without the Guesswork". Chữ ký thị giác là **họa tiết hình học phẳng nhiều màu** (vòng tròn đồng tâm, chevron, sọc) như bộ xếp hình.
- **Thị giác:** trắng + tím + hồng/cam/vàng/lime; Space Grotesk. **Mỗi mảng dịch vụ một ô họa tiết riêng** (Traffic / Conversion / Retention / Creative) xếp bậc thang chéo. Header chỉ có logo + **một nút CTA nêu lợi ích** ("Get a free growth review →") + hamburger.
- **Áp dụng:** hệ họa tiết SVG phẳng sinh từ dấu Aegis để tạo năng lượng mà không cần ảnh/3D; CTA ghi rõ khách nhận được gì.

### NoGood (nogood.io): growth squad

- **Thị giác:** đen than + lưới phối cảnh + logo 3D kim loại, quả cầu wireframe cam/tím có **nhãn dịch vụ xếp trên cung tròn** (Strategy, Content, Social, SEO, Paid…). Suisse + Microgramma Extended. Thẻ kính tối.
- **Bằng chứng:** thẻ khách hàng = logo + trích dẫn + **một con số lớn**.
- **Nhận xét:** nội dung marketing nhưng lớp vỏ vẫn "tech/tối", đúng kiểu chủ dự án đang muốn tránh. Chỉ lấy ý **sơ đồ quỹ đạo các kênh quanh một lõi**.

### Beetle Beetle (beetlebeetle.com): làm lại website cho B2B SaaS · Webflow + GSAP + Lenis

- **Ý tưởng lớn:** kể chuyện bằng **cắt dán tranh cổ điển + giấy xé + kẹp giấy**; ấm, hài, rất "người". Đỏ gạch `#A03C25` + giấy kem; Instrument Serif + Geist + Geist Mono.
- **Hero = câu hỏi nỗi đau:** "Struggling to close enterprise deals because prospects don't see your unique value?" (tô màu cụm khóa) → 2 nút → hàng logo.
- **Quy trình:** 4 thẻ giấy "STEP 1…4", mỗi thẻ có tiêu đề + 1 câu + **checklist đầu ra** + nút "Book a call" **lặp lại ở từng bước** + hình minh họa riêng.
- **Bằng chứng:** thẻ case 2 cột: tiêu đề nêu kết quả, đoạn bối cảnh, trích dẫn + ảnh người, ảnh website trên nền màu của thương hiệu đó.
- **Áp dụng:** hero dạng câu hỏi; checklist đầu ra từng giai đoạn; ảnh dự án trên **nền màu riêng từng dự án** (hợp với 7 dự án thật của Aegis); một thế giới minh họa có cá tính làm chữ ký.

### KOTA (kota.co.uk) · Awwwards Honorable Mention 2024-08 · Lenis + Three

- **Ý tưởng lớn:** "rebel against boring". Nền **gradient mờ chuyển động** (hồng/tím/xanh trên kem) + grotesk đen rất lớn, ảnh lồng trong chữ "o".
- **Dịch vụ = 3 thẻ trắng bo góc lớn nối tiếp:** Brand strategy & identity / Web design & development / **Growth marketing**; mỗi thẻ: tên lớn, chip hạng mục, 2 dòng mô tả, nút "Find out more", chồng ảnh/logo công cụ bên phải. Phía trên có công thức "Brand Clarity × Creative Craft × Commercial Momentum".
- **Quy trình:** "Our brand-to-build framework" = **tab pill 5 bước** + carousel ảnh.
- **Nhịp:** nửa đầu sáng (dịch vụ), nửa sau đen (dự án, kết quả, đối tác, FAQ), footer gradient với email cực lớn + nút "Copy email address".
- **Áp dụng:** 3 thẻ dịch vụ lớn = 3 gói; công thức "A × B × C" cho USP; gradient mềm bằng CSS (không WebGL) từ teal/aqua; email lớn có nút sao chép.

### Designjoy (designjoy.co): thuê bao thiết kế một người · Webflow

- **Ý tưởng lớn:** toàn trang là **một lời chào hàng**: "Design subscriptions for everyone", không menu, chỉ "See pricing" và "Book a call".
- **Thị giác:** hồng phấn nhạt + đen + **thẻ gradient rực** (vàng/xanh/cam/hồng), mặt cười. Figtree + serif nén nghiêng cho vế nhấn.
- **Quy trình 3 thẻ:** Subscribe → Request → Receive, mỗi thẻ một hình + 1 câu. **Bảng giá một thẻ tối duy nhất**, kèm 2 ô trấn an ("Pause anytime", "Try it for a week"). FAQ dài; chân trang là **lịch đặt cuộc gọi nhúng sẵn**.
- **Áp dụng:** quy trình 3 động từ; các ô "trấn an rủi ro" cạnh gói (ví dụ bàn giao toàn bộ mã nguồn); FAQ xử lý phản đối. Lịch nhúng bên thứ ba nặng trên mobile: chỉ tải khi bấm.

### Đã xem nhưng không lấy làm mẫu

- **Refokus** (refokus.com): preloader đếm % che 3 màn chụp đầu; đen + cam, serif; danh sách dự án dạng hàng. Vẫn là hướng "studio/tech".
- **Baunfire** (baunfire.com): hero tối chung chung "A digital agency focused on web", ảnh đội ngũ trong khung hình thoi; ít nội dung gói/quy trình.
- **Off Menu** (offmenu.design): trang chủ chỉ là vòng ảnh dự án hình tròn; **Motto** (wearemotto.com): biên tập tối giản đen trắng. Cả hai trùng hướng /demo1 hiện tại.

### Điểm chung của nhóm "marketing/tăng trưởng" (khác nhóm site đoạt giải ở trên)

1. **H1 là lời chào hàng một dòng**: kết quả + cho ai (hoặc câu hỏi nỗi đau), không phải khẩu hiệu thơ. Ngay dưới là 1 câu phụ + **2 nút** (đặt cuộc gọi / xem dự án).
2. **Một CTA duy nhất lặp lại** ở header dính, sau mỗi chương và trong từng bước quy trình; chữ trên nút nêu lợi ích ("Free strategy call", "Get a free growth review").
3. **Bằng chứng nằm sát lời hứa**: logo ngay dưới hero, con số gắn với từng case, trích dẫn nằm trong chính tab dịch vụ.
4. **Gói có tên, có "Phù hợp cho…", có danh sách bao gồm**; chia "làm một lần" và "đồng hành liên tục"; giá có thể để sau.
5. **Bảng so sánh với lựa chọn thay thế** (tự tuyển / agency truyền thống / mình).
6. **Quy trình 3–4 bước nằm ngang**, mỗi bước 2–3 từ + đầu ra cụ thể, có minh họa nhỏ.
7. **Màu ấm và nhiều hơn một accent** (lime, cam, gradient), thẻ bo góc lớn, đổi nền sáng/tối theo chương; **không** mono, lưới hairline, ASCII.
8. **Hình ảnh là sản phẩm và con người**: ảnh dự án thật, mockup UI tự vẽ, chân dung người sáng lập; không phải canvas trừu tượng.
9. **Kỹ thuật nhẹ**: đa số không WebGL (0 canvas); chuyển động là marquee logo, tab, video ngắn, số đếm.
10. **Giọng văn ngôi "bạn"**, câu ngắn, có FAQ xử lý phản đối ở cuối.

---

## minimal.gallery/tag/ai: site sản phẩm/dịch vụ "hiện đại nhưng không AI-slop" (2026-11-13, vòng 2)

Chủ dự án muốn bản thiết kế lại Aegis "hiện đại một chút, vẫn thẳng, nội dung tốt, và trên hết KHÔNG giống AI làm". Trang tag có 24 site; chụp desktop 15 site, mobile 6 site bằng `inspect-site.mjs` (ảnh ở scratchpad `research3/`, không commit). Không site nào chặn bot. Số liệu, logo, trích dẫn dưới đây là của chính các site, **không dùng lại**. Màu là ước lượng từ ảnh chụp (script không đo CSS).

### Project Simply (projectsimply.com): studio thương hiệu + web · gần mô hình Aegis nhất

- **Ý tưởng lớn:** portfolio **là** trang chủ. Một câu H1 rồi lập tức là tường dự án thật; nền đổi màu theo từng chặng (kem → hồng → vàng → xanh trời → mint).
- **Thị giác:** kem + vàng chanh / hồng / cyan / mint / tím, mỗi màu là một mảng phẳng lớn, không gradient, không bóng. Aeonik + Studio Feixen (chữ có nét riêng cho nhãn pill) + Poly Sans. Từ khóa trong H1 được **tô khối màu phía sau chữ** thay cho chữ nghiêng/gradient. Bo góc ~16px cho ô ảnh, pill tròn hẳn cho hàng mục.
- **Bố cục/Nhịp:** H1 + dải logo → lưới 3 cột lệch hàng (mỗi ô một nền riêng, ảnh chụp site/thiết bị, nhãn tên hiện khi rê) → 3 **pill khổ lớn** cho 3 nhóm khách (mỗi pill một màu, mở ra như accordion) → "A safe pair of hands": ảnh trái + danh sách 5 cam kết dạng hàng mở → 3 thẻ trích dẫn màu → chân trang là **4 thẻ trắng nhỏ** (địa chỉ, mạng xã hội, liên hệ, lĩnh vực) + wordmark tím khổng lồ.
- **Mobile:** header chỉ còn dấu logo + "Let's Talk" + "Menu"; lưới thành 1 cột, tên dự án luôn hiện dưới ảnh.
- **Kỹ thuật:** Lenis, 0 canvas, 18 video ngắn trong ô dự án.
- **Áp dụng:** tường 7 dự án thật bắt đầu ngay trong màn đầu; nền riêng cho từng dự án lấy từ màu thương hiệu của chính dự án đó; tô khối sau từ khóa; pill khổ lớn; chân trang thẻ nhỏ + wordmark.

### Ploy (ploy.ai): nền tảng marketing cho website · Geist + FK Screamer

- **Ý tưởng lớn:** "Your website should be working harder than you are." Website không dừng ở ngày ra mắt (trùng thông điệp gói Grow).
- **Thị giác:** xám nhạt `#F4F4F4` + mực + **bốn mảng pastel đặc** (hồng, vàng, xanh trời, lime), mỗi chương là **một tấm bo góc ~28px lọt trong trang**, không tràn mép. Chữ hiển thị **nén, in hoa, rất đậm** đi cùng thân chữ Geist cỡ thường: tương phản cỡ cực lớn. Chữ ký riêng: bóng bay 3D dựng theo logo (không phải 3D stock).
- **Kể chuyện:** "Your website launched. Then it stopped." (nửa câu mực, nửa câu xám) → 3 cột ngăn bằng hairline (Monitor / Act / Surface) → thẻ nhật ký "11:42PM @ads found…" → "One platform, three engines" (3 cột có tên gói + 3 động từ + 4 gạch đầu dòng) → **di trú 5 bước, tiêu đề là câu mệnh lệnh có dấu chấm** ("Paste your URL." "Approve the plan."), ô thứ 6 màu đen chứa một case → "Who's Ploy for?": tiêu đề dính bên trái, 3 ô đối tượng bên phải → ô nhập email.
- **Điểm trừ:** 3 thẻ số + sparkline (khuôn "hero-metric"); banner cookie + nút chat che ~30% màn hình mobile.
- **Áp dụng:** chương dạng tấm bo góc lọt trong trang; tiêu đề bước là câu hành động; câu hai sắc độ; tương phản cỡ chữ lớn thay vì thêm hiệu ứng.

### BehaviorAI (behaviorai.eu): tư vấn một người · Inter

- **Ý tưởng lớn:** chứng minh bằng **mockup sống**: hero có khung hóa đơn tự vẽ với công tắc "Without the pattern / With the pattern" và nút **Pause**.
- **Thị giác:** trắng + mực + **một lime** (nút, chip, một hàng tô đặc). Thẻ trắng bo ~20px, bóng rất mềm, chip trạng thái nhỏ. Tiêu đề căn trái, không căn giữa.
- **Kể chuyện:** vấn đề viết bằng **lời người trong cuộc** ("We have the tool, but nobody uses it."), 9 thẻ → "From problem to screen" 4 bước → "We say how strong the evidence is" (nhãn mức bằng chứng) → **thang dịch vụ theo chiều sâu**: trục dọc có mũi tên "Depth of adoption", ba hàng trắng → lime → đen, mỗi hàng trái là trạng thái của khách, phải là thẻ dịch vụ + "Let's talk"; nhãn "Many rollouts stop here". Ghi chú nhỏ "mockups are suggested directions on fictional data".
- **Mobile:** H1 + 2 nút + đầu mockup đều nằm trong màn đầu; mọi lưới về 1 cột.
- **Áp dụng:** thang 3 gói theo một trục có nghĩa (mức Aegis đồng hành sau ngày ra mắt); vấn đề bằng lời khách (không gắn tên người); ghi rõ mockup là minh họa; nút tạm dừng cho mọi vòng lặp tự chạy.

### Unify (unifygtm.com): bán hàng outbound · Webflow + GSAP · Saans + Feature Text

- **Thị giác:** kem `#FFFFF9` + nâu đen + **một đỏ cam**; serif Feature Text làm giọng hiển thị xuyên suốt (không phải serif nghiêng để nhấn), từ khóa đổi màu. Ảnh **nhòe chuyển động màu ấm** làm nền cho khung sản phẩm thật: chất ảnh riêng, không gradient tím.
- **Bố cục:** H1 căn trái một dòng → ảnh lớn có ô nhập prompt → đoạn dẫn chữ lớn + cột lợi ích có hairline trái → câu số liệu viết thành **một câu hoàn chỉnh** → tab theo vai trò trong thẻ trắng trên nền ảnh → case nổi bật (ảnh người + trích dẫn) → lưới 2×5 ô kết quả → bảng tính năng dạng **cột chữ + chip**, không icon → footer nằm trong thẻ trắng trên nền ảnh.
- **Áp dụng:** tính năng trình bày bằng tiêu đề nhỏ + chip thay cho thẻ icon; một chất ảnh riêng làm nền cho ảnh chụp sản phẩm; footer dạng thẻ.

### Hellomatik (hellomatik.com): AI vận hành doanh nghiệp · Hedvig Letters Serif + Inter

- **Thị giác:** trắng / `#FAFAFA` / đen, **góc vuông hoàn toàn**, không màu nhấn; ảnh tư liệu thật (tàu container, kho, nhà máy). Câu dẫn lớn làm đậm từng từ khi cuộn nhưng chữ vẫn đọc được từ đầu.
- **Kể chuyện:** hero ảnh toàn màn + hộp nhỏ chứa 1 câu + 2 nút → 3 logo → bản demo sản phẩm thật có nhãn "Demo with simulated data" → **"Use cases already live"** (dải thẻ ảnh, tiêu đề là việc cụ thể: "Supplier invoice matching before payment") → tab ngành → "A proposal for your first use case" (bước đầu tiên nói rõ khách nhận gì) → CTA cuối là **hai ô lớn cạnh nhau** "See the product →" / "Book a meeting".
- **Áp dụng:** tiêu đề là việc cụ thể đã làm; nói rõ buổi gọi đầu khách nhận được gì; CTA cuối dạng hai ô; nhãn "dữ liệu mô phỏng" cho mockup.

### Spek (spek.app): ASO agent · lausanne + Inter

- **Thị giác:** trắng + mực + một xanh cobalt; cả trang nằm trong **cột hẹp ~860px có hairline hai bên**; dấu ấn riêng là mảng xanh navy **hạt nhiễu** phía sau ảnh sản phẩm và ở CTA cuối.
- **Quy trình:** 3 hàng 2 cột trong lưới hairline: trái là số nhỏ + tiêu đề 2 dòng ở trên, mô tả neo **đáy ô**; phải là mockup tự vẽ trên nền xám. Lưới logo 5×3 có viền ô. Khối bằng chứng: trích dẫn + ảnh người + hai ô số.
- **Mobile:** H1 3 dòng + 2 nút + ảnh sản phẩm trong màn đầu.
- **Áp dụng:** hàng quy trình "chữ trái / mockup phải" với mô tả neo đáy; cột nội dung hẹp cho các đoạn đọc.

### Wist (wist.chat): live chat AI · LyonText + Inter

- **Thị giác:** trắng + serif LyonText cho tiêu đề; mỗi section mở bằng **tiêu đề đen + câu phụ xám cùng cỡ chữ** (hai sắc độ thay cho eyebrow + H2 + đoạn mô tả); khối đen có lưới xanh làm điểm ngắt; tranh minh họa kiểu in khắc (mái vòm, người ngồi bàn điều khiển) là thế giới hình ảnh riêng.
- **Kể chuyện:** hero chia đôi với widget thật dùng được ngay → "how it works" = danh sách 4 hàng bên trái đổi ảnh bên phải → lưới tính năng 3×3 hairline → bảng giá 4 cột hairline + FAQ 2 cột.
- **Điểm trừ:** nhãn mono "[01] HOW IT WORKS" trên mỗi section, lưới 3×3 ô icon giống nhau, hai bong bóng chat nổi che nội dung.
- **Áp dụng:** tiêu đề + câu phụ cùng cỡ hai sắc độ; danh sách hàng bên trái điều khiển hình bên phải.

### Factory (factory.ai): agent lập trình cho doanh nghiệp · Geist + Geist Mono

- **Thị giác:** xám `#F9F9F9` / `#EBEBEB` / than, một chấm cam; ảnh đen trắng; lưới hairline dày đặc. Các chương là tấm xám hoặc đen bo góc nhỏ lọt trong trang. Danh sách use case đánh số 01–06 dạng hàng.
- **Nhận xét:** kỷ luật cao nhưng đúng kiểu "tech/mono/hairline" mà chủ dự án đã chê ở /demo1. Chỉ lấy: tấm tối lọt trong trang cho một chương, danh sách hàng thay cho thẻ.

### Sunday (sunday.ai): robot gia dụng

- **Thị giác:** trắng / kem / xanh nhạt / chân trang vàng; một grotesk cỡ rất lớn; ảnh và video sản phẩm thật chiếm gần hết trang; thẻ ảnh có chú thích nằm trong ảnh; pill chuyển tab "Features / 360° / Anatomy"; chân trang ghi ngày + thời tiết tại trụ sở (chi tiết "có người làm").
- **Áp dụng:** để hình thật gánh trang, chữ ít và lớn; một chi tiết nhỏ có thật ở chân trang (giờ Việt Nam hiện tại) thay cho trang trí.

### Causal (causal.so): canvas ý tưởng · Manrope

- **Thị giác:** xám rất nhạt + đen, dấu hoa thị làm logo và làm tâm bố cục; ô tính năng là **bento xám phẳng có kích thước khác nhau**, mỗi ô chứa một mẩu giao diện thật + nhãn một dòng ở đáy; FAQ một cột hàng mảnh; wordmark mờ khổng lồ ở chân trang.
- **Điểm trừ:** căn giữa gần như toàn bộ, nhiều khoảng trống rỗng giữa các section.

### Đã chụp nhưng không lấy làm mẫu

- **Layer 9** (layer9.com) và **Kyoso** (kyoso.com): nền đen + viền phát sáng tím/xanh, mọi thứ căn giữa, lưới thẻ icon đều nhau, bảng giá 4 thẻ giống hệt. Đây chính là mặt bằng chung "AI làm" cần tránh.
- **Melius, Isidor, Letta**: chỉ đọc `report.json` (Melius 11 canvas WebGL; Isidor đen + mono; Letta gần như một màn chữ Fira Code), không hợp site dịch vụ.
- Chưa chụp: Ardor Retro Computer, Future AGI, Ponder AI, Rig AI, Diffusion Studio, Microsoft AI, Waabi (thuần sản phẩm AI/nghiên cứu); The Content Architecture đã có ở mục 2026-11.

### Điểm chung: vì sao các site này không giống "AI làm"

1. **Một quyết định hình ảnh riêng, lặp lại có kỷ luật**: bóng bay logo (Ploy), mảng hạt nhiễu (Spek), ảnh nhòe ấm (Unify), tranh in khắc (Wist), khối tô sau chữ (Project Simply). Không site mẫu nào dùng gradient tím-xanh, kính mờ, 3D stock.
2. **Màu đặc, phẳng, diện tích lớn** thay cho gradient và bóng; bóng gần như vắng mặt, phân tầng bằng nền tô và hairline.
3. **Bố cục đổi theo nội dung**: trong một trang có lưới lệch, hàng 2 cột, thang dọc, danh sách hàng, tab, bento ô không đều. Không có hai section liền nhau cùng khuôn.
4. **Căn trái là mặc định**; căn giữa chỉ dùng cho một câu tuyên bố.
5. **Tương phản cỡ chữ mạnh** (hiển thị rất lớn cạnh thân 16–18px) và **hai sắc độ chữ** thay cho eyebrow, chữ nghiêng, gradient chữ.
6. **Giao diện thật hoặc mockup tự vẽ có dữ liệu cụ thể** (số hóa đơn, tên từ khóa, giờ phút), ghi rõ khi là dữ liệu mô phỏng.
7. **Câu chữ cụ thể**: tiêu đề là việc làm được ("Supplier invoice matching before payment"), bước là câu mệnh lệnh, vấn đề là lời người trong cuộc; gần như không có "seamless / powerful / next-gen".
8. **Bán kính nhiều tầng hoặc cực đoan có chủ ý** (0px ở Hellomatik; pill + ~28px ở Ploy), không phải 12px cho mọi thứ.
9. **Kỹ thuật nhẹ**: 8/10 site mẫu có 0–1 canvas; nội dung hiện sẵn, không chờ cuộn.
10. **Lỗi chung cần tránh**: banner cookie + bong bóng chat che 25–50% màn hình mobile (Unify, Ploy, Hellomatik, Wist).

Đối chiếu Impeccable (`craft-floor.md` mục Refuse, `new-work.md` dòng 67–71): cấm eyebrow trên tiêu đề; từ chối thẻ icon cùng cỡ làm khung trang, khuôn hero-metric, số thứ tự section vô nghĩa, chữ gradient, kính mờ trang trí, viền màu một cạnh (`side-tab`), mono làm "trang phục kỹ thuật", emoji thay icon; danh sách `overused-font` có Fraunces, Newsreader, Space Grotesk, DM Sans, Plus Jakarta Sans, Instrument Sans, Inter làm chữ hiển thị. Impeccable cũng coi "nền kem + serif hiển thị + nhấn bằng serif nghiêng" là cụm mặc định của AI: **nên bỏ ý "grotesk + serif nghiêng để nhấn" của vòng 1** (thêm nữa Instrument Serif không có bộ chữ tiếng Việt trên Google Fonts) và thay bằng khối tô sau từ khóa hoặc hai sắc độ.
