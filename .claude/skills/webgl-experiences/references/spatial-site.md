# Website không gian 3D nhiều khu (mẫu: Xưởng Aegis, `/factory`)

Dùng khi người dùng muốn bỏ bố cục một trang dài, thay bằng một cảnh 3D chia thành nhiều khu, mỗi khu mở một khung nội dung. Cảnh dựng **bằng code** (không model GLTF) nên nhẹ và đổi màu theo token.

## Kiến trúc đã chạy được

- **URL là nguồn sự thật.** Mọi điều hướng là `<Link>` thật; `RouteSync` (trong `<Suspense>`) ghi `usePathname()` vào store, engine đọc store để bay camera. Không dùng ViewTransition trong khu này (snapshot đóng băng canvas).
- **Layout giữ canvas sống xuyên các route.** Next 16 giữ route cũ ở `<Activity>` ẩn, nên panel tự animate lúc mount, không có animation thoát.
- **Engine là singleton, tải lười** (`import()` sau first paint), tự sở hữu canvas và `attach/detach` giữa các host. Vòng lặp chạy trên `gsap.ticker`, hạ xuống ~20fps khi đứng yên.
- **Bản phẳng SVG** (server-render, link thật) là giao diện khi không có JS/WebGL, saveData, RAM ≤ 2GB, chất lượng thấp hoặc người dùng tự chọn. Không bao giờ là trang trống.
- **Hotspot là `<Link>` thật** trong `<nav>`; engine chiếu vị trí 3D xuống DOM bằng transform. Chọn vật 3D bằng `userData.pick` (`project:<slug>`, `lab:<id>`, `zone:<id>`).
- **Màn hẹp:** panel thành bottom sheet 3 nấc; engine nhận `insets` và dùng `setViewOffset` để chừa chỗ.

## Bài học kỹ thuật

- **Ngân sách lệnh vẽ ≤ 120 (desktop).** Gộp hình học cùng vật liệu bằng `mergeGeometries` (bệ, trụ, viền, chân bàn, khung cửa). Ẩn (`visible=false`) quầng sáng/phản chiếu khi opacity gần 0. Lần đầu dựng cảnh 7 khu cho 164 lệnh vẽ, sau gộp còn dưới 120.
- **Khung hình phải chứa đủ vật thể khi có panel.** Chỉ lùi camera theo tỷ lệ khung là chưa đủ: khai báo `span` (mét cần thấy) trong rig rồi tính hệ số lùi từ `span / bề rộng nhìn thấy`, có trần. Kiểm bằng cách đo vị trí hotspot trên màn hình, không chỉ nhìn ảnh.
- **`alphaMap` đọc kênh xanh lục.** Gradient mờ dần phải là thang xám, không phải màu.
- **Texture ảnh:** `fetch` + `createImageBitmap(..., { imageOrientation: "flipY" })` và `flipY = false`. Khung chưa có ảnh phải nhân màu nền, đừng để trắng.
- **ShaderMaterial tự viết** phải `#include <tonemapping_fragment>` và `<colorspace_fragment>` để khớp màu với vật liệu chuẩn.
- **Canvas rỗng chặn click.** Host canvas để `pointer-events: none` mặc định, chỉ bật khi `html[data-space-live="on"]`.
- **Tạm dừng có đếm tham chiếu** (`hold/release`) khi một thí nghiệm hoặc sheet đầy cần GPU.
- **Chụp WebGL headless** cần cờ `--enable-gpu --use-angle=swiftshader --enable-unsafe-swiftshader`.

## Tạo "wow" cho cảnh dựng bằng code (đã dùng ở Xưởng)

- **Chiều sâu trước, chi tiết sau:** vành thành phố xa (một `InstancedMesh`, cửa sổ sáng thưa trong shader, nhạt dần vào sương), bụi sáng trôi (một `Points`), sàn rộng làm nền. Tránh đặt khối nhà trên đường camera bay qua.
- **Ánh sáng bằng shader, không bằng đèn thật:** xung sáng đuôi dài chạy quanh nét mặt bằng (một mesh cho mọi phòng), vòng sóng lan trên sàn khi đổi khu, tường sáng lên ở khu đang xem, vệt sáng loang xuống sàn trước màn hình (thuộc tính đỉnh điều khiển độ sáng), dải ánh sáng quét chéo màn hình (`onBeforeCompile` chèn sau `map_fragment`, dùng chung `customProgramCacheKey`).
- **Bloom (desktop):** `EffectComposer` + `UnrealBloomPass` + `OutputPass`, RT `HalfFloatType` có MSAA. Khi đó đặt `renderer.toneMapping = NoToneMapping` (OutputPass tone map cả ảnh dự án nên ACES làm đổi màu ảnh). Ngưỡng ~0.5, cường độ ~0.4: cao hơn là cháy sáng bề mặt sáng (cuốn sổ, màn nền trắng). Điện thoại tắt bloom. `renderer.info.autoReset = false` và tự `reset()` trong `RenderPass` để QA đếm lệnh vẽ của riêng cảnh, không tính các lượt hậu kỳ.
- **Parallax chuột + lắc nhẹ** thay cho cảnh tĩnh; giảm chuyển động thì đóng băng thời gian của mọi hiệu ứng nền.
- **Ngân sách lệnh vẽ:** mỗi hiệu ứng thêm 1–2 lệnh vẽ; bỏ quầng halo riêng từng màn (bloom + vệt sáng sàn đã thay). Đo ở tổng mặt bằng: desktop ~110 (≤120), điện thoại ≤80 (bỏ phản chiếu sàn, tấm sáng phòng lúc nghỉ, quỹ đạo thứ hai).

## Điện thoại

- Mỗi rig khai báo `span` (bề rộng) và `spanV` (chiều cao) cần thấy; engine lùi camera theo phần khung còn trống cả hai chiều, có trần 2.6×. Cảnh nhìn ngang từ trên cao thì lùi cũng làm camera tiến vào phòng kế bên: góc nhìn phải đủ cao để vượt đỉnh tường (2,4 m).
- Bottom sheet vừa (52svh) và thấp (30svh) để cảnh còn ≥ 35% màn hình. Nhãn điểm chạm chỉ còn số thứ tự trên màn hẹp; vùng chạm ≥ 44px bằng `::after` ở `pointer: coarse`.

## Nội dung

Khu "phòng thí nghiệm" và "nhật ký" chỉ ghi điều code thật sự làm; bài nhật ký phải có `confirmed: true` và cần chủ dự án duyệt. Không ngày tháng, số liệu hay khách hàng bịa.
