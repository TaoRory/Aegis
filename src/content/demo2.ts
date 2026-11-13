import { getFactoryDict } from "@/content/factory";
import { projects } from "@/content/projects";

/**
 * Nội dung bản thiết kế /demo2 (website nhiều trang; tiếng Anh là chính, tiếng Việt là phụ).
 * Định vị do người dùng brief (2026-11-13): không chỉ làm website mà xây "tài sản số" gồm website, marketing và AI;
 * ba gói Own / Grow / Amplify, trình bày theo phạm vi công việc, KHÔNG ghi giá (chưa có giá).
 *
 * Đã xác nhận: gói Own bàn giao toàn bộ mã nguồn, tên miền, tài khoản hosting, tài liệu hướng dẫn, quyền quản trị;
 *   Grow = web/web app + SEO + marketing; Amplify = marketing đa nền tảng + phát triển thương hiệu, tặng landing page.
 * ⚑ NHÁP chờ người dùng sửa: đầu việc chi tiết của Grow / Amplify và của bốn trang dịch vụ (soạn theo quy trình phổ biến của ngành),
 *   các mốc của biểu đồ "giá trị tài sản", các bước quy trình, bảng so sánh, câu hỏi thường gặp, toàn bộ câu chữ tiêu đề.
 * AI agent: mới là định hướng → luôn ghi "tư vấn và xây theo yêu cầu", không mô tả như sản phẩm có sẵn.
 * Không có số liệu, khách hàng, lời chứng thực hay giá. Dự án: 7 website thật trong projects.ts. Blog: xem src/content/blog/README.md.
 */

export type D2Lang = "en" | "vi";

export const D2_BASE = "/demo2";
export const d2Home = (lang: D2Lang) => (lang === "en" ? D2_BASE : `${D2_BASE}/vi`);
/** Đường dẫn trong /demo2 theo ngôn ngữ; `path` bắt đầu bằng "/" hoặc rỗng (trang chủ) */
export const d2Href = (lang: D2Lang, path = "") => `${d2Home(lang)}${path}`;
export const d2Contact = (lang: D2Lang) => d2Href(lang, "/contact");

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
export type D2LayerId = "site" | "search" | "social" | "ai";
export type D2ServiceId = "web" | "growth" | "social" | "ai";

/** Gói nào bật lớp nào của "tài sản số" (AI không thuộc gói nào: làm riêng theo tư vấn) */
export const d2PlanLayers: Record<D2PlanId, D2LayerId[]> = {
  own: ["site"],
  grow: ["site", "search", "social"],
  amplify: ["site", "social"],
};

export const d2ServiceLayer: Record<D2ServiceId, D2LayerId> = { web: "site", growth: "search", social: "social", ai: "ai" };

export interface D2Plan {
  id: D2PlanId;
  name: string;
  line: string;
  bestFor: string;
  stay: string;
  includes: string[];
  cta: string;
}

export interface D2Service {
  id: D2ServiceId;
  name: string;
  /** Một dòng cho danh mục */
  line: string;
  lead: string;
  scope: string[];
  fit: string[];
  plans: string;
  note?: string;
}

