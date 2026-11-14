import type { D2Lang } from "@/content/demo2";

/**
 * Chữ MỚI của /demo3 cho khu vực "process" (phần đã có ở /demo2 thì dùng lại qua getD3, không chép sang đây).
 * Hai ngôn ngữ phải cùng một khuôn. Không bịa số liệu, khách hàng, lời chứng thực, giá.
 *
 * Thanh ray của trang Quy trình là một bảng nhỏ "bước × gói": `stops` là tên ngắn của năm bước (đúng thứ tự t.process.steps),
 * các chuỗi còn lại là chữ cho trình đọc màn hình. Bước nào thuộc gói nào KHÔNG khai báo lại ở đây:
 * component suy ra từ `t.process.steps[].plans` để hai bản /demo2 và /demo3 không lệch nhau.
 */
const copy = {
  en: {
    railCaption: "Which plans include each step",
    planHeader: "Plan",
    step: "Step",
    stops: ["Brief", "Scope", "Build", "Handover", "Grow"],
    included: "Included",
    notIncluded: "Not included",
  },
  vi: {
    railCaption: "Bước nào thuộc gói nào",
    planHeader: "Gói",
    step: "Bước",
    stops: ["Bài toán", "Phạm vi", "Thực hiện", "Bàn giao", "Lớn lên"],
    included: "Có trong gói",
    notIncluded: "Không có trong gói",
  },
} satisfies Record<D2Lang, Record<string, unknown>>;

export default copy;
