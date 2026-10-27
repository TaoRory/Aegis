/**
 * Cấu hình "Aegis Foundation" (Factory, phiên bản 2 của website): Lõi Aegis ở giữa, bốn khu dịch vụ ngang hàng
 * toả ra bốn hướng, Gallery (dự án thật), Studio (thí nghiệm + kệ mẫu + ghi chép) và Gate (liên hệ) nối vào lõi.
 * Mỗi khu là một route thật; tên hiển thị theo ngôn ngữ nằm ở src/content/factory/*.
 * Song ngữ: tiếng Việt ở /factory/..., tiếng Anh ở /en/factory/... (next.config rewrite /factory → /vi/factory).
 */

import type { ServiceId } from "@/content/types";

export const locales = ["vi", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "vi";

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export const SPACE_BASE = "/factory";

/** Đường dẫn công khai của Factory theo ngôn ngữ: vi → /factory/sub, en → /en/factory/sub */
export function factoryHref(lang: Locale, sub = ""): string {
  const base = lang === "en" ? `/en${SPACE_BASE}` : SPACE_BASE;
  const clean = sub.replace(/^\/+|\/+$/g, "");
  return clean ? `${base}/${clean}` : base;
}

/** Ngôn ngữ suy từ pathname (kể cả đường dẫn nội bộ /vi/factory sau rewrite) */
export function localeFromPath(pathname: string): Locale {
  return /^\/en(\/|$)/.test(pathname) ? "en" : "vi";
}

/** Bỏ tiền tố ngôn ngữ: /en/factory/work → /factory/work */
export function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(en|vi)(?=\/factory)/, "");
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
}

export const zones: readonly Zone[] = [
  { id: "hub", kind: "core", path: "" },
  { id: "about", kind: "core", path: "about" },
  // Bốn dịch vụ: thứ tự theo vị trí trên mặt bằng (tây bắc, đông bắc, tây nam, đông nam), không phải thứ tự bước
  { id: "ai", kind: "service", path: "services/ai" },
  { id: "software", kind: "service", path: "services/software" },
  { id: "web", kind: "service", path: "services/web" },
  { id: "marketing", kind: "service", path: "services/marketing" },
  { id: "work", kind: "proof", path: "work" },
  { id: "studio", kind: "proof", path: "studio" },
  { id: "contact", kind: "gate", path: "contact" },
] as const;

export const zoneById = Object.fromEntries(zones.map((z) => [z.id, z])) as Record<ZoneId, Zone>;
export const serviceIds: readonly ServiceId[] = ["ai", "software", "web", "marketing"];
export const isServiceZone = (zone: ZoneId): zone is ServiceId => (serviceIds as readonly string[]).includes(zone);

/** Thanh điều hướng: nhóm 4 dịch vụ ngang hàng, rồi các khu còn lại */
export const navServices = zones.filter((z) => z.kind === "service");
export const navOthers = (["work", "studio", "about", "contact"] as const).map((id) => zoneById[id]);

/** Từ pathname suy ra khu đang mở và mục con (slug dự án, id thí nghiệm, "demo"…) */
export function resolveZone(pathname: string): { zone: ZoneId; focus: string | null } {
  const rest = stripLocale(pathname).replace(/\/+$/, "").slice(SPACE_BASE.length).split("/").filter(Boolean);
  const [a, b, c] = rest;
  if (!a) return { zone: "hub", focus: null };
  if (a === "services") return b && (serviceIds as readonly string[]).includes(b) ? { zone: b as ServiceId, focus: c ?? null } : { zone: "hub", focus: "services" };
  if (a === "work") return { zone: "work", focus: b ?? null };
  if (a === "studio") return { zone: "studio", focus: null };
  if (a === "about") return { zone: "about", focus: null };
  if (a === "contact") return { zone: "contact", focus: null };
  return { zone: "hub", focus: null };
}

/** Route cha (Esc / nút đóng), giữ nguyên ngôn ngữ: /factory/work/vidi26 → /factory/work → /factory → / */
export function parentRoute(pathname: string): string {
  const lang = localeFromPath(pathname);
  const clean = stripLocale(pathname).replace(/\/+$/, "");
  if (clean === SPACE_BASE) return lang === "en" ? "/" : "/";
  const sub = clean.slice(SPACE_BASE.length + 1).split("/");
  sub.pop();
  return factoryHref(lang, sub.join("/"));
}