export interface D2Dict {
  lang: D2Lang;
  meta: { title: string; description: string };
  chrome: {
    skip: string;
    home: string;
    nav: string;
    menu: string;
    close: string;
    langLabel: string;
    pause: string;
    play: string;
    illustration: string;
    prev: string;
    next: string;
    custom: string;
    allServices: string;
  };
  nav: { path: string; label: string }[];
  cta: string;
  home: {
    h1: [string, string];
    lead: string;
    secondary: string;
    assetLabel: string;
    layers: Record<D2LayerId, { name: string; line: string }>;
    landing: string;
    planNotes: Record<D2PlanId, string>;
    seePlan: string;
    story: { ink: string; muted: string; flat: string; asset: string; note: string; milestones: { title: string; text: string }[] };
    servicesTitle: string;
    servicesLead: string;
    plansTitle: string;
    plansLink: string;
    workTitle: string;
    workLink: string;
    blogTitle: string;
    blogLink: string;
  };
  services: { title: string; lead: string; whatWeDo: string; goodFit: string; includedIn: string; open: string; others: string; items: D2Service[] };
  plans: {
    title: string;
    lead: string;
    bestFor: string;
    includes: string;
    axis: string;
    quoteNote: string;
    items: D2Plan[];
    fitTitle: string;
    cases: { quote: string; answer: string; note?: string }[];
  };
  own: { title: string; lead: string; items: { name: string; detail: string }[]; note: string };
  process: { title: string; lead: string; steps: { title: string; text: string; plans: string; mock: "brief" | "scope" | "build" | "handover" | "grow" }[] };
  mock: {
    brief: { title: string; fields: [string, string][]; chips: string[] };
    scope: { title: string; rows: [string, string][] };
    build: { title: string; rows: [string, string][] };
    handover: { title: string; done: string };
    grow: { title: string; days: string[]; rows: string[] };
    search: { query: string; results: string[]; yours: string };
    social: { title: string; tabs: string[] };
    ai: { nodes: string[] };
    site: { cta: string };
  };
  work: {
    title: string;
    lead: string;
    visit: string;
    all: string;
    view: string;
    type: string;
    category: string;
    address: string;
    features: string;
    fullPage: string;
    palette: string;
    paletteNote: string;
    next: string;
    similar: string;
    shotAlt: string;
  };
  categories: Record<string, string>;
  compare: { title: string; lead: string; cols: [string, string, string]; rows: { label: string; cells: [string, string, string] }[] };
  faq: { title: string; items: { q: string; a: string }[] };
  about: {
    title: string;
    statement: string;
    story: { label: string; text: string }[];
    valuesLabel: string;
    values: { title: string; description: string }[];
    promiseLabel: string;
    promise: string;
    processLink: string;
  };
  blog: { title: string; lead: string; topicsLabel: string; topics: string[]; empty: string; emptyLine: string; read: string; back: string; minutes: string };
  final: { title: string; work: string; workLine: string; call: string; callLine: string };
  footer: { tagline: string; services: string; company: string; other: string; demo1: string; current: string; rights: string };
  contact: { title: string; lead: string; back: string };
}

