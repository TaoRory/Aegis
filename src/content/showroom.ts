import { process, values } from "@/content/about";
import { projects } from "@/content/projects";
import { services } from "@/content/services";

/**
 * Nội dung trang /demo "Studio Aegis": không gian 3D trình bày 2 sản phẩm chính Web/App và Digital Marketing.
 *
 * ⚑ BẢN NHÁP CHỜ DUYỆT. Mọi mục có `draft: true` là lời văn Aegis soạn mới, ghép từ phạm vi dịch vụ đã xác nhận
 * (src/content/services.ts) và quy trình đã có (about.ts). Không có giá, số năm bảo hành, KPI hay cam kết thời gian.
 * Những điều chưa xác nhận ghi ở `review` (chỉ để chủ dự án đọc, KHÔNG hiển thị ra trang).
 */

export type SectionId = "web" | "projects" | "marketing" | "about" | "contact";
export type PackageId = "own" | "grow";
export type MakerRole = "coder" | "builder" | "architect" | "pinner" | "crier" | "poster" | "gardener" | "messenger" | "courier";

export interface PackageInfo {
  id: PackageId;
  name: string;
  tagline: string;
  model: string;
  fit: string;
  includes: string[];
  cta: string;
  /** Ghi vào ô mô tả của form liên hệ khi khách bấm "Nhận báo giá" */
  quoteNote: string;
  draft: true;
}

const web = services.find((s) => s.id === "web")!;
const marketing = services.find((s) => s.id === "marketing")!;

