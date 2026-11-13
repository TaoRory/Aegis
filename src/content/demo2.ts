import { getFactoryDict } from "@/content/factory";
import { projects } from "@/content/projects";

/**
 * Nội dung bản thiết kế /demo2 (tiếng Anh là chính, tiếng Việt là phụ).
 * Định vị mới do người dùng brief (2026-11-13): không chỉ làm website mà xây "tài sản số";
 * ba gói Own / Grow / Amplify, trình bày theo phạm vi công việc, KHÔNG ghi giá (chưa có giá).
 *
 * Đã xác nhận: gói Own bàn giao toàn bộ mã nguồn, tên miền, tài khoản hosting, tài liệu hướng dẫn, quyền quản trị.
 * ⚑ NHÁP chờ người dùng sửa: đầu việc của Grow và Amplify (soạn theo quy trình phổ biến của ngành), các bước quy trình,
 *   bảng so sánh, câu hỏi thường gặp, toàn bộ câu chữ tiêu đề.
 * AI agent: chỉ là định hướng → luôn ghi "tư vấn và xây theo yêu cầu", không mô tả như sản phẩm có sẵn.
 * Không có số liệu, khách hàng, lời chứng thực hay giá. Dự án: 7 website thật trong projects.ts.
 */

export type D2Lang = "en" | "vi";

export const D2_BASE = "/demo2";
export const d2Home = (lang: D2Lang) => (lang === "en" ? D2_BASE : `${D2_BASE}/vi`);
export const d2Contact = (lang: D2Lang) => `${d2Home(lang)}/contact`;

/** Màu "sân khấu" của từng dự án, lấy từ bảng màu đo trên chính website đó (project-systems.json). `ink` = màu chữ đặt trên nền đó. */
export const d2Stages: Record<string, { bg: string; ink: "light" | "dark" }> = {
  vidi26: { bg: "#3FA9FF", ink: "dark" },
  "handle-vietnam": { bg: "#C9A86A", ink: "dark" },
  "integritas-vu-legal": { bg: "#0D1B2A", ink: "light" },
  "tedx-vinuniversity-2026": { bg: "#C41E3A", ink: "light" },
  rethink: { bg: "#70E0F0", ink: "dark" },
  "tedx-vinuniversity-2025": { bg: "#E85CF5", ink: "dark" },
  "rethink-halloween": { bg: "#3D5B03", ink: "light" },
};

export type D2PlanId = "own" | "grow" | "amplify";

export interface D2Plan {
  id: D2PlanId;
  name: string;
  /** Một câu: bạn nhận được gì */
  line: string;
  bestFor: string;
  /** Aegis ở lại bao lâu sau khi ra mắt (trục của bậc thang gói) */
  stay: string;
  includes: string[];
  cta: string;
}

export interface D2Dict {
  lang: D2Lang;
  meta: { title: string; description: string };
  chrome: { skip: string; home: string; nav: string; menu: string; close: string; langLabel: string; pause: string; play: string; illustration: string };
  nav: { id: string; label: string }[];
  cta: string;
  hero: { before: string; mark: string; after: string; lead: string; secondary: string; wallLabel: string; visit: string };
  problem: { ink: string; muted: string; ask: string; items: { quote: string; answer: string; note?: string }[] };
  plans: { title: string; lead: string; bestFor: string; includes: string; axis: string; quoteNote: string; items: D2Plan[] };
  own: { title: string; lead: string; items: { name: string; detail: string }[]; note: string };
  process: { title: string; lead: string; steps: { title: string; text: string; plans: string; mock: "brief" | "scope" | "build" | "handover" | "grow" }[] };
  mock: {
    brief: { title: string; fields: [string, string][]; chips: string[] };
    scope: { title: string; rows: [string, string][] };
    build: { title: string; rows: [string, string][] };
    handover: { title: string; done: string };
    grow: { title: string; days: string[]; rows: string[] };
  };
  work: { title: string; lead: string; featured: string; visit: string; more: string };
  compare: { title: string; lead: string; cols: [string, string, string]; rows: { label: string; cells: [string, string, string] }[] };
  faq: { title: string; items: { q: string; a: string }[] };
  final: { title: string; work: string; workLine: string; call: string; callLine: string };
  footer: { tagline: string; plans: string; pages: string; other: string; demo1: string; current: string; rights: string };
  contact: { title: string; lead: string; back: string };
}

