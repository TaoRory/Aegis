import { AdditiveBlending, BoxGeometry, DoubleSide, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, Vector3, type BufferGeometry, type Texture } from "three";

import { mergeAll } from "@/components/space/engine/builders/merge";
import { createPools } from "@/components/space/engine/builders/pools";
import { addSheen, type Sheen } from "@/components/space/engine/builders/sheen";
import { hallSlot, SHOWROOM, type Slot } from "@/components/space/engine/layout";
import { exposureFor, gradientTexture, loadImageTexture } from "@/components/space/engine/textures";
import type { BuildContext, ZoneBuild } from "@/components/space/engine/types";
import { disposeGroup } from "@/components/space/engine/types";

/** Hộp đặt theo toạ độ cục bộ (lx, ly, lz) của một ô trên cung, đã xoay theo hướng của ô, gộp được vào một mesh */
function placedBox(w: number, h: number, d: number, lx: number, ly: number, lz: number, slot: Slot): BufferGeometry {
  const g = new BoxGeometry(w, h, d);
  g.rotateY(slot.yaw);
  const c = Math.cos(slot.yaw);
  const s = Math.sin(slot.yaw);
  g.translate(slot.x + c * lx + s * lz, ly, slot.z - s * lx + c * lz);
  return g;
}

/**
 * Sảnh dự án: bảy màn hình xếp trên một cung quanh lõi, quay mặt vào tâm. Mỗi màn đứng trên bệ riêng, có dải đèn đứng phía sau
 * (như tủ kính trưng bày), ảnh trang thật làm texture phát sáng, vệt sáng loang xuống sàn trước mặt và phản chiếu mờ.
 */
