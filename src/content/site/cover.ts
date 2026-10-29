import type { Locale } from "@/config/space";

/**
 * Chữ trên màn chuyển trang "vẽ bản vẽ" (RouteCover). Khẩu hiệu lấy từ tinh thần đã xác nhận của Aegis: Tin cậy · Vững chắc · Đồng hành.
 */
export const coverCopy: Record<Locale, { plotting: string; rev: string; tagline: string }> = {
  vi: { plotting: "Đang vẽ", rev: "Bản 2026", tagline: "Tin cậy · Vững chắc · Đồng hành" },
  en: { plotting: "Plotting", rev: "Rev. 2026", tagline: "Trusted · Solid · Alongside" },
};
