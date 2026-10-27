import type { ProcessStep, Value } from "@/content/types";

/**
 * Quy ước: trong chuỗi, phần đặt giữa *dấu sao* được hiển thị bằng serif nghiêng (từ khóa cảm xúc).
 * Mỗi phần tử của mảng `lines` là một dòng được ngắt chủ đích trên desktop.
 */

export const hero = {
  label: "BV-00 — Tổng mặt bằng",
  lines: ["Xây nền móng", "*vững chắc,*", "để tiến xa."],
  description:
    "Aegis là đội triển khai công nghệ cho doanh nghiệp: tư vấn giải pháp, trực tiếp xây dựng AI, phần mềm quản trị, website – web app, chạy marketing, rồi bàn giao sản phẩm dễ dùng nhất.",
  secondaryCta: { label: "Xem dịch vụ", href: "#dich-vu" },
  scrollHint: "Cuộn để xem bản vẽ",
};

export const about = {
  label: "[01] — Về Aegis",
  statement:
    "Aegis là đội *triển khai công nghệ và marketing* của doanh nghiệp. Chúng tôi tư vấn đúng giải pháp, tự tay xây dựng và bàn giao *sản phẩm dễ dùng nhất,* để chủ doanh nghiệp tự vận hành được.",
  body: "Mỗi dự án bắt đầu từ bài toán thực tế: quy trình đang vận hành ra sao, đội ngũ cần gì và mục tiêu nào cần đạt. Tư vấn chỉ là bước mở đầu: Aegis chốt phạm vi rồi trực tiếp triển khai, không dừng lại ở bản đề xuất.",
  promise: {
    label: "Điều Aegis bàn giao",
    text: "Sản phẩm *dễ dùng nhất* cho chủ doanh nghiệp: không cần rành công nghệ vẫn tự vận hành được.",
  },
  valuesLabel: "Ba nguyên tắc",
};

export const values: Value[] = [
  {
    title: "Tin cậy",
    description:
      "Đối tác để doanh nghiệp yên tâm giao phó hệ thống và hoạt động công nghệ. Phạm vi, tiến độ và trách nhiệm được thống nhất rõ ràng từ đầu.",
  },
  {
    title: "Vững chắc",
    description:
      "Ưu tiên nền tảng ổn định, dễ bảo trì và có thể mở rộng, để hệ thống phục vụ vận hành lâu dài thay vì chỉ đáp ứng trước mắt.",
  },
  {
    title: "Đồng hành",
    description:
      "Cùng doanh nghiệp từ lúc tư vấn giải pháp, qua triển khai, đến khi sản phẩm được bàn giao và đi vào vận hành.",
  },
];

export const servicesSection = {
  label: "[02] — Dịch vụ",
  lines: ["Bốn bản vẽ,", "*một nền móng.*"],
  lead: "Aegis hỗ trợ doanh nghiệp ở cả nền tảng vận hành lẫn hoạt động tiếp cận khách hàng. Bắt đầu từ một nhu cầu cụ thể, mở rộng khi cần.",
};

export const process: { label: string; lines: string[]; lead: string; steps: ProcessStep[] } = {
  label: "[03] — Cách làm việc",
  lines: ["Rõ ràng từ", "*cuộc trao đổi đầu tiên.*"],
  lead: "Mỗi dự án đi qua bốn bước, từ tư vấn đến bàn giao, để doanh nghiệp luôn biết việc gì đang được làm và vì sao.",
  steps: [
    {
      title: "Tư vấn giải pháp",
      description: "Lắng nghe bài toán, mục tiêu và bối cảnh vận hành, rồi đề xuất giải pháp phù hợp.",
    },
    {
      title: "Chốt phạm vi",
      description: "Thống nhất phạm vi công việc, kế hoạch và tiến độ triển khai.",
    },
    {
      title: "Triển khai",
      description: "Thực hiện theo phạm vi đã thống nhất và cập nhật tiến độ trong suốt quá trình.",
    },
    {
      title: "Bàn giao",
      description: "Bàn giao sản phẩm dễ dùng nhất để doanh nghiệp tự vận hành, hỗ trợ theo phạm vi thống nhất.",
    },
  ],
};

export const projectsSection = {
  label: "[04] — Dự án",
  lines: ["Dự án", "*đã thực hiện.*"],
  lead: "Các website Aegis đã thực hiện cho doanh nghiệp, tổ chức giáo dục và sự kiện.",
};

export const templatesSection = {
  label: "[05] — Mẫu giao diện",
  lines: ["Mỗi ngành", "*một style riêng.*"],
  pageLabel: "Thư viện style",
  pageLines: ["Tám style,", "*tám ngành.*"],
  lead: "Mỗi style là một công thức thiết kế cho một ngành: cảm xúc, typography, màu sắc và tương tác riêng, dựng thành website mẫu chạy thật. Doanh nghiệp có thể xem trực tiếp để hình dung website của mình.",
  cta: { label: "Xem toàn bộ thư viện", href: "/mau-giao-dien" },
};