const en: D2Dict = {
  lang: "en",
  meta: {
    title: "Aegis — Website, marketing and AI, built as one digital asset you own",
    description:
      "Aegis builds websites and web apps as digital assets. Buy yours outright with the full source code, or let us keep growing it with SEO, social marketing and AI.",
  },
  chrome: {
    skip: "Skip to main content",
    home: "Aegis, home",
    nav: "Main navigation",
    menu: "Menu",
    close: "Close",
    langLabel: "Language",
    pause: "Pause",
    play: "Play",
    illustration: "Illustration",
    prev: "Previous",
    next: "Next",
    custom: "Custom, by consultation",
    allServices: "All services",
  },
  nav: [
    { path: "/services", label: "Services" },
    { path: "/plans", label: "Plans" },
    { path: "/work", label: "Work" },
    { path: "/process", label: "Process" },
    { path: "/blog", label: "Blog" },
    { path: "/about", label: "About" },
  ],
  cta: "Get a quote",
  home: {
    h1: ["Website, marketing and AI. Built as one asset you", "own."],
    lead: "Aegis builds the website, then grows what it's worth: search, social channels and AI tools, added in layers. Buy it outright or keep us on.",
    secondary: "Compare plans",
    assetLabel: "Pick a plan to see what it switches on",
    layers: {
      site: { name: "Website", line: "A site or web app built for your business" },
      search: { name: "Search", line: "SEO, so customers can find it" },
      social: { name: "Social", line: "Channels that keep the brand in view" },
      ai: { name: "AI", line: "Tools and agents for routine work" },
    },
    landing: "Landing page",
    planNotes: {
      own: "Own: the website or web app, the source code and every account. Then it's yours to run.",
      grow: "Grow: we build it, then add SEO and marketing, month after month.",
      amplify: "Amplify: marketing only. Social channels and brand growth, with a landing page included.",
    },
    seePlan: "See this plan",
    story: {
      ink: "Most websites launch, then stand still.",
      muted: "An asset keeps gaining value.",
      flat: "A website left alone",
      asset: "An asset that's looked after",
      note: "Illustration of the idea, not measured data",
      milestones: [
        { title: "Launch.", text: "Both start the same way: a finished website goes live." },
        { title: "Handover.", text: "Source code, domain, hosting, documentation and admin access become yours." },
        { title: "Search.", text: "SEO setup and a keyword plan make the site findable." },
        { title: "Content.", text: "Regular updates keep it current, so it doesn't age the day after launch." },
        { title: "Social.", text: "Your channels bring the brand to people who haven't searched for it yet." },
      ],
    },
    servicesTitle: "Four layers, one team",
    servicesLead: "Start with the one you need. Add the others when the business is ready.",
    plansTitle: "Three ways to work with us",
    plansLink: "Compare plans in detail",
    workTitle: "Delivered and live",
    workLink: "All projects",
    blogTitle: "From the blog",
    blogLink: "All articles",
  },
  services: {
    title: "What we build and run",
    lead: "Four services that stack into one asset. Each can stand alone or sit inside a plan.",
    whatWeDo: "What we do",
    goodFit: "A good fit when",
    includedIn: "Included in",
    open: "Open",
    others: "Other services",
    items: [
      {
        id: "web",
        name: "Websites & web apps",
        line: "Company sites, event sites and custom web systems.",
        lead: "A website customers can find and you can update yourself. Built to scope, then handed over with everything you need to run it.",
        scope: ["Company websites and event websites", "Custom web systems and web apps", "Databases, data collection and admin permissions, scoped per project", "Handover: source code, domain, hosting, documentation, admin access"],
        fit: ["You need a professional website to present your business", "You need a dedicated site for an event, programme or campaign", "You need a web tool to collect information or manage your own content"],
        plans: "Own · Grow",
      },
      {
        id: "growth",
        name: "SEO & growth",
        line: "Search setup, content and upkeep that keep the site working.",
        lead: "A launched site is a starting point. We set up search properly, plan the content and keep the site current, with a report each month.",
        scope: ["SEO setup and keyword plan", "On-page optimisation", "Content plan and regular updates", "Website upkeep", "Monthly report"],
        fit: ["The site is live but customers aren't finding it", "Nobody on the team has time to keep it updated", "You want one partner for the website and its growth"],
        plans: "Grow",
      },
      {
        id: "social",
        name: "Social & brand",
        line: "Multi-platform social marketing and brand growth.",
        lead: "We plan the channels, produce the content and publish it on a steady rhythm, so the brand stays in view without you hiring a department.",
        scope: ["Channel and content strategy", "Content calendar", "Posts produced and published across platforms", "Brand voice and visual guide", "Landing page for campaigns", "Monthly report"],
        fit: ["You have a product and need steady marketing around it", "Your channels exist but post irregularly", "You want to outsource marketing instead of hiring"],
        plans: "Grow · Amplify",
      },
      {
        id: "ai",
        name: "AI solutions",
        line: "AI tools and agents, scoped around a real problem.",
        lead: "We start from the business problem, not the trend: where AI fits your workflow, what it should take over, and what stays with people. Then we build to order.",
        scope: ["AI consulting around a specific problem, clarified before any build", "Developing and deploying AI tools for your business", "Customising the solution to your own workflow"],
        fit: ["You want to apply AI but aren't sure where to start", "Routine work is eating the time of a small team or a solo founder", "You need AI tools tailored to how you actually work"],
        plans: "Custom scope",
        note: "Not an off-the-shelf product. Scope is agreed case by case.",
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
    fitTitle: "Which one sounds like you?",
    cases: [
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
    search: { query: "your service + your city", results: ["Directory listing", "Your website", "Another result"], yours: "You" },
    social: { title: "Content calendar", tabs: ["Plan", "Produce", "Publish"] },
    ai: { nodes: ["Request", "AI agent", "Done"] },
    site: { cta: "Contact" },
  },
  work: {
    title: "Delivered and live",
    lead: "Seven websites for businesses, education and events. Each one is running at its own address.",
    visit: "Visit site",
    all: "All projects",
    view: "View project",
    type: "Type",
    category: "Category",
    address: "Address",
    features: "Confirmed features",
    fullPage: "Full page",
    palette: "Colours of this project",
    paletteNote: "Measured from the live site.",
    next: "Next project",
    similar: "Talk about a similar project",
    shotAlt: "Screenshot of the {name} website",
  },
  categories: { business: "Business", education: "Education & organisations", event: "Events" },
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
  about: {
    title: "One team for the whole job, from consulting to handover.",
    statement: "Aegis builds practical, easy-to-use technology that solves the operating problems of a business.",
    story: [
      {
        label: "The problem",
        text: "For startups and small and medium-sized businesses, the biggest challenge is often the lack of specialist people to turn an idea into a system that actually runs.",
      },
      {
        label: "Our mission",
        text: "Aegis fills that gap by acting as a dedicated technology department: alongside the business from consulting, through AI solutions, website and web app design and development, and management software, to marketing.",
      },
    ],
    valuesLabel: "Three principles",
    values: getFactoryDict("en").about.values,
    promiseLabel: "What Aegis hands over",
    promise: "The easiest product to use for business owners: no technical background needed to run it.",
    processLink: "See how we work",
  },
  blog: {
    title: "Notes on tech, AI and marketing",
    lead: "Practical write-ups from our work: building for the web, using AI in marketing, and growing a digital asset.",
    topicsLabel: "What we'll write about",
    topics: ["Technology", "AI in marketing", "SEO & content", "Growth"],
    empty: "The first articles are being written.",
    emptyLine: "Nothing is published yet. In the meantime, the work and the plans say most of what we'd write.",
    read: "Read article",
    back: "All articles",
    minutes: "min read",
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
    services: "Services",
    company: "Company",
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
    title: "Aegis — Website, marketing và AI, gộp thành một tài sản số của riêng bạn",
    description:
      "Aegis xây website và web app như một tài sản số. Mua đứt kèm toàn bộ mã nguồn, hoặc để Aegis tiếp tục nâng giá trị bằng SEO, marketing mạng xã hội và AI.",
  },
  chrome: {
    skip: "Bỏ qua đến nội dung chính",
    home: "Aegis, trang chủ",
    nav: "Điều hướng chính",
    menu: "Menu",
    close: "Đóng",
    langLabel: "Ngôn ngữ",
    pause: "Tạm dừng",
    play: "Chạy tiếp",
    illustration: "Minh họa",
    prev: "Trước",
    next: "Sau",
    custom: "Làm riêng, theo tư vấn",
    allServices: "Tất cả dịch vụ",
  },
  nav: [
    { path: "/services", label: "Dịch vụ" },
    { path: "/plans", label: "Các gói" },
    { path: "/work", label: "Dự án" },
    { path: "/process", label: "Quy trình" },
    { path: "/blog", label: "Blog" },
    { path: "/about", label: "Về Aegis" },
  ],
  cta: "Nhận báo giá",
  home: {
    h1: ["Website, marketing và AI. Gộp thành một tài sản", "của riêng bạn."],
    lead: "Aegis xây website, rồi nâng giá trị của nó: tìm kiếm, mạng xã hội và công cụ AI, thêm từng lớp. Mua đứt hoặc giữ Aegis ở lại.",
    secondary: "So sánh các gói",
    assetLabel: "Chọn một gói để xem gói đó bật những lớp nào",
    layers: {
      site: { name: "Website", line: "Website hoặc web app làm riêng cho doanh nghiệp" },
      search: { name: "Tìm kiếm", line: "SEO, để khách tìm thấy bạn" },
      social: { name: "Mạng xã hội", line: "Các kênh giữ thương hiệu luôn hiện diện" },
      ai: { name: "AI", line: "Công cụ và agent cho việc lặp lại" },
    },
    landing: "Landing page",
    planNotes: {
      own: "Own: website hoặc web app, mã nguồn và mọi tài khoản. Sau đó bạn tự vận hành.",
      grow: "Grow: Aegis xây, rồi thêm SEO và marketing, đồng hành hằng tháng.",
      amplify: "Amplify: chỉ marketing. Mạng xã hội và phát triển thương hiệu, tặng kèm landing page.",
    },
    seePlan: "Xem gói này",
    story: {
      ink: "Phần lớn website làm xong rồi đứng yên.",
      muted: "Tài sản thì ngày càng có giá trị.",
      flat: "Website bị bỏ đó",
      asset: "Tài sản được chăm sóc",
      note: "Minh họa cho ý tưởng, không phải số liệu đo",
      milestones: [
        { title: "Ra mắt.", text: "Cả hai bắt đầu giống nhau: một website hoàn chỉnh được đưa lên." },
        { title: "Bàn giao.", text: "Mã nguồn, tên miền, hosting, tài liệu và quyền quản trị thuộc về bạn." },
        { title: "Tìm kiếm.", text: "Thiết lập SEO và kế hoạch từ khóa để khách tìm thấy website." },
        { title: "Nội dung.", text: "Cập nhật đều đặn để website luôn mới, không cũ đi ngay sau ngày ra mắt." },
        { title: "Mạng xã hội.", text: "Các kênh đưa thương hiệu tới những người chưa từng tìm kiếm bạn." },
      ],
    },
    servicesTitle: "Bốn lớp, một đội",
    servicesLead: "Bắt đầu từ lớp bạn cần. Thêm các lớp khác khi doanh nghiệp sẵn sàng.",
    plansTitle: "Ba cách làm việc với Aegis",
    plansLink: "So sánh chi tiết các gói",
    workTitle: "Đã bàn giao, đang chạy",
    workLink: "Tất cả dự án",
    blogTitle: "Từ blog",
    blogLink: "Tất cả bài viết",
  },
  services: {
    title: "Aegis xây và vận hành những gì",
    lead: "Bốn dịch vụ xếp chồng thành một tài sản. Mỗi dịch vụ có thể làm riêng hoặc nằm trong một gói.",
    whatWeDo: "Aegis làm gì",
    goodFit: "Phù hợp khi",
    includedIn: "Có trong gói",
    open: "Xem",
    others: "Dịch vụ khác",
    items: [
      {
        id: "web",
        name: "Website & web app",
        line: "Website doanh nghiệp, website sự kiện và hệ thống web làm riêng.",
        lead: "Một website khách tìm thấy được và bạn tự cập nhật được. Làm đúng phạm vi, rồi bàn giao kèm mọi thứ bạn cần để vận hành.",
        scope: ["Website doanh nghiệp và website sự kiện", "Hệ thống web và web app làm riêng", "Cơ sở dữ liệu, thu thập thông tin, phân quyền quản trị theo phạm vi dự án", "Bàn giao: mã nguồn, tên miền, hosting, tài liệu, quyền quản trị"],
        fit: ["Bạn cần một website chuyên nghiệp để giới thiệu doanh nghiệp", "Bạn cần website riêng cho một sự kiện, chương trình hoặc chiến dịch", "Bạn cần công cụ web để thu thập thông tin hoặc tự quản lý nội dung"],
        plans: "Own · Grow",
      },
      {
        id: "growth",
        name: "SEO & tăng trưởng",
        line: "Thiết lập tìm kiếm, nội dung và chăm sóc để website luôn làm việc.",
        lead: "Website ra mắt mới là điểm bắt đầu. Aegis thiết lập tìm kiếm đúng cách, lên kế hoạch nội dung và giữ website luôn mới, mỗi tháng một báo cáo.",
        scope: ["Thiết lập SEO và kế hoạch từ khóa", "Tối ưu trên trang", "Kế hoạch nội dung và cập nhật đều đặn", "Chăm sóc website", "Báo cáo hằng tháng"],
        fit: ["Website đã chạy nhưng khách không tìm thấy", "Đội của bạn không có thời gian cập nhật", "Bạn muốn một đối tác lo cả website lẫn tăng trưởng"],
        plans: "Grow",
      },
      {
        id: "social",
        name: "Mạng xã hội & thương hiệu",
        line: "Marketing đa nền tảng và phát triển thương hiệu.",
        lead: "Aegis lên kế hoạch kênh, sản xuất nội dung và đăng theo nhịp đều, để thương hiệu luôn hiện diện mà bạn không phải tuyển cả phòng ban.",
        scope: ["Chiến lược kênh và nội dung", "Lịch nội dung", "Sản xuất và đăng bài đa nền tảng", "Giọng thương hiệu và hướng dẫn hình ảnh", "Landing page cho chiến dịch", "Báo cáo hằng tháng"],
        fit: ["Bạn đã có sản phẩm và cần marketing đều đặn", "Các kênh đã có nhưng đăng không đều", "Bạn muốn thuê ngoài marketing thay vì tuyển người"],
        plans: "Grow · Amplify",
      },
      {
        id: "ai",
        name: "Giải pháp AI",
        line: "Công cụ và agent AI, làm theo một bài toán thật.",
        lead: "Aegis bắt đầu từ bài toán của doanh nghiệp, không từ xu hướng: AI nên đặt ở đâu trong quy trình, nên làm thay việc gì, việc gì vẫn cần con người. Sau đó xây theo yêu cầu.",
        scope: ["Tư vấn AI theo bài toán cụ thể, làm rõ trước khi triển khai", "Phát triển và triển khai công cụ AI cho doanh nghiệp", "Tùy chỉnh giải pháp theo quy trình riêng của bạn"],
        fit: ["Bạn muốn ứng dụng AI nhưng chưa rõ nên bắt đầu từ đâu", "Việc lặp lại đang chiếm thời gian của một đội nhỏ hoặc một founder làm một mình", "Bạn cần công cụ AI chỉnh theo cách làm việc thực tế"],
        plans: "Phạm vi riêng",
        note: "Không phải sản phẩm có sẵn. Phạm vi được chốt theo từng trường hợp.",
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
    fitTitle: "Trường hợp nào giống bạn?",
    cases: [
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
    search: { query: "dịch vụ của bạn + thành phố", results: ["Trang danh bạ", "Website của bạn", "Kết quả khác"], yours: "Bạn" },
    social: { title: "Lịch nội dung", tabs: ["Lên kế hoạch", "Sản xuất", "Đăng"] },
    ai: { nodes: ["Yêu cầu", "AI agent", "Xong"] },
    site: { cta: "Liên hệ" },
  },
  work: {
    title: "Đã bàn giao, đang chạy",
    lead: "Bảy website cho doanh nghiệp, giáo dục và sự kiện. Mỗi website đang chạy ở địa chỉ riêng.",
    visit: "Mở website",
    all: "Tất cả dự án",
    view: "Xem dự án",
    type: "Hạng mục",
    category: "Lĩnh vực",
    address: "Địa chỉ",
    features: "Tính năng đã xác nhận",
    fullPage: "Toàn trang",
    palette: "Màu của dự án",
    paletteNote: "Đo từ website đang chạy.",
    next: "Dự án tiếp theo",
    similar: "Trao đổi dự án tương tự",
    shotAlt: "Ảnh chụp website {name}",
  },
  categories: { business: "Doanh nghiệp", education: "Giáo dục & tổ chức", event: "Sự kiện" },
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
  about: {
    title: "Một đội ngũ đảm nhận toàn bộ quy trình, từ tư vấn đến bàn giao.",
    statement: "AEGIS xây dựng giải pháp công nghệ thiết thực và dễ ứng dụng giúp giải quyết các bài toán vận hành của doanh nghiệp.",
    story: [
      {
        label: "Vấn đề",
        text: "Với các startup và doanh nghiệp vừa và nhỏ (SME), thách thức lớn nhất thường là thiếu nhân sự chuyên môn để hiện thực hóa ý tưởng thành một hệ thống vận hành hiệu quả.",
      },
      {
        label: "Sứ mệnh",
        text: "AEGIS lấp đầy khoảng trống đó bằng cách đóng vai trò như một bộ phận công nghệ chuyên trách, đồng hành cùng doanh nghiệp từ khâu tư vấn, phát triển giải pháp AI, thiết kế và phát triển website / webapp, xây dựng phần mềm quản trị đến triển khai marketing.",
      },
    ],
    valuesLabel: "Ba nguyên tắc",
    values: getFactoryDict("vi").about.values,
    promiseLabel: "Aegis bàn giao gì",
    promise: "Sản phẩm dễ dùng nhất cho chủ doanh nghiệp: không cần rành công nghệ vẫn tự vận hành được.",
    processLink: "Xem cách Aegis làm việc",
  },
  blog: {
    title: "Ghi chép về công nghệ, AI và marketing",
    lead: "Bài viết thực tế từ công việc của Aegis: làm web, ứng dụng AI trong marketing và nuôi lớn một tài sản số.",
    topicsLabel: "Aegis sẽ viết về",
    topics: ["Công nghệ", "AI trong marketing", "SEO & nội dung", "Tăng trưởng"],
    empty: "Những bài đầu tiên đang được viết.",
    emptyLine: "Chưa có bài nào được đăng. Trong lúc chờ, phần dự án và các gói đã nói gần hết điều Aegis muốn viết.",
    read: "Đọc bài",
    back: "Tất cả bài viết",
    minutes: "phút đọc",
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
    services: "Dịch vụ",
    company: "Aegis",
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
