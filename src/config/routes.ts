import type { Locale } from "@/config/space";

/**
 * Địa chỉ công khai của trang chính theo ngôn ngữ. Tiếng Việt ở gốc (/, /web, /lien-he), tiếng Anh dưới /en (/en, /en/web, /en/contact).
 * Dịch vụ dùng thẳng id làm đường dẫn: /ai, /software, /web, /marketing.
 */
const prefix = (lang: Locale) => (lang === "en" ? "/en" : "");

export const homeHref = (lang: Locale) => (lang === "en" ? "/en" : "/");
export const serviceHref = (lang: Locale, id: string) => `${prefix(lang)}/${id}`;
export const contactHref = (lang: Locale, service?: string) => `${lang === "en" ? "/en/contact" : "/lien-he"}${service ? `?dv=${service}` : ""}`;
export const templatesHref = (lang: Locale) => (lang === "en" ? "/en/templates" : "/mau-giao-dien");
/** Mục trên trang chủ, ví dụ sectionHref("vi", "dich-vu") → /#dich-vu */
export const sectionHref = (lang: Locale, id: string) => `${homeHref(lang)}#${id}`;

/** Cặp đường dẫn riêng của từng ngôn ngữ (không chỉ khác tiền tố /en) */
const slugPairs: [vi: string, en: string][] = [
  ["/lien-he", "/contact"],
  ["/mau-giao-dien", "/templates"],
];

/**
 * Địa chỉ tương ứng của một trang ở ngôn ngữ kia (nút đổi ngôn ngữ). Hash không giữ lại vì chỉ có ở trình duyệt.
 * /web → /en/web, /lien-he → /en/contact, /en/templates → /mau-giao-dien, /en → /.
 */
export function counterpartPath(pathname: string, to: Locale): string {
  const clean = pathname.replace(/\/+$/, "") || "/";
  const isEn = clean === "/en" || clean.startsWith("/en/");
  const from: Locale = isEn ? "en" : "vi";
  if (from === to) return clean;
  const bare = isEn ? clean.replace(/^\/en/, "") || "/" : clean;
  const pair = slugPairs.find(([vi, en]) => (isEn ? en : vi) === bare);
  const mapped = pair ? (to === "en" ? pair[1] : pair[0]) : bare;
  return to === "en" ? (mapped === "/" ? "/en" : `/en${mapped}`) : mapped;
}
