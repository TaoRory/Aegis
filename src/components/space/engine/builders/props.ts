import {
  AdditiveBlending,
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  PointLight,
  Vector3,
} from "three";

import { boxAt, mergeAll } from "@/components/space/engine/builders/merge";
import { DOOR, JOURNAL } from "@/components/space/engine/layout";
import { gradientTexture, radialTexture } from "@/components/space/engine/textures";
import type { BuildContext, ZoneBuild } from "@/components/space/engine/types";
import { disposeGroup } from "@/components/space/engine/types";

/** Bàn ghi chép: bàn gỗ tối sát tường bắc, cuốn sổ mở, đèn bàn có nón sáng */
export function buildJournal(ctx: BuildContext): ZoneBuild {
  const { palette } = ctx;
  const group = new Group();
  const anchors: Record<string, Vector3> = {};
  const bodyMat = new MeshStandardMaterial({ color: palette.inkSurface, roughness: 0.55, metalness: 0.35 });
  const paperMat = new MeshStandardMaterial({ color: palette.paper.clone().multiplyScalar(0.55), roughness: 0.9, metalness: 0 });

  // Mặt bàn + bốn chân gộp thành một mesh
  const deskGeos = [boxAt(2.2, 0.08, 1.1, JOURNAL.x, 0.78, JOURNAL.z)];
  for (const [lx, lz] of [
    [-1, -0.45],
    [1, -0.45],
    [-1, 0.45],
    [1, 0.45],
  ] as const) {
    deskGeos.push(boxAt(0.07, 0.78, 0.07, JOURNAL.x + lx, 0.39, JOURNAL.z + lz));
  }
  group.add(new Mesh(mergeAll(deskGeos), bodyMat));
  // Cuốn sổ mở: hai trang nghiêng nhẹ hình chữ V
  for (const side of [-1, 1]) {
    const page = new Mesh(new BoxGeometry(0.62, 0.025, 0.85), paperMat);
    page.position.set(JOURNAL.x - 0.15 + side * 0.31, 0.845, JOURNAL.z + 0.05);
    page.rotation.z = -side * 0.06;
    group.add(page);
  }
  // Đèn bàn
  const base = new Mesh(new CylinderGeometry(0.16, 0.18, 0.04, 24), bodyMat);
  base.position.set(JOURNAL.x + 0.85, 0.84, JOURNAL.z - 0.25);
  const arm = new Mesh(new CylinderGeometry(0.014, 0.014, 0.8, 8), bodyMat);
  arm.position.set(JOURNAL.x + 0.85, 1.25, JOURNAL.z - 0.25);
  const shade = new Mesh(new ConeGeometry(0.2, 0.22, 24, 1, true), new MeshStandardMaterial({ color: palette.accent, roughness: 0.5, metalness: 0.3, side: DoubleSide }));
  shade.position.set(JOURNAL.x + 0.7, 1.62, JOURNAL.z - 0.1);
  shade.rotation.z = 0.5;
  const cone = new Mesh(
    new ConeGeometry(0.62, 0.9, 32, 1, true),
    new MeshBasicMaterial({ color: palette.accentLight, transparent: true, opacity: 0.07, blending: AdditiveBlending, depthWrite: false, side: DoubleSide }),
  );
  cone.position.set(JOURNAL.x + 0.42, 1.15, JOURNAL.z + 0.02);
  cone.rotation.z = 0.5;
  cone.rotation.x = 0;
  cone.scale.y = -1;
  const light = new PointLight(palette.accentLight, 0, 6, 2);
  light.position.set(JOURNAL.x + 0.5, 1.4, JOURNAL.z);
  group.add(base, arm, shade, cone, light);

  anchors["journal"] = new Vector3(JOURNAL.x, 1.5, JOURNAL.z);

  let active = false;
  return {
    group,
    anchors,
    pickables: [],
    setState(a) {
      active = a;
    },
    update(_time, dt) {
      const k = 1 - Math.exp(-dt * 4);
      light.intensity += ((active ? 3.5 : 1.2) - light.intensity) * k;
      (cone.material as MeshBasicMaterial).opacity += ((active ? 0.07 : 0.03) - (cone.material as MeshBasicMaterial).opacity) * k;
    },
    dispose() {
      disposeGroup(group);
      bodyMat.dispose();
      paperMat.dispose();
    },
  };
}

/** Cửa ra: khung cửa phát sáng ultramarine dựa tường bắc phòng Liên hệ, ánh sáng loang ra sàn phía trước */
export function buildDoor(ctx: BuildContext): ZoneBuild {
  const { palette } = ctx;
  const group = new Group();
  const anchors: Record<string, Vector3> = {};
  const glowTex = radialTexture();
  const fadeTex = gradientTexture([
    [0, 1],
    [1, 0],
  ]);

  const frameMat = new MeshBasicMaterial({ color: palette.accentLight, toneMapped: false });
  const doorFrame = new Mesh(
    mergeAll([boxAt(0.1, 2.3, 0.2, DOOR.x - 0.85, 1.15, DOOR.z + 0.1), boxAt(0.1, 2.3, 0.2, DOOR.x + 0.85, 1.15, DOOR.z + 0.1), boxAt(1.8, 0.1, 0.2, DOOR.x, 2.3, DOOR.z + 0.1)]),
    frameMat,
  );
  const portal = new Mesh(
    new PlaneGeometry(1.6, 2.25),
    new MeshBasicMaterial({ color: palette.accent, alphaMap: fadeTex, transparent: true, opacity: 0.55, blending: AdditiveBlending, depthWrite: false, toneMapped: false }),
  );
  portal.position.set(DOOR.x, 1.15, DOOR.z + 0.06);
  const floorGlow = new Mesh(
    new PlaneGeometry(3.4, 3.4).rotateX(-Math.PI / 2),
    new MeshBasicMaterial({ color: palette.accent, alphaMap: glowTex, transparent: true, opacity: 0.35, blending: AdditiveBlending, depthWrite: false }),
  );
  floorGlow.position.set(DOOR.x, 0.04, DOOR.z + 1.5);
  group.add(doorFrame, portal, floorGlow);
  anchors["door"] = new Vector3(DOOR.x, 2.9, DOOR.z + 0.1);

  let active = false;
  return {
    group,
    anchors,
    pickables: [],
    setState(a) {
      active = a;
    },
    update(time, dt) {
      const k = 1 - Math.exp(-dt * 4);
      const pulse = 0.5 + Math.sin(time * 1.5) * 0.08;
      const target = (active ? 0.95 : pulse) * 1.0;
      const m = portal.material as MeshBasicMaterial;
      m.opacity += (target - m.opacity) * k;
      (floorGlow.material as MeshBasicMaterial).opacity += ((active ? 0.7 : 0.3) - (floorGlow.material as MeshBasicMaterial).opacity) * k;
    },
    dispose() {
      disposeGroup(group);
      glowTex.dispose();
      fadeTex.dispose();
      frameMat.dispose();
    },
  };
}
