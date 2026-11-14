import type { D2Lang } from "@/content/demo2";

/**
 * Chữ MỚI của /demo3 cho khu vực "hero" (phần đã có ở /demo2 thì dùng lại qua getD3, không chép sang đây).
 * Hai ngôn ngữ phải cùng một khuôn. Không bịa số liệu, khách hàng, lời chứng thực, giá.
 */
const copy = {
  en: {},
  vi: {},
} satisfies Record<D2Lang, Record<string, unknown>>;

export default copy;
