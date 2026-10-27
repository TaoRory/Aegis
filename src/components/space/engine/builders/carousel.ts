import { AdditiveBlending, BoxGeometry, Color, CylinderGeometry, DoubleSide, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, TorusGeometry, Vector3, type BufferGeometry } from "three";

import { mergeAll } from "@/components/space/engine/builders/merge";
import { addSheen, type Sheen } from "@/components/space/engine/builders/sheen";
import { CAROUSEL } from "@/components/space/engine/layout";
import { exposureFor, loadImageTexture } from "@/components/space/engine/textures";
import type { BuildContext, ZoneBuild } from "@/components/space/engine/types";
import { disposeGroup } from "@/components/space/engine/types";

/**
 * Băng chuyền mẫu giao diện: tám khung quanh một trụ xoay chậm, mặt khung quay ra ngoài, mỗi khung tô màu sân khấu của style
 * (lúc chưa có ảnh) rồi hiện ảnh xem trước. Rê chuột vào một khung thì băng chuyền chậm lại để dễ bấm. Ảnh nạp lười.
 */
export function buildCarousel(ctx: BuildContext): ZoneBuild {
  const { palette, manifest } = ctx;
  const group = new Group();
  group.position.set(CAROUSEL.x, 0, CAROUSEL.z);
  const spin = new Group(); // phần xoay
  group.add(spin);
  const pickables: Mesh[] = [];
  const anchors: Record<string, Vector3> = {};

  interface Item {
    slug: string;
    screen: Mesh;
    stage: Color;
    bright: number;
    exposure: number;
    target: number;
    loaded: boolean;
    sheen: Sheen;
    /** Vị trí cục bộ (trong phần xoay) của điểm neo */
    local: Vector3;
  }
  const bezels: BufferGeometry[] = [];
  const n = Math.max(1, manifest.templates.length);
  const items: Item[] = manifest.templates.map((tpl, i) => {
    const phi = (i / n) * Math.PI * 2;
    const lx = Math.sin(phi) * CAROUSEL.r;
    const lz = Math.cos(phi) * CAROUSEL.r;
    const stage = new Color(tpl.stage);

    const bezel = new BoxGeometry(CAROUSEL.w + 0.14, CAROUSEL.h + 0.14, 0.07);
    bezel.rotateY(phi);
    bezel.translate(lx - Math.sin(phi) * 0.045, CAROUSEL.y, lz - Math.cos(phi) * 0.045);
    bezels.push(bezel);

    const screenMat = new MeshBasicMaterial({ color: stage, toneMapped: false });
    const sheen = addSheen(screenMat, i * 0.29);
    const screen = new Mesh(new PlaneGeometry(CAROUSEL.w, CAROUSEL.h), screenMat);
    screen.position.set(lx, CAROUSEL.y, lz);
    screen.rotation.y = phi;
    screen.userData.pick = `template:${tpl.slug}`;
    spin.add(screen);
    pickables.push(screen);

    const local = new Vector3(lx + Math.sin(phi) * 0.25, CAROUSEL.y + CAROUSEL.h / 2 + 0.4, lz + Math.cos(phi) * 0.25);
    anchors[`template:${tpl.slug}`] = new Vector3();
    return { slug: tpl.slug, screen, stage, bright: 0.55, exposure: 1, target: 0.55, loaded: false, sheen, local };
  });
  spin.add(new Mesh(mergeAll(bezels), new MeshStandardMaterial({ color: palette.ink, roughness: 0.5, metalness: 0.5 })));

  // Hai vành sáng: dưới chân và trên đỉnh các khung
  const rimMat = new MeshBasicMaterial({ color: palette.accentLight, transparent: true, opacity: 0.5, blending: AdditiveBlending, depthWrite: false, toneMapped: false });
  const rimLow = new Mesh(new TorusGeometry(CAROUSEL.r + 0.35, 0.025, 6, 96).rotateX(Math.PI / 2).translate(0, 0.3, 0), rimMat);
  const rimHigh = new Mesh(new TorusGeometry(CAROUSEL.r + 0.35, 0.02, 6, 96).rotateX(Math.PI / 2).translate(0, CAROUSEL.y + CAROUSEL.h / 2 + 0.3, 0), rimMat);
  spin.add(rimLow, rimHigh);
  // Chùm sáng đứng từ đỉnh trụ
  const beam = new Mesh(
    new CylinderGeometry(0.42, 0.62, 2.8, 32, 1, true).translate(0, 2.8 + 1.4, 0),
    new MeshBasicMaterial({ color: palette.accentLight, transparent: true, opacity: 0.14, blending: AdditiveBlending, depthWrite: false, side: DoubleSide, toneMapped: false }),
  );
  group.add(beam);

  let active = false;
  let hover: string | null = null;
  let angle = 0;
  let speed = 0.16;
  const recompute = () => {
    for (const item of items) item.target = !active ? 0.45 : hover === `template:${item.slug}` ? 0.95 : 0.7;
  };
  recompute();
  const world = new Vector3();

  return {
    group,
    anchors,
    pickables,
    loadCount: 0,
    setState(a) {
      active = a;
      recompute();
    },
    setHover(id) {
      hover = id;
      recompute();
    },
    update(time, dt) {
      const k = 1 - Math.exp(-dt * 6);
      // chậm lại khi đang rê vào một khung (để bấm cho dễ), nhanh hơn một chút khi đang ở khu này
      const targetSpeed = ctx.reduced ? 0 : hover?.startsWith("template:") ? 0.015 : active ? 0.12 : 0.18;
      speed += (targetSpeed - speed) * (1 - Math.exp(-dt * 3));
      angle += dt * speed;
      spin.rotation.y = angle;
      rimMat.opacity = 0.35 + Math.sin(time * 1.1) * 0.08 + (active ? 0.2 : 0);
      for (const item of items) {
        item.bright += (item.target - item.bright) * k;
        const mat = item.screen.material as MeshBasicMaterial;
        // Chưa có ảnh: giữ màu sân khấu của style (nhân độ sáng), có ảnh: chỉ điều chỉnh độ sáng
        if (item.loaded) mat.color.setScalar(item.bright * item.exposure);
        else mat.color.copy(item.stage).multiplyScalar(0.5 + item.bright * 0.5);
        item.sheen.uniforms.uSheenT.value = time;
        item.sheen.uniforms.uAmt.value = 0.15 * item.exposure * Math.max(0, item.bright - 0.4);
        // điểm neo đi theo khung đang xoay
        world.copy(item.local).applyMatrix4(spin.matrixWorld);
        anchors[`template:${item.slug}`].copy(world);
      }
    },
    async load(onEach) {
      const queue = [...items.keys()];
      const worker = async () => {
        for (let i = queue.shift(); i !== undefined; i = queue.shift()) {
          const item = items[i];
          const texture = await loadImageTexture(manifest.templates[i].cover, ctx.textureWidth, ctx.renderer);
          if (texture) {
            const mat = item.screen.material as MeshBasicMaterial;
            mat.map = texture;
            item.exposure = exposureFor(texture);
            mat.color.setScalar(item.bright * item.exposure);
            mat.needsUpdate = true;
            item.loaded = true;
          }
          onEach();
        }
      };
      await Promise.all([worker(), worker()]);
    },
    dispose() {
      disposeGroup(group);
    },
  };
}
