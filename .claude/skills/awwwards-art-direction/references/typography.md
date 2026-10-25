# Typography cho website "editorial-tech" tiếng Việt

## Font Google hỗ trợ subset `vietnamese` (đã kiểm chứng với next/font)

| Vai trò | Gợi ý | Ghi chú |
|---|---|---|
| Display + body (grotesk cá tính) | **Bricolage Grotesque** (variable, trục opsz/wdth), Be Vietnam Pro, Inter Tight, Space Grotesk, Plus Jakarta Sans, Manrope | Bricolage có nét "bản vẽ" và cá tính, hợp display cỡ lớn |
| Serif nghiêng (điểm nhấn cảm xúc) | **Newsreader** (italic), Fraunces, Playfair Display, Lora | Dùng cho 1–3 từ trong headline, không dùng cho đoạn dài |
| Mono (nhãn, số, metadata) | **JetBrains Mono**, Geist Mono, IBM Plex Mono, Roboto Mono, Source Code Pro | Viết hoa + tracking 0.06–0.12em cho nhãn |

**Không hỗ trợ tiếng Việt:** Instrument Serif (dù rất phổ biến trên Awwwards).

Kiểm tra nhanh một font:
```bash
node -e "const d=require(require('path').join(require.resolve('next/package.json'),'../dist/compiled/@next/font/dist/google/font-data.json'));console.log(d['Tên Font'].subsets)"
```

> Nếu `next/font` báo lỗi subset, font đó không hỗ trợ tiếng Việt. Đổi font, đừng bỏ subset `vietnamese`.

## Thang cỡ chữ gợi ý (clamp theo viewport)

- Hero display: `clamp(3.2rem, 11vw, 12rem)`, line-height 0.95–1.02, tracking −0.04em.
- Chương (H2): `clamp(2.4rem, 6vw, 6.5rem)`.
- Statement: `clamp(1.8rem, 3.6vw, 3.6rem)`, line-height 1.15.
- Body: 16–18px, line-height 1.6, tối đa 60–68 ký tự/dòng.
- Nhãn mono: 11–12px uppercase.

## Tiếng Việt: lưu ý kỹ thuật

- Dấu chồng (ễ, ặ, ữ) cao hơn chữ hoa. Với line-height < 1.1, **mask theo dòng (overflow hidden) sẽ cắt dấu**. Cách xử lý: thêm `padding-block: 0.14em; margin-block: -0.14em` cho phần tử mask, hoặc dùng `clip-path: inset(-0.3em 0 0 0)` thay cho overflow.
- **Tránh uppercase cho headline dài tiếng Việt**: chữ hoa có dấu (Ữ, Ặ) dễ va dòng. Uppercase chỉ dùng cho nhãn ngắn.
- **Ngắt dòng thủ công** headline quan trọng (`<br>` hoặc span theo dòng) cho từng breakpoint chính. `text-wrap: balance` chỉ là mặc định dự phòng.
- Split theo **từ**, không split theo ký tự, để giữ tổ hợp dấu (Unicode NFC) và cho screen reader đọc đúng (đặt `aria-label` ở phần tử cha nếu split ký tự).
