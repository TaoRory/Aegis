import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { themeMeta } from "@/styles/theme-meta";

/** Web app manifest tối thiểu (tên, icon, màu). Icon và màu là bản tạm cho tới khi có nhận diện chính thức. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — Giải pháp công nghệ & marketing cho doanh nghiệp`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    lang: "vi",
    start_url: "/",
    display: "browser",
    background_color: themeMeta.light,
    theme_color: themeMeta.light,
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon", type: "image/png", sizes: "180x180" },
    ],
  };
}
