# Art direction: Aegis "Bản vẽ nền móng"

## Ý tưởng lớn

**Aegis là người dựng nền móng.** Website là một tờ bản vẽ kỹ thuật sống: nền móng được *dựng lên* từ hàng nghìn điểm, rồi *biến hình* thành bản vẽ của từng nhóm dịch vụ khi người xem cuộn qua. Ẩn dụ này nói đúng tinh thần "Vững chắc", gợi sự chính xác của kỹ sư ("Tin cậy"), và đặt khách hàng vào vai chủ công trình ("Đồng hành"). Không dùng hình lá chắn, không thần thoại.

Tham chiếu: Heron AI (ngôn ngữ bản vẽ), EnduroSat (một cảnh WebGL liên tục, morph theo chương), The Void (typography editorial, serif nghiêng, wordmark khổng lồ), Emotion (particles phản ứng chuột).

## Chữ ký thị giác

1. **Nền móng bằng hạt** (signature): ~12k điểm tạo 4 phiến nền isometric xếp tầng ở hero; điểm tránh con trỏ; cuộn thì phân tán.
2. **Bản vẽ biến hình:** chương Dịch vụ được pin; cùng đám hạt morph thành 4 bản vẽ: mạng nơ-ron (AI) → lưới mô-đun (phần mềm) → khung trình duyệt (web) → sóng lan tỏa (marketing).
3. **Giấy vẽ kỹ thuật:** lưới hairline, dấu "+" ở góc khung, nhãn mono `[02] — DỊCH VỤ`, số bản vẽ "BV-02".
4. **Typography editorial:** Bricolage Grotesque cỡ cực lớn + *Newsreader nghiêng* cho từ khóa cảm xúc + JetBrains Mono cho nhãn.
5. **Nét vẽ theo cuộn:** đường dẫn SVG nối 4 bước làm việc được "vẽ" khi cuộn ngang.
6. **Danh mục công trình:** danh sách dự án chữ lớn, ảnh xem trước bay theo con trỏ, cursor bong bóng "Xem ↗".
7. **Màn kết:** CTA khổng lồ, nút tròn magnetic, wordmark "Aegis" tràn chiều ngang trồi lên từng chữ.
8. **Preloader:** đếm `000 → 100` bằng mono, lưới vẽ ra, rèm mở (1 lần/phiên, ≤ 2s).
9. **Nâng cấp kiểu Emotion (2026-10-25):**
   - **Tiêu đề hero "khớp lại":** gợn sóng (SVG feDisplacementMap) + tách kênh RGB khi intro, gợn nhẹ lại khi rê chuột vào (`src/components/sections/HeroFx.tsx`). Dòng 2 thụt bằng `↳`.
   - **Thước ngắm bản vẽ:** hai đường kẻ ultramarine chạy theo con trỏ trong hero + tọa độ "X · Y mm" (khổ A1).
   - **Khói ultramarine** theo chuột trong hero (`MistCursor`, blend screen); khói trắng trên màn kết.
   - **Chữ lớn tách màu theo tốc độ cuộn** (`ScrollChroma` cho `.text-h2`, `.text-mega`, `.chroma`).
   - **Tấm bản vẽ trồi lên:** mục Giới thiệu và Mẫu giao diện là tấm giấy bo góc 3rem trồi lên đè mục tối (`SheetRise`, không bọc section có pin).
   - **Màn kết Liên hệ:** tấm ultramarine (`data-surface="accent"`) trồi lên, chữ khổng lồ + nút tròn magnetic, form nằm bên dưới.

## Hệ thống (tạm thời, trong tokens.css)

- **Màu:** giấy `#ECEAE4`, mực `#0D0E11`, than `#15171C`, accent **ultramarine** `#3B3FFF` (trên nền tối dùng `#8C8FFF`). Accent ≤ 5% diện tích: nhãn, dấu "+", hạt nhấn, CTA.
- **Font:** Bricolage Grotesque (display/body), Newsreader italic (nhấn), JetBrains Mono (nhãn). Cả 3 có subset vietnamese.
- **Lưới:** 12 cột, gutter theo token; hairline `color-mix(mực 12%)`.
- **Texture:** grain SVG 5% trên nền giấy.
- **Bo góc:** gần như không (0–4px). Không shadow mềm.

## Kịch bản cuộn

| # | Section | Nền | Pin | Chuyển động chính | Reduced-motion |
|---|---|---|---|---|---|
| 0 | Preloader | mực | — | đếm số, rèm | bỏ qua |
| 1 | Hero | mực + canvas | — | split-line reveal tiêu đề, hạt dựng nền móng, phân tán khi cuộn | chữ tĩnh, canvas 1 frame |
| 2 | Tuyên ngôn | giấy | — | chữ sáng dần theo từ; 3 giá trị chữ khổng lồ | hiện đủ |
| 3 | Dịch vụ | mực + canvas | ✔ desktop | morph 4 bản vẽ, chương chữ thay nhau, thanh tiến độ 01–04 | danh sách tĩnh |
| 4 | Cách làm việc | giấy | ✔ desktop | track ngang, nét SVG được vẽ | danh sách dọc |
| 5 | Dự án | mực | — | index list + preview theo chuột, lọc | ảnh inline |
| 6 | Mẫu giao diện (teaser) | giấy | — | 6 thẻ sân khấu màu, rê chuột để ảnh toàn trang tự cuộn | tĩnh |
| 7 | Liên hệ + footer | mực | — | CTA khổng lồ, magnetic, wordmark trồi lên | tĩnh |

Trang `/mau-giao-dien` dùng cùng ngôn ngữ (nền mực, lưới bản vẽ, thẻ metadata kiểu hồ sơ). Mỗi trang mẫu `/mau-giao-dien/<slug>` có art direction **riêng theo ngành** (xem skill `template-gallery`).

## Ngân sách

- JS thêm ≤ 70 KB gzip (GSAP + ScrollTrigger + SplitText + Lenis + engine WebGL tự viết).
- Hạt: desktop 12k, mobile 5k; DPR ≤ 2.
- LCP ≤ 2.5s (máy dev ≤ 1s), CLS = 0, không lỗi console.

## Không làm

- Không màn chắn bắt buộc, không âm thanh tự phát.
- Không ẩn nội dung khi không có JS.
- Không bịa số liệu để "làm đầy" phần đếm số.