export const showroom = {
  meta: {
    title: "Studio Aegis: Website & App, Digital Marketing (bản demo)",
    description: "Không gian 3D giới thiệu hai sản phẩm chính của Aegis: thiết kế, phát triển website và web app, và digital marketing cho doanh nghiệp.",
  },
  brand: { name: "AEGIS", line: "Website & App · Digital Marketing" },
  boot: { label: "Đang dựng studio", enter: "Vào studio", hint: "Kéo để nhìn quanh · bấm vào màn hình để xem", skip: "Bỏ qua" },
  chrome: {
    nav: "Các khu trong studio",
    close: "Đóng",
    back: "Về toàn cảnh",
    menu: "Menu",
    home: "Trang chính Aegis",
    flat: "Xem bản phẳng",
    room: "Về căn phòng 3D",
    flatNotice: "Thiết bị không hỗ trợ 3D nên đang hiện bản phẳng, nội dung giống hệt.",
    demoNote: "Bản demo đang hoàn thiện",
  },

  sections: [
    { id: "web", index: "01", label: "Website & App", object: "Màn hình trên bàn làm việc" },
    { id: "projects", index: "02", label: "Dự án", object: "TV trên bảng ghim" },
    { id: "marketing", index: "03", label: "Digital Marketing", object: "Bảng hiển thị chiến dịch" },
    { id: "about", index: "04", label: "Về Aegis", object: "Khung ảnh dưới logo" },
    { id: "contact", index: "05", label: "Liên hệ", object: "Laptop dưới cửa sổ" },
  ] as { id: SectionId; index: string; label: string; object: string }[],

  /** Linh vật "Thợ Aegis" (minibot minh hoạ, không đại diện nhân sự thật): nhãn hiện khi rê chuột */
  makers: {
    roles: {
      coder: "Thợ code",
      builder: "Thợ xây nền móng",
      architect: "Kiến trúc sư",
      pinner: "Thợ dự án",
      crier: "Thợ marketing",
      poster: "Thợ nội dung",
      gardener: "Thợ chăm sóc",
      messenger: "Thợ liên lạc",
      courier: "Thợ kết nối",
    } as Record<MakerRole, string>,
    hint: "Bấm để xem khu",
  },

  /** Nhãn tab trong màn hình 3D (bản phẳng hiện tất cả nối tiếp) */
  tabs: {
    web: { packages: "Hai gói", estate: "Bất động sản số", compare: "So sánh", process: "Quy trình" },
    marketing: { scope: "Phạm vi", approach: "Cách triển khai", link: "Đi cùng website" },
  },

  hero: {
    title: "Studio Aegis",
    lead: "Hai sản phẩm, một đội triển khai: Aegis xây website và web app làm nền móng, rồi chạy digital marketing để đưa khách hàng tới.",
  },

  web: {
    title: web.title,
    summary: web.summary,
    estate: {
      draft: true,
      heading: "Website là bất động sản số của doanh nghiệp",
      lead: "Một văn phòng thật cần địa chỉ, nền đất và ngôi nhà. Trên internet cũng vậy, và tài sản này thuộc về doanh nghiệp, không phụ thuộc vào nền tảng của ai.",
      points: [
        { term: "Tên miền", text: "là địa chỉ: khách hàng gõ đúng tên là tìm thấy doanh nghiệp." },
        { term: "Hosting", text: "là nền đất: nơi website đứng vững, nhanh và an toàn." },
        { term: "Website", text: "là ngôi nhà: mở cửa đón khách mọi lúc, trình bày đúng điều doanh nghiệp muốn nói." },
        { term: "Nội dung & SEO", text: "là giá trị tăng dần: càng chăm sóc, tài sản càng được tìm thấy nhiều hơn." },
      ],
    },
    packagesHeading: "Hai cách sở hữu",
    packagesLead: "Chọn theo cách doanh nghiệp muốn vận hành sau khi website lên sóng. Cả hai đều bắt đầu từ cùng một nền móng.",
    packages: [
      {
        id: "own",
        name: "Gói Sở hữu",
        tagline: "Bán đứt: đầu tư một lần, toàn quyền tài sản",
        model: "Xây dựng một lần, bàn giao trọn",
        fit: "Doanh nghiệp đã có người tự vận hành và cập nhật website.",
        includes: [
          "Làm rõ mục tiêu và cấu trúc nội dung",
          "Thiết kế theo thương hiệu",
          "Lập trình website hoặc web app",
          "Cơ sở dữ liệu, thu thập thông tin, phân quyền quản trị theo phạm vi dự án",
          "SEO kỹ thuật nền tảng và cài đặt đo lường",
          "Bàn giao toàn bộ mã nguồn, quyền quản trị và hướng dẫn sử dụng",
        ],
        cta: "Nhận báo giá gói Sở hữu",
        quoteNote: "Tôi quan tâm Gói Sở hữu (bán đứt).",
        draft: true,
      },
      {
        id: "grow",
        name: "Gói Đồng hành",
        tagline: "Xây dựng và nâng cấp cùng doanh nghiệp",
        model: "Xây dựng + vận hành, nâng cấp hằng tháng",
        fit: "Doanh nghiệp muốn website lớn dần theo việc kinh doanh, có đội chăm sóc lâu dài.",
        includes: [
          "Toàn bộ phần xây dựng của Gói Sở hữu",
          "Quản lý hosting, tên miền, SSL và sao lưu",
          "Cập nhật nội dung theo yêu cầu",
          "Theo dõi số liệu và tối ưu chuyển đổi",
          "Landing page cho từng chiến dịch",
          "Phát triển thêm tính năng theo từng giai đoạn",
          "Báo cáo định kỳ",
        ],
        cta: "Nhận báo giá gói Đồng hành",
        quoteNote: "Tôi quan tâm Gói Đồng hành (xây dựng và nâng cấp).",
        draft: true,
      },
    ] as PackageInfo[],
    compare: {
      draft: true,
      heading: "So sánh nhanh",
      columns: ["Gói Sở hữu", "Gói Đồng hành"],
      rows: [
        { label: "Thiết kế và lập trình", values: [true, true] },
        { label: "Bàn giao mã nguồn và quyền quản trị", values: [true, true] },
        { label: "SEO kỹ thuật nền tảng, đo lường", values: [true, true] },
        { label: "Quản lý hosting, tên miền, sao lưu", values: [false, true] },
        { label: "Cập nhật nội dung", values: [false, true] },
        { label: "Tối ưu chuyển đổi, landing page chiến dịch", values: [false, true] },
        { label: "Nâng cấp tính năng theo giai đoạn", values: [false, true] },
      ] as { label: string; values: [boolean, boolean] }[],
    },
    priceNote: "Aegis báo giá riêng sau khi hiểu mục tiêu và hiện trạng của doanh nghiệp.",
    processHeading: "Cách làm việc",
    process: process.steps,
  },

  projects: {
    title: "Dự án đã thực hiện",
    lead: "Các website Aegis đã làm cho doanh nghiệp, tổ chức giáo dục và sự kiện.",
    open: "Mở website",
    items: projects,
  },

  marketing: {
    title: "Digital Marketing",
    summary: marketing.summary,
    scopeHeading: "Aegis triển khai",
    scope: marketing.scope,
    needsHeading: "Khi nào doanh nghiệp cần",
    needs: marketing.needs,
    approach: {
      draft: true,
      heading: "Cách triển khai",
      steps: [
        { title: "Hiểu mục tiêu", description: "Làm rõ khách hàng mục tiêu, sản phẩm chủ lực và điều doanh nghiệp muốn đạt." },
        { title: "Lên kế hoạch kênh", description: "Chọn kênh phù hợp: quảng cáo trực tuyến, mạng xã hội, nội dung." },
        { title: "Trực tiếp triển khai", description: "Aegis chạy chiến dịch và nội dung theo phạm vi đã thống nhất." },
        { title: "Báo cáo và điều chỉnh", description: "Theo dõi kết quả, báo cáo định kỳ và điều chỉnh cho đợt sau." },
      ],
    },
    link: {
      draft: true,
      heading: "Đi cùng website",
      text: "Quảng cáo dẫn khách về đâu thì nơi đó phải chuyển đổi được. Landing page chiến dịch và đo lường nằm trong Gói Đồng hành, nên marketing và website chạy cùng một nhịp.",
    },
    value: marketing.value,
    cta: "Nhận tư vấn marketing",
    quoteNote: "Tôi quan tâm dịch vụ Digital Marketing.",
  },

  about: {
    title: "Về Aegis",
    statement: "Aegis là đội triển khai công nghệ và marketing của doanh nghiệp: tư vấn đúng giải pháp, tự tay xây dựng và bàn giao sản phẩm dễ dùng nhất.",
    values,
  },

  contact: {
    title: "Liên hệ",
    lead: "Trả lời vài câu ngắn, Aegis đọc kỹ rồi liên hệ lại để tư vấn và báo giá.",
  },

  /** ⚑ Chỉ để chủ dự án duyệt, không hiển thị */
  review: [
    "Tên gói: 'Gói Sở hữu' / 'Gói Đồng hành' có ổn không, hay muốn tên khác?",
    "Gói Đồng hành: chu kỳ thanh toán (tháng / quý / năm)? Có tách thành nhiều bậc như Basic / Growth không?",
    "Có cam kết bảo hành, chỉnh sửa miễn phí, thời gian triển khai nào muốn đưa lên không? (hiện không ghi)",
    "Digital Marketing: có gói cụ thể (vd theo kênh, theo ngân sách quảng cáo) không? Hiện chỉ ghi phạm vi đã xác nhận.",
    "Ẩn dụ 'bất động sản số' và 4 ý: duyệt lời văn.",
  ],
};
