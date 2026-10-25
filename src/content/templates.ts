/**
 * Thư viện mẫu giao diện DEMO do Aegis tự thiết kế để minh họa năng lực.
 * Mỗi mẫu là một STYLE có tên (ATELIER, SIGNAL…): công thức đầy đủ nằm ở .claude/skills/style-library/styles/<slug>.md.
 * Thương hiệu, nội dung và số liệu trong các mẫu đều là GIẢ ĐỊNH (không phải khách hàng thật).
 * Dự án thực tế nằm ở src/content/projects.ts.
 *
 * Mỗi mẫu là một route tĩnh: src/app/(demo)/mau-giao-dien/<slug>/page.tsx
 * Ảnh xem trước: `pnpm capture:templates` → public/templates + template-previews.json
 */

export const templateGroups = ["Thương mại", "Công nghệ & truyền thông", "Dịch vụ", "Giáo dục"] as const;
export type TemplateGroup = (typeof templateGroups)[number];

export interface DemoTemplate {
  slug: string;
  /** Tên style (gọi tên này để dựng website theo style) */
  name: string;
  /** Tên thương hiệu giả định dùng trong mẫu */
  brand: string;
  industry: string;
  /** Nhóm để lọc trong thư viện (nhóm thể loại demo, không phải phân loại khách hàng thật) */
  group: TemplateGroup;
  /** Cảm xúc chủ đạo quyết định font, màu, chuyển động */
  emotion: string;
  /** Ý tưởng lớn, một câu */
  idea: string;
  /** Khoảnh khắc signature */
  signature: string;
  /** Tương tác người xem có thể thử */
  interactions: string[];
  fonts: string;
  /** Bảng màu chính (nền, mực, accent, phụ) */
  palette: string[];
  /** Ngành khác có thể dùng style này */
  fits: string[];
  /** Màu sân khấu và màu chữ cho thẻ trong thư viện (lấy từ bảng màu của chính mẫu) */
  stage: string;
  stageInk: string;
}

