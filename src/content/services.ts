import type { Service } from "@/content/types";

export const services: Service[] = [
  {
    id: "ai",
    title: "Giải pháp AI doanh nghiệp",
    shortTitle: "AI doanh nghiệp",
    summary:
      "Tư vấn đúng bài toán, rồi dựng công cụ AI chạy thật trong quy trình của doanh nghiệp, không chạy theo xu hướng.",
    needs: [
      "Muốn ứng dụng AI nhưng chưa rõ nên bắt đầu từ đâu",
      "Cần đánh giá AI có phù hợp với quy trình và dữ liệu hiện có hay không",
      "Cần công cụ AI điều chỉnh theo cách làm việc riêng của đội ngũ",
    ],
    scope: [
      "Tư vấn giải pháp AI theo bài toán cụ thể, làm rõ trước khi triển khai",
      "Phát triển và triển khai sản phẩm AI cho doanh nghiệp",
      "Tùy chỉnh giải pháp theo yêu cầu riêng của từng khách hàng",
    ],
    value: "AI được đặt đúng chỗ trong quy trình, phục vụ công việc hằng ngày của doanh nghiệp.",
  },
  {
    id: "software",
    title: "Triển khai phần mềm quản trị doanh nghiệp",
    shortTitle: "Phần mềm quản trị",
    summary:
      "Tư vấn giải pháp, triển khai và tùy chỉnh phần mềm quản trị theo đúng quy trình vận hành, bàn giao để đội ngũ dùng ngay.",
    needs: [
      "Dữ liệu và công việc nằm rải rác ở nhiều nơi, khó theo dõi",
      "Phần mềm có sẵn chưa khớp với cách vận hành thực tế",
      "Cần chuẩn hóa quy trình khi doanh nghiệp mở rộng",
    ],
    scope: [
      "Tư vấn giải pháp và chốt phạm vi triển khai",
      "Triển khai phần mềm vào hoạt động của doanh nghiệp",
      "Tùy chỉnh theo quy trình vận hành riêng",
    ],
    value: "Hệ thống quản trị khớp với cách doanh nghiệp làm việc, giúp vận hành rõ ràng và ổn định hơn.",
  },
  {
    id: "web",
    title: "Thiết kế, phát triển website và web app",
    shortTitle: "Website & web app",
    summary:
      "Từ website giới thiệu doanh nghiệp, website sự kiện đến hệ thống web xây dựng theo yêu cầu.",
    needs: [
      "Cần website chuyên nghiệp để giới thiệu doanh nghiệp",
      "Cần trang riêng cho sự kiện, chương trình hoặc chiến dịch",
      "Cần công cụ web để thu thập thông tin hoặc tự quản lý nội dung",
    ],
    scope: [
      "Website giới thiệu doanh nghiệp và website sự kiện",
      "Hệ thống web, web app theo yêu cầu",
      "Cơ sở dữ liệu, thu thập thông tin và phân quyền quản trị theo phạm vi từng dự án",
    ],
    value: "Hiện diện trực tuyến chỉn chu, dễ cập nhật và phục vụ đúng mục tiêu của doanh nghiệp.",
  },
  {
    id: "marketing",
    title: "Marketing cho doanh nghiệp",
    shortTitle: "Marketing",
    summary: "Lên kế hoạch và trực tiếp triển khai marketing trên các kênh trực tuyến, đưa doanh nghiệp đến gần khách hàng hơn.",
    needs: [
      "Cần tiếp cận khách hàng mới trên kênh trực tuyến",
      "Cần duy trì hiện diện đều đặn trên mạng xã hội",
      "Cần một đầu mối triển khai marketing theo mục tiêu cụ thể",
    ],
    scope: [
      "Quảng cáo trực tuyến",
      "Social media marketing",
      "Các hoạt động marketing khác theo nhu cầu và phạm vi thống nhất",
    ],
    value: "Hoạt động marketing có định hướng, gắn với mục tiêu kinh doanh và phạm vi đã thống nhất.",
  },
];
