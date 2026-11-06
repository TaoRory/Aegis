import { about, process, servicesSection, values } from "@/content/about";
import { serviceQuestion } from "@/content/contact-flow";
import { projectCategories, projects } from "@/content/projects";
import { services } from "@/content/services";
import { templateNotice, templates } from "@/content/templates";

/**
 * Nội dung bản thiết kế /demo1 (tiếng Việt), giọng thẳng và ngắn.
 * Chỉ ghép lại dữ kiện đã xác nhận trong about.ts, services.ts, projects.ts, contact-flow.ts, templates.ts:
 * không thêm số liệu, khách hàng, lời chứng thực, giá, thời gian hay thông tin liên hệ mới.
 * ⚑ Các câu tiêu đề mới (hero, sổ cái, dịch vụ, dự án, câu hỏi, lời mời) là NHÁP chờ duyệt.
 * Lời khách hàng và đội ngũ để trống: chỉ hiện khi có dữ liệu thật (xem `testimonials`, `team`).
 */

const plain = (text: string) => text.replace(/\*/g, "");

export const D1_BASE = "/demo1";
export const d1ContactHref = (service?: string) => `${D1_BASE}/lien-he${service ? `?dv=${service}` : ""}`;
export const d1ProjectHref = (slug: string) => `${D1_BASE}/du-an/${slug}`;

const categoryLabel = Object.fromEntries(projectCategories.map((c) => [c.id, c.label]));

/** Tagline trong bộ nhận diện (Brand-guideline: logo ngang "BUILD / DEPLOY / SCALE") — ⚑ chờ xác nhận dùng trên web */
const BRAND_LINE = "BUILD / DEPLOY / SCALE";

export interface D1Testimonial {
  quote: string;
  name: string;
  role: string;
  org: string;
  /** Ảnh chân dung trong public/ (không bắt buộc) */
  photo?: string;
}

