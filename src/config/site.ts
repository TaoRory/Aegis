/**
 * Cấu hình chung của website: tên, thông điệp, điều hướng, SEO và thông tin liên hệ.
 * Nội dung chi tiết (dịch vụ, dự án, giá trị…) nằm trong src/content.
 */

/** Tên miền production, khai báo qua biến môi trường. Không hardcode. */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || undefined;

export const siteConfig = {
  name: "Aegis",
  url: siteUrl,
  locale: "vi_VN",
  tagline: "Aegis xây dựng nền tảng công nghệ vững chắc, giúp doanh nghiệp tự tin tiến xa.",
  description:
    "Aegis là đội triển khai công nghệ cho doanh nghiệp: tư vấn giải pháp, xây dựng AI, phần mềm quản trị, website – web app và marketing, bàn giao sản phẩm dễ dùng nhất.",

  /** Link dạng "/#id" để dùng được từ mọi trang (ở trang chủ vẫn cuộn mượt tại chỗ); "/lien-he" là trang form riêng */
  nav: [
    { label: "Giới thiệu", href: "/#gioi-thieu" },
    { label: "Dịch vụ", href: "/#dich-vu" },
    { label: "Dự án", href: "/#du-an" },
    { label: "Mẫu giao diện", href: "/mau-giao-dien" },
    { label: "Liên hệ", href: "/lien-he" },
  ],

  cta: { label: "Trao đổi nhu cầu", href: "/lien-he" },

  /**
   * Thông tin liên hệ chính thức. Để null cho tới khi được xác nhận;
   * mục nào có giá trị sẽ tự hiển thị ở phần Liên hệ và Footer.
   */
  contact: {
    email: null as string | null,
    phone: null as string | null,
    address: null as string | null,
  },
} as const;

export type NavItem = (typeof siteConfig.nav)[number];
