import type { Group, Mesh, Vector3, WebGLRenderer } from "three";

import type { ZoneId } from "@/config/space";
import type { Palette } from "@/components/space/engine/palette";
import type { RoomZone } from "@/components/space/plan";

/** Dữ liệu cảnh do React cung cấp (chuỗi/URL thuần, đã theo ngôn ngữ), để engine không import trực tiếp nội dung */
export interface SceneManifest {
  projects: { slug: string; name: string; cover: string }[];
  templates: { slug: string; name: string; cover: string; stage: string; accent: string }[];
  lab: { id: string; name: string }[];
  /** Nhãn bảng tên của từng khu (theo ngôn ngữ) */
  zones: Record<RoomZone, { name: string; tag: string }>;
}

export interface BuildContext {
  palette: Palette;
  manifest: SceneManifest;
  renderer: WebGLRenderer;
  mobile: boolean;
  reduced: boolean;
  /** Chiều rộng tối đa của texture ảnh (px) */
  textureWidth: number;
}

/** Một khu của cảnh (gallery, studio, khu dịch vụ…) */
export interface ZoneBuild {
  group: Group;
  /** Vị trí thế giới của các điểm chạm; khóa trùng id hotspot (vd "project:vidi26") */
  anchors: Record<string, Vector3>;
  /** Mesh nhận raycast; userData.pick = id hotspot */
  pickables: Mesh[];
  update(time: number, dt: number): void;
  /** active: khu đang được xem; focus: mục con được chọn (slug / id) */
  setState(active: boolean, focus: string | null): void;
  /** Khu đang mở (cho các phần cần biết toàn cảnh: bảng tên, hologram lõi) */
  setZone?(zone: ZoneId): void;
  /** id hotspot đang được rê chuột tới (hoặc null) */
  setHover?(id: string | null): void;
  /** Nạp lười các texture (trả về số texture đã xong qua callback để tính tiến độ) */
  load?(onEach: () => void): Promise<void>;
  /** Số texture cần nạp khi khởi động (để tính tiến độ) */
  loadCount?: number;
  dispose(): void;
}

/** Giải phóng hình học, vật liệu và texture của mọi vật trong group */
export function disposeGroup(group: Group) {
  group.traverse((object) => {
    const mesh = object as Mesh;
    mesh.geometry?.dispose();
    const material = mesh.material;
    const list = Array.isArray(material) ? material : material ? [material] : [];
    for (const m of list) {
      for (const value of Object.values(m)) {
        if (value && typeof value === "object" && "isTexture" in value) (value as { dispose(): void }).dispose();
      }
      m.dispose();
    }
  });
}
