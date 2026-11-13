# Design Playbook: làm website không bị "AI slop"

File này dành cho AI coding agent (và người làm) khi thiết kế, dựng website hoặc web app cho khách.
Cách dùng: chép file vào gốc dự án mới và yêu cầu agent đọc trước khi viết bất kỳ dòng giao diện nào.
File tự đứng được: không phụ thuộc vào dự án gốc.

Nguồn: hai vòng nghiên cứu tháng 11/2026 trên 24 website (agency growth, dịch vụ bán theo gói, studio web, và các trang trong minimal.gallery mục AI), đối chiếu với bộ luật của Impeccable. Danh sách trang tham khảo ở cuối file.

---

## 1. Quy trình bắt buộc trước khi code

1. **Viết lời chào hàng một dòng.** Ai, nhận được gì, khác gì. Nếu chưa viết được câu này thì chưa thiết kế.
2. **Liệt kê dữ kiện thật đang có**: dự án đã làm, ảnh thật, số liệu có nguồn, lời chứng thực có đồng ý đăng, giá. Thứ gì không có thì không xuất hiện trên trang. Không bịa để lấp chỗ.
3. **Chọn một chữ ký thị giác** (mục 3) và dùng lặp lại có chủ đích.
4. **Phác bố cục từng phần, mỗi phần một kiểu** (mục 5). Hai phần liền nhau không dùng chung một khuôn.
5. **Chọn font đã kiểm tra bộ dấu của ngôn ngữ đích** (mục 4).
6. Dựng xong thì chạy danh sách kiểm ở mục 8 trên trình duyệt thật, cả desktop lẫn điện thoại.

### Ba câu hỏi về cấu trúc, trả lời trước khi vẽ

Rút từ lần làm lại website Aegis (bản đầu bị chê "chỉ là một landing page tầm thường"):

- **Một trang cuộn dọc hay website nhiều trang?** Doanh nghiệp có từ ba dịch vụ trở lên, có dự án và có ý định viết bài thì làm nhiều trang: Trang chủ, Dịch vụ (mỗi dịch vụ một trang), Gói hoặc Bảng giá, Dự án (mỗi dự án một trang), Quy trình, Giới thiệu, Blog, Liên hệ. Menu trỏ tới trang thật, không phải bốn điểm neo trên cùng một trang. Trang chủ chỉ kể câu chuyện chính và dẫn đi.
- **Màn đầu đang nói doanh nghiệp làm gì?** Thứ chiếm nhiều diện tích nhất ở màn đầu sẽ thành định vị trong mắt khách. Đặt một tường ảnh website ở đó thì khách hiểu "bên này làm web", dù tiêu đề nói rộng hơn. Màn đầu phải cho thấy toàn bộ phạm vi dịch vụ.
- **Đối thủ gần nhất đang nói gì?** Mở trang của họ trước khi viết tiêu đề. Nếu câu định vị trùng nhau thì phải nói phần mình có mà họ không có.

Mỗi trang nên có một hoặc hai điểm tương tác có chủ đích, gắn với nội dung (ví dụ bấm chọn gói để thấy gói đó gồm gì; cuộn để thấy một biểu đồ ý tưởng được vẽ dần). Không có điểm nào thì trang "đúng nhưng nhạt"; rải hiệu ứng khắp nơi thì thành AI slop.

## 2. Dấu hiệu "AI slop": thấy là sửa

### Màu và hiệu ứng
- Gradient tím–xanh; nền đen với một màu neon và viền phát sáng.
- Chữ tô gradient. Nhấn mạnh bằng cỡ, độ đậm hoặc khối màu sau chữ.
- Kính mờ (blur, glass) dùng để trang trí.
- Một kiểu đổ bóng mềm và một mức bo góc cho mọi thứ.
- Hình 3D, blob, ảnh trừu tượng lấy sẵn; ảnh do AI sinh.

### Bố cục
- Hàng ba thẻ giống hệt nhau (icon + tiêu đề + đoạn chữ) làm khung xương cả trang.
- Mọi thứ căn giữa. Mặc định là căn trái; căn giữa nhiều nhất một câu tuyên bố.
- Hero chia đôi có hàng huy hiệu, hoặc tiêu đề căn giữa nằm trên một hàng thẻ.
- Nhãn nhỏ (eyebrow) phía trên mọi tiêu đề.
- Đánh số 01/02/03 ở nơi thứ tự không có ý nghĩa. Số chỉ dùng cho quy trình.
- Thẻ lồng trong thẻ.
- Thẻ có viền màu một cạnh.
- Phần nào cũng cùng một khuôn và cùng một nhịp khoảng trống.

