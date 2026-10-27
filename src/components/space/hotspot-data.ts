import { serviceHref } from "@/config/routes";
import { factoryHref, isServiceZone, servicesWithDemo, zonesFor, type Locale, type Variant, type ZoneId } from "@/config/space";
import type { FactoryUi } from "@/content/factory/types";
import { projects } from "@/content/projects";
import { templates } from "@/content/templates";

export interface Hotspot {
  /** Khóa trùng với điểm neo 3D của engine */
  id: string;
  href: string;
  label: string;
  /** Nhãn mono nhỏ phía trước (loại khu, hoặc số thứ tự trong một danh sách) */
  tag: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Danh sách điểm chạm (kim cương) hiển thị cho khu đang xem. Đều là liên kết thật.
 * Bốn khu dịch vụ không đánh số: nhãn là loại khu ("DỊCH VỤ"), không phải thứ tự.
 */
export function hotspotsFor(zone: ZoneId, lang: Locale, ui: FactoryUi, variant: Variant): Hotspot[] {
  const href = (sub: string) => factoryHref(lang, sub, variant);
  if (zone === "hub") {
    return zonesFor(variant).filter((z) => z.id !== "hub").map((z) => ({ id: `zone:${z.id}`, href: href(z.path), label: ui.zones[z.id].name, tag: ui.zones[z.id].tag }));
  }
  if (isServiceZone(zone)) {
    const primary = servicesWithDemo.includes(zone)
      ? { id: `demo:${zone}`, href: href(`services/${zone}/demo`), label: ui.hotspotLabels.demo, tag: "" }
      : variant === "web"
        ? { id: `proof:${zone}`, href: href("work"), label: ui.hotspotLabels.proof, tag: "" }
        : { id: `proof:${zone}`, href: serviceHref(lang, zone), label: ui.hotspotLabels.page, tag: "" };
    return [primary, { id: `start:${zone}`, href: `${href("contact")}?dv=${zone}`, label: ui.hotspotLabels.start, tag: "" }];
  }
  if (zone === "work") {
    return projects.map((p, i) => ({ id: `project:${p.slug}`, href: href(`work/${p.slug}`), label: p.name, tag: pad(i + 1) }));
  }
  if (zone === "studio") {
    return templates.map((t, i) => ({ id: `template:${t.slug}`, href: `/mau-giao-dien/${t.slug}`, label: t.name, tag: pad(i + 1) }));
  }
  return [];
}

/** Đích điều hướng của một id hotspot (cho thao tác bấm vào vật thể 3D khi không có phần tử DOM tương ứng) */
export function hrefForId(id: string, lang: Locale, variant: Variant): string | null {
  const [kind, key] = id.split(":");
  const href = (sub: string) => factoryHref(lang, sub, variant);
  if (kind === "zone") {
    const zone = zonesFor(variant).find((z) => z.id === key);
    return zone ? href(zone.path) : null;
  }
  if (kind === "demo") return href(`services/${key}/demo`);
  if (kind === "proof") return variant === "web" ? href("work") : serviceHref(lang, key);
  if (kind === "start") return `${href("contact")}?dv=${key}`;
  if (kind === "project") return href(`work/${key}`);
  if (kind === "template") return `/mau-giao-dien/${key}`;
  return null;
}