const en: D2Dict = {
  lang: "en",
  meta: {
    title: "Aegis — Digital assets you own: websites, web apps, SEO and marketing",
    description:
      "Aegis builds websites and web apps as digital assets. Buy yours outright with the full source code, or let us keep growing it with SEO and marketing.",
  },
  chrome: {
    skip: "Skip to main content",
    home: "Aegis, back to top",
    nav: "Main navigation",
    menu: "Menu",
    close: "Close",
    langLabel: "Language",
    pause: "Pause",
    play: "Play",
    illustration: "Illustration",
  },
  nav: [
    { id: "plans", label: "Plans" },
    { id: "process", label: "Process" },
    { id: "work", label: "Work" },
    { id: "faq", label: "FAQ" },
  ],
  cta: "Get a quote",
  hero: {
    before: "We build digital assets you",
    mark: "own.",
    after: "",
    lead: "A website or web app built for your business. Buy it outright with the full source code, or let us keep growing it with SEO and marketing.",
    secondary: "See the plans",
    wallLabel: "Websites we have delivered",
    visit: "Visit site",
  },
  problem: {
    ink: "Most websites launch, then stand still.",
    muted: "An asset keeps gaining value.",
    ask: "Sound familiar?",
    items: [
      {
        quote: "“I'm starting a company here. I need a site that's ready to use, not a project to manage.”",
        answer: "Own: we build it and hand over everything, with a guide written for non-technical owners.",
      },
      {
        quote: "“We're a small team. We need a marketing department, not another hire.”",
        answer: "Grow or Amplify: one team for the website, SEO and social channels.",
      },
      {
        quote: "“I run the business solo. I want AI agents to take over the routine work.”",
        answer: "We consult on where AI fits your workflow, then build to order.",
        note: "Custom work, by consultation",
      },
    ],
  },
  plans: {
    title: "Three ways to work with us",
    lead: "Start with a one-time build, or keep us on to grow it. Every plan is quoted by scope.",
    bestFor: "Best for",
    includes: "What's included",
    axis: "How long we stay",
    quoteNote: "Quoted by scope after a short brief",
    items: [
      {
        id: "own",
        name: "Own",
        line: "We design and build your website or web app, then hand it over. All of it.",
        bestFor: "Founders and businesses who want to buy the asset outright and run it themselves.",
        stay: "Until handover",
        includes: ["Website or web app, designed and built", "Full source code", "Domain name", "Hosting account", "How-to documentation", "Admin access"],
        cta: "Get a quote for Own",
      },
      {
        id: "grow",
        name: "Grow",
        line: "We build it, then keep raising its value with SEO and marketing.",
        bestFor: "Teams that want a website and a marketing partner without hiring a department.",
        stay: "Month after month",
        includes: ["Everything in Own", "SEO setup and keyword plan", "On-page optimisation", "Content plan and regular updates", "Website upkeep", "Monthly report"],
        cta: "Get a quote for Grow",
      },
      {
        id: "amplify",
        name: "Amplify",
        line: "Marketing only. We run your social channels and grow the brand, with a landing page included.",
        bestFor: "Businesses that already have a product and need steady, multi-platform marketing.",
        stay: "Month after month",
        includes: ["Landing page, included", "Channel and content strategy", "Content calendar", "Posts produced and published across platforms", "Brand voice and visual guide", "Monthly report"],
        cta: "Get a quote for Amplify",
      },
    ],
  },
  own: {
    title: "What “own” means",
    lead: "When an Own or Grow project is delivered, these are yours. Not rented, not locked to us.",
    items: [
      { name: "Full source code", detail: "The complete codebase of your website or web app." },
      { name: "Domain name", detail: "Registered for you and transferred to your control." },
      { name: "Hosting account", detail: "The account your site runs on, handed over with access." },
      { name: "How-to documentation", detail: "A plain-language guide to running and updating the site." },
      { name: "Admin access", detail: "Administrator rights to manage the site yourself." },
    ],
    note: "Handover checklist",
  },
  process: {
    title: "From first message to handover",
    lead: "Four steps for every project. A fifth for plans that keep growing.",
    steps: [
      { title: "Tell us the problem.", text: "A short brief, mostly multiple choice. We read it and come back with a recommended solution.", plans: "All plans", mock: "brief" },
      { title: "Agree the scope.", text: "Scope of work, plan and timeline are settled before anything is built.", plans: "All plans", mock: "scope" },
      { title: "Follow the build.", text: "We build exactly what was agreed and keep you updated along the way.", plans: "All plans", mock: "build" },
      { title: "Take the keys.", text: "Source code, domain, hosting, documentation and admin access are handed over.", plans: "Own · Grow", mock: "handover" },
      { title: "Keep growing.", text: "SEO, content and social channels run on a monthly rhythm, with a report each month.", plans: "Grow · Amplify", mock: "grow" },
    ],
  },
  mock: {
    brief: { title: "Brief", fields: [["Service", "Website / web app"], ["Goal", "Launch a new business"]], chips: ["Own", "Grow", "Amplify"] },
    scope: { title: "Scope of work", rows: [["Pages and features", "Agreed"], ["Plan", "Agreed"], ["Timeline", "Agreed"]] },
    build: { title: "Progress", rows: [["Design", "Done"], ["Build", "In progress"], ["Review with you", "Next"]] },
    handover: { title: "Handover", done: "Handed over" },
    grow: { title: "This month", days: ["Mon", "Tue", "Wed", "Thu", "Fri"], rows: ["SEO", "Content", "Social"] },
  },
  work: {
    title: "Delivered and live",
    lead: "Seven websites for businesses, education and events. Each one is running at its own address.",
    featured: "Featured project",
    visit: "Visit site",
    more: "More delivered work",
  },
  compare: {
    title: "Hire, outsource, or Aegis",
    lead: "Three common ways to get a website and marketing done.",
    cols: ["Hire in-house", "Freelancer or agency", "Aegis"],
    rows: [
      { label: "Source code and accounts are yours", cells: ["Yes", "Depends on the contract", "Yes, in every Own and Grow project"] },
      { label: "Build and marketing from one team", cells: ["Several hires", "Often separate vendors", "One team"] },
      { label: "Work continues after launch", cells: ["Yes", "Usually ends at delivery", "Grow and Amplify plans"] },
      { label: "A guide to run it yourself", cells: ["Up to your team", "Varies", "Included in handover"] },
      { label: "Getting started", cells: ["Recruit first", "Varies", "One short brief"] },
    ],
  },
  faq: {
    title: "Before you start",
    items: [
      { q: "Who owns the website when it's finished?", a: "You do. Own and Grow projects are handed over with the full source code, domain name, hosting account, how-to documentation and admin access." },
      { q: "How is the price set?", a: "Each plan is quoted by scope. Send a short brief and we reply with a recommended solution and a quote." },
      { q: "Can I start with Own and move to Grow later?", a: "Yes. Own is a one-time build. If you later want SEO and marketing on top, we scope a Grow plan for the site you already own." },
      { q: "What does Amplify include if I already have a website?", a: "Amplify covers marketing across your social channels and brand growth. A landing page is included for campaigns; your existing website stays as it is." },
      { q: "Is the AI agent work an off-the-shelf product?", a: "No. We consult on where AI fits your workflow and build to order. Scope is agreed case by case." },
      { q: "Do you work in English?", a: "Yes. We work with clients in English and Vietnamese." },
    ],
  },
  final: {
    title: "Ready to build an asset?",
    work: "See the work",
    workLine: "Seven live websites, each at its own address.",
    call: "Get a quote",
    callLine: "A short brief, mostly multiple choice. We reply with a solution and a quote.",
  },
  footer: {
    tagline: "Stands behind every stage of your business growth.",
    plans: "Plans",
    pages: "On this page",
    other: "Other",
    demo1: "Design /demo1",
    current: "Current main site",
    rights: "© Aegis",
  },
  contact: {
    title: "Tell us about your project",
    lead: "One question per screen, about a minute. Later questions adapt to the service you pick.",
    back: "Back to home",
  },
};