### Chữ và nội dung
- Font dùng quá nhiều: Inter làm tiêu đề, Space Grotesk, DM Sans, Plus Jakarta Sans, Outfit, Instrument Sans, Fraunces, Playfair, Newsreader.
- Cụm "nền kem + serif cho tiêu đề + chữ nghiêng serif để nhấn".
- Font mono dùng làm "trang phục công nghệ" cho nhãn và tiêu đề. Mono chỉ dành cho mã và dữ liệu.
- Emoji hoặc ký tự Unicode thay cho icon.
- Từ sáo rỗng: "seamless", "powerful", "next-gen", "giải pháp toàn diện", "đột phá".
- Khuôn "số lớn + nhãn nhỏ" với số liệu không có nguồn; logo khách và lời chứng thực không có thật.

### Chuyển động
- Cùng một hiệu ứng trượt lên cho mọi phần khi cuộn.
- Chữ ẩn cho tới khi cuộn tới. Người dùng thấy trang trống và chậm.
- Easing nảy (bounce).

## 3. Nguyên tắc nên làm

- **Một chữ ký thị giác, lặp lại.** Ví dụ: khối màu phẳng sau từ khóa; hình khối lấy từ logo; nền màu riêng cho từng dự án. Chọn một, đừng dùng năm.
- **Màu phẳng và viền mảnh tạo chiều sâu.** Gần như không đổ bóng. Chỉ một kiểu bóng, dành cho phần tử "nổi" như mô hình giao diện.
- **Bảng màu nhỏ**: một nền sáng, một màu mực, một hoặc hai màu thương hiệu. Sự đa dạng màu đến từ nội dung thật (ảnh dự án, màu thương hiệu của khách), không từ việc thêm màu trang trí.
- **Chương tối là một tấm bo góc nằm trong lề trang**, không tràn hết chiều ngang. Tối đa hai tấm mỗi trang.
- **Chữ hai sắc độ**: nửa câu màu mực, nửa câu màu xám, cùng cỡ. Thay được cho nhãn nhỏ và phụ đề.
- **Tương phản cỡ chữ mạnh**: tiêu đề rất lớn cạnh chữ nội dung 17–18px.
- **Hình ảnh thật**: ảnh chụp sản phẩm hoặc dự án thật. Khi cần minh họa, vẽ mô hình giao diện bằng HTML/CSS với dữ liệu hợp lý, ghi rõ là minh họa, không gắn số liệu thành tích.
- **Tiêu đề bước dạng mệnh lệnh ngắn, có dấu chấm**: "Tell us the problem." "Agree the scope."
- **Một lời mời duy nhất, lặp lại**, viết theo lợi ích: "Get a quote", không phải "Submit" hay "Learn more".
- **Chưa có giá thì không ghi giá.** Trình bày gói theo "Phù hợp với" và "Bao gồm", kèm nút nhận báo giá.
- **So sánh định tính**: bảng so với các lựa chọn thay thế, chỉ ghi điều mình bảo đảm được, không ghi con số.
- **Theme cả bề mặt trình duyệt**: màu bôi đen, viền focus, màu accent của form.

## 4. Thông số khởi điểm

Đây là điểm xuất phát, chỉnh theo thương hiệu.

### Chữ
- Tiêu đề: `clamp(2.5rem, 1rem + 5.4vw, 5.25rem)`, line-height 1.02, letter-spacing −0.03em, `text-wrap: balance`.
- H2: `clamp(1.875rem, 1rem + 2.6vw, 3.1rem)`, line-height 1.06.
- Nội dung: 1.0625–1.125rem, line-height 1.55, dòng dài tối đa khoảng 65 ký tự.
- Chữ nhỏ: không dưới 0.8125rem.
- Tiếng Việt: tăng line-height tiêu đề lên 1.12–1.16 vì dấu chồng (Ế, Ỗ); tránh tiêu đề viết hoa toàn bộ với font hẹp.

