import { homeHref, serviceHref } from "@/config/routes";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/config/space";
import { getSiteDict } from "@/content/site";
import type { ServiceId } from "@/content/types";

/**
 * Dữ liệu cấu trúc (schema.org JSON-LD) cho trang chính. Chỉ dùng dữ kiện đã có trong nội dung: tên, mô tả, 4 nhóm dịch vụ,
 * ngôn ngữ. Không thêm logo, địa chỉ, số điện thoại, mạng xã hội, đánh giá hay giá khi chưa được xác nhận (siteConfig.contact đang null).
 * Cần siteConfig.url để có URL tuyệt đối; không có thì trả về null và trang không chèn gì.
 */

const inLanguage: Record<Locale, string> = { vi: "vi-VN", en: "en" };

const abs = (base: string, path: string) => `${base}${path === "/" ? "" : path}`;

export function homeJsonLd(lang: Locale) {
  const base = siteConfig.url;
  if (!base) return null;
  const { meta, services } = getSiteDict(lang);
  const org = `${base}/#organization`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": org,
        name: siteConfig.name,
        url: base,
        description: meta.description,
        knowsLanguage: ["vi", "en"],
        makesOffer: services.map((s) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: s.title, url: abs(base, serviceHref(lang, s.id)) },
        })),
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: abs(base, homeHref(lang)),
        name: siteConfig.name,
        description: meta.description,
        inLanguage: inLanguage[lang],
        publisher: { "@id": org },
      },
    ],
  };
}

export function serviceJsonLd(lang: Locale, id: ServiceId) {
  const base = siteConfig.url;
  if (!base) return null;
  const { services } = getSiteDict(lang);
  const service = services.find((s) => s.id === id)!;
  const url = abs(base, serviceHref(lang, id));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: service.title,
        description: service.summary,
        url,
        serviceType: service.title,
        inLanguage: inLanguage[lang],
        provider: { "@type": "Organization", "@id": `${base}/#organization`, name: siteConfig.name, url: base },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: siteConfig.name, item: abs(base, homeHref(lang)) },
          { "@type": "ListItem", position: 2, name: service.title, item: url },
        ],
      },
    ],
  };
}
