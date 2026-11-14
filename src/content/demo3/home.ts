import type { D2Lang } from "@/content/demo2";

/**
 * Chữ MỚI của /demo3 cho khu vực "home" (phần đã có ở /demo2 thì dùng lại qua getD3, không chép sang đây).
 * Hai ngôn ngữ phải cùng một khuôn. Không bịa số liệu, khách hàng, lời chứng thực, giá.
 */
const copy = {
  en: {
    /** Nhãn nút dừng / chạy của dải chữ chạy (chỉ trình đọc màn hình đọc) */
    marquee: { pause: "Pause the moving text", play: "Play the moving text" },
  },
  vi: {
    marquee: { pause: "Tạm dừng dải chữ chạy", play: "Chạy tiếp dải chữ" },
  },
} satisfies Record<D2Lang, Record<string, unknown>>;

export default copy;
