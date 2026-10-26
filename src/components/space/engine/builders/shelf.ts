import { AdditiveBlending, BoxGeometry, Color, DoubleSide, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, Vector3, type BufferGeometry } from "three";

import { boxAt, mergeAll } from "@/components/space/engine/builders/merge";
import { createPools } from "@/components/space/engine/builders/pools";
import { addSheen, type Sheen } from "@/components/space/engine/builders/sheen";

import { SHELF, shelfX, shelfY } from "@/components/space/engine/layout";
import { gradientTexture, loadImageTexture } from "@/components/space/engine/textures";
import type { BuildContext, ZoneBuild } from "@/components/space/engine/types";
import { disposeGroup } from "@/components/space/engine/types";

/**
 * Kệ mẫu: tám khung treo trên tường bắc của phòng (hai hàng bốn). Khung có viền phát sáng theo màu accent của style,
 * lúc chưa có ảnh thì tô màu sân khấu của style (placeholder có nghĩa). Ảnh nạp lười khi khu này được mở hoặc lúc rảnh.
 */
export function buildShelf(ctx: BuildContext): ZoneBuild {
  const { palette, manifest } = ctx;
  const group = new Group();
  const pickables: Mesh[] = [];
  const anchors: Record<string, Vector3> = {};
  const fade = gradientTexture([
    [0, 0],
    [1, 1],
  ]);

  const frameMat = new MeshStandardMaterial({ color: palette.ink, roughness: 0.5, metalness: 0.4 });
  const rail = new Mesh(new BoxGeometry(SHELF.dx * SHELF.cols + 0.4, 0.07, 0.3), new MeshStandardMaterial({ color: palette.inkSurface, roughness: 0.6, metalness: 0.4 }));
  rail.position.set(SHELF.x, 0.07, SHELF.z + 0.15);
  group.add(rail);

  interface Item {
    slug: string;
    screen: Mesh;
    reflection: Mesh;
    glow: Mesh;
    stage: Color;
    bright: number;
    target: number;
    loaded: boolean;
    sheen: Sheen;
  }
  const frameGeos: BufferGeometry[] = [];
  const items: Item[] = manifest.templates.map((tpl, i) => {
    const x = shelfX(i);
    const y = shelfY(i);
    const unit = new Group();
    unit.position.set(x, y, SHELF.z + 0.06);

    frameGeos.push(boxAt(SHELF.w + 0.12, SHELF.h + 0.12, 0.05, x, y, SHELF.z + 0.06));
    const stage = new Color(tpl.stage);
    const screenMat = new MeshBasicMaterial({ color: stage, toneMapped: false });
    const sheen = addSheen(screenMat, i * 0.29);
    const screen = new Mesh(new PlaneGeometry(SHELF.w, SHELF.h), screenMat);
    screen.position.z = 0.03;
    screen.userData.pick = `template:${tpl.slug}`;
    const glow = new Mesh(
      new PlaneGeometry(SHELF.w + 0.16, SHELF.h + 0.16),
      new MeshBasicMaterial({ color: new Color(tpl.accent), transparent: true, opacity: 0.18, blending: AdditiveBlending, depthWrite: false }),
    );
    glow.position.z = 0.012;
    glow.scale.setScalar(1.0);

    // Phản chiếu chỉ cho hàng dưới (sát sàn); hàng trên ẩn (không tốn lệnh vẽ)
    const reflection = new Mesh(
      new PlaneGeometry(SHELF.w, SHELF.h),
      new MeshBasicMaterial({ color: stage, alphaMap: fade, transparent: true, opacity: 0.22, depthWrite: false, side: DoubleSide, toneMapped: false }),
    );
    reflection.position.set(0, -2 * y, 0.03);
    reflection.scale.y = -1;
    reflection.visible = i >= SHELF.cols && !ctx.mobile;

    unit.add(glow, screen, reflection);
    group.add(unit);
    pickables.push(screen);
    anchors[`template:${tpl.slug}`] = new Vector3(x, y + SHELF.h / 2 + 0.28, SHELF.z + 0.15);
    return { slug: tpl.slug, screen, reflection, glow, stage, bright: 0.55, target: 0.55, loaded: false, sheen };
  });

  group.add(new Mesh(mergeAll(frameGeos), frameMat));

  // Ánh sáng từ các khung loang xuống sàn: một vệt cho mỗi cột
  const pools = createPools(
    Array.from({ length: SHELF.cols }, (_, c) => ({ x: shelfX(c), z: SHELF.z + 1.15, w: 2.4, d: 2.2 })),
    palette.accentLight,
  );
  group.add(pools.mesh);

  let active = false;
  let hover: string | null = null;
  const recompute = () => {
    for (const item of items) item.target = !active ? 0.4 : hover === `template:${item.slug}` ? 0.9 : 0.64;
  };
  recompute();

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
      const colGlow = new Array<number>(SHELF.cols).fill(0);
      for (const item of items) {
        item.bright += (item.target - item.bright) * k;
        const screenMat = item.screen.material as MeshBasicMaterial;
        // Chưa có ảnh: giữ màu sân khấu của style (nhân độ sáng), có ảnh: chỉ điều chỉnh độ sáng
        if (item.loaded) screenMat.color.setScalar(item.bright);
        else screenMat.color.copy(item.stage).multiplyScalar(0.5 + item.bright * 0.5);
        const glowOpacity = Math.max(0, (item.bright - 0.82) * 1.6);
        (item.glow.material as MeshBasicMaterial).opacity = glowOpacity;
        item.glow.visible = glowOpacity > 0.01; // quầng viền chỉ vẽ khi khung đang được rê tới
        item.sheen.uniforms.uSheenT.value = time;
        item.sheen.uniforms.uAmt.value = 0.15 * Math.max(0, item.bright - 0.4);
        const col = items.indexOf(item) % SHELF.cols;
        colGlow[col] = Math.max(colGlow[col], item.bright - 0.4);
      }
      colGlow.forEach((v, c) => pools.set(c, v * 0.9));
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
            mat.color.setScalar(item.bright);
            mat.needsUpdate = true;
            const reflMat = item.reflection.material as MeshBasicMaterial;
            reflMat.map = texture;
            reflMat.needsUpdate = true;
            item.loaded = true;
          }
          onEach();
        }
      };
      await Promise.all([worker(), worker()]);
    },
    dispose() {
      disposeGroup(group);
      fade.dispose();
      pools.dispose();
      frameMat.dispose();
    },
  };
}