export function buildHall(ctx: BuildContext): ZoneBuild {
  const { palette, manifest } = ctx;
  const group = new Group();
  const pickables: Mesh[] = [];
  const anchors: Record<string, Vector3> = {};

  const fade = gradientTexture([
    [0, 0],
    [1, 1],
  ]);
  const bodyMat = new MeshStandardMaterial({ color: palette.inkSurface, roughness: 0.55, metalness: 0.5 });
  const bezelMat = new MeshStandardMaterial({ color: palette.ink, roughness: 0.5, metalness: 0.3 });

  interface Item {
    slug: string;
    screen: Mesh;
    reflection: Mesh;
    bright: number;
    /** Hệ số chống cháy sáng theo ảnh bìa (1 = ảnh tối, giữ nguyên) */
    exposure: number;
    target: number;
    texture: Texture | null;
    sheen: Sheen;
  }
  const bodyGeos: BufferGeometry[] = [];
  const bezelGeos: BufferGeometry[] = [];
  const backGeos: BufferGeometry[] = [];
  const standH = SHOWROOM.y - SHOWROOM.h / 2 - 0.08;
  const slots = manifest.projects.map((_, i) => hallSlot(i));
  const items: Item[] = manifest.projects.map((project, i) => {
    const slot = slots[i];
    const unit = new Group();
    unit.position.set(slot.x, 0, slot.z);
    unit.rotation.y = slot.yaw;

    bodyGeos.push(placedBox(1.5, 0.1, 0.7, 0, 0.05, 0, slot), placedBox(0.07, standH, 0.07, 0, 0.1 + standH / 2, -0.05, slot));
    bezelGeos.push(placedBox(SHOWROOM.w + 0.1, SHOWROOM.h + 0.1, 0.06, 0, SHOWROOM.y, -0.04, slot));
    // dải đèn đứng phía sau màn hình
    const back = new PlaneGeometry(SHOWROOM.w + 0.9, 3.0);
    back.rotateY(slot.yaw);
    back.translate(slot.x - Math.sin(slot.yaw) * 0 + Math.sin(slot.yaw) * -0.45, 1.5, slot.z + Math.cos(slot.yaw) * -0.45);
    backGeos.push(back);

    const screenMat = new MeshBasicMaterial({ color: palette.inkSurface, toneMapped: false });
    const sheen = addSheen(screenMat, i * 0.37);
    const screen = new Mesh(new PlaneGeometry(SHOWROOM.w, SHOWROOM.h), screenMat);
    screen.position.set(0, SHOWROOM.y, 0.001);
    screen.userData.pick = `project:${project.slug}`;

    const reflection = new Mesh(
      new PlaneGeometry(SHOWROOM.w, SHOWROOM.h),
      new MeshBasicMaterial({ color: palette.inkSurface, alphaMap: fade, transparent: true, opacity: 0.3, depthWrite: false, side: DoubleSide, toneMapped: false }),
    );
    reflection.position.set(0, -SHOWROOM.y, 0.001);
    reflection.scale.y = -1;
    reflection.renderOrder = 0;
    reflection.visible = !ctx.mobile; // điện thoại: bỏ phản chiếu sàn để giữ ngân sách lệnh vẽ

    unit.add(screen, reflection);
    group.add(unit);
    pickables.push(screen);
    anchors[`project:${project.slug}`] = new Vector3(slot.x + Math.sin(slot.yaw) * 0.1, SHOWROOM.y + SHOWROOM.h / 2 + 0.4, slot.z + Math.cos(slot.yaw) * 0.1);
    return { slug: project.slug, screen, reflection, bright: 0.5, exposure: 1, target: 0.5, texture: null, sheen };
  });

  group.add(new Mesh(mergeAll(bodyGeos), bodyMat), new Mesh(mergeAll(bezelGeos), bezelMat));
  const backlights = new Mesh(
    mergeAll(backGeos),
    new MeshBasicMaterial({ color: palette.accent, alphaMap: fade, transparent: true, opacity: 0.16, blending: AdditiveBlending, depthWrite: false, side: DoubleSide, toneMapped: false }),
  );
  group.add(backlights);

  // Ánh sáng từ màn hình loang xuống sàn trước mặt
  const pools = createPools(
    slots.map((s) => ({ x: s.x + s.nx * 1.1, z: s.z + s.nz * 1.1, w: 2.7, d: 2.4, yaw: s.yaw })),
    palette.accentLight,
  );
  group.add(pools.mesh);

  let active = false;
  let focus: string | null = null;
  let hover: string | null = null;
  const recompute = () => {
    for (const item of items) {
      const isFocus = focus === item.slug;
      const isHover = hover === `project:${item.slug}`;
      item.target = !active ? 0.5 : focus ? (isFocus ? 1 : 0.3) : isHover ? 1 : 0.8;
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
      (backlights.material as MeshBasicMaterial).opacity = 0.1 + (active ? 0.1 : 0.04) + Math.sin(time * 0.8) * 0.015;
      for (const item of items) {
        item.bright += (item.target - item.bright) * k;
        const sm = item.screen.material as MeshBasicMaterial;
        const rm = item.reflection.material as MeshBasicMaterial;
        if (sm.map) sm.color.setScalar(item.bright * item.exposure);
        else sm.color.copy(palette.inkSurface).multiplyScalar(item.bright);
        if (rm.map) rm.color.setScalar(item.bright * item.exposure);
        else rm.color.copy(palette.inkSurface).multiplyScalar(item.bright);
        item.sheen.uniforms.uSheenT.value = time;
        item.sheen.uniforms.uAmt.value = 0.15 * item.exposure * Math.max(0, item.bright - 0.4);
        pools.set(items.indexOf(item), (item.bright - 0.4) * 1.1);
        const lift = focus === item.slug ? 1.04 : 1;
        item.screen.scale.setScalar(item.screen.scale.x + (lift - item.screen.scale.x) * k);
      }
    },
    async load(onEach) {
      const queue = [...items.keys()];
      const worker = async () => {
        for (let i = queue.shift(); i !== undefined; i = queue.shift()) {
          const item = items[i];
          const texture = await loadImageTexture(manifest.projects[i].cover, ctx.textureWidth, ctx.renderer);
          if (texture) {
            item.texture = texture;
            item.exposure = exposureFor(texture);
            const screenMat = item.screen.material as MeshBasicMaterial;
            screenMat.map = texture;
            screenMat.color.setScalar(item.bright * item.exposure);
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
      pools.dispose();
      bodyMat.dispose();
      bezelMat.dispose();
    },
  };
}
