import {
  DirectionalLight,
  HemisphereLight,
  MathUtils,
  NeutralToneMapping,
  PCFShadowMap,
  PerspectiveCamera,
  PMREMGenerator,
  Raycaster,
  Scene,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Material,
  type Mesh,
  type MeshBasicMaterial,
  type MeshStandardMaterial,
  type Texture,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

import { loadImageTexture } from "@/components/space/engine/textures";
import { buildMakers, type Makers } from "@/components/showroom/engine/makers";
import { ANCHORS, buildRoom, readRoomPalette, type BuiltRoom, type RoomPalette } from "@/components/showroom/engine/room-build";
import { drawBrowser, drawCampaign, drawMessenger, drawMosaic, drawSplash, drawValues, unflip } from "@/components/showroom/engine/screens";
import type { MakerRole, SectionId } from "@/content/showroom";
import { gsap } from "@/lib/motion";

/**
 * Engine của Studio Aegis (/demo): cảnh Three.js nhỏ, không hậu kỳ.
 *  - Toàn cảnh: người xem ĐỨNG GIỮA PHÒNG, kéo để xoay quanh nhìn 360° (OrbitControls quay quanh chính vị trí camera: đích nhìn
 *    đặt sát camera, tốc độ xoay âm cho cảm giác "quay đầu"); lăn chuột chỉnh góc nhìn (fov). Khu nằm ngoài tầm mắt hiện
 *    mũi tên ở mép màn hình chỉ hướng cần xoay.
 *  - Bấm màn hình / đồ vật / kim cương: camera bay thẳng trước MÀN HÌNH của khu đó, khoảng cách tính để màn hình phủ vùng
 *    nhìn (chừa thanh điều hướng). Tới nơi engine chiếu 4 góc màn hình ra toạ độ trang và ghi vào biến CSS của lớp HTML
 *    (--sx --sy --sw --sh), lớp HTML nằm khít "trong" màn hình. Đang xem một khu thì khoá xoay để lớp HTML luôn khớp.
 *  - Thợ Aegis (makers.ts) đi lại làm việc; rê chuột vào thì vẫy tay và hiện nhãn vai.
 */

type Vec3 = [number, number, number];
interface Rig {
  pos: Vec3;
  target: Vec3;
  fov: number;
}

/** Khoảng cách đích nhìn sát camera: OrbitControls xoay camera quanh điểm này nên gần như xoay tại chỗ */
const LOOK_EPS = 0.01;
/** Rig đứng tại chỗ nhìn theo hướng (yaw 0 = nhìn về vách sau −z, dương = sang phải; pitch dương = ngước lên) */
function lookRig(pos: Vec3, yawDeg: number, pitchDeg: number, fov: number): Rig {
  const yaw = MathUtils.degToRad(yawDeg);
  const pitch = MathUtils.degToRad(pitchDeg);
  const d: Vec3 = [Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)];
  return { pos, target: [pos[0] + d[0] * LOOK_EPS, pos[1] + d[1] * LOOK_EPS, pos[2] + d[2] * LOOK_EPS], fov };
}
const OVERVIEW: Rig = lookRig([0, 1.55, 0.8], 0, -4, 64);
const OVERVIEW_PHONE: Rig = lookRig([0, 1.55, 1.3], 0, -4, 74);
const FOV_RANGE: [number, number] = [46, 80];
const SCREEN_FOV = 30;

export interface RoomEngineOptions {
  phone: boolean;
  reduced: boolean;
  covers: string[];
  emblem: string;
  /** chữ trên màn hình (lấy từ nội dung) */
  text: { sections: Record<SectionId, { index: string; label: string }>; values: string };
  onProgress(p: number): void;
  onReady(): void;
  onPick(id: SectionId): void;
  onHover(id: SectionId | null): void;
  /** camera đã tới trước màn hình của khu */
  onArrive(id: SectionId): void;
  onMakerHover(maker: { role: MakerRole; section: SectionId } | null): void;
}

