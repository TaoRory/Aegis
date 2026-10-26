/**
 * Cấu hình "Xưởng Aegis" (phiên bản 2 của website: không gian nhiều phần thay cho trang cuộn dài).
 * Mỗi khu là một route thật dưới SPACE_BASE; engine 3D và bản phẳng đều đọc danh sách này.
 * Chữ hiển thị dài nằm ở src/content/space.ts.
 */

export const SPACE_BASE = "/xuong";

export type ZoneId = "hub" | "trung-bay" | "thi-nghiem" | "mau-giao-dien" | "dich-vu" | "ve-aegis" | "nhat-ky" | "lien-he";

export interface Zone {
  id: ZoneId;
  route: string;
  /** Số thứ tự trên thanh điều hướng; null = không nằm trên thanh (vào qua mặt bằng / liên kết) */
  index: string | null;
  /** Mã tờ bản vẽ hiển thị ở góc trái dưới */
  sheet: string;
  name: string;
  /** Tên ngắn cho thanh điều hướng */
  short: string;
}

export const zones: readonly Zone[] = [
  { id: "hub", route: SPACE_BASE, index: null, sheet: "BV-00", name: "Tổng mặt bằng", short: "Mặt bằng" },
  { id: "trung-bay", route: `${SPACE_BASE}/trung-bay`, index: "01", sheet: "BV-01", name: "Phòng trưng bày", short: "Trưng bày" },
  { id: "thi-nghiem", route: `${SPACE_BASE}/thi-nghiem`, index: "02", sheet: "BV-02", name: "Phòng thí nghiệm", short: "Thí nghiệm" },
  { id: "mau-giao-dien", route: `${SPACE_BASE}/mau-giao-dien`, index: "03", sheet: "BV-03", name: "Kệ mẫu", short: "Kệ mẫu" },
  { id: "dich-vu", route: `${SPACE_BASE}/dich-vu`, index: "04", sheet: "BV-04", name: "Bàn bản vẽ", short: "Dịch vụ" },
  { id: "ve-aegis", route: `${SPACE_BASE}/ve-aegis`, index: "05", sheet: "BV-05", name: "Lõi nền móng", short: "Về Aegis" },
  { id: "lien-he", route: `${SPACE_BASE}/lien-he`, index: "06", sheet: "BV-06", name: "Cửa ra", short: "Liên hệ" },
  { id: "nhat-ky", route: `${SPACE_BASE}/nhat-ky`, index: null, sheet: "BV-07", name: "Bàn ghi chép", short: "Nhật ký" },
] as const;

export const zoneById = Object.fromEntries(zones.map((z) => [z.id, z])) as Record<ZoneId, Zone>;

/** Các khu nằm trên thanh điều hướng dưới đáy */
export const navZones = zones.filter((z) => z.index !== null);

/** Từ pathname suy ra khu đang mở và mục con (slug sản phẩm, id thí nghiệm…) */
export function resolveZone(pathname: string): { zone: ZoneId; focus: string | null } {
  const rest = pathname.replace(/\/+$/, "").slice(SPACE_BASE.length).split("/").filter(Boolean);
  if (rest.length === 0) return { zone: "hub", focus: null };
  const zone = zones.find((z) => z.id !== "hub" && z.route === `${SPACE_BASE}/${rest[0]}`);
  if (!zone) return { zone: "hub", focus: null };
  return { zone: zone.id, focus: rest[1] ?? null };
}

/** Route cha: dùng cho Esc / nút đóng. /xuong/trung-bay/vidi26 → /xuong/trung-bay → /xuong → / */
export function parentRoute(pathname: string): string {
  const clean = pathname.replace(/\/+$/, "");
  if (clean === SPACE_BASE) return "/";
  return clean.slice(0, clean.lastIndexOf("/")) || SPACE_BASE;
}
