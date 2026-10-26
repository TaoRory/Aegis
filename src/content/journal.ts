/**
 * Nhật ký xưởng. Chỉ bài có `confirmed: true` mới hiển thị.
 * Ba bài khởi đầu chỉ mô tả cách chính website này được dựng (kiểm chứng được trong mã nguồn), không có ngày tháng hay số liệu kinh doanh.
 * Cần người phụ trách nội dung xem lại trước khi công bố; thêm bài mới với confirmed: false cho tới khi được duyệt.
 */

export interface JournalEntry {
  slug: string;
  index: string;
  title: string;
  body: string[];
  confirmed: boolean;
}

export const journalEntries: JournalEntry[] = [
  {
    slug: "nen-mong-dung-tu-hat",
    index: "01",
    title: "Nền móng dựng từ hạt",
    body: [
      "Hình nền móng ở trang chủ không phải ảnh hay video. Đó là khoảng 18 nghìn điểm sáng trên máy tính (10 nghìn trên điện thoại), mỗi điểm có một vị trí đích cho từng hình: nền móng, mạng nơ-ron, lưới mô-đun, khung trình duyệt, sóng lan tỏa.",
      "Khi người xem cuộn qua mục dịch vụ, các điểm tự di chuyển từ hình này sang hình kế tiếp, và việc đó được tính trên GPU. Bạn có thể tự chơi với engine này trong Studio.",
    ],
    confirmed: true,
  },
  {
    slug: "tam-style-tam-nganh",
    index: "02",
    title: "Tám style, tám ngành",
    body: [
      "Thư viện mẫu gồm tám style, mỗi style là một công thức riêng cho một ngành: màu sắc, font có hỗ trợ tiếng Việt, bố cục và các tương tác.",
      "Các mẫu là thương hiệu giả định để minh họa năng lực. Ảnh dùng trong mẫu lấy từ nguồn có giấy phép mở và có ghi nguồn ở cuối từng mẫu.",
    ],
    confirmed: true,
  },
  {
    slug: "xuong-dung-bang-code",
    index: "03",
    title: "Xưởng này dựng bằng code",
    body: [
      "Không gian 3D bạn đang xem không dùng model dựng sẵn. Sàn, bệ, khung các khu và màn hình đều là hình khối sinh bằng mã (Three.js); ảnh các dự án được dán lên màn hình làm texture.",
      "Nếu thiết bị không chạy được 3D, xưởng chuyển sang bản mặt bằng phẳng với cùng các đường dẫn.",
    ],
    confirmed: true,
  },
];

export const publishedJournal = journalEntries.filter((e) => e.confirmed);
