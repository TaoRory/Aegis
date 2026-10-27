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
  // Factory song ngữ: tiếng Việt ở /factory/... (rewrite nội bộ sang /vi/factory/...), tiếng Anh ở /en/factory/...
  async rewrites() {
    return [
      { source: "/factory", destination: "/vi/factory" },
      { source: "/factory/:path*", destination: "/vi/factory/:path*" },
    ];
  },
  async redirects() {
    return [
      // Địa chỉ nội bộ không công khai: /vi/factory/... về /factory/...
      { source: "/vi/factory", destination: "/factory", permanent: true },
      { source: "/vi/factory/:path*", destination: "/factory/:path*", permanent: true },
      // Địa chỉ cũ (bố cục 7 phòng) chuyển sang cấu trúc mới, cả hai ngôn ngữ
      ...["", "/en"].flatMap((lang) => [
        { source: `${lang}/factory/trung-bay`, destination: `${lang}/factory/work`, permanent: true },
        { source: `${lang}/factory/trung-bay/:slug`, destination: `${lang}/factory/work/:slug`, permanent: true },
        { source: `${lang}/factory/thi-nghiem`, destination: `${lang}/factory/studio`, permanent: true },
        { source: `${lang}/factory/thi-nghiem/:id`, destination: `${lang}/factory/studio`, permanent: true },
        { source: `${lang}/factory/studio/lab/:id`, destination: `${lang}/factory/studio`, permanent: true },
        { source: `${lang}/factory/mau-giao-dien`, destination: `${lang}/factory/studio`, permanent: true },
        { source: `${lang}/factory/nhat-ky`, destination: `${lang}/factory/studio`, permanent: true },
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
