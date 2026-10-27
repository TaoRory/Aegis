import type { Metadata } from "next";

import { contactHref, homeHref, serviceHref, templatesHref } from "@/config/routes";
import type { Locale } from "@/config/space";
import { getSiteDict } from "@/content/site";
import type { ServiceId } from "@/content/types";

/** Địa chỉ hai ngôn ngữ của cùng một trang (hreflang) */
const alternates = (path: (lang: Locale) => string, lang: Locale): Metadata["alternates"] => ({
  canonical: path(lang),
  languages: { vi: path("vi"), en: path("en") },
});

export function homeMetadata(lang: Locale): Metadata {
  const { meta } = getSiteDict(lang);
  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: alternates(homeHref, lang),
    openGraph: { type: "website", locale: meta.ogLocale, title: meta.title, description: meta.description, siteName: "Aegis" },
  };
}

export function serviceMetadata(lang: Locale, id: ServiceId): Metadata {
  const dict = getSiteDict(lang);
  const service = dict.services.find((s) => s.id === id)!;
  return {
    title: service.title,
    description: service.summary,
    alternates: alternates((l) => serviceHref(l, id), lang),
    openGraph: { type: "website", locale: dict.meta.ogLocale, title: `${service.title} | Aegis`, description: service.summary, siteName: "Aegis" },
  };
}

export function contactMetadata(lang: Locale): Metadata {
  const { contact } = getSiteDict(lang);
  return {
    title: contact.pageTitle,
    description: contact.pageDescription,
    alternates: alternates((l) => contactHref(l), lang),
  };
}

export function templatesMetadata(lang: Locale): Metadata {
  const { templatesPage } = getSiteDict(lang);
  return {
    title: templatesPage.title,
    description: templatesPage.description,
    alternates: alternates(templatesHref, lang),
  };
}
