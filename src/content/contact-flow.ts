import { services } from "@/content/services";
import { templates } from "@/content/templates";
import type { ServiceId } from "@/content/types";

/**
 * Kịch bản form liên hệ "Bản vẽ của bạn": hỏi từng câu, rẽ nhánh theo dịch vụ.
 * Câu 1 chọn dịch vụ, sau đó là các câu riêng của dịch vụ đó, rồi các câu chung.
 * Sửa câu hỏi/lựa chọn tại đây; form (trình duyệt) và API (server) cùng đọc file này.
 *
 * Lựa chọn trong form được khách hiểu là "Aegis làm được việc này":
 * chỉ thêm lựa chọn đã được chủ dự án xác nhận (duyệt ngày 2026-10-25).
 */

export const OTHER_SERVICE = "other";
/** Giá trị của lựa chọn "Khác": hiện thêm ô để khách tự ghi */
export const OTHER_OPTION = "khac";

export type FlowServiceId = ServiceId | typeof OTHER_SERVICE;

export interface ChoiceOption {
  value: string;
  label: string;
  /** Ghi chú nhỏ dưới nhãn (ví dụ ngành của style mẫu) */
  note?: string;
}

export interface ChoiceQuestion {
  id: string;
  /** single: chọn một (tự sang câu sau); multi: chọn nhiều; style: chọn một style trong thư viện mẫu */
  kind: "single" | "multi" | "style";
  title: string;
  hint?: string;
  options: ChoiceOption[];
  /** Thêm lựa chọn "Khác" kèm ô tự ghi */
  allowOther?: boolean;
  /** Không bắt buộc: có nút "Bỏ qua" */
  optional?: boolean;
}

export const serviceQuestion = {
  title: "Bạn cần Aegis dựng gì?",
  hint: "Chọn một hạng mục chính. Các câu sau sẽ đổi theo lựa chọn của bạn.",
  options: [
    ...services.map((s) => ({ value: s.id as FlowServiceId, label: s.shortTitle, title: s.title, note: s.summary })),
    {
      value: OTHER_SERVICE as FlowServiceId,
      label: "Nhiều hạng mục / chưa chắc",
      title: "Nhiều hạng mục / chưa chắc, cần Aegis tư vấn",
      note: "Kể ngắn bài toán của bạn, Aegis tư vấn giải pháp phù hợp rồi triển khai.",
    },
  ],
};

