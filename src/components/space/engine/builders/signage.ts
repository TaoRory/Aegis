import { CanvasTexture, Group, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace, Vector3 } from "three";

import { isServiceZone, type ZoneId } from "@/config/space";
import { BACK_WALL, PAVILION_H } from "@/components/space/engine/builders/architecture";
import { fontFamily } from "@/components/space/engine/palette";
import { rooms, type RoomZone } from "@/components/space/plan";
import type { BuildContext, ZoneBuild } from "@/components/space/engine/types";
import { disposeGroup } from "@/components/space/engine/types";

const W = 1024;
const H = 256;

/** Vẽ bảng tên: nhãn mono nhỏ + tên khu cỡ lớn (chữ thật theo ngôn ngữ đang xem, đủ dấu tiếng Việt) */
async function plateTexture(ctx: BuildContext, tag: string, name: string): Promise<CanvasTexture> {
  const sans = fontFamily("--font-brand-sans", "sans-serif");
  const mono = fontFamily("--font-brand-mono", "monospace");
  try {
    await Promise.all([document.fonts.load(`600 92px ${sans}`), document.fonts.load(`500 30px ${mono}`)]);
  } catch {
    /* dùng font dự phòng */
  }
  const c = ctx.palette;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext("2d")!;
  g.fillStyle = `#${c.accentLight.getHexString()}`;
  g.font = `500 30px ${mono}`;
  g.letterSpacing = "6px";
  g.fillText(tag, 8, 52);
  g.letterSpacing = "0px";
  g.fillStyle = `#${c.paper.getHexString()}`;
  let size = 92;
  g.font = `600 ${size}px ${sans}`;
  while (g.measureText(name).width > W - 16 && size > 48) {
    size -= 4;
    g.font = `600 ${size}px ${sans}`;
  }
  g.fillText(name, 4, 168);
  g.fillStyle = `#${c.accent.getHexString()}`;
  g.fillRect(8, 206, 120, 6);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/**
 * Bảng tên cho mọi khu (trừ lõi, đã có hologram): treo trong khung phía sau của khu dịch vụ, hoặc đặt trên đỉnh tường lưng
 * của Gallery/Studio/Cổng. Giúp đọc được cấu trúc xưởng ngay từ tổng quan, như biển chỉ dẫn của một công trình thật.
 */
export function buildSignage(ctx: BuildContext): ZoneBuild {
  const group = new Group();
  const plates: { zone: RoomZone; mesh: Mesh; level: number }[] = [];

  for (const room of rooms) {
    if (room.zone === "about") continue;
    const label = ctx.manifest.zones[room.zone];
    const service = room.zone === "ai" || room.zone === "software" || room.zone === "web" || room.zone === "marketing";
    const width = service ? 3.4 : 3.8;
    const mesh = new Mesh(new PlaneGeometry(width, (width * H) / W), new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
    const back = room.z - room.d / 2;
    if (service) mesh.position.set(room.x - room.w / 2 + 0.4 + width / 2, PAVILION_H - 0.35, back + 0.3);
    else mesh.position.set(room.x - room.w / 2 + 0.3 + width / 2, BACK_WALL + 0.55, back + 0.1);
    mesh.visible = false;
    group.add(mesh);
    plates.push({ zone: room.zone, mesh, level: 0 });
    void plateTexture(ctx, label.tag, label.name).then((texture) => {
      const m = mesh.material as MeshBasicMaterial;
      m.map = texture;
      m.needsUpdate = true;
      mesh.visible = true;
    });
  }

  let active: ZoneId = "hub";
  return {
    group,
    anchors: {} as Record<string, Vector3>,
    pickables: [],
    setState() {},
    setZone(zone) {
      active = zone;
    },
    update(_time, dt) {
      const k = 1 - Math.exp(-dt * 4);
      for (const p of plates) {
        // Chỉ hiện khi nhìn từ trên cao (tổng quan, khu dịch vụ) hoặc ở chính khu đó: ở các khu khác camera đứng gần nên bảng sẽ che vật trưng bày
        const target = active === p.zone ? 1 : active === "hub" ? 0.85 : isServiceZone(active) ? 0.5 : 0;
        p.level += (target - p.level) * k;
        (p.mesh.material as MeshBasicMaterial).opacity = p.mesh.visible ? p.level : 0;
      }
    },
    dispose() {
      disposeGroup(group);
    },
  };
}