export class RoomEngine {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera: PerspectiveCamera;
  private controls: OrbitControls;
  private room: BuiltRoom;
  private makers: Makers;
  private palette: RoomPalette;
  private raycaster = new Raycaster();
  private pointer = new Vector2();
  private hotspots = new Map<SectionId, HTMLElement>();
  private screenEl: HTMLElement | null = null;
  private bubbleEl: HTMLElement | null = null;
  private host: HTMLElement;
  private opts: RoomEngineOptions;
  private raf = 0;
  private last = 0;
  private disposed = false;
  private paused = false;
  private focusId: SectionId | null = null;
  private arrived = false;
  /** góc nhìn toàn cảnh trước khi mở một màn hình (đóng lại thì quay về đúng chỗ đang nhìn) */
  private savedLook: Rig | null = null;
  private flight: gsap.core.Timeline | null = null;
  private textures: Texture[] = [];
  private coverImages: HTMLCanvasElement[] = [];
  private emblemImage: HTMLCanvasElement | undefined;
  private coverIndex = 0;
  private coverTimer = 0;
  private hoverId: SectionId | null = null;
  private hoverMaker: number | null = null;
  private downAt: { x: number; y: number } | null = null;
  private tmp = new Vector3();
  private rectKey = "";

  constructor(host: HTMLElement, opts: RoomEngineOptions) {
    this.host = host;
    this.opts = opts;
    this.renderer = new WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, opts.phone ? 1.5 : 1.75));
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = NeutralToneMapping;
    this.renderer.toneMappingExposure = 0.95;
    this.renderer.shadowMap.enabled = !opts.phone;
    this.renderer.shadowMap.type = PCFShadowMap;
    this.renderer.domElement.className = "showroom-canvas";
    host.appendChild(this.renderer.domElement);

    this.palette = readRoomPalette();
    this.scene.background = this.palette.bright.clone();

    // Ánh sáng ban ngày: môi trường phòng (PBR) + trời/đất + nắng xiên có bóng mềm
    const pmrem = new PMREMGenerator(this.renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    this.scene.environment = env;
    this.scene.environmentIntensity = 0.55;
    // trong phòng kín: đất của bán cầu sáng gần bằng trời để vách và trần không xám; thêm đèn bù phía đối diện nắng
    this.scene.add(new HemisphereLight(this.palette.bright, this.palette.bright.clone().lerp(this.palette.grey, 0.3), 1.2));
    const fill = new DirectionalLight(this.palette.bright, 1.1);
    fill.position.set(-3.5, 4, 2.5);
    this.scene.add(fill);
    const sun = new DirectionalLight(this.palette.bright, 2.9);
    sun.position.set(2.5, 8, 4.5);
    sun.target.position.set(0, 0, -0.3);
    sun.castShadow = !opts.phone;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -5;
    sun.shadow.camera.right = 5;
    sun.shadow.camera.top = 5;
    sun.shadow.camera.bottom = -5;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.015;
    sun.shadow.radius = 4;
    this.scene.add(sun, sun.target);

    this.room = buildRoom(this.palette, { phone: opts.phone });
    this.scene.add(this.room.root);
    this.makers = buildMakers(this.palette, { reduced: opts.reduced, shadows: !opts.phone });
    this.scene.add(this.makers.root);
    this.drawIdleScreens();

    const o = opts.phone ? OVERVIEW_PHONE : OVERVIEW;
    this.camera = new PerspectiveCamera(o.fov, 1, 0.05, 80);
    this.camera.position.set(...o.pos);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(...o.target);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = false;
    this.controls.rotateSpeed = -0.4; // âm: kéo sang phải thì cảnh trượt sang phải như khi quay đầu sang trái
    this.controls.enableZoom = false;
    this.applyOverviewLimits();
    this.controls.update();

    this.resize();
    window.addEventListener("resize", this.resize);
    document.addEventListener("visibilitychange", this.onVisibility);
    const el = this.renderer.domElement;
    el.addEventListener("pointermove", this.onPointerMove);
    el.addEventListener("pointerdown", this.onPointerDown);
    el.addEventListener("pointerup", this.onPointerUp);
    el.addEventListener("pointerleave", this.onPointerLeave);
    el.addEventListener("wheel", this.onWheel, { passive: false });

    void this.loadAssets();
    this.raf = requestAnimationFrame(this.tick);
  }

  // ---------- Màn hình ----------
  private drawIdle(id: SectionId) {
    const s = this.room.screens[id];
    const p = this.palette;
    switch (id) {
      case "web":
        drawBrowser(s.canvas, p, this.coverImages[this.coverIndex]);
        break;
      case "projects":
        drawMosaic(s.canvas, p, this.coverImages);
        break;
      case "marketing":
        drawCampaign(s.canvas, p);
        break;
      case "about":
        drawValues(s.canvas, p, this.opts.text.values, this.emblemImage);
        break;
      case "contact":
        drawMessenger(s.canvas, p);
        break;
    }
    s.texture.needsUpdate = true;
  }

  private drawIdleScreens() {
    for (const id of Object.keys(this.room.screens) as SectionId[]) if (id !== this.focusId) this.drawIdle(id);
  }

  private drawSplashFor(id: SectionId) {
    const s = this.room.screens[id];
    const t = this.opts.text.sections[id];
    drawSplash(s.canvas, this.palette, t.index, t.label);
    s.texture.needsUpdate = true;
  }

  // ---------- Tài nguyên ----------
  private async loadAssets() {
    const total = this.opts.covers.length + 1;
    let done = 0;
    const bump = () => this.opts.onProgress(Math.min(1, ++done / total));
    this.opts.onProgress(0.05);
    if (document.fonts?.ready) await document.fonts.ready.catch(() => undefined);
    const emblem = await loadImageTexture(this.opts.emblem, 512, this.renderer);
    if (this.disposed) return;
    if (emblem) {
      const mat = this.room.emblem.material as MeshBasicMaterial;
      mat.map = emblem;
      mat.color.set(0xffffff);
      mat.opacity = 1;
      mat.needsUpdate = true;
      this.textures.push(emblem);
      if (emblem.image) this.emblemImage = unflip(emblem.image as ImageBitmap);
    }
    bump();
    for (let i = 0; i < this.opts.covers.length; i++) {
      const tex = await loadImageTexture(this.opts.covers[i], 640, this.renderer);
      if (this.disposed) return;
      if (tex) {
        this.textures.push(tex);
        const card = this.room.cards[i];
        if (card) {
          const mat = card.material as MeshStandardMaterial;
          mat.map = tex;
          mat.color.set(0xffffff);
          mat.needsUpdate = true;
        }
        if (tex.image) this.coverImages.push(unflip(tex.image as ImageBitmap));
      }
      bump();
    }
    this.drawIdleScreens();
    if (!this.opts.reduced && this.coverImages.length > 1) {
      this.coverTimer = window.setInterval(() => {
        this.coverIndex = (this.coverIndex + 1) % this.coverImages.length;
        if (this.focusId !== "web") this.drawIdle("web");
      }, 3200);
    }
    this.opts.onReady();
  }

  // ---------- Kim cương + nhãn thợ: chiếu điểm 3D xuống DOM ----------
  setHotspots(map: Map<SectionId, HTMLElement>) {
    this.hotspots = map;
  }

  /** Lớp HTML của màn hình đang mở (engine ghi vị trí khung màn hình vào biến CSS) */
  setScreenElement(el: HTMLElement | null) {
    this.screenEl = el;
    this.rectKey = "";
  }

  setBubbleElement(el: HTMLElement | null) {
    this.bubbleEl = el;
  }

  private project(x: number, y: number, z: number) {
    this.tmp.set(x, y, z).project(this.camera);
    return {
      x: (this.tmp.x * 0.5 + 0.5) * this.host.clientWidth,
      y: (-this.tmp.y * 0.5 + 0.5) * this.host.clientHeight,
      behind: this.tmp.z > 1,
    };
  }

  private projectOverlays() {
    const w = this.host.clientWidth;
    const h = this.host.clientHeight;
    const edgeCount = { left: 0, right: 0 };
    for (const [id, el] of this.hotspots) {
      const anchor = ANCHORS[id];
      const cam = this.tmp.set(...anchor).applyMatrix4(this.camera.matrixWorldInverse);
      const behind = cam.z > -0.05;
      const camSide = cam.x < 0 ? "left" : "right";
      const pt = this.project(...anchor);
      let x = pt.x;
      let y = pt.y;
      let edge: "left" | "right" | null = null;
      if (behind) edge = camSide;
      else if (x < 48) edge = "left";
      else if (x > w - 48) edge = "right";
      if (edge) {
        x = edge === "left" ? 44 : w - 44;
        y = h * 0.36 + edgeCount[edge]++ * 56;
      }
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      el.dataset.hidden = this.focusId !== null ? "true" : "false";
      if (edge) el.dataset.edge = edge;
      else delete el.dataset.edge;
    }
    if (this.bubbleEl) {
      if (this.hoverMaker === null || this.focusId) this.bubbleEl.dataset.hidden = "true";
      else {
        const head = this.makers.headPosition(this.hoverMaker, this.tmp);
        const pt = this.project(head.x, head.y, head.z);
        this.bubbleEl.style.transform = `translate3d(${pt.x.toFixed(1)}px, ${pt.y.toFixed(1)}px, 0)`;
        this.bubbleEl.dataset.hidden = "false";
      }
    }
    if (this.screenEl && this.focusId) {
      const r = this.screenRect(this.focusId);
      const key = `${r.x.toFixed(1)},${r.y.toFixed(1)},${r.w.toFixed(1)},${r.h.toFixed(1)}`;
      if (key !== this.rectKey) {
        this.rectKey = key;
        const st = this.screenEl.style;
        st.setProperty("--sx", `${r.x.toFixed(1)}px`);
        st.setProperty("--sy", `${r.y.toFixed(1)}px`);
        st.setProperty("--sw", `${r.w.toFixed(1)}px`);
        st.setProperty("--sh", `${r.h.toFixed(1)}px`);
      }
    }
  }

  /** Khung (px, theo trang) bao 4 góc màn hình của khu */
  screenRect(id: SectionId) {
    const s = this.room.screens[id];
    const { c, n, u } = this.screenBasis(id);
    const r = new Vector3().crossVectors(u, n);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [a, b] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ]) {
      const pt = c.clone().addScaledVector(r, (a * s.w) / 2).addScaledVector(u, (b * s.h) / 2);
      const q = this.project(pt.x, pt.y, pt.z);
      x0 = Math.min(x0, q.x);
      x1 = Math.max(x1, q.x);
      y0 = Math.min(y0, q.y);
      y1 = Math.max(y1, q.y);
    }
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }

  private screenBasis(id: SectionId) {
    const mesh = this.room.screens[id].mesh;
    mesh.updateWorldMatrix(true, false);
    const c = new Vector3().setFromMatrixPosition(mesh.matrixWorld);
    const n = new Vector3(0, 0, 1).transformDirection(mesh.matrixWorld);
    const u = new Vector3(0, 1, 0).transformDirection(mesh.matrixWorld);
    return { c, n, u };
  }

  /** Vùng trang dành cho màn hình (px): chừa thanh điều hướng ở đáy và lề */
  private frameArea() {
    const w = this.host.clientWidth;
    const h = this.host.clientHeight;
    if (this.opts.phone) return { w, h, top: 72, bottom: 92, side: 10 };
    // lề trái/phải đủ rộng để nút logo + menu ở góc trên phải không nằm đè lên màn hình
    return { w, h, top: Math.max(20, h * 0.03), bottom: Math.max(84, h * 0.1), side: Math.max(96, w * 0.065) };
  }

  /** Góc camera nhìn thẳng màn hình, khoảng cách để màn hình vừa khít vùng dành cho nó */
  private screenRig(id: SectionId): Rig {
    const s = this.room.screens[id];
    const { c, n, u } = this.screenBasis(id);
    const a = this.frameArea();
    const availW = a.w - a.side * 2;
    const availH = a.h - a.top - a.bottom;
    const tanV = Math.tan(MathUtils.degToRad(SCREEN_FOV) / 2);
    const tanH = tanV * (a.w / a.h);
    const dW = (s.w * a.w) / (2 * tanH * availW);
    const dH = (s.h * a.h) / (2 * tanV * availH);
    // điện thoại (màn dọc): vừa theo chiều ngang, lớp HTML sẽ giãn ra phủ màn hình
    const d = this.opts.phone ? dW : Math.max(dW, dH);
    const ppm = a.h / (2 * d * tanV);
    const shift = (a.h / 2 - (a.top + availH / 2)) / ppm;
    const target = c.clone().addScaledVector(u, -shift);
    const pos = target.clone().addScaledVector(n, d);
    return { pos: [pos.x, pos.y, pos.z], target: [target.x, target.y, target.z], fov: SCREEN_FOV };
  }

  // ---------- Camera ----------
  private applyOverviewLimits() {
    const c = this.controls;
    c.enabled = true;
    c.enableRotate = true;
    c.enableZoom = false;
    // xoay quanh chính vị trí camera: nhìn xuống tối đa ~35°, ngước lên ~30°, xoay ngang tự do 360°
    c.minDistance = 0;
    c.maxDistance = Infinity;
    c.minAzimuthAngle = -Infinity;
    c.maxAzimuthAngle = Infinity;
    c.minPolarAngle = MathUtils.degToRad(55);
    c.maxPolarAngle = MathUtils.degToRad(120);
  }

  private unlock() {
    const c = this.controls;
    c.minDistance = 0;
    c.maxDistance = Infinity;
    c.minAzimuthAngle = -Infinity;
    c.maxAzimuthAngle = Infinity;
    c.minPolarAngle = 0;
    c.maxPolarAngle = Math.PI;
  }

  focus(id: SectionId | null, instant = false) {
    const prev = this.focusId;
    if (!prev && id) {
      this.savedLook = { pos: this.camera.position.toArray() as Vec3, target: this.controls.target.toArray() as Vec3, fov: this.camera.fov };
    }
    this.focusId = id;
    this.arrived = false;
    this.rectKey = "";
    if (prev && prev !== id) this.drawIdle(prev);
    if (id) this.drawSplashFor(id);
    const rig = id ? this.screenRig(id) : (this.savedLook ?? (this.opts.phone ? OVERVIEW_PHONE : OVERVIEW));
    this.flight?.kill();
    this.unlock();
    // đang xem màn hình: khoá xoay/zoom để lớp HTML luôn khít màn hình
    this.controls.enabled = !id;
    const finish = () => {
      if (id) {
        this.unlock();
        this.controls.enabled = false;
        this.arrived = true;
        this.projectOverlays();
        this.opts.onArrive(id);
      } else this.applyOverviewLimits();
    };
    const c = this.controls;
    if (instant || this.opts.reduced) {
      this.camera.position.set(...rig.pos);
      c.target.set(...rig.target);
      this.camera.fov = rig.fov;
      this.camera.updateProjectionMatrix();
      c.update();
      finish();
      return;
    }
    const camState = { fov: this.camera.fov };
    const duration = id && prev ? 1.15 : 1.35;
    this.flight = gsap
      .timeline({ onComplete: finish })
      .to(this.camera.position, { x: rig.pos[0], y: rig.pos[1], z: rig.pos[2], duration, ease: "power3.inOut" }, 0)
      .to(c.target, { x: rig.target[0], y: rig.target[1], z: rig.target[2], duration, ease: "power3.inOut" }, 0)
      .to(
        camState,
        {
          fov: rig.fov,
          duration,
          ease: "power3.inOut",
          onUpdate: () => {
            this.camera.fov = camState.fov;
            this.camera.updateProjectionMatrix();
          },
        },
        0,
      );
  }

  // ---------- Chuột / chạm ----------
  private setRay(event: PointerEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
  }

  private pickSection(): SectionId | null {
    const hit = this.raycaster.intersectObjects(this.room.pickables, false)[0];
    return (hit?.object.userData.section as SectionId | undefined) ?? null;
  }

  private onPointerMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse" || this.focusId) return;
    this.setRay(event);
    const maker = this.makers.pick(this.raycaster.ray);
    if (maker !== this.hoverMaker) {
      this.hoverMaker = maker;
      this.makers.setHover(maker);
      this.opts.onMakerHover(maker === null ? null : this.makers.info(maker));
    }
    const id = maker !== null ? this.makers.info(maker).section : this.pickSection();
    if (id !== this.hoverId) {
      this.hoverId = id;
      this.opts.onHover(id);
    }
    this.renderer.domElement.style.cursor = id ? "pointer" : "grab";
  };
  private onPointerDown = (event: PointerEvent) => {
    this.downAt = { x: event.clientX, y: event.clientY };
  };
  private onPointerUp = (event: PointerEvent) => {
    const d = this.downAt;
    this.downAt = null;
    if (!d || Math.hypot(event.clientX - d.x, event.clientY - d.y) > 6) return; // vừa kéo xoay, không phải bấm
    this.setRay(event);
    const maker = this.makers.pick(this.raycaster.ray);
    const id = maker !== null ? this.makers.info(maker).section : this.pickSection();
    if (id) this.opts.onPick(id);
  };
  /** Lăn chuột: thu hẹp / mở rộng góc nhìn (như zoom thị kính), chỉ khi đang ở toàn cảnh */
  private onWheel = (event: WheelEvent) => {
    if (this.focusId || this.flight?.isActive()) return;
    event.preventDefault();
    const unit = event.deltaMode === 1 ? 16 : 1;
    this.camera.fov = MathUtils.clamp(this.camera.fov + event.deltaY * unit * 0.03, FOV_RANGE[0], FOV_RANGE[1]);
    this.camera.updateProjectionMatrix();
  };

  private onPointerLeave = () => {
    if (this.hoverId || this.hoverMaker !== null) {
      this.hoverId = null;
      this.hoverMaker = null;
      this.makers.setHover(null);
      this.opts.onHover(null);
      this.opts.onMakerHover(null);
    }
  };

  // ---------- Vòng lặp ----------
  private resize = () => {
    const w = this.host.clientWidth;
    const h = this.host.clientHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
    // đang xem màn hình: tính lại khoảng cách để màn hình vẫn vừa khít
    if (this.focusId && this.arrived) {
      const rig = this.screenRig(this.focusId);
      this.camera.position.set(...rig.pos);
      this.controls.target.set(...rig.target);
      this.controls.update();
      this.rectKey = "";
    }
  };

  private onVisibility = () => {
    this.paused = document.hidden;
    if (!this.paused && !this.raf) {
      this.last = 0;
      this.raf = requestAnimationFrame(this.tick);
    }
  };

  private tick = (now: number) => {
    if (this.disposed || this.paused) {
      this.raf = 0;
      return;
    }
    const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 0.016;
    this.last = now;
    this.controls.update();
    this.makers.update(dt, now / 1000, this.camera.position);
    if (!this.opts.reduced) {
      const pulse = 0.82 + 0.18 * Math.sin(now / 900);
      for (const m of this.room.glows) m.opacity = m.transparent ? 0.55 * pulse : 1;
    }
    this.renderer.render(this.scene, this.camera);
    this.projectOverlays();
    this.raf = requestAnimationFrame(this.tick);
  };

  /** Số lệnh vẽ của khung hình gần nhất (kiểm thử ngân sách) */
  get drawCalls() {
    return this.renderer.info.render.calls;
  }

  /** Kiểm thử: số thợ và vị trí hiện tại */
  get makerState() {
    return { count: this.makers.count, positions: this.makers.positions() };
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.clearInterval(this.coverTimer);
    this.flight?.kill();
    window.removeEventListener("resize", this.resize);
    document.removeEventListener("visibilitychange", this.onVisibility);
    const el = this.renderer.domElement;
    el.removeEventListener("pointermove", this.onPointerMove);
    el.removeEventListener("pointerdown", this.onPointerDown);
    el.removeEventListener("pointerup", this.onPointerUp);
    el.removeEventListener("pointerleave", this.onPointerLeave);
    el.removeEventListener("wheel", this.onWheel);
    this.controls.dispose();
    this.room.dispose();
    this.makers.dispose();
    for (const t of this.textures) t.dispose();
    (this.scene.environment as Texture | null)?.dispose();
    this.scene.traverse((o) => {
      const mesh = o as Mesh;
      if (mesh.isMesh) (mesh.material as Material).dispose();
    });
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    el.remove();
  }
}
