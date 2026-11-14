import type { D2Lang } from "@/content/demo2";

/**
 * Chữ MỚI của /demo3 cho khu vực "shell" (phần đã có ở /demo2 thì dùng lại qua getD3, không chép sang đây).
 * Hai ngôn ngữ phải cùng một khuôn. Không bịa số liệu, khách hàng, lời chứng thực, giá.
 */
const copy = {
  en: {
    /** Nhãn nút dừng / chạy của nền động ở khối lời mời cuối trang (chỉ trình đọc màn hình đọc) */
    final: { pause: "Pause the background motion", play: "Play the background motion" },
  },
  vi: {
    final: { pause: "Tạm dừng nền chuyển động", play: "Chạy tiếp nền chuyển động" },
  },
} satisfies Record<D2Lang, Record<string, unknown>>;

export default copy;
