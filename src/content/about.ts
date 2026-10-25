import type { ProcessStep, Value } from "@/content/types";

/**
 * Quy ước: trong chuỗi, phần đặt giữa *dấu sao* được hiển thị bằng serif nghiêng (từ khóa cảm xúc).
 * Mỗi phần tử của mảng `lines` là một dòng được ngắt chủ đích trên desktop.
 */

export const hero = {
  label: "BV-00 — Tổng mặt bằng",
  lines: ["Xây nền móng", "*vững chắc,*", "để tiến xa."],
  description:
    "Aegis đồng hành cùng doanh nghiệp ứng dụng AI, triển khai phần mềm quản trị, xây dựng website – web app và làm marketing trên môi trường số.",
  secondaryCta: { label: "Xem dự án", href: "#du-an" },
  scrollHint: "Cuộn để xem bản vẽ",
};

export const about = {
  label: "[01] — Về Aegis",
  statement:
    "Aegis là đối tác *công nghệ và marketing* của doanh nghiệp. Chúng tôi giúp doanh nghiệp ứng dụng AI, vận hành bằng phần mềm phù hợp, hiện diện chuyên nghiệp trên môi trường số và *tiếp cận đúng khách hàng.*",
  body: "Mỗi giải pháp bắt đầu từ bài toán thực tế: quy trình đang vận hành ra sao, đội ngũ cần gì và mục tiêu nào cần đạt. Từ đó, Aegis đề xuất phạm vi phù hợp, triển khai và đồng hành để giải pháp thực sự được sử dụng.",
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
      "Cùng doanh nghiệp ứng dụng AI, phần mềm và phát triển trên môi trường số, từ lúc xác định nhu cầu đến khi giải pháp đi vào vận hành.",
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
  lead: "Mỗi dự án đi qua bốn bước, để doanh nghiệp luôn biết việc gì đang được làm và vì sao.",
  steps: [
    {
      title: "Trao đổi nhu cầu",
      description: "Lắng nghe bài toán, mục tiêu và bối cảnh vận hành của doanh nghiệp.",
    },
    {
      title: "Đề xuất giải pháp",
      description: "Đề xuất hướng triển khai, phạm vi công việc và kế hoạch phù hợp.",
    },
    {
      title: "Triển khai",
      description: "Thực hiện theo phạm vi đã thống nhất và cập nhật tiến độ trong suốt quá trình.",
    },
    {
      title: "Đồng hành",
      description: "Hỗ trợ theo phạm vi thống nhất để giải pháp vận hành ổn định và tiếp tục phát triển.",
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
  pageLabel: "[05] — Thư viện style",
  pageLines: ["Tám style,", "*tám ngành.*"],
  lead: "Mỗi style là một công thức thiết kế cho một ngành: cảm xúc, typography, màu sắc và tương tác riêng, dựng thành website mẫu chạy thật. Doanh nghiệp có thể xem trực tiếp để hình dung website của mình.",
  cta: { label: "Xem toàn bộ thư viện", href: "/mau-giao-dien" },
};

export const contactSection = {
  label: "[06] — Liên hệ",
  lines: ["Bắt đầu từ", "*bản vẽ đầu tiên.*"],
  lead: "Chia sẻ ngắn gọn nhu cầu hiện tại. Aegis sẽ liên hệ lại để trao đổi chi tiết và đề xuất hướng phù hợp.",
  prompts: [
    "Lĩnh vực và mô hình hoạt động của doanh nghiệp",
    "Bài toán hoặc mục tiêu đang cần giải quyết",
    "Thời gian mong muốn bắt đầu triển khai",
  ],
};
