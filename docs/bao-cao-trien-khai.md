# Báo cáo triển khai nâng cấp Aegis (P0–P5)

Ngày: 2026-10-26 · Bản chạy thử: `http://localhost:3000` (bản build production, chạy từ bản sao Linux `/root/aegis-verify` vì `node_modules` trong thư mục Windows là bản Windows).

## Đã làm

| Phase | Kết quả |
|---|---|
| P0 Định vị | Mô tả dịch vụ, Về Aegis, quy trình 4 bước đổi sang "tư vấn giải pháp → chốt phạm vi → triển khai → bàn giao sản phẩm dễ dùng"; thêm khối "Điều Aegis bàn giao". |
| P1 Form liên hệ | Trang `/lien-he` hỏi từng câu, rẽ nhánh theo 4 dịch vụ + nhánh "chưa chắc"; câu 1 cũng nằm ở trang chủ; server kiểm tra lại từng lựa chọn theo nhánh. Nội dung câu hỏi: `src/content/contact-flow.ts`. |
| P2 Con trỏ | Con trỏ "đầu bút kỹ thuật": một chấm + một vòng, kéo giãn theo vận tốc, ôm nút, bong bóng nhãn, dấu "+" khi bấm; nguồn chuột dùng chung `src/lib/pointer.ts`. |
| P3 Thư viện 3D | `GalleryRing.tsx` + `gallery-engine.ts` (WebGL2 tự viết): vòng thẻ 3D, sàn phản chiếu, vòng sáng, lưới trần; kéo / lăn ngang / phím / thước / lọc nhóm; rê chuột thì ảnh trong thẻ cuộn; fallback vòng 3D CSS, lưới tĩnh khi tắt JS. Có ở `/mau-giao-dien` (đầy đủ) và trang chủ (rút gọn). |
| P4 Chuyển trang | View Transitions: rèm bản vẽ giữa trang Aegis, thẻ 3D phóng thành trang mẫu, mờ chéo cho Back/Forward; mọi link nội bộ chuyển sang điều hướng client. |
| P5 Đánh bóng | Menu di động dạng rèm; nút "Cài đặt" (chất lượng Cao/Thấp, con trỏ riêng Bật/Tắt); ảnh xem trước dự án vặn nhẹ theo hướng kéo; bộ lọc dự án không còn lẫn vào chuyển trang. |

## Kiểm tra (bản build production, trình duyệt thật)

| Bộ kiểm tra | Kết quả |
|---|---|
| `pnpm qa` (đã cập nhật cho form mới) | 93/93 |
| Form từng bước (4 nhánh, bàn phím, tắt JS, mobile) | 28/28 |
| Con trỏ | 23/23 |
| Thư viện 3D + chuyển trang (Chromium) | 52/52 |
| Cài đặt, menu rèm, lọc dự án, hash-link, vuốt cảm ứng | 25/25 |
| Lỗi do review độc lập tìm ra (đã sửa) | 22/22 |
| Firefox, WebKit (Safari engine): mở trang, con trỏ, thư viện, chuyển trang, form | 7/7 mỗi trình duyệt, không lỗi console |
| `lint`, `typecheck`, `build` | sạch |

## Lỗi tìm thấy và đã sửa

Một agent review độc lập đọc code mới và báo 1 lỗi nghiêm trọng, 8 trung bình, 11 nhẹ. Đã sửa 18/20:

