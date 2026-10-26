import { AdditiveBlending, DoubleSide, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, Vector3, type BufferGeometry, type Texture } from "three";

import { boxAt, mergeAll } from "@/components/space/engine/builders/merge";

import { SHOWROOM, showroomX } from "@/components/space/engine/layout";
import { gradientTexture, loadImageTexture, radialTexture } from "@/components/space/engine/textures";
import type { BuildContext, ZoneBuild } from "@/components/space/engine/types";
import { disposeGroup } from "@/components/space/engine/types";

/**
 * Phòng trưng bày: mỗi dự án là một màn hình đứng trên bệ, ảnh trang thật làm texture phát sáng, có halo phía sau
 * và phản chiếu mờ xuống sàn (bản lật đặt dưới mặt sàn bán trong suốt).
 */
export function buildShowroom(ctx: BuildContext): ZoneBuild {
  const { palette, manifest } = ctx;
  const group = new Group();
  const pickables: Mesh[] = [];
  const anchors: Record<string, Vector3> = {};

  const fade = gradientTexture([
    [0, 0],
    [1, 1],
  ]);
  const halo = radialTexture();
  const bodyMat = new MeshStandardMaterial({ color: palette.inkSurface, roughness: 0.6, metalness: 0.4 });
  const bezelMat = new MeshStandardMaterial({ color: palette.ink, roughness: 0.5, metalness: 0.3 });

  interface Item {
    slug: string;
    screen: Mesh;
    reflection: Mesh;
    halo: Mesh;
    bright: number;
    target: number;
    texture: Texture | null;
  }
  // Bệ + trụ và khung viền của cả 7 màn hình gộp thành 2 mesh (thay vì 21)
  const bodyGeos: BufferGeometry[] = [];
  const bezelGeos: BufferGeometry[] = [];
  const standH = SHOWROOM.y - SHOWROOM.h / 2 - 0.08;
  const items: Item[] = manifest.projects.map((project, i) => {
    const x = showroomX(i);
    const unit = new Group();
    unit.position.set(x, 0, SHOWROOM.z);

    bodyGeos.push(boxAt(1.35, 0.08, 0.62, x, 0.04, SHOWROOM.z), boxAt(0.07, standH, 0.07, x, 0.08 + standH / 2, SHOWROOM.z - 0.05));
    bezelGeos.push(boxAt(SHOWROOM.w + 0.1, SHOWROOM.h + 0.1, 0.06, x, SHOWROOM.y, SHOWROOM.z - 0.04));

    const screenMat = new MeshBasicMaterial({ color: palette.inkSurface, toneMapped: false });
    const screen = new Mesh(new PlaneGeometry(SHOWROOM.w, SHOWROOM.h), screenMat);
    screen.position.set(0, SHOWROOM.y, 0.001);
    screen.userData.pick = `project:${project.slug}`;

    const haloMesh = new Mesh(
      new PlaneGeometry(SHOWROOM.w * 1.9, SHOWROOM.h * 2.2),
      new MeshBasicMaterial({ color: palette.accent, alphaMap: halo, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false }),
    );
    haloMesh.position.set(0, SHOWROOM.y, -0.2);

    const reflection = new Mesh(
      new PlaneGeometry(SHOWROOM.w, SHOWROOM.h),
      new MeshBasicMaterial({ color: palette.inkSurface, alphaMap: fade, transparent: true, opacity: 0.3, depthWrite: false, side: DoubleSide, toneMapped: false }),
    );
    reflection.position.set(0, -SHOWROOM.y, 0.001);
    reflection.scale.y = -1;
    reflection.renderOrder = 0;

    unit.add(haloMesh, screen, reflection);
    group.add(unit);
    pickables.push(screen);
    anchors[`project:${project.slug}`] = new Vector3(x, SHOWROOM.y + SHOWROOM.h / 2 + 0.38, SHOWROOM.z + 0.1);
    return { slug: project.slug, screen, reflection, halo: haloMesh, bright: 0.5, target: 0.5, texture: null };
  });

  group.add(new Mesh(mergeAll(bodyGeos), bodyMat), new Mesh(mergeAll(bezelGeos), bezelMat));

  let active = false;
  let focus: string | null = null;
  let hover: string | null = null;
  const recompute = () => {
    for (const item of items) {
      const isFocus = focus === item.slug;
      const isHover = hover === `project:${item.slug}`;
      item.target = !active ? 0.45 : focus ? (isFocus ? 1 : 0.28) : isHover ? 1 : 0.78;
    }
  };
  recompute();

  return {
    group,
    anchors,
    pickables,
    loadCount: items.length,
    setState(a, f) {
      active = a;
      focus = f;
      recompute();
    },
    setHover(id) {
      hover = id;
      recompute();
    },
    update(time, dt) {
      const k = 1 - Math.exp(-dt * 6);
      for (const item of items) {
        item.bright += (item.target - item.bright) * k;
        const sm = item.screen.material as MeshBasicMaterial;
        const rm = item.reflection.material as MeshBasicMaterial;
        if (sm.map) sm.color.setScalar(item.bright);
        else sm.color.copy(palette.inkSurface).multiplyScalar(item.bright);
        if (rm.map) rm.color.setScalar(item.bright);
        else rm.color.copy(palette.inkSurface).multiplyScalar(item.bright);
        const haloOpacity = Math.max(0, (item.bright - 0.45) * 0.45);
        (item.halo.material as MeshBasicMaterial).opacity = haloOpacity;
        item.halo.visible = haloOpacity > 0.01; // không vẽ quầng khi gần như vô hình
        const lift = focus === item.slug ? 1.04 : 1;
        item.screen.scale.setScalar(item.screen.scale.x + (lift - item.screen.scale.x) * k);
      }
      void time;
    },
    async load(onEach) {
      const queue = [...items.keys()];
      const worker = async () => {
        for (let i = queue.shift(); i !== undefined; i = queue.shift()) {
          const item = items[i];
          const texture = await loadImageTexture(manifest.projects[i].cover, ctx.textureWidth, ctx.renderer);
          if (texture) {
            item.texture = texture;
            const screenMat = item.screen.material as MeshBasicMaterial;
            screenMat.map = texture;
            screenMat.color.setScalar(item.bright);
            screenMat.needsUpdate = true;
            const reflMat = item.reflection.material as MeshBasicMaterial;
            reflMat.map = texture;
            reflMat.needsUpdate = true;
          }
          onEach();
        }
      };
      await Promise.all([worker(), worker(), worker()]);
    },
    dispose() {
      disposeGroup(group);
      fade.dispose();
      halo.dispose();
      bodyMat.dispose();
      bezelMat.dispose();
    },
  };
}
