import type { D2Lang } from "@/content/demo2";

/**
 * Chữ MỚI của website chính cho khu vực "work" (phần đã có ở /demo2 thì dùng lại qua getD3, không chép sang đây).
 * Hai ngôn ngữ phải cùng một khuôn. Không bịa số liệu, khách hàng, lời chứng thực, giá.
 *
 * - `cases`: phần mở rộng của trang chi tiết dự án. Chỉ ghi điều đã xác nhận (projects.ts + thông tin chủ dự án gửi 2026-11-15):
 *   khách hàng, Aegis đã làm gì, đã xây những gì. Không có số liệu kết quả.
 * - `brands`: lưới thương hiệu đã làm cùng (trang chủ, trang Work). Logo do chủ dự án gửi (public/brands, giữ màu gốc, nền đã tách);
 *   thương hiệu chưa có file logo thì hiện tên bằng chữ, KHÔNG tự vẽ logo. Không nói Aegis là đối tác chính thức của VinUni.
 */

type Built = { title: string; text: string };
type Case = { client: string; services: string[]; built: Built[]; links?: { label: string; href: string }[] };
type Brand = { id: string; name: string; logo?: { src: string; width: number; height: number }; work: string; slug?: string };

const VINDISCOVERY_POST = "https://www.facebook.com/share/p/1ExC27zTrB/";

const en = {
  /** Gợi ý cạnh nhãn "Full page": khung ảnh toàn trang tự cuộn được */
  scrollHint: "Scroll inside the frame",
  case: {
    industry: "Industry",
    overview: "Overview",
    mobile: "On the phone",
    client: "Client",
    services: "What Aegis did",
    live: "Live at",
    built: "What we built",
    system: "Design system",
    screens: "The site, top to bottom",
    more: "More about the project",
  },
  cases: {
    vidi26: {
      client: "VinUniversity Admissions Office, for the VinDiscovery 2026 programme",
      services: ["Web app design & build"],
      built: [
        { title: "Real-time scores", text: "Scores update in real time on the site, as the programme runs." },
        { title: "Announcements", text: "The team posts announcements straight to the site." },
        { title: "Database & admin roles", text: "A database with admin permissions, so the team manages content itself." },
        { title: "Blog management", text: "Blog posts are written and updated from the admin side." },
      ],
      links: [{ label: "Programme post on Facebook", href: VINDISCOVERY_POST }],
    },
    "handle-vietnam": {
      client: "Handle, healthcare support and medical travel in Vietnam",
      services: ["Website design & build"],
      built: [
        { title: "Company website", text: "A site that presents the Handle service." },
        { title: "Information collection", text: "Basic details sent through the site are stored in a database." },
      ],
    },
    "integritas-vu-legal": {
      client: "Integritas Vu Legal, a law firm in Vietnam",
      services: ["Website design & build", "Marketing"],
      built: [
        { title: "Practice areas", text: "Each area of the firm's practice, laid out on the site." },
        { title: "Team", text: "The lawyers behind the firm." },
        { title: "Professional articles", text: "A place for the firm's legal writing." },
        { title: "Marketing", text: "Aegis also runs the firm's marketing." },
      ],
    },
    "tedx-vinuniversity-2026": {
      client: "TEDxVinUniversity",
      services: ["Website design & build"],
      built: [
        { title: "The Limitless Decade", text: "The site carries the 2026 theme." },
        { title: "Speakers", text: "Who is speaking, introduced one by one." },
        { title: "Event schedule", text: "The programme of the day." },
      ],
    },
    rethink: {
      client: "ReThink, a student organisation at VinUniversity",
      services: ["Website design & build"],
      built: [{ title: "Organisation website", text: "The home of the organisation online." }],
    },
    "tedx-vinuniversity-2025": {
      client: "TEDxVinUniversity",
      services: ["Website design & build"],
      built: [{ title: "Event website", text: "The site for the 2025 edition." }],
    },
    "rethink-halloween": {
      client: "The Student Council, with ReThink",
      services: ["Website design & build"],
      built: [
        { title: "Ticket sales", text: "Tickets are sold directly through the website." },
        { title: "Event website", text: "Everything about the Halloween event, in one place." },
      ],
    },
  } satisfies Record<string, Case>,
  brands: {
    label: "Brands we've built with",
    title: "Schools, companies, events and organisations.",
    lead: "Websites, web apps and marketing, built and run by one team.",
    next: "Your brand next",
    nextLine: "Tell us what you're building",
    soon: "Website coming soon",
    items: [
      { id: "vinuniversity", name: "VinUniversity Admissions Office", logo: { src: "/brands/vinuniversity.png", width: 335, height: 206 }, work: "Web app for VinDiscovery", slug: "vidi26" },
      { id: "handle", name: "Handle Vietnam", logo: { src: "/brands/handle.png", width: 220, height: 45 }, work: "Website", slug: "handle-vietnam" },
      { id: "integritas", name: "Integritas Vu Legal", logo: { src: "/brands/integritas-light.png", width: 416, height: 401 }, work: "Website + marketing", slug: "integritas-vu-legal" },
      { id: "tedx", name: "TEDxVinUniversity", work: "Event websites, 2025 and 2026", slug: "tedx-vinuniversity-2026" },
      { id: "rethink", name: "ReThink", work: "Organisation website", slug: "rethink" },
      { id: "sophie", name: "Sophie Academy", logo: { src: "/brands/sophie.png", width: 785, height: 300 }, work: "Website + marketing" },
      { id: "council", name: "Student Council", work: "Halloween event site with ticketing, with ReThink", slug: "rethink-halloween" },
    ] satisfies Brand[],
  },
};

