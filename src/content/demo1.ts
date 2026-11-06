import { about, process, servicesSection, values } from "@/content/about";
import { serviceQuestion } from "@/content/contact-flow";
import { projectCategories, projects } from "@/content/projects";
import { services } from "@/content/services";
import { templateNotice, templates } from "@/content/templates";

/**
 * Nội dung bản thiết kế tối giản /demo1 (tiếng Việt).
 * Chỉ ghép lại dữ kiện đã xác nhận trong about.ts, services.ts, projects.ts, contact-flow.ts, templates.ts:
 * không thêm số liệu, khách hàng, lời chứng thực, giá hay thông tin liên hệ mới.
 * Bản này không dùng chữ serif nghiêng: cú pháp *nhấn* của nội dung gốc được bỏ dấu sao.
 */

const plain = (text: string) => text.replace(/\*/g, "");

export const D1_BASE = "/demo1";
export const d1ContactHref = (service?: string) => `${D1_BASE}/lien-he${service ? `?dv=${service}` : ""}`;
export const d1ProjectHref = (slug: string) => `${D1_BASE}/du-an/${slug}`;

const categoryLabel = Object.fromEntries(projectCategories.map((c) => [c.id, c.label]));

export const d1 = {
  meta: {
    title: "Aegis — Website, phần mềm, AI và marketing cho doanh nghiệp",
    description:
      "Aegis là đội triển khai công nghệ và marketing của doanh nghiệp: tư vấn giải pháp, xây dựng AI, phần mềm quản trị, website – web app và marketing, bàn giao sản phẩm dễ dùng.",
  },
  chrome: {
    skip: "Bỏ qua đến nội dung chính",
    home: "Aegis – về đầu trang",
    navLabel: "Điều hướng chính",
    menu: "Menu",
    close: "Đóng",
  },
  nav: [
    { label: "Về Aegis", href: `${D1_BASE}#gioi-thieu` },
    { label: "Dịch vụ", href: `${D1_BASE}#dich-vu` },
    { label: "Dự án", href: `${D1_BASE}#du-an` },
    { label: "Cách làm việc", href: `${D1_BASE}#cach-lam-viec` },
    { label: "Câu hỏi", href: `${D1_BASE}#cau-hoi` },
  ],
  cta: { label: "Trao đổi nhu cầu", short: "Trao đổi", href: d1ContactHref() },

  hero: {
    /** Một câu, hai sắc độ: vế đầu nói Aegis làm gì (mực), vế sau nói làm thế nào (xám) */
    title: ["Website, phần mềm, AI và marketing", "cho doanh nghiệp, làm trọn từ tư vấn tới bàn giao."],
    lead: "Aegis tư vấn đúng giải pháp, tự tay xây dựng, rồi bàn giao sản phẩm dễ dùng nhất để doanh nghiệp tự vận hành.",
    work: "Xem dự án",
    servicesLabel: "Bốn mảng dịch vụ",
    /** Chữ chạy trong hình ký tự của dấu Aegis */
    markText: services.map((s) => s.shortTitle.toUpperCase()).join(" · ") + " · ",
    caption: "Dấu Aegis, dựng bằng tên bốn mảng dịch vụ.",
  },

  about: {
    label: "Về Aegis",
    statement: plain(about.statement),
    body: about.body,
    promiseLabel: about.promise.label,
    promise: plain(about.promise.text),
    valuesLabel: about.valuesLabel,
    values,
  },

  services: {
    label: "Dịch vụ",
    lead: servicesSection.lead,
    needs: "Nhu cầu thường gặp",
    scope: "Aegis hỗ trợ",
    value: "Giá trị mang lại",
    talk: "Trao đổi về mảng này",
    work: "Xem dự án website",
    items: services,
  },

  work: {
    label: "Dự án",
    title: "Website đã bàn giao",
    lead: "Website Aegis đã làm cho doanh nghiệp, tổ chức giáo dục và sự kiện. Mỗi dự án mở ra một trang riêng, kèm ảnh chụp toàn trang.",
    open: "Xem dự án",
    templates: `Xem ${templates.length} mẫu giao diện demo`,
    templatesNote: "Thương hiệu giả định, do Aegis tự thiết kế để minh họa.",
    items: projects,
    categoryLabel,
  },

  process: {
    label: "Cách làm việc",
    title: "Bốn bước, từ tư vấn tới bàn giao.",
    lead: process.lead,
    steps: process.steps,
  },

  faq: {
    label: "Câu hỏi",
    title: "Câu hỏi thường gặp",
    /** Câu trả lời chỉ dùng dữ kiện đã có trên website (dịch vụ, cách làm việc, lời hứa bàn giao, lưu ý mẫu demo) */
    items: [
      {
        q: "Aegis nhận những loại dự án nào?",
        a: `Bốn mảng: ${services.map((s) => s.title).join("; ")}.`,
      },
      {
        q: "Có phải làm trọn gói cả bốn mảng không?",
        a: servicesSection.lead,
      },
      {
        q: "Bắt đầu làm việc với Aegis thế nào?",
        a: "Gửi một phiếu yêu cầu ngắn, chủ yếu là bấm chọn. Aegis đọc phiếu, tư vấn giải pháp và liên hệ lại; sau đó hai bên chốt phạm vi, kế hoạch và tiến độ trước khi triển khai.",
      },
      {
        q: "Sau khi bàn giao, doanh nghiệp có tự vận hành được không?",
        a: `Đó là mục tiêu của mọi dự án: ${plain(about.promise.text).charAt(0).toLowerCase()}${plain(about.promise.text).slice(1)} Aegis hỗ trợ theo phạm vi đã thống nhất.`,
      },
      {
        q: "Các mẫu giao diện trên website là gì?",
        a: templateNotice,
      },
    ],
  },

  contact: {
    label: "Liên hệ",
    title: ["Có bài toán cần giải?", "Bắt đầu bằng một phiếu ngắn."],
    lead: "Trả lời vài câu hỏi ngắn, chủ yếu là bấm chọn. Aegis đọc phiếu, tư vấn giải pháp và liên hệ lại để bắt tay triển khai.",
    pickerLabel: serviceQuestion.title,
    options: serviceQuestion.options.map((o) => ({ value: o.value, label: o.label })),
    channels: { email: "Email", phone: "Điện thoại", address: "Địa chỉ" },
    pageTitle: ["Phiếu yêu cầu.", "Kể cho Aegis về bài toán của bạn."],
    pageLead: "Mỗi màn một câu hỏi, khoảng một phút. Các câu sau đổi theo hạng mục bạn chọn, để Aegis hiểu đúng bài toán ngay từ đầu.",
    back: "Về trang chủ",
  },

  project: {
    category: "Lĩnh vực",
    type: "Hạng mục",
    service: "Dịch vụ",
    site: "Website",
    description: "Mô tả",
    highlights: "Tính năng đã bàn giao",
    fullPage: "Ảnh chụp toàn trang",
    visit: "Mở website",
    similar: "Trao đổi dự án tương tự",
    next: "Dự án tiếp theo",
    all: "Tất cả dự án",
    shotAlt: "Ảnh chụp trang chủ website {name}",
    fullAlt: "Ảnh chụp toàn trang website {name}",
  },

  footer: {
    contact: "Liên hệ",
    contactLink: "Gửi phiếu yêu cầu",
    pages: "Trang",
    services: "Dịch vụ",
    more: "Khác",
    templates: "Mẫu giao diện demo",
    current: "Trang chính hiện tại",
    tagline: "Stands behind every stage of your business growth.",
    copyright: "© Aegis",
    top: "Lên đầu trang",
  },
};

export type D1Dict = typeof d1;
