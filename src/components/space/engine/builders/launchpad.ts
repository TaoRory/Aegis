import { AdditiveBlending, Group, Mesh, MeshBasicMaterial, PlaneGeometry, RingGeometry, Vector3, type BufferGeometry } from "three";

import { buildFigure } from "@/components/space/engine/builders/figure";
import { boxAt, mergeAll } from "@/components/space/engine/builders/merge";
import { DOOR } from "@/components/space/engine/layout";
import { radialTexture } from "@/components/space/engine/textures";
import type { BuildContext, ZoneBuild } from "@/components/space/engine/types";
import { disposeGroup } from "@/components/space/engine/types";

/**
 * Bệ liên hệ: bệ tròn có hai vành sáng và một xung lan ra, sáu trụ đèn thấp quanh bệ, và một nhân vật lễ tân đứng giữa bệ
 * (chắp tay chờ, vẫy chào khi chuột tìm tới; xem figure.ts).
 */
export function buildLaunchpad(ctx: BuildContext): ZoneBuild {
  const { palette, reduced } = ctx;
  const group = new Group();
  const glowTex = radialTexture();
  const additive = { transparent: true, blending: AdditiveBlending, depthWrite: false } as const;
  const padY = 0.2;

  const figure = buildFigure(palette, reduced);
  figure.group.position.set(DOOR.x, padY, DOOR.z - 0.1);
  figure.group.scale.setScalar(1.7);

  // Vành sáng trên bệ + xung lan ra
  const ringA = new Mesh(new RingGeometry(DOOR.r - 0.3, DOOR.r - 0.24, 96).rotateX(-Math.PI / 2), new MeshBasicMaterial({ color: palette.accentLight, opacity: 0.6, ...additive }));
  ringA.position.set(DOOR.x, padY + 0.01, DOOR.z);
  const ringB = new Mesh(new RingGeometry(1.4, 1.45, 96).rotateX(-Math.PI / 2), new MeshBasicMaterial({ color: palette.accentPale, opacity: 0.4, ...additive }));
  ringB.position.set(DOOR.x, padY + 0.01, DOOR.z);
  const pulse = new Mesh(new RingGeometry(0.98, 1.0, 96).rotateX(-Math.PI / 2), new MeshBasicMaterial({ color: palette.accentLight, opacity: 0, ...additive }));
  pulse.position.set(DOOR.x, padY + 0.02, DOOR.z);
  const floorGlow = new Mesh(new PlaneGeometry(DOOR.r * 2.2, DOOR.r * 2.2).rotateX(-Math.PI / 2), new MeshBasicMaterial({ color: palette.accent, alphaMap: glowTex, opacity: 0.35, ...additive }));
  floorGlow.position.set(DOOR.x, padY + 0.02, DOOR.z);

  // Sáu trụ đèn thấp quanh bệ (chừa phía cửa)
  const posts: BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 2 + 0.7 + (i * (Math.PI * 2 - 1.4)) / 5; // chừa khoảng trống phía cửa (hướng +z)
    posts.push(boxAt(0.1, 0.55, 0.1, DOOR.x + Math.cos(a) * (DOOR.r - 0.12), padY + 0.28, DOOR.z + Math.sin(a) * (DOOR.r - 0.12)));
  }
  const postMesh = new Mesh(mergeAll(posts), new MeshBasicMaterial({ color: palette.accentLight, toneMapped: false }));

  group.add(ringA, ringB, pulse, floorGlow, postMesh, figure.group);

  let active = false;
  return {
    group,
    anchors: {} as Record<string, Vector3>,
    pickables: [figure.hit],
    setState(a) {
      active = a;
      figure.setActive(a);
    },
    setHover(id) {
      figure.setHover(id);
    },
    setPointer(ray, viewer) {
      figure.setRay(ray, viewer);
    },
    onIntroDone() {
      figure.greet();
    },
    update(time, dt) {
      const k = 1 - Math.exp(-dt * 4);
      (floorGlow.material as MeshBasicMaterial).opacity += ((active ? 0.7 : 0.3) - (floorGlow.material as MeshBasicMaterial).opacity) * k;
      // xung chạy từ tâm bệ ra mép, nhanh hơn khi đang xem khu này
      const wave = (time * (active ? 0.7 : 0.35)) % 1;
      pulse.scale.setScalar(1 + wave * (DOOR.r - 1.1));
      (pulse.material as MeshBasicMaterial).opacity = (1 - wave) * (active ? 0.7 : 0.35);
      ringB.rotation.y = time * 0.3;
      figure.pose(time, dt);
    },
    dispose() {
      disposeGroup(group);
      glowTex.dispose();
    },
  };
}
