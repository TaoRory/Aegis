import {
  NeutralToneMapping,
  DirectionalLight,
  HemisphereLight,
  MathUtils,
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
import { ANCHORS, buildRoom, drawScreenShot, readRoomPalette, type BuiltRoom, type RoomPalette } from "@/components/showroom/engine/room-build";
import type { SectionId } from "@/content/showroom";
import { gsap } from "@/lib/motion";

/**
 * Engine của Studio Aegis (/demo): một cảnh Three.js nhỏ, không hậu kỳ. Kéo để nhìn quanh (OrbitControls giới hạn góc),
 * bấm vật thể hoặc kim cương thì camera bay tới góc nhìn của khu đó; khung nội dung che một phần màn hình thì khung hình
 * được dịch (setViewOffset) để vật thể vẫn nằm giữa phần còn trống.
 */

type Vec3 = [number, number, number];
interface Rig {
  pos: Vec3;
  target: Vec3;
  fov: number;
}

const OVERVIEW: Rig = { pos: [5.5, 3.25, 5.1], target: [0.0, 1.1, -1.45], fov: 42 };
const OVERVIEW_PHONE: Rig = { pos: [5.8, 3.9, 6.6], target: [-0.3, 1.1, -1.4], fov: 54 };
const RIGS: Record<SectionId, Rig> = {
  web: { pos: [-0.75, 1.55, -0.95], target: [-1.6, 1.15, -3.1], fov: 40 },
  projects: { pos: [2.75, 1.85, -0.95], target: [3.0, 1.72, -3.45], fov: 40 },
  marketing: { pos: [-1.65, 1.5, 1.7], target: [-3.65, 0.95, 0.85], fov: 40 },
  about: { pos: [-1.35, 2.05, -0.15], target: [-3.95, 2.15, -1.2], fov: 40 },
  contact: { pos: [-0.25, 1.32, -1.75], target: [-0.62, 0.88, -2.62], fov: 36 },
};

export interface RoomEngineOptions {
  phone: boolean;
  reduced: boolean;
  covers: string[];
  emblem: string;
  onProgress(p: number): void;
  onReady(): void;
  onPick(id: SectionId): void;
  onHover(id: SectionId | null): void;
}

export class RoomEngine {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera: PerspectiveCamera;
  private controls: OrbitControls;
  private room: BuiltRoom;
  private palette: RoomPalette;
  private raycaster = new Raycaster();
  private pointer = new Vector2();
  private hotspots = new Map<SectionId, HTMLElement>();
  private host: HTMLElement;
  private opts: RoomEngineOptions;
  private raf = 0;
  private disposed = false;
  private paused = false;
  private focusId: SectionId | null = null;
  private inset = { right: 0, bottom: 0 };
  private flight: gsap.core.Timeline | null = null;
  private covers: Texture[] = [];
  private coverImages: ImageBitmap[] = [];
  private coverIndex = 0;
  private coverTimer = 0;
  private hoverId: SectionId | null = null;
  private downAt: { x: number; y: number } | null = null;
  private tmp = new Vector3();

  constructor(host: HTMLElement, opts: RoomEngineOptions) {
    this.host = host;
    this.opts = opts;
    this.renderer = new WebGLRenderer({ antialias: !opts.phone, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, opts.phone ? 1.5 : 2));
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = NeutralToneMapping;
    this.renderer.toneMappingExposure = 0.92;
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
    this.scene.environmentIntensity = 0.6;
    this.scene.add(new HemisphereLight(this.palette.bright, this.palette.grey, 1.1));
    const sun = new DirectionalLight(this.palette.bright, 2.2);
    sun.position.set(4.5, 7.5, 5.5);
    sun.target.position.set(-0.5, 0, -1.5);
    sun.castShadow = !opts.phone;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -6;
    sun.shadow.camera.right = 6;
    sun.shadow.camera.top = 6;
    sun.shadow.camera.bottom = -6;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.02;
    sun.shadow.radius = 4;
    this.scene.add(sun, sun.target);

    this.room = buildRoom(this.palette, { phone: opts.phone });
    this.scene.add(this.room.root);

    const o = opts.phone ? OVERVIEW_PHONE : OVERVIEW;
    this.camera = new PerspectiveCamera(o.fov, 1, 0.1, 60);
    this.camera.position.set(...o.pos);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(...o.target);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = false;
    this.controls.rotateSpeed = 0.55;
    this.controls.zoomSpeed = 0.6;
    this.applyLimits(null);
    this.controls.update();

    this.resize();
    window.addEventListener("resize", this.resize);
    document.addEventListener("visibilitychange", this.onVisibility);
    const el = this.renderer.domElement;
    el.addEventListener("pointermove", this.onPointerMove);
    el.addEventListener("pointerdown", this.onPointerDown);
    el.addEventListener("pointerup", this.onPointerUp);
    el.addEventListener("pointerleave", this.onPointerLeave);

    void this.loadAssets();
    this.raf = requestAnimationFrame(this.tick);
  }

  // ---------- Tài nguyên ----------
  private async loadAssets() {
    const total = this.opts.covers.length + 1;
    let done = 0;
    const bump = () => this.opts.onProgress(Math.min(1, ++done / total));
    this.opts.onProgress(0.05);
    const emblem = await loadImageTexture(this.opts.emblem, 512, this.renderer);
    if (this.disposed) return;
    if (emblem) {
      emblem.flipY = false;
      const mat = this.room.emblem.material as MeshBasicMaterial;
      mat.map = emblem;
      mat.color.set(0xffffff);
      mat.opacity = 1;
      mat.needsUpdate = true;
      this.covers.push(emblem);
    }
    bump();
    // ảnh dự án: thẻ trên bảng ghim + màn hình máy tính
    for (let i = 0; i < this.opts.covers.length; i++) {
      const url = this.opts.covers[i];
      const tex = await loadImageTexture(url, 640, this.renderer);
      if (this.disposed) return;
      if (tex) {
        this.covers.push(tex);
        const card = this.room.cards[i];
        if (card) {
          const mat = card.material as MeshStandardMaterial;
          mat.map = tex;
          mat.color.set(0xffffff);
          mat.needsUpdate = true;
        }
        if (tex.image) this.coverImages.push(tex.image as ImageBitmap);
        if (this.coverImages.length === 1) this.showCover(0);
      }
      bump();
    }
    if (!this.opts.reduced && this.coverImages.length > 1) {
      this.coverTimer = window.setInterval(() => this.showCover(this.coverIndex + 1), 3200);
    }
    this.opts.onReady();
  }

  private showCover(index: number) {
    if (!this.coverImages.length) return;
    this.coverIndex = index % this.coverImages.length;
    // ImageBitmap đã lật dọc cho PlaneGeometry: vẽ lên canvas phải lật lại
    const img = this.coverImages[this.coverIndex];
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const g = c.getContext("2d")!;
    g.translate(0, img.height);
    g.scale(1, -1);
    g.drawImage(img, 0, 0);
    drawScreenShot(this.room.monitor.canvas, c, this.palette);
    this.room.monitor.texture.needsUpdate = true;
  }

  // ---------- Kim cương: chiếu điểm neo 3D xuống DOM ----------
  setHotspots(map: Map<SectionId, HTMLElement>) {
    this.hotspots = map;
  }

  private projectHotspots() {
    const w = this.host.clientWidth;
    const h = this.host.clientHeight;
    for (const [id, el] of this.hotspots) {
      this.tmp.set(...ANCHORS[id]).project(this.camera);
      const behind = this.tmp.z > 1;
      const x = (this.tmp.x * 0.5 + 0.5) * w;
      const y = (-this.tmp.y * 0.5 + 0.5) * h;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      el.dataset.hidden = behind || (this.focusId !== null && this.focusId !== id) ? "true" : "false";
    }
  }

  // ---------- Camera ----------
  private applyLimits(id: SectionId | null) {
    const c = this.controls;
    if (id === null) {
      c.minDistance = this.opts.phone ? 7 : 5.5;
      c.maxDistance = this.opts.phone ? 13 : 10.5;
      c.minAzimuthAngle = MathUtils.degToRad(8);
      c.maxAzimuthAngle = MathUtils.degToRad(78);
      c.minPolarAngle = MathUtils.degToRad(48);
      c.maxPolarAngle = MathUtils.degToRad(80);
    } else {
      // khi xem một khu: chỉ nhích nhẹ quanh góc nhìn, không đi lạc
      const r = RIGS[id];
      const off = new Vector3(...r.pos).sub(new Vector3(...r.target));
      const dist = off.length();
      const az = Math.atan2(off.x, off.z);
      const polar = Math.acos(off.y / dist);
      c.minDistance = dist * 0.7;
      c.maxDistance = dist * 1.35;
      c.minAzimuthAngle = az - 0.32;
      c.maxAzimuthAngle = az + 0.32;
      c.minPolarAngle = Math.max(0.2, polar - 0.25);
      c.maxPolarAngle = Math.min(1.5, polar + 0.2);
    }
  }

  focus(id: SectionId | null, instant = false) {
    this.focusId = id;
    const rig = id ? RIGS[id] : this.opts.phone ? OVERVIEW_PHONE : OVERVIEW;
    const pos = this.opts.phone && id ? phoneRig(rig) : rig;
    this.flight?.kill();
    // mở khoá giới hạn trong lúc bay để OrbitControls không kéo ngược camera
    const c = this.controls;
    c.minDistance = 0;
    c.maxDistance = Infinity;
    c.minAzimuthAngle = -Infinity;
    c.maxAzimuthAngle = Infinity;
    c.minPolarAngle = 0;
    c.maxPolarAngle = Math.PI;
    const finish = () => this.applyLimits(id);
    if (instant || this.opts.reduced) {
      this.camera.position.set(...pos.pos);
      c.target.set(...pos.target);
      this.camera.fov = pos.fov;
      this.camera.updateProjectionMatrix();
      c.update();
      finish();
      return;
    }
    const camState = { fov: this.camera.fov };
    this.flight = gsap
      .timeline({ onComplete: finish })
      .to(this.camera.position, { x: pos.pos[0], y: pos.pos[1], z: pos.pos[2], duration: 1.25, ease: "power3.inOut" }, 0)
      .to(c.target, { x: pos.target[0], y: pos.target[1], z: pos.target[2], duration: 1.25, ease: "power3.inOut" }, 0)
      .to(camState, { fov: pos.fov, duration: 1.25, ease: "power3.inOut", onUpdate: () => {
        this.camera.fov = camState.fov;
        this.camera.updateProjectionMatrix();
      } }, 0);
  }

  /** Phần màn hình bị khung nội dung che (px): khung hình dịch sang để vật thể nằm giữa phần còn lại */
  setInsets(right: number, bottom: number) {
    this.inset = { right, bottom };
    this.updateViewOffset();
  }

  private updateViewOffset() {
    const w = this.host.clientWidth;
    const h = this.host.clientHeight;
    const { right, bottom } = this.inset;
    if (right > 0 || bottom > 0) this.camera.setViewOffset(w, h, right / 2, bottom / 2, w, h);
    else this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();
  }

  // ---------- Chuột / chạm ----------
  private pick(event: PointerEvent): SectionId | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObjects(this.room.pickables, false)[0];
    return (hit?.object.userData.section as SectionId | undefined) ?? null;
  }

  private onPointerMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    const id = this.pick(event);
    if (id !== this.hoverId) {
      this.hoverId = id;
      this.renderer.domElement.style.cursor = id ? "pointer" : "grab";
      this.opts.onHover(id);
    }
  };
  private onPointerDown = (event: PointerEvent) => {
    this.downAt = { x: event.clientX, y: event.clientY };
  };
  private onPointerUp = (event: PointerEvent) => {
    const d = this.downAt;
    this.downAt = null;
    if (!d || Math.hypot(event.clientX - d.x, event.clientY - d.y) > 6) return; // vừa kéo xoay, không phải bấm
    const id = this.pick(event);
    if (id) this.opts.onPick(id);
  };
  private onPointerLeave = () => {
    if (this.hoverId) {
      this.hoverId = null;
      this.opts.onHover(null);
    }
  };

  // ---------- Vòng lặp ----------
  private resize = () => {
    const w = this.host.clientWidth;
    const h = this.host.clientHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / Math.max(1, h);
    this.updateViewOffset();
  };

  private onVisibility = () => {
    this.paused = document.hidden;
    if (!this.paused && !this.raf) this.raf = requestAnimationFrame(this.tick);
  };

  private tick = (now: number) => {
    if (this.disposed || this.paused) {
      this.raf = 0;
      return;
    }
    this.controls.update();
    if (!this.opts.reduced) {
      const pulse = 0.82 + 0.18 * Math.sin(now / 900);
      for (const m of this.room.glows) m.opacity = m.transparent ? 0.55 * pulse : 1;
    }
    this.renderer.render(this.scene, this.camera);
    this.projectHotspots();
    this.raf = requestAnimationFrame(this.tick);
  };

  /** Số lệnh vẽ của khung hình gần nhất (kiểm thử ngân sách) */
  get drawCalls() {
    return this.renderer.info.render.calls;
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
    this.controls.dispose();
    this.room.dispose();
    for (const t of this.covers) t.dispose();
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

/** Điện thoại: lùi camera ra một chút và nhìn hơi cao để vật thể không bị bottom sheet che */
function phoneRig(r: Rig): Rig {
  const pos = new Vector3(...r.pos);
  const target = new Vector3(...r.target);
  const off = pos.clone().sub(target).multiplyScalar(1.35);
  const p = target.clone().add(off);
  return { pos: [p.x, p.y + 0.25, p.z], target: [target.x, target.y - 0.12, target.z], fov: 50 };
}
