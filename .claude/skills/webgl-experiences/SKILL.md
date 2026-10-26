---
name: webgl-experiences
description: Xây hiệu ứng WebGL cho website (particle field, morph hình theo cuộn, phản ứng chuột, shader nền) nhẹ và có fallback. Dùng khi cần "signature moment" 3D/hạt, hero WebGL, hoặc khi chọn giữa raw WebGL, OGL, Three.js, React Three Fiber.
---

# WebGL experiences

## Chọn công cụ

| Nhu cầu | Chọn | Kích thước gzip |
|---|---|---|
| Một hiệu ứng đơn (particles, nền shader, biến dạng ảnh) | **Raw WebGL2** (một program, vài buffer) | ~3–8 KB tự viết |
| Vài hiệu ứng, cần helper geometry/texture | OGL | ~25 KB |
| Cảnh 3D thật: model GLTF, hoặc cảnh không gian dựng bằng code (Xưởng `/xuong`) | Three.js (nạp lười bằng `import()`); xem `references/spatial-site.md` | ~150 KB+ |
| Cảnh 3D gắn chặt với React state | React Three Fiber + drei | lớn nhất |

Website giới thiệu doanh nghiệp: ưu tiên **raw WebGL2** cho particles. Chỉ dùng Three.js khi có model 3D hoặc cần cảnh không gian nhiều khu (`references/spatial-site.md`).

## Luật

1. **WebGL là lớp tăng cường.** Canvas `aria-hidden`, mọi nội dung nằm trong HTML. Không có WebGL (lỗi context, máy yếu) thì giao diện vẫn đầy đủ, có thể kèm nền tĩnh SVG/CSS.
2. **Nạp lười:** module WebGL `import()` sau `requestIdleCallback` hoặc khi hero hiển thị. Không chặn LCP.
3. **DPR tối đa 2 (mobile 1.5).** Số hạt theo thiết bị: desktop 9–14k, mobile 4–6k, `navigator.hardwareConcurrency <= 4` thì giảm một nửa.
4. **Dừng render khi không thấy:** IntersectionObserver + `document.visibilitychange`. Khi canvas đứng yên (không cuộn, không di chuột) có thể render ở 30fps.
5. **Reduced-motion:** vẽ 1 frame tĩnh của hình hiện tại, không vòng lặp, không phản ứng chuột.
6. **Morph trên GPU:** lưu nhiều bộ vị trí đích (attribute `aShapeA`, `aShapeB`…) và nội suy trong vertex shader bằng uniform `uMorph`. Không cập nhật buffer mỗi frame.
7. **Màu lấy từ CSS token:** đọc `getComputedStyle(document.documentElement).getPropertyValue('--accent')` rồi chuyển sang vec3, để đổi theme không phải sửa shader.
8. **Xử lý mất context:** lắng nghe `webglcontextlost` → dừng vòng lặp; `webglcontextrestored` → khởi tạo lại.

## Tài liệu

- `references/particle-morph.md`: kiến trúc engine particle morph (dùng trong website Aegis: `src/components/webgl/`), cách tạo hình đích bằng thủ tục, shader mẫu, cách nối với ScrollTrigger.
