/**
 * Chữ hiển thị của Xưởng Aegis (phiên bản 2). Quy ước giống about.ts: *dấu sao* = serif nghiêng.
 * Không bịa: không số liệu, khách hàng, thành tích; chỉ nói điều có thật trong mã nguồn và dữ liệu đã xác nhận.
 */

export const spaceCopy = {
  name: "Xưởng Aegis",
  homeLink: "← Trang chính Aegis",
  homeLinkShort: "← Aegis",
  hub: {
    label: "BV-00 — Tổng mặt bằng",
    lines: ["Xưởng Aegis,", "*nơi mọi thứ được dựng.*"],
    lead: "Một xưởng nhỏ để xem Aegis làm việc: những website đã thực hiện, các thí nghiệm tự dựng, thư viện style mẫu và cách Aegis nhận một bài toán. Chọn một khu trên mặt bằng.",
    hint3d: "Kéo để nhìn quanh · bấm ◆ để mở",
    hintFlat: "Bấm vào một khu trên mặt bằng",
    legend: "Các khu trong xưởng",
  },
  zones: {
    "trung-bay": {
      lead: "Các website Aegis đã thực hiện cho doanh nghiệp, tổ chức giáo dục và sự kiện. Mỗi dự án đứng trên một bệ trưng bày: xem thông tin, xem ảnh trang, rồi mở website thật.",
    },
    "thi-nghiem": {
      lead: "Những thí nghiệm Aegis tự dựng để thử cách chuyển động và đồ họa hoạt động. Mỗi thí nghiệm là một nguyên mẫu chạy thật trong trình duyệt, bạn có thể chơi ngay.",
    },
    "mau-giao-dien": {
      lead: "Tám style giao diện, mỗi style là một công thức thiết kế cho một ngành, dựng thành website mẫu chạy thật.",
    },
    "dich-vu": {
      lead: "Bốn nhóm dịch vụ, mỗi nhóm một tờ bản vẽ: bắt đầu từ một nhu cầu cụ thể, mở rộng khi cần.",
    },
    "ve-aegis": {
      lead: "Aegis là đội triển khai công nghệ và marketing của doanh nghiệp.",
    },
    "nhat-ky": {
      lead: "Ghi chép ngắn về cách chính xưởng này được dựng.",
      empty: "Bàn ghi chép đang để trống. Các ghi chép sẽ được thêm sau.",
    },
    "lien-he": {
      lead: "Trả lời vài câu hỏi ngắn, chủ yếu là bấm chọn. Aegis đọc phiếu, tư vấn giải pháp và liên hệ lại để bắt tay triển khai.",
    },
  },
  product: {
    label: "SẢN PHẨM",
    open: "Mở website ↗",
    shot: "Ảnh trang chủ website (chụp tại thời điểm dựng xưởng)",
    fullShot: "Cuộn trong khung để xem toàn trang",
    specType: "Loại",
    specGroup: "Nhóm",
    specAddress: "Địa chỉ",
    specFeatures: "Tính năng đã xác nhận",
    prev: "Sản phẩm trước",
    next: "Sản phẩm kế tiếp",
  },
  lab: {
    label: "NGUYÊN MẪU",
    notice: "Nguyên mẫu thử nghiệm, chạy thật trong trình duyệt.",
    how: "Cách chơi",
    tech: "Ghi chú kỹ thuật",
    usedIn: "Đang dùng ở",
    fullscreen: "Toàn màn hình",
    exitFullscreen: "Thoát toàn màn hình",
  },
  notFound: {
    lines: ["Phòng này", "*chưa được dựng.*"],
    back: "Về tổng mặt bằng",
  },
  boot: {
    skip: "Bỏ qua ⏎",
    lines: [
      "AEGIS / XƯỞNG — BV-00",
      "> đọc bản vẽ mặt bằng",
      "> đổ móng",
      "> dựng tường",
      "> lắp màn hình trưng bày",
      "> thắp đèn",
      "Sẵn sàng. Kéo để nhìn quanh.",
    ],
  },
  hud: {
    close: "Đóng",
    back: "Quay lại",
    nav: "Điều hướng Xưởng",
    flat: "Bản phẳng",
    threeD: "Bản 3D",
    flatNotice: "Thiết bị chưa hỗ trợ không gian 3D, Xưởng đang hiển thị bản phẳng.",
    shortcuts: "Phím tắt",
    details: "Chi tiết",
    toHub: "Về xưởng",
    menu: "Menu",
    menuClose: "Đóng menu",
    dragHint: "Kéo để nhìn quanh",
    stepOf: "Mục",
  },
} as const;