### Font có đủ dấu tiếng Việt, không nằm trong danh sách dùng quá nhiều
- Bricolage Grotesque (tiêu đề, có cá tính) với Hanken Grotesk (nội dung).
- Familjen Grotesk với Be Vietnam Pro.
- Archivo, dùng trục width để lấy tương phản từ một họ font.
- Không có tiếng Việt, đừng dùng cho trang tiếng Việt: Instrument Serif, Instrument Sans, Figtree, DM Sans, Outfit, Sora, Schibsted Grotesk.
- Luôn kiểm tra lại bộ dấu khi cài font.

### Tương phản: đạt chuẩn chưa chắc đã dễ đọc

Bản đầu của website Aegis đạt WCAG AA ở gần như mọi chữ mà vẫn bị chê "khó đọc", vì mọi thứ nhạt như nhau: nền sáng, thẻ trắng, viền mảnh, chữ phụ xám và nhỏ.

- Chữ phụ nhắm 7:1 trở lên, không dừng ở 4.5:1. Chữ nội dung dày 450–500 thay vì 400.
- Nhãn nhỏ nhất 14px, đậm 600.
- Viền thẻ đủ đậm để thấy mép thẻ (khoảng 20% màu mực trên nền sáng).
- Mỗi trang có ít nhất một hoặc hai tấm nền tối hoặc nền màu đậm để tạo nhịp sáng tối.
- Không làm mờ chữ bằng opacity trên nền màu.
- Đưa phép đo tương phản vào bộ kiểm tự động, chạy trên mọi trang.

### Bo góc ba cấp
- Tấm chương, nền dự án: 28px (20px trên điện thoại).
- Thẻ, khung mô hình: 16px; phần tử bên trong: 8px.
- Nút, chip, tab: bo tròn hẳn.

### Khoảng cách
- Bội số của 8px.
- Khoảng trên dưới mỗi phần: `clamp(72px, 10vw, 144px)`, xen kẽ chật và thoáng.
- Đệm thẻ 24–32px; khe 16–24px.
- Bề rộng nội dung 1240px; cột đọc 720–860px; lề điện thoại 20–24px.

### Thẻ
- Chỉ ba loại: trắng viền mảnh, tô màu thương hiệu nhạt, tô màu mực.
- Không xếp ba thẻ giống nhau thành hàng.

### Chuyển động
- Mọi chữ hiện ngay khi tải trang.
- Một điểm nhấn động duy nhất cho cả trang, có nút tạm dừng nếu tự chạy.
- Ngoài ra chỉ có hover, focus và chuyển tab hoặc accordion (200–300ms, ease-out).
- Mọi animation nằm trong `@media (prefers-reduced-motion: no-preference)`.
- Muốn trang "sống" mà không giấu chữ: khối trồi lên bằng transform (dịch xuống 2–3rem, không đổi opacity), khối màu sau từ khóa tự quét vào, mô hình minh họa tự chuyển động, dải chữ chạy, mũi tên và ảnh phản ứng khi rê chuột, chiều sâu 3D theo con trỏ cho một khối chính.

## 5. Thư viện bố cục: mỗi phần chọn một kiểu khác nhau

| Mục đích | Kiểu bố cục |
|---|---|
| Hero | Câu chào hàng căn trái, hai nút, và sản phẩm thật (tường dự án hoặc ảnh giao diện) bắt đầu ngay trong màn đầu |
| Nêu vấn đề | Một câu lớn hai sắc độ; bên dưới là tình huống của khách dạng hàng kẻ dòng, không thẻ, không icon |
| Gói dịch vụ | Bậc thang dọc: ba hàng rộng hết cỡ trên ba bề mặt khác nhau. Trái là "nhận gì" và "phù hợp với"; phải là danh sách bao gồm và nút |
| Điểm khác biệt | Tiêu đề dính bên trái, danh sách định nghĩa bên phải |
| Quy trình | Các hàng so le trong một khung viền mảnh: chữ một bên, mô hình minh họa một bên |
| Dự án | Một dự án lớn trên nền màu riêng, phần còn lại là danh mục dạng hàng |
| So sánh | Bảng, cột của mình tô màu; trên điện thoại trượt ngang có điểm bắt |
| Câu hỏi | Hai cột: tiêu đề trái, các hàng mở ra bên phải |
| Lời mời cuối | Hai ô lớn cạnh nhau, không phải một dải căn giữa |
| Footer | Tấm tối bo góc nằm trong lề, tên thương hiệu khổ lớn |

