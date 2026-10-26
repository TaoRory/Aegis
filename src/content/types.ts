export type ServiceId = "ai" | "software" | "web" | "marketing";

export interface Service {
  id: ServiceId;
  /** Tên đầy đủ của nhóm dịch vụ */
  title: string;
  /** Tên ngắn, dùng cho đồ họa hero và lựa chọn trong form */
  shortTitle: string;
  summary: string;
  /** Nhu cầu thường gặp của khách hàng */
  needs: string[];
  /** Phạm vi Aegis hỗ trợ */
  scope: string[];
  /** Giá trị thực tế mang lại */
  value: string;
}

export interface Value {
  title: string;
  description: string;
}

export interface ProcessStep {
  title: string;
  description: string;
}

export type ProjectCategory = "business" | "education" | "event";

export interface Project {
  /** Định danh, đồng thời là tên file ảnh preview trong public/portfolio */
  slug: string;
  name: string;
  /** Loại dự án hiển thị trên card */
  type: string;
  category: ProjectCategory;
  /** Nhóm dịch vụ mà dự án là bằng chứng (dùng để nối khu dịch vụ ↔ Gallery) */
  services: ServiceId[];
  description: string;
  /** Chỉ ghi tính năng đã được xác nhận */
  highlights?: string[];
  url: string;
}

export interface PreviewImage {
  src: string;
  width: number;
  height: number;
}

/** Sinh tự động bởi scripts/capture-previews.mjs */
export type ProjectPreviews = Record<string, { cover: PreviewImage; full: PreviewImage }>;
