import type { D2Lang, D2PlanId } from "@/content/demo2";

/**
 * Chữ MỚI của /demo3 cho khu vực "plans" (phần đã có ở /demo2 thì dùng lại qua getD3, không chép sang đây).
 * Hai ngôn ngữ phải cùng một khuôn. Không bịa số liệu, khách hàng, lời chứng thực, giá.
 */

/**
 * Mỗi tình huống ở "Trường hợp nào giống bạn?" dẫn về gói nào (theo đúng thứ tự của plans.cases trong demo2.ts).
 * Rút từ chính câu trả lời đã có: tình huống 1 nói về Own, tình huống 2 về Grow hoặc Amplify,
 * tình huống 3 là AI agent làm riêng theo tư vấn nên không dẫn về gói nào.
 */
const fit: D2PlanId[][] = [["own"], ["grow", "amplify"], []];

const copy = {
  en: {
    fit,
    /** Nhãn cho trình đọc màn hình của viên dẫn về thẻ gói; {name} là tên gói */
    seePlan: "See the {name} plan",
    /** Gợi ý trên điện thoại: bảng so sánh rộng hơn màn hình, cột Aegis nằm bên phải */
    swipe: "Swipe sideways to compare",
  },
  vi: {
    fit,
    seePlan: "Xem gói {name}",
    swipe: "Vuốt ngang để so sánh",
  },
} satisfies Record<D2Lang, Record<string, unknown>>;

export default copy;
