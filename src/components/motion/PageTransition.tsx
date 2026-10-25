import { ViewTransition } from "react";

/**
 * Điểm kích hoạt chuyển trang (View Transitions). Đặt một lần trong mỗi trang (page.tsx / DemoShell), KHÔNG đặt trong layout
 * vì layout không bị gỡ khi đổi route nên enter/exit không chạy.
 *
 * Phần tử bọc chỉ là một chấm vô hình cỡ 0: nó làm React bắt đầu một view transition khi route đổi, còn hiệu ứng thật
 * (rèm bản vẽ) nằm trên ảnh chụp gốc của trang: ::view-transition-old/new(root) trong effects.css, chọn theo loại điều hướng:
 *   aegis-forward  link đi tới (mặc định của SmartLink / Button nội bộ)
 *   aegis-back     link quay lại (thanh DemoBar "← Thư viện")
 *   aegis-open     mở mẫu từ thư viện (ảnh thẻ phóng thành trang mẫu)
 * Điều hướng không có loại (nút Back/Forward của trình duyệt) dùng hiệu ứng mờ chéo ngắn.
 * Trình duyệt không hỗ trợ View Transitions: chuyển trang bình thường.
 */
const classes = {
  "aegis-forward": "aegis-marker",
  "aegis-back": "aegis-marker",
  "aegis-open": "aegis-marker",
  default: "aegis-marker",
};

export function PageTransition() {
  return (
    <ViewTransition enter={classes} exit={classes} default="none">
      <div aria-hidden className="vt-marker" />
    </ViewTransition>
  );
}
