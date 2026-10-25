import type { Project, ProjectCategory } from "@/content/types";

/**
 * Portfolio. Thứ tự trong mảng là thứ tự hiển thị.
 * Ảnh preview được tạo bằng `pnpm capture:previews` (lưu tại public/portfolio,
 * kích thước ghi vào project-previews.json). Dự án chưa có ảnh sẽ hiển thị khung thay thế.
 */
export const projects: Project[] = [
  {
    slug: "vidi26",
    name: "VIDI26",
    type: "Website tuyển sinh",
    category: "education",
    description:
      "Website cho chương trình VinUni Discovery 2026 của văn phòng tuyển sinh Trường Đại học VinUni. Có cơ sở dữ liệu và phân quyền quản trị để đội ngũ tự cập nhật nội dung blog.",
    highlights: ["Cơ sở dữ liệu", "Phân quyền admin", "Quản lý nội dung blog"],
    url: "https://vidi26.vercel.app/",
  },
  {
    slug: "handle-vietnam",
    name: "Handle Vietnam",
    type: "Website doanh nghiệp",
    category: "business",
    description:
      "Website cho Handle, dịch vụ hỗ trợ chăm sóc sức khỏe và du lịch y tế tại Việt Nam. Có cơ sở dữ liệu để thu thập thông tin cơ bản.",
    highlights: ["Cơ sở dữ liệu thu thập thông tin"],
    url: "https://handlevietnam.com/vi",
  },
  {
    slug: "integritas-vu-legal",
    name: "Integritas Vu Legal",
    type: "Website doanh nghiệp",
    category: "business",
    description:
      "Website giới thiệu cho Integritas Vu Legal, công ty luật tại Việt Nam, trình bày lĩnh vực hành nghề, đội ngũ và bài viết chuyên môn.",
    url: "https://www.integritasvulegal.com/",
  },
  {
    slug: "tedx-vinuniversity-2026",
    name: "TEDxVinUniversity 2026",
    type: "Website sự kiện",
    category: "event",
    description:
      "Website cho sự kiện TEDxVinUniversity 2026 với chủ đề “The Limitless Decade”, giới thiệu diễn giả và lịch trình sự kiện.",
    url: "https://v0-tedxvinuni.vercel.app/",
  },
  {
    slug: "rethink",
    name: "ReThink",
    type: "Website tổ chức",
    category: "education",
    description:
      "Website cho ReThink, tổ chức sinh viên thuộc Trường Đại học VinUni.",
    url: "https://rethinkorg.com",
  },
  {
    slug: "tedx-vinuniversity-2025",
    name: "TEDxVinUniversity 2025",
    type: "Website sự kiện",
    category: "event",
    description: "Website cho sự kiện TEDxVinUniversity 2025.",
    url: "https://rethinkorg.com/tedx",
  },
  {
    slug: "rethink-halloween",
    name: "ReThink Halloween",
    type: "Website sự kiện",
    category: "event",
    description:
      "Website cho sự kiện Halloween của hội đồng học sinh, phối hợp cùng ReThink, tổ chức sinh viên thuộc Trường Đại học VinUni.",
    url: "https://rethinkorg.com/halloween",
  },
];

export const projectCategories: { id: ProjectCategory | "all"; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "business", label: "Doanh nghiệp" },
  { id: "education", label: "Giáo dục & tổ chức" },
  { id: "event", label: "Sự kiện" },
];
