import { MARK_CENTER, MARK_SEGMENTS } from "@/components/brand/mark-data";
import { gsap } from "@/lib/motion";

/**
 * Motion identity của logo (theo bảng "Motion Identity" trong guideline: một dải lụa → xoắn lại → khép thành lục giác):
 * mảnh trên cùng xuất hiện trước như một dải sáng, cả khối xoắn ngược về vị trí, các mảnh còn lại lần lượt xoay vào chỗ theo chiều
 * kim đồng hồ quanh tâm, cuối cùng một vệt sáng chạy dọc viền ngoài rồi tắt.
 * Dùng trên SVG có cấu trúc của AegisMarkPaths (data-mark-body, data-seg, data-rim). Trả về timeline để nơi gọi ghép thêm bước.
 */
export function assembleMark(svg: SVGSVGElement, { duration = 2 }: { duration?: number } = {}) {
  const origin = `${MARK_CENTER.x} ${MARK_CENTER.y}`;
  const k = duration / 2;
  const body = svg.querySelector<SVGGElement>("[data-mark-body]");
  // MARK_SEGMENTS đã sắp theo góc từ phía trên, theo chiều kim đồng hồ
  const segs = MARK_SEGMENTS.map((s) => svg.querySelector<SVGGraphicsElement>(`[data-seg="${s.id}"]`)).filter((n): n is SVGGraphicsElement => !!n);
  const rim = svg.querySelector<SVGPathElement>("[data-rim]");
  const whole = svg.querySelector<SVGGElement>("[data-whole]");

  gsap.set(segs, { opacity: 0, scale: 0.62, rotation: -46, svgOrigin: origin });
  if (body) gsap.set(body, { rotation: -60, svgOrigin: origin });
  if (rim) gsap.set(rim, { opacity: 0, strokeDasharray: "0.18 0.82", strokeDashoffset: 0 });

  const tl = gsap.timeline();
  if (body) tl.to(body, { rotation: 0, duration: 1.7 * k, ease: "expo.out" }, 0);
  tl.to(segs[0], { opacity: 1, scale: 1, rotation: 0, duration: 1 * k, ease: "expo.out" }, 0)
    .to(segs.slice(1), { opacity: 1, scale: 1, rotation: 0, duration: 0.95 * k, ease: "expo.out", stagger: 0.09 * k }, 0.24 * k);
  if (rim) {
    // vệt sáng chạy một vòng quanh viền ngoài
    tl.to(rim, { opacity: 0.85, duration: 0.25 * k }, 1.15 * k)
      .to(rim, { strokeDashoffset: -1, duration: 0.9 * k, ease: "power2.inOut" }, 1.15 * k)
      .to(rim, { opacity: 0, duration: 0.3 * k }, 1.8 * k);
  }
  // Xong: đổi sang ảnh nguyên khối (giống hệt khi đã lắp) để không còn đường nối giữa các mảnh khi phóng to
  if (whole && body) tl.set(whole, { opacity: 1 }, ">").set(body, { opacity: 0 }, ">");
  return tl;
}