export const templates: DemoTemplate[] = [
  {
    slug: "atelier",
    name: "ATELIER",
    brand: "Tơ Đêm",
    industry: "Thời trang",
    group: "Thương mại",
    emotion: "Khao khát",
    idea: "Website là một số tạp chí thời trang: masthead khổng lồ, ảnh bìa, lookbook như dải phim.",
    signature: "Lookbook kéo được, cả dải ảnh cong theo tốc độ tay kéo.",
    interactions: ["Kéo dải lookbook", "Lọc catalogue", "Giỏ hàng trượt", "Rê chuột xem hậu trường"],
    fonts: "Playfair · Epilogue",
    palette: ["#ece8e1", "#121110", "#9e1b32", "#6f6a63"],
    fits: ["Trang sức", "Mỹ phẩm cao cấp", "Studio ảnh cưới", "Nội thất boutique"],
    stage: "#ece8e1",
    stageInk: "#121110",
  },
  {
    slug: "signal",
    name: "SIGNAL",
    brand: "MẠCH",
    industry: "Công nghệ / AI",
    group: "Công nghệ & truyền thông",
    emotion: "Chính xác",
    idea: "Tín hiệu từ nhiễu: trường sóng hỗn loạn duỗi thẳng khi người xem cuộn và rê chuột.",
    signature: "Trường sóng shader phản ứng theo chuột và cuộn.",
    interactions: ["Rê chuột làm phẳng sóng", "Chạy thử luồng tự động hóa", "Hàng tính năng xáo chữ"],
    fonts: "Geologica · JetBrains Mono",
    palette: ["#0a0c10", "#eef1f4", "#c6ff3d", "#8a93a0"],
    fits: ["Fintech", "Phần mềm quản trị", "Startup phần cứng", "An ninh dữ liệu"],
    stage: "#0a0c10",
    stageInk: "#c6ff3d",
  },
  {
    slug: "serene",
    name: "SERENE",
    brand: "SƯƠNG",
    industry: "Dịch vụ chăm sóc",
    group: "Dịch vụ",
    emotion: "An tâm",
    idea: "Sương sớm phủ trang, tan dần dưới con trỏ, mọi chuyển động chậm như hơi thở.",
    signature: "Làn sương theo chuột trên ảnh hero.",
    interactions: ["Rê chuột xua sương", "Bài thở có hướng dẫn", "Đặt lịch 4 bước"],
    fonts: "Fraunces · Lexend",
    palette: ["#eef0ec", "#1f2a26", "#c98d78", "#a9b8ad"],
    fits: ["Nha khoa", "Phòng khám", "Yoga / thiền", "Chăm sóc thú cưng"],
    stage: "#dfe5df",
    stageInk: "#1f2a26",
  },
  {
    slug: "hearth",
    name: "HEARTH",
    brand: "Than & Muối",
    industry: "F&B",
    group: "Thương mại",
    emotion: "Thèm",
    idea: "Gian bếp lúc tối, than hồng hắt sáng; món ăn hiện ra khi người xem lướt thực đơn.",
    signature: "Thực đơn: ảnh món bám theo con trỏ.",
    interactions: ["Rê chuột trên thực đơn", "Đổi nhóm món", "Giữ bàn"],
    fonts: "Noto Serif Display · Archivo",
    palette: ["#15110e", "#f3e9dc", "#ff5b1f", "#e0b25b"],
    fits: ["Café / tiệm bánh", "Bar", "Fine dining", "Chuỗi F&B"],
    stage: "#15110e",
    stageInk: "#ff5b1f",
  },
  {
    slug: "broadcast",
    name: "BROADCAST",
    brand: "Tần Số",
    industry: "Truyền thông",
    group: "Công nghệ & truyền thông",
    emotion: "Táo bạo",
    idea: "Website như một kênh đang lên sóng: REC, timecode, danh sách dự án như lịch phát.",
    signature: "Lịch phát: tên dự án xáo chữ, ảnh bám con trỏ.",
    interactions: ["Rê chuột trên lịch phát", "Mở showreel", "Mở rộng dịch vụ"],
    fonts: "Archivo · IBM Plex Mono",
    palette: ["#f1efea", "#0b0b0b", "#ff2d00", "#6b6965"],
    fits: ["Agency quảng cáo", "Production house", "Podcast", "Báo chí online"],
    stage: "#f1efea",
    stageInk: "#ff2d00",
  },
  {
    slug: "playground",
    name: "PLAYGROUND",
    brand: "Bập Bênh English",
    industry: "Trung tâm tiếng Anh",
    group: "Giáo dục",
    emotion: "Vui",
    idea: "Sân chơi ngôn ngữ: sticker kéo được, kiểm tra trình độ là trò chơi, từ vựng là thẻ lật.",
    signature: "Sticker kéo thả có quán tính trên hero.",
    interactions: ["Kéo sticker", "Kiểm tra trình độ 5 câu", "Lật thẻ từ vựng", "Đăng ký học thử"],
    fonts: "Unbounded · Nunito · Patrick Hand",
    palette: ["#fff6e6", "#15153a", "#2f4bff", "#ffd23f"],
    fits: ["Trung tâm kỹ năng / STEM", "Mầm non", "App học ngôn ngữ", "Khu vui chơi"],
    stage: "#2f4bff",
    stageInk: "#ffd23f",
  },
  {
    slug: "voyage",
    name: "VOYAGE",
    brand: "La Bàn",
    industry: "Tư vấn du học",
    group: "Dịch vụ",
    emotion: "Khát vọng",
    idea: "Mỗi section là một chặng bay, từ tấm vé đầu tiên tới ngày nhập học.",
    signature: "Đường bay tự vẽ theo cuộn, máy bay chạy theo đường.",
    interactions: ["Kéo dải điểm đến", "Tích checklist hồ sơ", "Đặt lịch tư vấn"],
    fonts: "Cormorant Garamond · Manrope",
    palette: ["#f4efe6", "#0f1f3d", "#c4382b", "#b08d57"],
    fits: ["Công ty du lịch", "Dịch vụ visa", "Logistics quốc tế", "Trường quốc tế"],
    stage: "#0f1f3d",
    stageInk: "#f4efe6",
  },
  {
    slug: "campus",
    name: "CAMPUS",
    brand: "Rặng Thông",
    industry: "Giáo dục",
    group: "Giáo dục",
    emotion: "Điềm tĩnh",
    idea: "Niên giám được biên tập kỹ: chương đánh số, chú thích bên lề, ảnh lớn yên tĩnh.",
    signature: "Một ngày ở trường: cuộn ngang theo kim đồng hồ.",
    interactions: ["Cuộn qua một ngày học", "Mở cấp học", "Xem lịch sự kiện", "Đăng ký tham quan"],
    fonts: "Literata · Inter Tight",
    palette: ["#f5f1e8", "#1b1f1a", "#1d4a33", "#b8932f"],
    fits: ["Đại học / học viện", "Trung tâm đào tạo", "Thư viện / bảo tàng", "Mầm non cao cấp"],
    stage: "#1d4a33",
    stageInk: "#f5f1e8",
  },
];

export const templateNotice =
  "Đây là các mẫu giao diện demo do Aegis tự thiết kế để minh họa năng lực. Thương hiệu, nội dung và số liệu trong mẫu đều là giả định, không phải khách hàng thực tế.";

export function getTemplate(slug: string) {
  const index = templates.findIndex((t) => t.slug === slug);
  if (index < 0) throw new Error(`Không có mẫu "${slug}"`);
  return { template: templates[index], index, next: templates[(index + 1) % templates.length] };
}