- **Nghiêm trọng:** vuốt dọc để cuộn trang trên điện thoại có thể mở nhầm một mẫu (trình duyệt huỷ thao tác bị coi là một cú bấm).
- Lớp phủ morph / cờ `data-morph-from` có thể kẹt khi quay lại thư viện; hẹn giờ cũ xoá nhầm cờ của lần mở mới.
- Enter chốt chữ khi đang gõ tiếng Việt (Telex/VNI) làm form nhảy sang câu sau.
- `sessionStorage` bị chặn (chế độ riêng tư, trình duyệt trong ứng dụng) làm sập form, hoặc báo gửi lỗi dù email đã gửi.
- Quay lại trang liên hệ (trang được Next giữ lại) xoá họ tên đang nhập.
- Kéo vòng 3D ở chế độ CSS có thể kẹt; lớp chuyển trang chặn click trong 0,9 giây.
- Ctrl/Cmd-click vào link thẻ không mở tab mới; một nấc lăn ngang không đủ để sang thẻ kế; `?style=1.5` làm sập trang; Back không nhớ style đã xem.
- WebGL: vòng lặp thử lại vô hạn khi GPU liên tục mất context; context hỏng giữa chừng không được giải phóng.
- API: `service="constructor"` gây lỗi 500; kiểm tra kích thước body chỉ làm sau khi đọc hết; đồng hồ máy khách lệch làm khách thật bị coi là spam (đổi sang đo thời gian điền bằng đồng hồ đơn điệu).
- Con trỏ: trạng thái "đang bấm" kẹt khi thao tác bị huỷ; ôm nút của trang đang bị ẩn.
- Cài đặt: Esc không trả focus; thẻ thư viện (chế độ WebGL) không có viền focus khi Tab.
- WebKit báo "ResizeObserver loop" ở thư viện và chân trang (chân trang là lỗi có sẵn từ trước).

## Còn lại, cần bạn quyết định

1. **Giới hạn gửi form theo IP** đọc `x-forwarded-for` và lưu trong bộ nhớ từng instance. Trên Vercel header này đáng tin, nhưng nếu chạy sau nginx tự dựng thì có thể bị giả. Có từ trước, chưa đổi.
2. **Trạng thái "đã kết nối kênh nhận" của form được chốt lúc build** (README đã ghi). Đặt `RESEND_API_KEY` / `CONTACT_TO_EMAIL` xong phải deploy lại.
3. **Nhóm lọc của thư viện** (Thương mại · Công nghệ & truyền thông · Dịch vụ · Giáo dục) do tôi tự chia 8 mẫu demo vào 4 nhóm. Cần bạn xác nhận tên nhóm.
4. **Quay lại từ trang mẫu về thư viện** dùng rèm bản vẽ, không có hiệu ứng thu ngược ảnh về thẻ.
5. **Lăn dọc trên thư viện vẫn cuộn trang**; chỉ lăn ngang (trackpad / Shift+lăn), kéo, phím, nút mới xoay vòng.
6. Chưa thử trên GPU thật và thiết bị thật (Safari iPhone, Android tầm thấp). Trình duyệt kiểm tra chạy WebGL bằng phần mềm nên chưa đo được fps thật.
7. Dung lượng JS tải về (gzip): trang chủ khoảng 266 KB, `/mau-giao-dien` 260 KB, `/lien-he` 260 KB. Phần tôi thêm ước khoảng 35–40 KB trải trên các trang (form ≈ 12 KB, thư viện 3D ≈ 12 KB, còn lại là con trỏ, cài đặt, chuyển trang); chưa có số đo chính xác so với bản trước vì không có bản build cũ.
8. **Chưa commit gì.** Repo có sẵn khoảng 70 file hiển thị là đã sửa do khác biệt ký tự xuống dòng.

## Lỗi bạn gặp khi dùng thử (2026-10-26): bấm "Liên hệ" / "Mẫu giao diện" thì trang kẹt ở cuối, không lăn được

- **Nguyên nhân:** thư viện cuộn mượt (Lenis) giữ "vị trí đích" của trang cũ. Khi bạn vừa cuộn xong rồi bấm link ngay, Next cuộn trang mới về đầu nhưng Lenis kéo ngược về vị trí cũ (bị kẹp ở cuối trang mới), và mỗi cú lăn sau đó tính từ vị trí cũ nên không đi đâu được. Nội dung phía trên (chưa tới lượt hiện) nên trông như trang trống chỉ còn chân trang.
- **Sửa:** `MotionProvider.tsx` đặt lại Lenis mỗi lần đổi route (về đầu trang, hoặc về đúng mục nếu link có `#hash`); Back/Forward trả về đúng chỗ đang xem.
- **Kiểm tra:** 4 kịch bản "cuộn xong bấm ngay" (chờ 150ms và 900ms) hết lỗi; bộ dò `flows.mjs` 103/103 (từ 3 trang × 5 link header, cuộn sâu bằng bánh xe thật, kiểm tra route / vị trí / lăn xuống-lên / tiêu đề hiện / không lỗi console), gồm cả trang mẫu, Back/Forward và menu di động.