const vi: typeof en = {
  scrollHint: "Cuộn trong khung để xem cả trang",
  case: {
    industry: "Lĩnh vực",
    overview: "Tổng quan",
    mobile: "Trên điện thoại",
    client: "Khách hàng",
    services: "Aegis đã làm",
    live: "Đang chạy tại",
    built: "Những gì đã xây",
    system: "Hệ thống thiết kế",
    screens: "Toàn bộ website, từ trên xuống",
    more: "Thêm về dự án",
  },
  cases: {
    vidi26: {
      client: "Văn phòng tuyển sinh VinUniversity, cho chương trình VinDiscovery 2026",
      services: ["Thiết kế & dựng web app"],
      built: [
        { title: "Điểm cập nhật realtime", text: "Điểm được cập nhật theo thời gian thực ngay trên website trong suốt chương trình." },
        { title: "Đăng thông báo", text: "Đội ngũ đăng thông báo trực tiếp lên website." },
        { title: "Cơ sở dữ liệu & phân quyền", text: "Cơ sở dữ liệu có phân quyền quản trị, đội ngũ tự quản lý nội dung." },
        { title: "Quản lý blog", text: "Bài blog được viết và cập nhật từ trang quản trị." },
      ],
      links: [{ label: "Bài đăng về chương trình trên Facebook", href: VINDISCOVERY_POST }],
    },
    "handle-vietnam": {
      client: "Handle, hỗ trợ chăm sóc sức khỏe và du lịch y tế tại Việt Nam",
      services: ["Thiết kế & dựng website"],
      built: [
        { title: "Website doanh nghiệp", text: "Website giới thiệu dịch vụ của Handle." },
        { title: "Thu thập thông tin", text: "Thông tin cơ bản gửi qua website được lưu vào cơ sở dữ liệu." },
      ],
    },
    "integritas-vu-legal": {
      client: "Integritas Vu Legal, công ty luật tại Việt Nam",
      services: ["Thiết kế & dựng website", "Marketing"],
      built: [
        { title: "Lĩnh vực hành nghề", text: "Từng lĩnh vực của công ty được trình bày trên website." },
        { title: "Đội ngũ", text: "Các luật sư của công ty." },
        { title: "Bài viết chuyên môn", text: "Nơi đăng các bài viết pháp lý của công ty." },
        { title: "Marketing", text: "Aegis triển khai cả marketing cho công ty." },
      ],
    },
    "tedx-vinuniversity-2026": {
      client: "TEDxVinUniversity",
      services: ["Thiết kế & dựng website"],
      built: [
        { title: "The Limitless Decade", text: "Website mang chủ đề của mùa 2026." },
        { title: "Diễn giả", text: "Giới thiệu từng diễn giả." },
        { title: "Lịch trình", text: "Chương trình của ngày sự kiện." },
      ],
    },
    rethink: {
      client: "ReThink, tổ chức sinh viên thuộc Trường Đại học VinUni",
      services: ["Thiết kế & dựng website"],
      built: [{ title: "Website tổ chức", text: "Ngôi nhà trực tuyến của tổ chức." }],
    },
    "tedx-vinuniversity-2025": {
      client: "TEDxVinUniversity",
      services: ["Thiết kế & dựng website"],
      built: [{ title: "Website sự kiện", text: "Website cho mùa 2025." }],
    },
    "rethink-halloween": {
      client: "Hội đồng học sinh, phối hợp cùng ReThink",
      services: ["Thiết kế & dựng website"],
      built: [
        { title: "Bán vé trực tiếp", text: "Vé được bán ngay trên website." },
        { title: "Website sự kiện", text: "Mọi thông tin về sự kiện Halloween ở một chỗ." },
      ],
    },
  },
  brands: {
    label: "Thương hiệu đã đồng hành",
    title: "Trường học, doanh nghiệp, sự kiện và tổ chức.",
    lead: "Website, web app và marketing, một đội dựng và vận hành.",
    next: "Thương hiệu của bạn",
    nextLine: "Kể cho Aegis bạn đang xây gì",
    soon: "Website sắp ra mắt",
    items: [
      { id: "vinuniversity", name: "Văn phòng tuyển sinh VinUniversity", logo: { src: "/brands/vinuniversity.png", width: 335, height: 206 }, work: "Web app cho VinDiscovery", slug: "vidi26" },
      { id: "handle", name: "Handle Vietnam", logo: { src: "/brands/handle.png", width: 220, height: 45 }, work: "Website", slug: "handle-vietnam" },
      { id: "integritas", name: "Integritas Vu Legal", logo: { src: "/brands/integritas-light.png", width: 416, height: 401 }, work: "Website + marketing", slug: "integritas-vu-legal" },
      { id: "tedx", name: "TEDxVinUniversity", work: "Website sự kiện, 2025 và 2026", slug: "tedx-vinuniversity-2026" },
      { id: "rethink", name: "ReThink", work: "Website tổ chức", slug: "rethink" },
      { id: "sophie", name: "Sophie Academy", logo: { src: "/brands/sophie.png", width: 785, height: 300 }, work: "Website + marketing" },
      { id: "council", name: "Hội đồng học sinh", work: "Website sự kiện Halloween bán vé, cùng ReThink", slug: "rethink-halloween" },
    ],
  },
};

const copy = { en, vi } satisfies Record<D2Lang, Record<string, unknown>>;

export default copy;
