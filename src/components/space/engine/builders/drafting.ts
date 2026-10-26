import { BoxGeometry, CanvasTexture, DoubleSide, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, SRGBColorSpace, Vector3, type BufferGeometry } from "three";

import { boxAt, mergeAll } from "@/components/space/engine/builders/merge";
import { DRAFT } from "@/components/space/engine/layout";
import { fontFamily } from "@/components/space/engine/palette";
import type { BuildContext, ZoneBuild } from "@/components/space/engine/types";
import { disposeGroup } from "@/components/space/engine/types";

/** Vẽ một "tờ bản vẽ" dịch vụ lên canvas: nền mực, lưới ultramarine, mã tờ và tên dịch vụ (chữ thật, đủ dấu tiếng Việt) */
async function sheetTexture(ctx: BuildContext, index: number, title: string): Promise<CanvasTexture> {
  const sans = fontFamily("--font-brand-sans", "sans-serif");
  const mono = fontFamily("--font-brand-mono", "monospace");
  try {
    await Promise.all([document.fonts.load(`600 44px ${sans}`), document.fonts.load(`500 22px ${mono}`)]);
  } catch {
    /* dùng font dự phòng */
  }
  const c = ctx.palette;
  const w = 768;
  const h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext("2d")!;
  g.fillStyle = `#${c.ink.getHexString()}`;
  g.fillRect(0, 0, w, h);
  g.strokeStyle = `#${c.accent.getHexString()}`;
  g.globalAlpha = 0.35;
  g.lineWidth = 1;
  for (let x = 0; x <= w; x += 32) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, h);
    g.stroke();
  }
  for (let y = 0; y <= h; y += 32) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(w, y);
    g.stroke();
  }
  g.globalAlpha = 1;
  g.strokeStyle = `#${c.accentLight.getHexString()}`;
  g.lineWidth = 3;
  g.strokeRect(20, 20, w - 40, h - 40);
  // sơ đồ minh họa đơn giản theo chỉ số (không mang dữ liệu)
  g.lineWidth = 2;
  g.beginPath();
  if (index === 0) {
    for (let k = 0; k < 3; k++) {
      for (let m = 0; m < 3; m++) {
        g.moveTo(480 + k * 90 + 12, 150 + m * 70);
        g.arc(480 + k * 90, 150 + m * 70, 12, 0, Math.PI * 2);
      }
    }
  } else if (index === 1) {
    for (let k = 0; k < 3; k++) for (let m = 0; m < 3; m++) g.rect(440 + k * 90, 110 + m * 70, 70, 50);
  } else if (index === 2) {
    g.rect(420, 110, 270, 190);
    g.moveTo(420, 140);
    g.lineTo(690, 140);
  } else {
    for (let k = 1; k <= 4; k++) {
      g.moveTo(560 + k * 28, 210);
      g.arc(560, 210, k * 28, 0, Math.PI * 2);
    }
  }
  g.stroke();
  g.fillStyle = `#${c.accentLight.getHexString()}`;
  g.font = `500 22px ${mono}`;
  g.fillText(`BV-04.${index + 1}`, 48, 70);
  g.fillStyle = `#${c.paper.getHexString()}`;
  g.font = `600 46px ${sans}`;
  g.fillText(title, 48, h - 64);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/**
 * Bàn bản vẽ: bàn vẽ kỹ thuật nghiêng (cạnh bắc cao hơn) với bốn tờ bản vẽ dịch vụ xếp 2 × 2.
 * Tờ đang xem sáng lên; chữ trên tờ là tên dịch vụ thật từ nội dung.
 */
export function buildDrafting(ctx: BuildContext): ZoneBuild {
  const { palette, manifest } = ctx;
  const group = new Group();
  const anchors: Record<string, Vector3> = {};
  const bodyMat = new MeshStandardMaterial({ color: palette.inkSurface, roughness: 0.6, metalness: 0.4 });

  const table = new Group();
  table.position.set(DRAFT.x, DRAFT.topY, DRAFT.z);
  table.rotation.x = 0.2;
  const top = new Mesh(new BoxGeometry(3.7, 0.07, 2.5), bodyMat);
  const rim = new Mesh(new BoxGeometry(3.78, 0.02, 2.58), new MeshBasicMaterial({ color: palette.accentLight, transparent: true, opacity: 0.4 }));
  rim.position.y = 0.04;
  table.add(top, rim);
  group.add(table);
  const legGeos: BufferGeometry[] = [];
  for (const [lx, lz] of [
    [-1.7, -1.05],
    [1.7, -1.05],
    [-1.7, 1.15],
    [1.7, 1.15],
  ] as const) {
    const legH = DRAFT.topY + (lz < 0 ? 0.2 : -0.2);
    legGeos.push(boxAt(0.08, legH, 0.08, DRAFT.x + lx, legH / 2, DRAFT.z + lz));
  }
  group.add(new Mesh(mergeAll(legGeos), bodyMat));

  interface Sheet {
    id: string;
    mesh: Mesh;
    bright: number;
    target: number;
  }
  const sheets: Sheet[] = manifest.services.map((service, i) => {
    const mat = new MeshBasicMaterial({ color: palette.inkSurface.clone(), side: DoubleSide, toneMapped: false });
    const mesh = new Mesh(new PlaneGeometry(1.6, 1.07), mat);
    const col = i % 2;
    const row = Math.floor(i / 2);
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = (i % 2 ? 1 : -1) * 0.05;
    mesh.position.set((col - 0.5) * 1.75, 0.05, (row - 0.5) * 1.2);
    table.add(mesh);
    return { id: service.id, mesh, bright: 0.4, target: 0.7 };
  });

  let active = false;
  void (async () => {
    for (let i = 0; i < manifest.services.length; i++) {
      const texture = await sheetTexture(ctx, i, manifest.services[i].shortTitle);
      const mat = sheets[i].mesh.material as MeshBasicMaterial;
      mat.map = texture;
      mat.color.setScalar(sheets[i].bright);
      mat.needsUpdate = true;
    }
  })();

  return {
    group,
    anchors,
    pickables: [],
    setState(a) {
      active = a;
      for (const s of sheets) s.target = a ? 1 : 0.55;
    },
    update(time, dt) {
      const k = 1 - Math.exp(-dt * 5);
      sheets.forEach((s, i) => {
        s.bright += (s.target - s.bright) * k;
        const mat = s.mesh.material as MeshBasicMaterial;
        if (mat.map) mat.color.setScalar(s.bright);
        else mat.color.copy(palette.inkSurface).multiplyScalar(s.bright);
        s.mesh.position.y = 0.05 + (active ? Math.sin(time * 1.2 + i * 1.3) * 0.012 + 0.015 : 0);
      });
    },
    dispose() {
      disposeGroup(group);
      bodyMat.dispose();
    },
  };
}
