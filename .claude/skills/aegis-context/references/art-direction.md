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

10. **Con trỏ "đầu bút kỹ thuật" (2026-10-25):** một chấm + một vòng (`src/components/motion/Cursor.tsx`), thay con trỏ gốc (trừ ô nhập chữ). Vòng đuổi theo bằng nội suy theo thời gian, kéo giãn/xoay theo vận tốc, "ôm" hình nút khi rê lên `.btn-box` / `.round-btn` / `[data-cursor="snap"]`, bong bóng nhãn cho `data-cursor="view|drag"`, bấm chuột để lại dấu "+". Vị trí chuột dùng chung ở `src/lib/pointer.ts` (`onPointerMove`): component mới cần theo chuột phải đăng ký qua đây, không tự `addEventListener("pointermove")`.

11. **Phòng trưng bày bản vẽ (2026-10-25):** thư viện style là một vòng thẻ 3D WebGL2 trong xưởng tối (sàn có vòng sáng ultramarine, lưới trần phối cảnh, thẻ cong theo vòng, viền phát sáng, phản chiếu sàn, cong/tách kênh màu theo tốc độ xoay). `GalleryRing.tsx` (điều khiển, DOM thật, fallback CSS) + `gallery-engine.ts` (vẽ). Trang chủ có bản rút gọn trong khung bo góc; `/mau-giao-dien` có bản đầy đủ (lọc, thước tiến độ). Chỉ dành cho mẫu demo, không trộn với 7 dự án thật.
12. **Chuyển trang "lật bản vẽ" (2026-10-25):** View Transitions. Rèm quét ngang giữa các trang Aegis (`aegis-forward` / `aegis-back`); thẻ 3D phóng thành trang mẫu (`aegis-open`, cặp `ViewTransition name="tpl-<slug>"` giữa lớp phủ trong thư viện và `.morph-target` của `DemoShell`). Con trỏ riêng có `view-transition-name` để không bị đóng băng.
13. **Cài đặt hiệu ứng (2026-10-25):** nút "Cài đặt" ở header (chất lượng Cao/Thấp, con trỏ riêng Bật/Tắt) — không có âm thanh tự phát.

14. **Phân tử sống + luồng năng lượng (2026-10-26):** 5 bản vẽ (nền móng, AI, phần mềm, web, marketing) dựng từ ~18k phân tử (10k trên điện thoại): hạt có chiều sâu, nhấp nháy, trôi theo nhiễu xoáy, 6% "hạt nhân" màu accent có quầng, thêm lớp "đám mây electron" (`ShapeBuilder.haze`) cho hình có khối. Con trỏ / ngón tay không còn đẩy hạt ra xa ("hố đen") mà là **luồng năng lượng** (`src/components/webgl/flow-field.ts`): trường vận tốc trên GPU, hạt bị cuốn theo hướng di chuyển, sáng lên, rồi trôi về chỗ cũ; vệt năng lượng mờ vẽ ngay trong canvas hạt. Điện thoại: artwork chiếm trọn nửa trên, chữ ở nửa dưới (không `mask-image`, không `backdrop-filter`); cuộn tạo "gió" lệch nhẹ. Không còn tách màu chữ theo tốc độ cuộn trên mọi thiết bị.

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
