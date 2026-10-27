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

## Điện thoại kiểu game (học từ raomuhammadhamza.tech, đã làm ở Xưởng)

Sheet che nửa màn hình + camera lùi ra xem cả sa bàn làm cảnh "tù". Cách làm đúng:

- **Cảnh toàn màn hình.** Sheet mặc định ở nấc `peek` (6rem: tay nắm "Chi tiết" + tiêu đề); chạm tay nắm mở `mid` (52svh), `full` (tạm dừng 3D). Thanh trên chỉ có tên/"◂ Về xưởng" và một nút menu; mọi nút phụ (về trang chính, 3D/phẳng, cài đặt) gom vào menu. Nav dưới đáy là viên kính 6 icon, mục đang chọn bung thành viên đặc có nhãn (nhãn mục khác ẩn bằng clip, vẫn là tên truy cập).
- **Camera áp sát vật thể** (`phoneRig` trong `camera-rig.ts`): mỗi khu có điểm nhìn riêng cho điện thoại. Camera phải nằm trong phòng hoặc cao hơn đỉnh tường 2,4 m của phòng phía trước, nếu không tường che mất vật thể (kể cả sau khi `fitPullback` đẩy camera lùi). Kiểm bằng ảnh, không đoán.
- **Bộ chuyển mục `‹ 01 / 07 ›`** là `<Link>` thật tới route kế/trước, nổi trên sheet; mỗi lần chuyển camera bay sang vật kế tiếp (đây là phần "di chuyển nhiều").
- **Kéo quanh rất rộng:** yaw ±1.15 rad ở hub, ±0.75 ở khu, pitch ±0.3 (máy tính chỉ ±0.45/±0.14). Gợi ý "Kéo để nhìn quanh" chỉ hiện ở màn đầu, ẩn sau lần kéo/chuyển trang đầu tiên hoặc khi sheet mở.
- **Tự trôi khi nhàn rỗi** (`drift` yaw, `pan` trượt dọc dãy vật thể): chỉ chạy khi người dùng yên ≥ 2,5 giây, chạm là dừng ngay; ~30 fps; giảm chuyển động thì tắt.
- **Sống động rẻ:** xe là một `Points` chạy hai làn ngược chiều quanh xưởng (đúng một lệnh vẽ), bong bóng trong ống nghiệm, vòng quét.
- **Thử bằng thao tác chạm thật** (`hasTouch`, CDP `Input.dispatchTouchEvent`), đo `yaw` qua `?debug-space`. `pnpm qa:factory` có nhóm kiểm tra `[mobile]` cho các điểm này.

## Bố cục đối xứng "Foundation" và song ngữ (Factory 2.0)

- **Mặt bằng một nguồn:** `plan.ts` (khu tròn/chữ nhật + `links` dòng năng lượng) → `engine/layout.ts` (toạ độ vật trưng bày) → FlatMap và mọi builder. Đổi bố cục chỉ sửa `plan.ts` rồi chỉnh rig camera.
- **Ngang hàng bằng một công thức:** `builders/pavilion.ts` dựng cả 4 khu dịch vụ bằng cùng một hàm (khung kính gộp một mesh, tác phẩm hạt riêng theo `createShapes`, vòng sáng); `camera-rig.ts` dùng cùng một công thức góc nhìn cho cả 4. Khác nhau chỉ ở dữ liệu.
- **Camera phải vượt đỉnh tường lưng 2,4 m** của dãy khu phía trước: hai khu phía nam nhìn từ phía nam thì tường Studio che mất, nên nhìn chéo từ cao (~47°) với `span` đủ lớn. Kiểm bằng ảnh.
- **Dòng nối giữa các khu:** `builders/atmosphere.ts` có một mesh cho mọi `links` (vạch sáng trôi từ lõi ra; khu đang xem sáng hơn) và xung `transfer(from, to)` chạy từ khu cũ về lõi rồi tới khu mới (~1,3 s) mỗi lần đổi khu.
- **Song ngữ trong Next 16:** `next.config.ts` có `rewrites` (`/factory/:path*` → `/vi/factory/:path*`) và `redirects` (`/vi/factory/*` → `/factory/*`, slug cũ → slug mới, 308). Không cần proxy.ts. Route `(spatial)/[lang]/factory/**`, `generateStaticParams` trả `vi`/`en`; `params` chỉ đọc trong `<Suspense>`. Chữ giao diện qua `FactoryProvider`/`useFactory()` (client), nội dung dài qua `getFactoryDict(lang)` (server). Chữ vẽ vào canvas trong cảnh (bảng tên khu) theo ngôn ngữ nên engine được dựng lại khi đổi ngôn ngữ (`engine.lang`).
- **`html[lang]`:** root layout là `vi`; bootScript đặt `lang="en"` cho `/en/factory` từ khung hình đầu và `SpaceShell` đồng bộ khi chuyển ngôn ngữ.
- **Bẫy:** trong chuỗi template của bootScript, `\/` mất dấu gạch chéo ngược và làm vỡ regex; dùng so sánh chuỗi. Trang con với tham số không hợp lệ (vd `/factory/services/web/demo`) vẫn trả 200 kèm giao diện 404 vì nội dung đã stream trong `<Suspense>`.

## Camera tự do, lõi năng lượng và intro chữ khoét (Factory 3.0 "Forge")

