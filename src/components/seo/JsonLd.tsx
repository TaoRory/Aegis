/**
 * Chèn dữ liệu cấu trúc schema.org vào HTML trả về từ server (Google đọc ngay, không cần chạy JS).
 * "<" được thoát để nội dung không thể đóng thẻ script.
 */
export function JsonLd({ data }: { data: object | null }) {
  if (!data) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
