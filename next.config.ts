import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  // Factory song ngữ, hai bản: tiếng Việt ở /factory/... và /web/factory/... (rewrite nội bộ sang /vi/...), tiếng Anh ở /en/...
  async rewrites() {
    return [
      { source: "/factory", destination: "/vi/factory" },
      { source: "/factory/:path*", destination: "/vi/factory/:path*" },
      { source: "/web/factory", destination: "/vi/web/factory" },
      { source: "/web/factory/:path*", destination: "/vi/web/factory/:path*" },
    ];
  },
  async redirects() {
    return [
      // Website chính nay là bản demo3 (tiếng Anh ở gốc, tiếng Việt ở /vi). Địa chỉ của trang chính cũ → trang tương ứng của bản mới
      { source: "/demo3", destination: "/", permanent: true },
      { source: "/demo3/:path*", destination: "/:path*", permanent: true },
      { source: "/en", destination: "/", permanent: true },
      { source: "/en/contact", destination: "/contact", permanent: true },
      { source: "/en/web", destination: "/services/web", permanent: true },
      { source: "/en/ai", destination: "/services/ai", permanent: true },
      { source: "/en/marketing", destination: "/services/social", permanent: true },
      { source: "/en/software", destination: "/services", permanent: true },
      { source: "/en/templates", destination: "/work", permanent: true },
      { source: "/templates", destination: "/work", permanent: true },
      { source: "/lien-he", destination: "/vi/contact", permanent: true },
      { source: "/web", destination: "/vi/services/web", permanent: true },
      { source: "/ai", destination: "/vi/services/ai", permanent: true },
      { source: "/marketing", destination: "/vi/services/social", permanent: true },
      { source: "/software", destination: "/vi/services", permanent: true },
      { source: "/mau-giao-dien", destination: "/vi/work", permanent: true },
      // Địa chỉ nội bộ không công khai: /vi/factory/... về /factory/...
      { source: "/vi/factory", destination: "/factory", permanent: true },
      { source: "/vi/factory/:path*", destination: "/factory/:path*", permanent: true },
      { source: "/vi/web/factory", destination: "/web/factory", permanent: true },
      { source: "/vi/web/factory/:path*", destination: "/web/factory/:path*", permanent: true },
      // Bản trung tính (/factory) không có khu Dự án và Studio mẫu: các địa chỉ đó nay nằm ở bản web (/web/factory)
      ...["", "/en"].flatMap((lang) => [
        { source: `${lang}/factory/work`, destination: `${lang}/web/factory/work`, permanent: true },
        { source: `${lang}/factory/work/:slug`, destination: `${lang}/web/factory/work/:slug`, permanent: true },
        { source: `${lang}/factory/studio`, destination: `${lang}/web/factory/studio`, permanent: true },
      ]),
      // Địa chỉ cũ (bố cục 7 phòng) chuyển sang cấu trúc mới, cả hai ngôn ngữ
      ...["", "/en"].flatMap((lang) => [
        { source: `${lang}/factory/trung-bay`, destination: `${lang}/web/factory/work`, permanent: true },
        { source: `${lang}/factory/trung-bay/:slug`, destination: `${lang}/web/factory/work/:slug`, permanent: true },
        { source: `${lang}/factory/thi-nghiem`, destination: `${lang}/web/factory/studio`, permanent: true },
        { source: `${lang}/factory/thi-nghiem/:id`, destination: `${lang}/web/factory/studio`, permanent: true },
        { source: `${lang}/factory/studio/lab/:id`, destination: `${lang}/web/factory/studio`, permanent: true },
        { source: `${lang}/factory/mau-giao-dien`, destination: `${lang}/web/factory/studio`, permanent: true },
        { source: `${lang}/factory/nhat-ky`, destination: `${lang}/web/factory/studio`, permanent: true },
        { source: `${lang}/factory/dich-vu`, destination: `${lang}/factory/services`, permanent: true },
        { source: `${lang}/factory/ve-aegis`, destination: `${lang}/factory/about`, permanent: true },
        { source: `${lang}/factory/lien-he`, destination: `${lang}/factory/contact`, permanent: true },
      ]),
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
