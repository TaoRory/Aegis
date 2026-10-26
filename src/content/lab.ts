/**
 * Phòng thí nghiệm: các "nguyên mẫu" ghép từ chính engine/hiệu ứng trong dự án.
 * Chỉ ghi điều mã nguồn thực sự làm. `usedIn` chỉ liệt kê nơi hiệu ứng đang được dùng thật.
 */

export type LabId = "nen-mong" | "suong-mu" | "tach-mau" | "dai-cong";

export interface LabItem {
  id: LabId;
  index: string;
  name: string;
  tagline: string;
  description: string;
  howTo: string[];
  techNotes: string[];
  usedIn: string[];
}

export const labItems: LabItem[] = [
  {
    id: "nen-mong",
    index: "01",
    name: "Nền móng hạt",
    tagline: "Hàng chục nghìn điểm sáng đổi hình theo ý bạn.",
    description:
      "Đây là engine hạt đang dựng hình nền móng ở trang chủ Aegis, đặt vào một khung riêng để bạn tự điều khiển: chọn hình, làm các điểm rời ra, đẩy chúng bằng chuột.",
    howTo: ["Bấm một hình để các điểm bay sang hình đó", "Kéo thanh tán để làm các điểm rời ra", "Rê chuột trong khung để đẩy các điểm"],
    techNotes: [
      "WebGL2 viết tay, không dùng thư viện 3D",
      "Mỗi điểm giữ hai vị trí (từ và tới); việc đổi hình diễn ra trên GPU",
      "Chuyển động nhiễu và luồng theo chuột được tính trong shader",
    ],
    usedIn: ["Nền hạt ở trang chủ Aegis"],
  },
  {
    id: "suong-mu",
    index: "02",
    name: "Sương",
    tagline: "Vẽ một làn khói bằng con trỏ.",
    description: "Làn sương mờ đi theo con trỏ rồi tan dần. Rê nhanh thì làn sương dày và rộng hơn.",
    howTo: ["Rê chuột trong khung để vẽ làn sương", "Rê nhanh hơn thì làn sương dày hơn", "Dừng lại để sương tan"],
    techNotes: [
      "WebGL2, hai khung hình đổi chỗ cho nhau (ping-pong) ở độ phân giải thấp",
      "Mỗi khung làm mờ, trôi và nhạt dần khung trước, rồi cộng thêm nét vẽ theo đường con trỏ",
    ],
    usedIn: ["Màn kết liên hệ ở trang chủ Aegis", "Mẫu SERENE"],
  },
  {
    id: "tach-mau",
    index: "03",
    name: "Chữ tách màu",
    tagline: "Chữ rách thành hai viền màu khi bạn lướt nhanh.",
    description: "Gõ một dòng chữ rồi lướt chuột qua nó. Càng nhanh, hai kênh màu lệch nhau càng xa; dừng lại thì khớp trở về.",
    howTo: ["Gõ chữ vào ô", "Rê chuột nhanh qua chữ để các kênh màu lệch nhau", "Chạm và kéo ngón tay nếu dùng điện thoại"],
    techNotes: ["Ba lớp chữ chồng nhau; hai lớp màu dịch ngược chiều theo tốc độ con trỏ", "Chỉ dùng CSS và JavaScript, không WebGL"],
    usedIn: [],
  },
  {
    id: "dai-cong",
    index: "04",
    name: "Dải cong",
    tagline: "Kéo một dải thẻ, cả dải cong thành cung.",
    description: "Một dải ngang kéo được có quán tính. Kéo càng nhanh, các thẻ càng nâng lên và xoay theo khoảng cách tới tâm.",
    howTo: ["Kéo dải ngang", "Kéo nhanh thì cả dải cong thành cung", "Dùng phím mũi tên trái/phải khi đã chọn dải"],
    techNotes: ["Quán tính do vòng lặp tự viết, không dùng thư viện kéo", "Mỗi thẻ dịch lên và xoay theo khoảng cách tới tâm và vận tốc kéo"],
    usedIn: ["Mẫu ATELIER", "Mẫu VOYAGE"],
  },
];

export const labById = Object.fromEntries(labItems.map((i) => [i.id, i])) as Record<LabId, LabItem>;
