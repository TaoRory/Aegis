import type { D2Lang } from "@/content/demo2";

/**
 * Chữ MỚI của /demo3 cho khu vực "work" (phần đã có ở /demo2 thì dùng lại qua getD3, không chép sang đây).
 * Hai ngôn ngữ phải cùng một khuôn. Không bịa số liệu, khách hàng, lời chứng thực, giá.
 */
const copy = {
  en: {
    /** Gợi ý cạnh nhãn "Full page": khung ảnh toàn trang tự cuộn được */
    scrollHint: "Scroll inside the frame",
  },
  vi: {
    scrollHint: "Cuộn trong khung để xem cả trang",
  },
} satisfies Record<D2Lang, Record<string, unknown>>;

export default copy;
