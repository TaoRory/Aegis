import { BoxGeometry, BufferGeometry } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

/** Hộp đã dịch tới vị trí thế giới, để gộp nhiều hộp cùng vật liệu thành MỘT mesh (tiết kiệm lệnh vẽ) */
export function boxAt(w: number, h: number, d: number, x: number, y: number, z: number): BufferGeometry {
  const g = new BoxGeometry(w, h, d);
  g.translate(x, y, z);
  return g;
}

/** Gộp danh sách hình học (cùng thuộc tính, cùng có/không chỉ mục) rồi giải phóng bản gốc */
export function mergeAll(list: BufferGeometry[]): BufferGeometry {
  const merged = mergeGeometries(list, false);
  for (const g of list) g.dispose();
  return merged;
}