Các kiểu khác đã thấy hiệu quả: danh sách bên trái điều khiển hình bên phải; hàng viên thuốc cỡ lớn làm accordion; tính năng dạng tiêu đề nhỏ kèm chip thay cho thẻ icon.

## 6. Điện thoại

- Header chỉ còn logo, một nút lời mời và nút Menu.
- Tab thành nút xếp chồng; quy trình thành danh sách dọc có số.
- Dãy nhiều ảnh thành một hàng trượt ngang có điểm bắt, không xếp dọc bảy ô.
- Vùng chạm tối thiểu 40–44px.
- Không để banner cookie và bong bóng chat che quá một phần tư màn hình đầu.
- Kiểm tra tràn ngang ở 375, 768, 1280 và 1440px. Lưu ý: phần tử `position: absolute` (kể cả chữ ẩn cho trình đọc màn hình) nằm trong vùng trượt ngang sẽ làm tràn cả trang nếu thẻ cha không có `position: relative`.

## 7. Nội dung

- Tiêu đề dùng danh từ và động từ cụ thể. "We build digital assets you own." tốt hơn "Empowering your digital journey."
- Mỗi phần trả lời một câu hỏi của khách: cái gì, cho ai, gồm gì, làm thế nào, bằng chứng đâu, bắt đầu ra sao.
- Lời của khách chỉ đưa lên khi có thật và được đồng ý. Tình huống minh họa phải để không ghi tên và đóng khung là "bạn có thấy quen không".
- Dịch vụ mới ở mức định hướng thì ghi "tư vấn và làm theo yêu cầu", không mô tả như sản phẩm có sẵn.
- Form liên hệ không được giả lập gửi thành công.

## 8. Danh sách kiểm trước khi bàn giao

- [ ] Màn đầu: câu chào hàng và nút chính nhìn thấy ngay, không cần cuộn, ở cả desktop và điện thoại.
- [ ] Tắt JavaScript và bật "giảm chuyển động": nội dung vẫn hiện đủ.
- [ ] Không tràn ngang ở bốn khổ màn hình.
- [ ] Không có số liệu, giá, logo, lời chứng thực nào thiếu nguồn.
- [ ] Hai phần liền nhau không dùng chung một khuôn bố cục.
- [ ] Không có mục nào trong danh sách "AI slop" ở mục 2.
- [ ] Tương phản chữ đạt 4.5:1 (chữ lớn 3:1).
- [ ] Mọi ảnh có kích thước cố định, không gây nhảy bố cục.
- [ ] Mọi liên kết ra ngoài còn sống.
- [ ] Không có lỗi console.

## 9. Trang tham khảo

Xem để hiểu cách làm, không sao chép bố cục hay tài sản.

| Trang | Học được gì |
|---|---|
| projectsimply.com | Vào thẳng tường dự án thật trên nền màu riêng; khối màu sau từ khóa |
| ploy.ai | Tấm chương bo góc lồng trong lề; tiêu đề bước dạng mệnh lệnh |
| behaviorai.eu | Bậc thang dịch vụ ba hàng ba bề mặt; mô hình tự vẽ có nút tạm dừng |
| superside.com | Thẻ gói không ghi giá với "Best for"; bảng so sánh ba lựa chọn |
| flowninja.com | Khung "làm một lần" và "đồng hành tiếp" |
| heydigital.co | Mạch nỗi đau, "đó là chỗ chúng tôi vào cuộc", giải pháp; mô hình giao diện tự vẽ |
| unifygtm.com | Tính năng bằng chữ và chip, không thẻ icon |
| hellomatik.com | Lời mời cuối là hai ô lớn; ghi rõ "dữ liệu mô phỏng" |
| spek.app | Quy trình dạng hàng so le trong khung viền mảnh |
| wist.chat | Tiêu đề và phụ đề cùng cỡ, khác sắc độ |
| singlegrain.com | Quy trình bốn cột; thư của founder thay lời chứng thực |
| designjoy.co | Cả trang là một lời chào hàng; ba bước ngắn |

Phản ví dụ (trông như AI làm): nền đen, neon phát sáng, mọi thứ căn giữa, lưới thẻ icon và thẻ giá giống hệt nhau.