const vi: D2Dict = {
  lang: "vi",
  meta: {
    title: "Aegis — Tài sản số của riêng bạn: website, web app, SEO và marketing",
    description:
      "Aegis xây website và web app như một tài sản số. Mua đứt kèm toàn bộ mã nguồn, hoặc để Aegis tiếp tục nâng giá trị bằng SEO và marketing.",
  },
  chrome: {
    skip: "Bỏ qua đến nội dung chính",
    home: "Aegis, về đầu trang",
    nav: "Điều hướng chính",
    menu: "Menu",
    close: "Đóng",
    langLabel: "Ngôn ngữ",
    pause: "Tạm dừng",
    play: "Chạy tiếp",
    illustration: "Minh họa",
  },
  nav: [
    { id: "plans", label: "Các gói" },
    { id: "process", label: "Quy trình" },
    { id: "work", label: "Dự án" },
    { id: "faq", label: "Câu hỏi" },
  ],
  cta: "Nhận báo giá",
  hero: {
    before: "Aegis xây tài sản số",
    mark: "của riêng bạn.",
    after: "",
    lead: "Website hoặc web app làm riêng cho doanh nghiệp của bạn. Mua đứt kèm toàn bộ mã nguồn, hoặc để Aegis tiếp tục nâng giá trị bằng SEO và marketing.",
    secondary: "Xem các gói",
    wallLabel: "Website Aegis đã bàn giao",
    visit: "Mở website",
  },
  problem: {
    ink: "Phần lớn website làm xong rồi đứng yên.",
    muted: "Tài sản thì ngày càng có giá trị.",
    ask: "Bạn có thấy quen không?",
    items: [
      {
        quote: "“Tôi đang mở công ty. Tôi cần một website dùng được ngay, không phải một dự án để quản lý.”",
        answer: "Gói Own: Aegis làm và bàn giao toàn bộ, kèm hướng dẫn viết cho người không rành kỹ thuật.",
      },
      {
        quote: "“Đội của tôi nhỏ. Tôi cần một phòng marketing, không cần tuyển thêm người.”",
        answer: "Gói Grow hoặc Amplify: một đội lo website, SEO và các kênh mạng xã hội.",
      },
      {
        quote: "“Tôi vận hành công ty một mình. Tôi muốn AI agent làm thay các việc lặp lại.”",
        answer: "Aegis tư vấn AI nên đặt ở đâu trong quy trình của bạn, rồi xây theo yêu cầu.",
        note: "Làm riêng, theo tư vấn",
      },
    ],
  },
  plans: {
    title: "Ba cách làm việc với Aegis",
    lead: "Bắt đầu bằng một lần xây, hoặc giữ Aegis ở lại để nuôi lớn. Mỗi gói báo giá theo phạm vi công việc.",
    bestFor: "Phù hợp với",
    includes: "Bao gồm",
    axis: "Aegis ở lại bao lâu",
    quoteNote: "Báo giá theo phạm vi, sau một phiếu yêu cầu ngắn",
    items: [
      {
        id: "own",
        name: "Own",
        line: "Aegis thiết kế và xây website hoặc web app, rồi bàn giao. Toàn bộ.",
        bestFor: "Founder và doanh nghiệp muốn mua đứt tài sản và tự vận hành.",
        stay: "Tới lúc bàn giao",
        includes: ["Website hoặc web app, thiết kế và xây dựng", "Toàn bộ mã nguồn", "Tên miền", "Tài khoản hosting", "Tài liệu hướng dẫn", "Quyền quản trị"],
        cta: "Nhận báo giá gói Own",
      },
      {
        id: "grow",
        name: "Grow",
        line: "Aegis xây, rồi tiếp tục nâng giá trị bằng SEO và marketing.",
        bestFor: "Đội muốn có website và một đối tác marketing mà không phải tuyển cả phòng ban.",
        stay: "Đồng hành hằng tháng",
        includes: ["Mọi thứ trong gói Own", "Thiết lập SEO và kế hoạch từ khóa", "Tối ưu trên trang", "Kế hoạch nội dung và cập nhật đều đặn", "Chăm sóc website", "Báo cáo hằng tháng"],
        cta: "Nhận báo giá gói Grow",
      },
      {
        id: "amplify",
        name: "Amplify",
        line: "Chỉ marketing. Aegis vận hành các kênh mạng xã hội và phát triển thương hiệu, tặng kèm landing page.",
        bestFor: "Doanh nghiệp đã có sản phẩm và cần marketing đều đặn trên nhiều nền tảng.",
        stay: "Đồng hành hằng tháng",
        includes: ["Landing page tặng kèm", "Chiến lược kênh và nội dung", "Lịch nội dung", "Sản xuất và đăng bài đa nền tảng", "Giọng thương hiệu và hướng dẫn hình ảnh", "Báo cáo hằng tháng"],
        cta: "Nhận báo giá gói Amplify",
      },
    ],
  },
  own: {
    title: "“Của riêng bạn” nghĩa là gì",
    lead: "Khi dự án Own hoặc Grow được bàn giao, những thứ này thuộc về bạn. Không thuê, không bị khóa vào Aegis.",
    items: [
      { name: "Toàn bộ mã nguồn", detail: "Trọn bộ mã của website hoặc web app." },
      { name: "Tên miền", detail: "Đăng ký cho bạn và chuyển về quyền kiểm soát của bạn." },
      { name: "Tài khoản hosting", detail: "Tài khoản nơi website chạy, bàn giao kèm quyền truy cập." },
      { name: "Tài liệu hướng dẫn", detail: "Hướng dẫn dễ hiểu để vận hành và cập nhật website." },
      { name: "Quyền quản trị", detail: "Quyền quản trị để bạn tự quản lý website." },
    ],
    note: "Danh sách bàn giao",
  },
  process: {
    title: "Từ tin nhắn đầu tiên tới lúc bàn giao",
    lead: "Bốn bước cho mọi dự án. Bước thứ năm cho các gói đồng hành.",
    steps: [
      { title: "Kể cho Aegis bài toán.", text: "Một phiếu ngắn, chủ yếu là bấm chọn. Aegis đọc và gửi lại giải pháp đề xuất.", plans: "Mọi gói", mock: "brief" },
      { title: "Chốt phạm vi.", text: "Phạm vi công việc, kế hoạch và tiến độ được thống nhất trước khi bắt tay làm.", plans: "Mọi gói", mock: "scope" },
      { title: "Theo dõi quá trình làm.", text: "Aegis làm đúng phạm vi đã thống nhất và cập nhật tiến độ suốt quá trình.", plans: "Mọi gói", mock: "build" },
      { title: "Nhận chìa khóa.", text: "Mã nguồn, tên miền, hosting, tài liệu và quyền quản trị được bàn giao.", plans: "Own · Grow", mock: "handover" },
      { title: "Tiếp tục lớn lên.", text: "SEO, nội dung và mạng xã hội chạy theo nhịp hằng tháng, mỗi tháng một báo cáo.", plans: "Grow · Amplify", mock: "grow" },
    ],
  },
  mock: {
    brief: { title: "Phiếu yêu cầu", fields: [["Hạng mục", "Website / web app"], ["Mục tiêu", "Ra mắt doanh nghiệp mới"]], chips: ["Own", "Grow", "Amplify"] },
    scope: { title: "Phạm vi công việc", rows: [["Trang và tính năng", "Đã chốt"], ["Kế hoạch", "Đã chốt"], ["Tiến độ", "Đã chốt"]] },
    build: { title: "Tiến độ", rows: [["Thiết kế", "Xong"], ["Xây dựng", "Đang làm"], ["Duyệt cùng bạn", "Tiếp theo"]] },
    handover: { title: "Bàn giao", done: "Đã bàn giao" },
    grow: { title: "Tháng này", days: ["T2", "T3", "T4", "T5", "T6"], rows: ["SEO", "Nội dung", "Mạng xã hội"] },
  },
  work: {
    title: "Đã bàn giao, đang chạy",
    lead: "Bảy website cho doanh nghiệp, giáo dục và sự kiện. Mỗi website đang chạy ở địa chỉ riêng.",
    featured: "Dự án tiêu biểu",
    visit: "Mở website",
    more: "Các dự án khác",
  },
  compare: {
    title: "Tự tuyển, thuê ngoài, hay Aegis",
    lead: "Ba cách phổ biến để có website và marketing.",
    cols: ["Tự tuyển người", "Freelancer hoặc agency", "Aegis"],
    rows: [
      { label: "Mã nguồn và tài khoản thuộc về bạn", cells: ["Có", "Tùy hợp đồng", "Có, trong mọi dự án Own và Grow"] },
      { label: "Một đội lo cả xây dựng và marketing", cells: ["Phải tuyển nhiều vị trí", "Thường là các bên riêng", "Một đội"] },
      { label: "Tiếp tục làm sau khi ra mắt", cells: ["Có", "Thường dừng ở bàn giao", "Gói Grow và Amplify"] },
      { label: "Có hướng dẫn để tự vận hành", cells: ["Tùy đội của bạn", "Tùy bên", "Có trong bàn giao"] },
      { label: "Để bắt đầu", cells: ["Tuyển dụng trước", "Tùy bên", "Một phiếu ngắn"] },
    ],
  },
  faq: {
    title: "Trước khi bắt đầu",
    items: [
      { q: "Làm xong thì website thuộc về ai?", a: "Thuộc về bạn. Dự án Own và Grow được bàn giao kèm toàn bộ mã nguồn, tên miền, tài khoản hosting, tài liệu hướng dẫn và quyền quản trị." },
      { q: "Giá được tính thế nào?", a: "Mỗi gói báo giá theo phạm vi công việc. Bạn gửi một phiếu ngắn, Aegis trả lời kèm giải pháp đề xuất và báo giá." },
      { q: "Tôi bắt đầu với Own rồi chuyển sang Grow sau được không?", a: "Được. Own là một lần xây. Sau này nếu bạn muốn thêm SEO và marketing, Aegis lên phạm vi gói Grow cho chính website bạn đang sở hữu." },
      { q: "Tôi đã có website, gói Amplify gồm những gì?", a: "Amplify lo marketing trên các kênh mạng xã hội và phát triển thương hiệu. Landing page tặng kèm dùng cho chiến dịch; website hiện tại của bạn giữ nguyên." },
      { q: "AI agent có phải sản phẩm có sẵn không?", a: "Không. Aegis tư vấn AI nên đặt ở đâu trong quy trình của bạn rồi xây theo yêu cầu. Phạm vi được chốt theo từng trường hợp." },
      { q: "Aegis có làm việc bằng tiếng Anh không?", a: "Có. Aegis làm việc với khách hàng bằng tiếng Anh và tiếng Việt." },
    ],
  },
  final: {
    title: "Sẵn sàng xây một tài sản?",
    work: "Xem dự án",
    workLine: "Bảy website đang chạy, mỗi website một địa chỉ riêng.",
    call: "Nhận báo giá",
    callLine: "Một phiếu ngắn, chủ yếu là bấm chọn. Aegis trả lời kèm giải pháp và báo giá.",
  },
  footer: {
    tagline: "Stands behind every stage of your business growth.",
    plans: "Các gói",
    pages: "Trên trang này",
    other: "Khác",
    demo1: "Bản thiết kế /demo1",
    current: "Trang chính hiện tại",
    rights: "© Aegis",
  },
  contact: {
    title: "Kể cho Aegis về dự án của bạn",
    lead: "Mỗi màn một câu hỏi, khoảng một phút. Các câu sau đổi theo hạng mục bạn chọn.",
    back: "Về trang chủ",
  },
};

const dicts: Record<D2Lang, D2Dict> = { en, vi };
export const getD2 = (lang: D2Lang) => dicts[lang];

/** 7 dự án thật, chữ theo ngôn ngữ (bản tiếng Anh lấy từ từ điển Factory đã dịch sát bản Việt) */
export const d2Projects = (lang: D2Lang) => (lang === "en" ? getFactoryDict("en").projects : projects);