export const branchQuestions: Record<FlowServiceId, ChoiceQuestion[]> = {
  ai: [
    {
      id: "ai_tasks",
      kind: "multi",
      title: "Bạn muốn AI làm việc gì?",
      hint: "Chọn một hoặc nhiều.",
      allowOther: true,
      options: [
        { value: "chatbot", label: "Trả lời khách hàng (chatbot)" },
        { value: "internal", label: "Trợ lý nội bộ tra cứu tài liệu" },
        { value: "automation", label: "Tự động hoá quy trình, giấy tờ" },
        { value: "reports", label: "Tổng hợp dữ liệu, làm báo cáo" },
      ],
    },
    {
      id: "ai_data",
      kind: "single",
      title: "Dữ liệu hiện đang nằm ở đâu?",
      options: [
        { value: "sheets", label: "Excel / Google Sheets" },
        { value: "software", label: "Phần mềm đang dùng" },
        { value: "files", label: "File, giấy tờ rời rạc" },
        { value: "none", label: "Chưa có dữ liệu" },
      ],
    },
    {
      id: "ai_stage",
      kind: "single",
      title: "Bạn đang ở bước nào?",
      options: [
        { value: "clear", label: "Đã rõ việc cần AI làm" },
        { value: "tried", label: "Đã thử vài công cụ AI" },
        { value: "scratch", label: "Bắt đầu từ đầu" },
      ],
    },
  ],
  software: [
    {
      id: "sw_areas",
      kind: "multi",
      title: "Mảng nào cần quản trị?",
      hint: "Chọn một hoặc nhiều.",
      allowOther: true,
      options: [
        { value: "sales", label: "Bán hàng / khách hàng" },
        { value: "inventory", label: "Kho" },
        { value: "hr", label: "Nhân sự" },
        { value: "finance", label: "Tài chính" },
        { value: "projects", label: "Dự án / công việc" },
      ],
    },
    {
      id: "sw_current",
      kind: "single",
      title: "Hiện đang quản lý bằng gì?",
      options: [
        { value: "sheets", label: "Excel / Google Sheets" },
        { value: "software", label: "Một phần mềm khác" },
        { value: "paper", label: "Giấy tờ" },
        { value: "none", label: "Chưa có gì" },
      ],
    },
    {
      id: "sw_users",
      kind: "single",
      title: "Bao nhiêu người sẽ dùng?",
      options: [
        { value: "1-10", label: "1–10 người" },
        { value: "11-50", label: "11–50 người" },
        { value: "51-200", label: "51–200 người" },
        { value: "200+", label: "Trên 200 người" },
      ],
    },
  ],
  web: [
    {
      id: "web_type",
      kind: "single",
      title: "Bạn cần loại nào?",
      options: [
        { value: "company", label: "Website giới thiệu doanh nghiệp" },
        { value: "event", label: "Website sự kiện / landing page" },
        { value: "app", label: "Web app / hệ thống theo yêu cầu" },
        { value: "shop", label: "Bán hàng online" },
      ],
    },
    {
      id: "web_features",
      kind: "multi",
      title: "Cần những tính năng nào?",
      hint: "Chọn một hoặc nhiều. Chưa rõ thì bỏ qua.",
      allowOther: true,
      optional: true,
      options: [
        { value: "form", label: "Form thu thập thông tin" },
        { value: "cms", label: "Tự quản lý nội dung" },
        { value: "accounts", label: "Tài khoản & phân quyền" },
        { value: "i18n", label: "Đa ngôn ngữ" },
        { value: "payment", label: "Thanh toán online" },
      ],
    },
    {
      id: "web_style",
      kind: "style",
      title: "Bạn thích style nào?",
      hint: "Các style trong thư viện mẫu của Aegis (thương hiệu trong mẫu là giả định). Chưa chọn được thì bỏ qua.",
      optional: true,
      options: templates.map((t) => ({ value: t.slug, label: t.name, note: t.industry })),
    },
  ],
  marketing: [
    {
      id: "mkt_goal",
      kind: "single",
      title: "Mục tiêu chính là gì?",
      options: [
        { value: "leads", label: "Có thêm khách hàng tiềm năng" },
        { value: "sales", label: "Tăng doanh số" },
        { value: "brand", label: "Tăng độ nhận diện" },
        { value: "event", label: "Quảng bá sự kiện" },
      ],
    },
    {
      id: "mkt_channels",
      kind: "multi",
      title: "Muốn triển khai trên kênh nào?",
      hint: "Chọn một hoặc nhiều.",
      allowOther: true,
      options: [
        { value: "facebook", label: "Quảng cáo Facebook" },
        { value: "google", label: "Quảng cáo Google" },
        { value: "tiktok", label: "TikTok" },
        { value: "social", label: "Quản lý fanpage / nội dung mạng xã hội" },
        { value: "seo", label: "SEO" },
      ],
    },
    {
      id: "mkt_team",
      kind: "single",
      title: "Hiện đã có người làm marketing chưa?",
      options: [
        { value: "team", label: "Có đội riêng" },
        { value: "one", label: "Có một người kiêm" },
        { value: "none", label: "Chưa có" },
      ],
    },
  ],
  other: [],
};

/** Câu chung cho mọi nhánh, hỏi sau các câu riêng */
export const commonQuestions: ChoiceQuestion[] = [
  {
    id: "timeline",
    kind: "single",
    title: "Khi nào bạn muốn bắt đầu?",
    options: [
      { value: "asap", label: "Càng sớm càng tốt" },
      { value: "1-3m", label: "Trong 1–3 tháng" },
      { value: "exploring", label: "Đang tìm hiểu" },
    ],
  },
];

export const messageStep = {
  title: "Kể thêm một chút về bài toán?",
  /** Nhánh "chưa chắc" bắt buộc mô tả để Aegis có thông tin tư vấn */
  titleOther: "Kể ngắn bài toán của bạn",
  hint: "Không bắt buộc. Có thể dán link website hiện tại hoặc trang bạn thích.",
  hintOther: "Doanh nghiệp đang làm gì, đang vướng ở đâu, muốn đạt điều gì.",
  placeholder: "Ví dụ: Công ty có 30 nhân viên bán hàng, đang theo dõi đơn bằng Excel và hay bị sót…",
};

export const contactStep = {
  title: "Aegis liên hệ lại với bạn qua đâu?",
  hint: "Aegis chỉ dùng thông tin này để trao đổi về nhu cầu của bạn.",
};

export const reviewStep = {
  title: "Xem lại phiếu yêu cầu",
  hint: "Kiểm tra nhanh trước khi gửi. Bấm “Sửa” để quay lại câu bất kỳ.",
};

export function questionsFor(service: string): ChoiceQuestion[] {
  // hasOwn: "constructor", "__proto__"… không được coi là một nhánh
  const branch = Object.hasOwn(branchQuestions, service) ? branchQuestions[service as FlowServiceId] : [];
  return [...branch, ...commonQuestions];
}

export function serviceTitle(value: string) {
  return serviceQuestion.options.find((o) => o.value === value)?.title ?? value;
}

export function serviceShortLabel(value: string) {
  return serviceQuestion.options.find((o) => o.value === value)?.label ?? value;
}
