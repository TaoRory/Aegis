# Playbook theo ngành: cảm xúc → font → màu → chuyển động

> **Đã có công thức đầy đủ cho 8 ngành** (bố cục từng section, token, tương tác, ảnh, giọng văn, chuyển thể) trong skill `style-library`: ATELIER (thời trang), SIGNAL (công nghệ), SERENE (dịch vụ chăm sóc), HEARTH (F&B), BROADCAST (truyền thông), PLAYGROUND (tiếng Anh/kỹ năng), VOYAGE (du học/du lịch), CAMPUS (giáo dục). Bảng dưới là bản tóm tắt để chọn nhanh cho ngành khác.

Rút từ Emotion Agency và các khách hàng của họ (xem `design-research/references/site-notes.md`). Dùng khi dựng website/mẫu cho một ngành cụ thể. Mỗi ngành chọn **một cảm xúc chủ đạo** rồi để cảm xúc đó quyết định mọi lựa chọn. Font dưới đây đều có subset tiếng Việt (đã kiểm chứng).

| Ngành | Cảm xúc | Font (display / body / phụ) | Màu | Chữ ký chuyển động | Tham chiếu |
|---|---|---|---|---|---|
| SaaS / web app | Năng lượng, tự tin | Space Grotesk / Space Grotesk / *Fraunces nghiêng* | Nền xanh đen + 1 màu neon dịu (lime, cam san hô) | Hình WebGL/gradient "nở hoa" theo chuột; chữ khổng lồ chạy ngang theo cuộn, từng chữ cái lệch nhịp; thẻ Problem/Solution | Flashform, Aura |
| Kiến trúc / bất động sản / resort | Tĩnh lặng, sang trọng | Cormorant Garamond (mảnh) / Manrope | Be, đá, xanh rêu nhạt | Tiêu đề serif mảnh căn giữa; bản vẽ đường nét tự vẽ theo cuộn; ảnh lộ qua clip-path chậm | KSH Design |
| Tài chính / đầu tư | Điềm tĩnh, tin cậy | Hanken Grotesk / Literata nghiêng | Trắng xám mềm + 1 xanh đậm | Khối điêu khắc mềm (blob 3D) xoay chậm; số liệu đếm; biểu đồ vẽ nét | Kairos Capital |
| Sự kiện / lễ hội / hội nghị | Phấn khích, đếm ngược | Anton (condensed) / Archivo | Khối màu đậm tương phản cao (đỏ cam, tím, vàng) | Marquee, đếm ngược, chữ khổng lồ xếp chồng, lịch trình accordion | TEDx, Halloween (portfolio Aegis) |
| Thời trang / trang sức / e-commerce | Cá tính, khao khát | Playfair (opsz/wdth) / Epilogue | Nền xám nhạt + đen + 1 màu kẹo | Tên thương hiệu serif khổng lồ; từ rải trên hình; "CATALOGUE" cực lớn + bộ lọc; giỏ hàng trượt | Relive by Coco |
| Y tế / phòng khám / dịch vụ đặt lịch | An tâm, dễ chịu | Lexend / *Fraunces (SOFT)* | Xanh bạc hà, kem, xanh than | Hình mềm "thở" chậm; stepper đặt lịch mượt; vi tương tác phản hồi rõ | — |
| Nhiếp ảnh / sáng tạo cá nhân | Thân mật, tò mò | serif display / grotesk | Kem + đen | Ảnh rải tự do, kéo thả, phóng to khi chọn | Sofia Shcherbak |
| Web3 / hạ tầng | Minh bạch, kỹ thuật | DM Sans / DM Mono (thay bằng font có VI: Hanken + JetBrains Mono) | Đen/trắng + lime | Sơ đồ mạng lưới, thẻ đánh số, accordion | Aura |

**Không có subset tiếng Việt (tránh):** Syne, DM Serif Display, Bodoni Moda, Bebas Neue, Archivo Black, Sora, Figtree, Onest, Golos Text, Instrument Sans, Instrument Serif.

## Kỹ thuật dùng chung cho mọi ngành

- Headline mở bằng **một từ serif nghiêng** + ký hiệu `↳` thụt dòng (Emotion).
- Nhãn mono uppercase cho metadata.
- Một "khoảnh khắc signature" mỗi trang; không nhồi hiệu ứng.
- Nội dung luôn trong HTML; WebGL/Canvas chỉ là lớp trang trí.