export interface D1Member {
  name: string;
  role: string;
  /** Ảnh chân dung trong public/ */
  photo: string;
}

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
    ticker: `${BRAND_LINE} · WEBSITE · WEB APP · PHẦN MỀM QUẢN TRỊ · AI · MARKETING · `,
    mapLabel: "Bản đồ trang",
    mapGo: "Đi tới {name}",
    quickOpen: "Mở lối tắt",
    quickClose: "Đóng lối tắt",
    quickTitle: "Bắt đầu nhanh",
  },
  nav: [
    { id: "cach-lam-viec", label: "Cách làm", href: `${D1_BASE}#cach-lam-viec` },
    { id: "dich-vu", label: "Dịch vụ", href: `${D1_BASE}#dich-vu` },
    { id: "du-an", label: "Dự án", href: `${D1_BASE}#du-an` },
    { id: "ve-aegis", label: "Về Aegis", href: `${D1_BASE}#ve-aegis` },
    { id: "cau-hoi", label: "Câu hỏi", href: `${D1_BASE}#cau-hoi` },
  ],
  cta: { label: "Trao đổi nhu cầu", short: "Trao đổi", href: d1ContactHref() },
  brandLine: BRAND_LINE,

  hero: {
    /** Kiểu "đổi chữ": vế xám bị gạch đi, vế đậm thay vào. Ý từ about.body: "không dừng lại ở bản đề xuất" */
    struck: "Bản đề xuất.",
    title: "Aegis dựng tới lúc bàn giao.",
    lead: "Website, web app, phần mềm quản trị, AI và marketing cho doanh nghiệp. Tư vấn đúng giải pháp, tự tay xây dựng, rồi bàn giao sản phẩm dễ dùng nhất để bạn tự vận hành.",
    work: "Xem dự án",
    markLabel: "Logo Aegis dựng bằng ký tự",
    markText: `${BRAND_LINE} · ${services.map((s) => s.shortTitle.toUpperCase()).join(" · ")} · `,
    featured: "Dự án tiêu biểu",
    featuredCta: "Xem dự án",
  },

  ledger: {
    label: "Cách làm",
    title: "Từ cuộc trao đổi đầu tiên tới lúc bạn tự vận hành.",
    /** process.lead, viết gọn */
    lead: "Mỗi dự án đi qua bốn bước. Lúc nào bạn cũng biết việc gì đang được làm và vì sao.",
    counter: "Bước",
    head: ["Quy trình Aegis", "Rõ từ đầu"],
    /** Tách từ mô tả 4 bước trong about.ts (process.steps), không thêm việc mới */
    steps: [
      { title: process.steps[0].title, items: ["Lắng nghe bài toán và mục tiêu", "Tìm hiểu bối cảnh vận hành", "Đề xuất giải pháp phù hợp"] },
      { title: process.steps[1].title, items: ["Phạm vi công việc", "Kế hoạch", "Tiến độ triển khai"] },
      { title: process.steps[2].title, items: ["Làm đúng phạm vi đã thống nhất", "Cập nhật tiến độ suốt quá trình"] },
      { title: process.steps[3].title, items: ["Sản phẩm dễ dùng nhất để bạn tự vận hành", "Hỗ trợ theo phạm vi đã thống nhất"] },
    ],
  },

  services: {
    label: "Dịch vụ",
    title: "Bốn mảng. Bắt đầu từ một.",
    lead: servicesSection.lead,
    drawing: "Bản vẽ",
    more: "Xem phạm vi",
    less: "Thu gọn",
    needs: "Nhu cầu thường gặp",
    scope: "Aegis hỗ trợ",
    value: "Giá trị mang lại",
    talk: "Trao đổi về mảng này",
    items: services,
  },

  work: {
    label: "Dự án",
    title: "Đã bàn giao. Đang chạy thật.",
    lead: "Website cho doanh nghiệp, tổ chức giáo dục và sự kiện, đang chạy ở tên miền thật. Chọn một dự án để xem.",
    open: "Bấm để xem",
    view: "Xem dự án",
    prev: "Dự án trước",
    next: "Dự án sau",
    list: "Danh sách dự án",
    templates: `Xem ${templates.length} mẫu giao diện demo`,
    templatesNote: "Thương hiệu giả định, do Aegis tự thiết kế để minh họa.",
    items: projects,
    categoryLabel,
  },

  studio: {
    label: "Về Aegis",
    title: "Một đội. Tư vấn, xây dựng, bàn giao.",
    statement: plain(about.statement),
    body: about.body,
    promiseLabel: about.promise.label,
    promise: plain(about.promise.text),
    valuesLabel: about.valuesLabel,
    values,
    teamLabel: "Đội ngũ",
    /** ⚑ Chờ ảnh và tên thật (danh sách cần gửi trong plan). Rỗng thì không hiện khối đội ngũ. */
    team: [] as D1Member[],
  },

  testimonials: {
    label: "Khách hàng nói",
    /** ⚑ Chỉ thêm lời nhận xét thật, có đồng ý đăng. Rỗng thì không hiện cả mục. */
    items: [] as D1Testimonial[],
    prev: "Lời trước",
    next: "Lời sau",
  },

  faq: {
    label: "Câu hỏi",
    title: "Trước khi bắt đầu",
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
    title: ["Có bài toán?", "Kể cho Aegis nghe."],
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
    system: "Hệ thống thiết kế của dự án",
    systemNote: "Đo từ website đang chạy.",
    typeface: "Kiểu chữ",
    palette: "Bảng màu",
    devices: "Trên máy tính và điện thoại",
    fullPage: "Ảnh chụp toàn trang",
    visit: "Mở website",
    similar: "Trao đổi dự án tương tự",
    next: "Dự án tiếp theo",
    all: "Tất cả dự án",
    shotAlt: "Ảnh chụp trang chủ website {name}",
    mobileAlt: "Ảnh chụp website {name} trên điện thoại",
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
