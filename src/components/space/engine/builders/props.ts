import {
  AdditiveBlending,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Vector3,
} from "three";

import { boxAt, mergeAll } from "@/components/space/engine/builders/merge";
import { DOOR } from "@/components/space/engine/layout";
import { gradientTexture, radialTexture } from "@/components/space/engine/textures";
import type { BuildContext, ZoneBuild } from "@/components/space/engine/types";
import { disposeGroup } from "@/components/space/engine/types";

/** Cổng liên hệ: khung cửa phát sáng ultramarine dựa tường lưng của khu Gate, ánh sáng loang ra sàn phía trước */
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
