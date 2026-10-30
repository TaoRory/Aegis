import type { Metadata } from "next";

import { contactHref, homeHref, serviceHref, templatesHref } from "@/config/routes";
import type { Locale } from "@/config/space";
import { getSiteDict } from "@/content/site";
import type { ServiceId } from "@/content/types";

/**
 * Metadata SEO của các trang chính. Đường dẫn ở đây là tương đối; metadataBase trong app/layout.tsx (từ siteConfig.url)
 * biến chúng thành URL tuyệt đối cho canonical, hreflang, og:url và og:image.
 */

/** Ảnh chia sẻ dùng chung (src/app/opengraph-image.png). Phải khai báo lại vì openGraph của trang thay hẳn openGraph của layout. */
const OG_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: "Aegis – Nền tảng công nghệ vững chắc để doanh nghiệp tự tin tiến xa",
};

const ogLocale: Record<Locale, string> = { vi: "vi_VN", en: "en_US" };

/** Địa chỉ hai ngôn ngữ của cùng một trang (hreflang); x-default trỏ về bản tiếng Việt (thị trường chính) */
const alternates = (path: (lang: Locale) => string, lang: Locale): Metadata["alternates"] => ({
  canonical: path(lang),
  languages: { vi: path("vi"), en: path("en"), "x-default": path("vi") },
});

/** Open Graph + Twitter của một trang: tiêu đề, mô tả, URL, ngôn ngữ và ảnh chia sẻ */
function social(lang: Locale, path: string, title: string, description: string): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      type: "website",
      siteName: "Aegis",
      url: path,
      locale: ogLocale[lang],
      alternateLocale: ogLocale[lang === "vi" ? "en" : "vi"],
      title,
      description,
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE] },
  };
}

export function homeMetadata(lang: Locale): Metadata {
  const { meta } = getSiteDict(lang);
  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: alternates(homeHref, lang),
    ...social(lang, homeHref(lang), meta.title, meta.description),
  };
}

export function serviceMetadata(lang: Locale, id: ServiceId): Metadata {
  const dict = getSiteDict(lang);
  const service = dict.services.find((s) => s.id === id)!;
  const description = service.seoDescription ?? service.summary;
  return {
    title: service.title,
    description,
    alternates: alternates((l) => serviceHref(l, id), lang),
    ...social(lang, serviceHref(lang, id), `${service.title} | Aegis`, description),
  };
}

export function contactMetadata(lang: Locale): Metadata {
  const { contact } = getSiteDict(lang);
  return {
    title: contact.pageTitle,
    description: contact.pageDescription,
    alternates: alternates((l) => contactHref(l), lang),
    ...social(lang, contactHref(lang), `${contact.pageTitle} | Aegis`, contact.pageDescription),
  };
}

export function templatesMetadata(lang: Locale): Metadata {
  const { templatesPage } = getSiteDict(lang);
  return {
    title: templatesPage.title,
    description: templatesPage.description,
    alternates: alternates(templatesHref, lang),
    ...social(lang, templatesHref(lang), `${templatesPage.title} | Aegis`, templatesPage.description),
  };
}
