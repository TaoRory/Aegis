# Bộ công cụ thiết kế "Awwwards-level" cho Aegis

Thư mục `.claude/` là định dạng Claude Code tự nhận diện. Mở dự án bằng Claude Code là các skill và agent dưới đây sẵn sàng sử dụng.

## Skills (`.claude/skills/`)

| Skill | Dùng khi |
|---|---|
| `design-research` | Cần nghiên cứu website tham khảo: chụp nhiều vị trí cuộn, nhận diện thư viện (GSAP, Lenis, Three.js…), rút ra pattern. Có script và ghi chú các site đã phân tích. |
| `awwwards-art-direction` | Lên concept, art direction, layout, typography; kiểm tra để website không bị "template AI". |
| `motion-engineering` | Viết chuyển động: Lenis smooth scroll, GSAP ScrollTrigger (pin/scrub), SplitText, preloader, cursor, magnetic, horizontal scroll trong Next.js App Router. |
| `webgl-experiences` | Hiệu ứng WebGL: particle morph, shader, nạp lười (lazy-load), fallback, hiệu năng. |
| `design-qa` | Kiểm tra thị giác và chuyển động bằng trình duyệt thật, chấm điểm theo tiêu chí Awwwards, kiểm tra hiệu năng và a11y. |
| `template-gallery` | Thêm/sửa mẫu giao diện demo trong thư viện `/mau-giao-dien`: cấu trúc, token riêng mỗi mẫu, quy tắc trung thực, chụp ảnh xem trước, bài học kỹ thuật. |
| `style-library` | **8 style có tên** (ATELIER, SIGNAL, SERENE, HEARTH, BROADCAST, PLAYGROUND, VOYAGE, CAMPUS), mỗi style là công thức đầy đủ cho một ngành + demo chạy thật. Gọi: "làm website cho X theo style VOYAGE". Kèm bảng tương tác đã lọc từ nghiên cứu. |
| `aegis-context` | Dữ kiện doanh nghiệp Aegis, các ràng buộc "không bịa", và art direction hiện tại của website. **Luôn nạp khi làm việc trên website Aegis.** |

## Agents (`.claude/agents/`)

| Agent | Vai trò |
|---|---|
| `creative-director` | Đề xuất concept/art direction, phản biện thiết kế theo checklist chống template. |
| `design-researcher` | Khảo sát site tham khảo bằng script, tổng hợp pattern có thể dùng lại. |
| `motion-developer` | Hiện thực chuyển động GSAP/Lenis đúng hiệu năng, có cleanup và hỗ trợ reduced-motion. |
| `webgl-developer` | Hiện thực WebGL/shader nhẹ, có fallback. |
| `template-builder` | Dựng mẫu demo mới cho một ngành (thương hiệu giả định, art direction riêng) hoặc nâng cấp mẫu có sẵn. |
| `awwwards-juror` | Đóng vai giám khảo: chụp màn hình, chấm Design/Usability/Creativity/Content, đưa ra danh sách sửa cụ thể. |

## Quy trình đề xuất

1. `design-researcher`: nghiên cứu tham khảo, ghi lại vào `design-research/references/site-notes.md`.
2. `creative-director`: chốt concept, cập nhật `aegis-context/references/art-direction.md`.
3. `motion-developer` và `webgl-developer`: hiện thực.
4. `awwwards-juror`: chấm điểm và đưa danh sách sửa, lặp lại đến khi đạt mục tiêu (≥ 8/10 Design).

Dựng website cho doanh nghiệp khác theo một style: đọc `style-library/SKILL.md` (mục "Cách gọi một style") → `template-builder` → `awwwards-juror`.

Nghiên cứu tương tác (hover, kéo, cuộn) của một site mà không cần quay màn hình: `node .claude/skills/design-research/scripts/record-interactions.mjs <url> <thư mục> --quick`.

Thêm mẫu cho thư viện: `design-researcher` (nếu có site tham khảo) → `template-builder` → `awwwards-juror`.
