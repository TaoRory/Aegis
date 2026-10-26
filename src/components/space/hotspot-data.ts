import { SPACE_BASE, zones, type ZoneId } from "@/config/space";
import { labItems } from "@/content/lab";
import { projects } from "@/content/projects";
import { templates } from "@/content/templates";

export interface Hotspot {
  /** Khóa trùng với điểm neo 3D của engine */
  id: string;
  href: string;
  label: string;
  /** Nhãn mono nhỏ phía trước (số thứ tự) */
  tag: string;
}

/** Danh sách điểm chạm (kim cương) hiển thị cho khu đang xem. Đều là liên kết thật. */
export function hotspotsFor(zone: ZoneId): Hotspot[] {
  if (zone === "hub") {
    return zones
      .filter((z) => z.id !== "hub")
      .map((z) => ({ id: `zone:${z.id}`, href: z.route, label: z.name, tag: z.index ?? z.sheet }));
  }
  if (zone === "trung-bay") {
    return projects.map((p, i) => ({ id: `project:${p.slug}`, href: `${SPACE_BASE}/trung-bay/${p.slug}`, label: p.name, tag: String(i + 1).padStart(2, "0") }));
  }
  if (zone === "thi-nghiem") {
    return labItems.map((l) => ({ id: `lab:${l.id}`, href: `${SPACE_BASE}/thi-nghiem/${l.id}`, label: l.name, tag: l.index }));
  }
  if (zone === "mau-giao-dien") {
    return templates.map((t, i) => ({ id: `template:${t.slug}`, href: `/mau-giao-dien/${t.slug}`, label: t.name, tag: String(i + 1).padStart(2, "0") }));
  }
  return [];
}

/** Đích điều hướng của một id hotspot (cho thao tác bấm vào vật thể 3D khi không có phần tử DOM tương ứng) */
export function hrefForId(id: string): string | null {
  const [kind, key] = id.split(":");
  if (kind === "zone") return zones.find((z) => z.id === key)?.route ?? null;
  if (kind === "project") return `${SPACE_BASE}/trung-bay/${key}`;
  if (kind === "lab") return `${SPACE_BASE}/thi-nghiem/${key}`;
  if (kind === "template") return `/mau-giao-dien/${key}`;
  return null;
}