- **Camera:** dùng `OrbitControls` (`three/addons/controls/OrbitControls.js`) với giảm chấn, `zoomToCursor`, cảm ứng `DOLLY_PAN`. Giới hạn khoảng cách theo khu (`setLimits`), tâm nhìn kẹp trong xưởng, góc cực không chui xuống sàn. Chuyển khu = bay camera và tâm nhìn bằng gsap rồi trả quyền cho người dùng. Có nút ⟲ và phím R về góc mặc định; nhàn rỗi ~5 s ở tổng quan thì tự xoay chậm. Bỏ vuốt ngang để chuyển mục vì trùng với xoay.
- **Bỏ thẻ giới thiệu ở tổng quan khi có 3D:** cảnh là chủ thể. `h1` và câu dẫn vẫn nằm trong DOM (thu còn 1×1 px) cho trình đọc màn hình. Nhãn hotspot chỉ hiện khi rê chuột/focus; trên cảm ứng chỉ nhãn gần tâm (`data-near`).
- **Hình khối riêng cho từng khu**, nhưng bốn dịch vụ cùng một công thức (`bay.ts`): bệ bát giác, giàn khung, hai cánh tay máy (`arms.ts`, IK hai khớp, `InstancedMesh` gộp mọi cánh tay vào vài lệnh vẽ), tác phẩm hạt.
- **Intro chữ khoét (`SpaceIntro.tsx`):** lớp phủ SVG có mặt nạ, chữ AEGIS rất lớn là ô cửa nhìn vào cảnh đang chạy. Cuộn ảo (bánh xe, vuốt, phím) gom thành tiến độ `p`; lớp phủ phóng to quanh khối đặc ở đỉnh chữ A (tìm bằng quét một cột điểm ảnh trên canvas), cùng lúc `engine.setIntroProgress(p)` đưa camera lùi và dựng các khu từ sàn. Chỉ một lần mỗi phiên (`sessionStorage`), có nút Bỏ qua, link sâu và giảm chuyển động không có intro.
- **Bẫy của intro:** (1) hình phủ của mặt nạ chỉ cần bằng khung nhìn, không dùng toạ độ khổng lồ (Chrome vẽ ô đen khi mặt nạ phóng hàng chục lần); (2) làm mượt `p` bằng thời gian thật qua `requestAnimationFrame`, không dùng `gsap.to` (máy chậm bị gsap giới hạn bước thời gian nên trôi rất chậm); (3) failsafe CSS chỉ áp khi `SpaceIntro` chưa chạy (`data-intro-live`), nếu không sẽ làm lớp phủ biến mất giữa chừng trên máy chậm.
- **Cánh tay máy thật hơn:** thanh côn bo cạnh (`RoundedBoxGeometry` biến dạng theo chiều dài), trục khớp, thanh chống thủy lực, động cơ nhỏ, vòng sáng ở khớp; mỗi cánh tay có chương trình riêng (hàn có tia lửa, kẹp–đặt có ngón mở/khép, quét) với điểm dừng, tốc độ, nhịp nghỉ khác nhau (hạt giống riêng) nên không đồng bộ. Gộp hình học trộn có/không chỉ mục phải đưa về không chỉ mục (`mergeAll`).
- **Nhân vật tương tác (`figure.ts`):** thân gộp một mesh có màu đỉnh, mỗi tay hai mesh dùng IK hai khớp. Engine đưa tia từ camera qua con trỏ (`setPointer`) để nhân vật biết chuột lại gần; chuột tới thì vẫy chào ~3,4 s rồi chắp tay, chuột đi thì chắp ngay. Luôn quay mặt về camera để thấy chính diện từ mọi góc.
- **Sương mù theo khoảng cách camera:** sương cố định 30–70 m làm cảnh trên điện thoại (camera xa 90 m) chìm hẳn vào nền; cho `near/far` tỉ lệ với khoảng cách camera tới tâm nhìn.
- **Không tự xoay camera khi nhàn rỗi** (người dùng không thích). Sau khi `flyTo`, xả quán tính của OrbitControls bằng cách tắt giảm chấn và gọi `update()` một lần.
- **Ngân sách đo được:** tổng quan 94 lệnh vẽ (desktop, có bloom) và 72 (điện thoại, không bloom), ~30k tam giác.

## Hai bản của một không gian (trung tính / web)

- Một mã nguồn phục vụ hai địa chỉ gốc: `/factory` và `/web/factory`. Mỗi bản có cây route riêng (`(spatial)/[lang]/factory/**` và `(spatial)/[lang]/web/factory/**`) nhưng chỉ là các file mỏng gọi chung `components/space/views/*` kèm `variant`. Biến thể phải biết lúc build (không đọc từ pathname phía client: pathname lúc prerender là địa chỉ nội bộ `/vi/...`, sẽ lệch hydration).
- Khu chỉ có ở một bản (trưng bày sản phẩm) được cờ `showcase` trong `config/space.ts`; engine nhận `manifest.showcase` để bỏ builder, nét mặt bằng, bệ, vách và tấm sáng của các khu đó. Engine là singleton: khi sang bản khác phải dispose và dựng lại (`engine.showcase`).
- Cặp ngôn ngữ vẫn đổi bằng liên kết thường. Chuyển từ trang chính sang Factory cũng dùng liên kết thường để script đầu trang đặt cờ khóa cuộn và màn mở đầu.

## Nội dung

Từ Factory 3.0 không còn khu thí nghiệm và nhật ký; các khu còn lại chỉ ghi điều code thật sự làm; bài nhật ký phải có `confirmed: true` và cần chủ dự án duyệt. Không ngày tháng, số liệu hay khách hàng bịa.
