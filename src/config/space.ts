/**
 * Cấu hình "Aegis Foundation" (Factory, phiên bản 2 của website): Lõi Aegis ở giữa, bốn khu dịch vụ ngang hàng
 * toả ra bốn hướng, Gallery (dự án thật), Studio (thí nghiệm + kệ mẫu + ghi chép) và Gate (liên hệ) nối vào lõi.
 * Mỗi khu là một route thật; tên hiển thị theo ngôn ngữ nằm ở src/content/factory/*.
 * Song ngữ: tiếng Việt ở /factory/..., tiếng Anh ở /en/factory/... (next.config rewrite /factory → /vi/factory).
 */

import { homeHref, serviceHref } from "@/config/routes";
import type { ServiceId } from "@/content/types";

export const locales = ["vi", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "vi";

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Hai bản Factory cùng một mã nguồn:
 * - "neutral" (/factory): bản trung tính, không khoe sản phẩm đã làm (không có khu Dự án và Studio mẫu);
 * - "web" (/web/factory): bản sao đầy đủ dành cho khách quan tâm website, có thêm Dự án và Studio mẫu.
 */
export type Variant = "neutral" | "web";
export const SPACE_BASES: Record<Variant, string> = { neutral: "/factory", web: "/web/factory" };

/** Đường dẫn công khai của Factory: vi → /factory/sub, en → /en/factory/sub; bản web thêm /web phía trước */
export function factoryHref(lang: Locale, sub = "", variant: Variant = "neutral"): string {
  const base = (lang === "en" ? "/en" : "") + SPACE_BASES[variant];
  const clean = sub.replace(/^\/+|\/+$/g, "");
  return clean ? `${base}/${clean}` : base;
}

/** Bản Factory suy từ pathname (kể cả đường dẫn nội bộ /vi/web/factory sau rewrite) */
export function variantFromPath(pathname: string): Variant {
  return /^\/(?:(?:en|vi)\/)?web\/factory(?:\/|$)/.test(pathname) ? "web" : "neutral";
}

/** Ngôn ngữ suy từ pathname (kể cả đường dẫn nội bộ /vi/factory sau rewrite) */
export function localeFromPath(pathname: string): Locale {
  return /^\/en(\/|$)/.test(pathname) ? "en" : "vi";
}

/** Bỏ tiền tố ngôn ngữ: /en/factory/work → /factory/work, /en/web/factory → /web/factory */
export function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(en|vi)(?=\/(?:web\/)?factory)/, "");
}

/** Ba service còn thiếu dự án thật có demo minh họa; Web dùng dự án thật */
export const servicesWithDemo: readonly ServiceId[] = ["ai", "software", "marketing"];

export type ZoneId = "hub" | "about" | ServiceId | "work" | "studio" | "contact";
export type ZoneKind = "core" | "service" | "proof" | "gate";

export interface Zone {
  id: ZoneId;
  kind: ZoneKind;
  /** Đường dẫn con dưới /factory ("" = tổng quan) */
  path: string;
  /** Khu trưng bày sản phẩm đã làm: chỉ có ở bản web (/web/factory) */
  showcase?: boolean;
}

export const zones: readonly Zone[] = [
  { id: "hub", kind: "core", path: "" },
  { id: "about", kind: "core", path: "about" },
  // Bốn dịch vụ: thứ tự theo vị trí trên mặt bằng (tây bắc, đông bắc, tây nam, đông nam), không phải thứ tự bước
  { id: "ai", kind: "service", path: "services/ai" },
  { id: "software", kind: "service", path: "services/software" },
  { id: "web", kind: "service", path: "services/web" },
  { id: "marketing", kind: "service", path: "services/marketing" },
  { id: "work", kind: "proof", path: "work", showcase: true },
  { id: "studio", kind: "proof", path: "studio", showcase: true },
  { id: "contact", kind: "gate", path: "contact" },
] as const;

export const zoneById = Object.fromEntries(zones.map((z) => [z.id, z])) as Record<ZoneId, Zone>;
export const serviceIds: readonly ServiceId[] = ["ai", "software", "web", "marketing"];
export const isServiceZone = (zone: ZoneId): zone is ServiceId => (serviceIds as readonly string[]).includes(zone);

/** Thanh điều hướng: nhóm 4 dịch vụ ngang hàng, rồi các khu còn lại */
export const navServices = zones.filter((z) => z.kind === "service");
export const navOthers = (["work", "studio", "about", "contact"] as const).map((id) => zoneById[id]);

/** Khu có mặt trong từng bản: bản trung tính bỏ các khu trưng bày sản phẩm */
export const hasZone = (zone: ZoneId, variant: Variant) => variant === "web" || !zoneById[zone].showcase;
export const zonesFor = (variant: Variant) => zones.filter((z) => hasZone(z.id, variant));
export const navOthersFor = (variant: Variant) => navOthers.filter((z) => hasZone(z.id, variant));

/** Từ pathname suy ra khu đang mở và mục con (slug dự án, id thí nghiệm, "demo"…) */
export function resolveZone(pathname: string): { zone: ZoneId; focus: string | null } {
  const variant = variantFromPath(pathname);
  const rest = stripLocale(pathname).replace(/\/+$/, "").slice(SPACE_BASES[variant].length).split("/").filter(Boolean);
  const [a, b, c] = rest;
  let zone: ZoneId = "hub";
  let focus: string | null = null;
  if (a === "services") {
    if (b && (serviceIds as readonly string[]).includes(b)) {
      zone = b as ServiceId;
      focus = c ?? null;
    } else focus = "services";
  } else if (a === "work") [zone, focus] = ["work", b ?? null];
  else if (a === "studio") zone = "studio";
  else if (a === "about") zone = "about";
  else if (a === "contact") zone = "contact";
  return hasZone(zone, variant) ? { zone, focus } : { zone: "hub", focus: null };
}

/**
 * Route cha (Esc / nút đóng), giữ nguyên ngôn ngữ: /factory/work/vidi26 → /factory/work → /factory → trang chủ.
 * Từ tổng quan của bản web thì về trang Web (/web), từ bản trung tính về trang chủ.
 */
export function parentRoute(pathname: string): string {
  const lang = localeFromPath(pathname);
  const variant = variantFromPath(pathname);
  const base = SPACE_BASES[variant];
  const clean = stripLocale(pathname).replace(/\/+$/, "");
  if (clean === base) return variant === "web" ? serviceHref(lang, "web") : homeHref(lang);
  const sub = clean.slice(base.length + 1).split("/");
  sub.pop();
  return factoryHref(lang, sub.join("/"), variant);
}
