import {
  ACESFilmicToneMapping,
  CatmullRomCurve3,
  DirectionalLight,
  Fog,
  HemisphereLight,
  MathUtils,
  PerspectiveCamera,
  PMREMGenerator,
  PointLight,
  Raycaster,
  Scene,
  Spherical,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Mesh,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

import type { ZoneId } from "@/config/space";
import { buildArchitecture, type Architecture } from "@/components/space/engine/builders/architecture";
import { buildCore } from "@/components/space/engine/builders/core";
import { buildDrafting } from "@/components/space/engine/builders/drafting";
import { buildLab } from "@/components/space/engine/builders/lab";
import { buildDoor, buildJournal } from "@/components/space/engine/builders/props";
import { buildShelf } from "@/components/space/engine/builders/shelf";
import { buildShowroom } from "@/components/space/engine/builders/showroom";
import { fitPullback, INTRO_RIG, pullback, rigFor, type Rig } from "@/components/space/engine/camera-rig";
import { readPalette } from "@/components/space/engine/palette";
import type { BuildContext, SceneManifest, ZoneBuild } from "@/components/space/engine/types";
import { gsap } from "@/lib/motion";

export interface EngineOptions {
  manifest: SceneManifest;
  mobile: boolean;
  reduced: boolean;
  onProgress: (p: number) => void;
  onHover: (id: string | null) => void;
  onPick: (id: string) => void;
  onContextLost: () => void;
}

export interface Insets {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

const ZONE_BUILD_KEYS: Record<string, ZoneId> = { showroom: "trung-bay", lab: "thi-nghiem", shelf: "mau-giao-dien", drafting: "dich-vu", core: "ve-aegis", journal: "nhat-ky", door: "lien-he" };

/**
 * Engine 3D của Xưởng Aegis (Three.js, tải lười). Đây là nơi DUY NHẤT import `three`.
 * Singleton theo vòng đời trang: SceneCanvas gắn/tháo canvas (attach/detach) nên cảnh không dựng lại khi đổi route.
 * Vòng lặp chạy trên gsap.ticker; khi không có gì chuyển động thì hạ xuống ~20 khung/giây, tạm dừng hẳn khi ẩn tab / paused.
 */
export class SpaceEngine {
  readonly canvas: HTMLCanvasElement;
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera: PerspectiveCamera;
  private readonly architecture: Architecture;
  private readonly zones: { key: string; zone: ZoneId; build: ZoneBuild }[] = [];
  private readonly pickables: Mesh[] = [];
  private readonly anchors = new Map<string, Vector3>();
  private readonly hotspotEls = new Map<string, HTMLElement>();
  private readonly raycaster = new Raycaster();
  private readonly pmrem: PMREMGenerator;
  private readonly lights: (DirectionalLight | HemisphereLight | PointLight)[] = [];
  private readonly intro = { walls: 1, canvas: 1 };

  private host: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private zone: ZoneId | "hub" = "hub";
  private focus: string | null = null;
  private insets: Insets = { left: 0, right: 0, top: 0, bottom: 0 };
  private paused = false;
  private disposed = false;
  private busyUntil = 0;
  private lastRender = 0;
  private time = 0;
  private hoverId: string | null = null;
  private introDone = false;
  private looking = { yaw: 0, pitch: 0, ty: 0, tp: 0 };
  private drag: { x: number; y: number; moved: number } | null = null;
  private view = { x: 0, y: 0 };
  private width = 1;
  private height = 1;

  private readonly curPos = new Vector3();
  private readonly curTarget = new Vector3();
  private curFov = 32;
  private flight: gsap.core.Tween | null = null;
  private viewTween: gsap.core.Tween | null = null;
  private readonly tmp = new Vector3();
  private readonly spherical = new Spherical();
  private readonly options: EngineOptions;

  private constructor(options: EngineOptions, ctx: BuildContext, canvas: HTMLCanvasElement, renderer: WebGLRenderer) {
    this.options = options;
    this.canvas = canvas;
    this.renderer = renderer;
    this.camera = new PerspectiveCamera(32, 1, 0.1, 120);
    this.pmrem = new PMREMGenerator(renderer);

    const { palette } = ctx;
    this.scene.background = palette.ink.clone();
    this.scene.fog = new Fog(palette.ink.clone(), 30, 70);
    this.scene.environment = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.3;

    const hemi = new HemisphereLight(palette.accentPale, palette.ink, 0.5);
    const key = new DirectionalLight(palette.paper, 0.9);
    key.position.set(-6, 12, 10);
    const fill = new PointLight(palette.accent, 40, 26, 1.6);
    fill.position.set(0, 7, 0);
    this.lights.push(hemi, key, fill);
    this.scene.add(hemi, key, fill);

    this.architecture = buildArchitecture(ctx);
    this.scene.add(this.architecture.group);
    this.collect(this.architecture.anchors, this.architecture.pickables);
  }

  private collect(anchors: Record<string, Vector3>, pickables: Mesh[]) {
    for (const [id, v] of Object.entries(anchors)) this.anchors.set(id, v);
    this.pickables.push(...pickables);
  }

  /** Dựng toàn bộ cảnh. Tiến độ (0..1) báo qua options.onProgress: dựng hình khối → nạp texture → biên dịch shader. */
  static async create(options: EngineOptions): Promise<SpaceEngine> {
    options.onProgress(0.08);
    const palette = readPalette();
    const canvas = document.createElement("canvas");
    canvas.className = "space-canvas";
    const renderer = new WebGLRenderer({ canvas, antialias: !options.mobile, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, options.mobile ? 1.25 : 1.75));
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const ctx: BuildContext = {
      palette,
      manifest: options.manifest,
      renderer,
      mobile: options.mobile,
      reduced: options.reduced,
      textureWidth: options.mobile ? 768 : 1024,
    };
    const engine = new SpaceEngine(options, ctx, canvas, renderer);
    options.onProgress(0.2);

    const builds: [string, ZoneBuild][] = [
      ["showroom", buildShowroom(ctx)],
      ["lab", buildLab(ctx)],
      ["shelf", buildShelf(ctx)],
      ["drafting", buildDrafting(ctx)],
      ["core", buildCore(ctx)],
      ["journal", buildJournal(ctx)],
      ["door", buildDoor(ctx)],
    ];
    for (const [key, build] of builds) {
      engine.scene.add(build.group);
      engine.zones.push({ key, zone: ZONE_BUILD_KEYS[key], build });
      engine.collect(build.anchors, build.pickables);
    }
    options.onProgress(0.35);

    // Texture khởi động: chỉ phòng trưng bày (ảnh dự án). Kệ mẫu nạp lười.
    const showroom = builds[0][1];
    let loaded = 0;
    const total = Math.max(1, showroom.loadCount ?? 1);
    await showroom.load?.(() => {
      loaded += 1;
      options.onProgress(0.35 + 0.5 * (loaded / total));
    });
    options.onProgress(0.88);

    engine.configureViewport(1, 1);
    engine.setCamera({ pos: INTRO_RIG.pos, target: INTRO_RIG.target, fov: INTRO_RIG.fov });
    await engine.renderer.compileAsync(engine.scene, engine.camera);
    options.onProgress(1);
    return engine;
  }

  // ---------- Vòng đời ----------

  attach(host: HTMLElement) {
    if (this.disposed) return;
    this.host = host;
    host.appendChild(this.canvas);
    this.canvas.dataset.cursor = "drag";
    this.canvas.dataset.cursorLabel = "Kéo";
    const c = this.canvas;
    c.addEventListener("pointerdown", this.onDown);
    c.addEventListener("pointermove", this.onMove);
    c.addEventListener("pointerup", this.onUp);
    c.addEventListener("pointerleave", this.onLeave);
    c.addEventListener("dblclick", this.onDouble);
    c.addEventListener("webglcontextlost", this.onContextLost);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);
    this.resize();
    gsap.ticker.add(this.tick);
    this.markBusy(1500);
  }

  detach() {
    gsap.ticker.remove(this.tick);
    const c = this.canvas;
    c.removeEventListener("pointerdown", this.onDown);
    c.removeEventListener("pointermove", this.onMove);
    c.removeEventListener("pointerup", this.onUp);
    c.removeEventListener("pointerleave", this.onLeave);
    c.removeEventListener("dblclick", this.onDouble);
    c.removeEventListener("webglcontextlost", this.onContextLost);
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    c.remove();
    this.host = null;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.detach();
    this.flight?.kill();
    this.viewTween?.kill();
    this.architecture.dispose();
    for (const z of this.zones) z.build.dispose();
    this.pmrem.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }

  get isDisposed() {
    return this.disposed;
  }

  // ---------- Điều khiển từ React ----------

  setPaused(value: boolean) {
    this.paused = value;
    if (!value) this.markBusy(800);
  }

  setHotspots(elements: Map<string, HTMLElement>) {
    this.hotspotEls.clear();
    for (const [id, el] of elements) this.hotspotEls.set(id, el);
    this.markBusy(400);
  }

  setInsets(insets: Insets, retarget = true) {
    this.insets = insets;
    if (retarget) this.retarget(false, 0.7);
  }

  setRoute(zone: ZoneId, focus: string | null, instant = false) {
    this.zone = zone;
    this.focus = focus;
    this.looking.ty = this.looking.tp = 0;
    this.architecture.setZone(zone);
    for (const z of this.zones) z.build.setState(z.zone === zone, z.zone === zone ? focus : null);
    // Kệ mẫu: nạp ảnh khi lần đầu tới gần
    if (zone === "mau-giao-dien") void this.loadShelf();
    this.retarget(instant, 1.5);
  }

  private shelfLoading = false;
  /** Nạp texture kệ mẫu (gọi khi vào khu hoặc lúc rảnh sau khi sẵn sàng) */
  async loadShelf() {
    if (this.shelfLoading) return;
    this.shelfLoading = true;
    await this.zones.find((z) => z.key === "shelf")?.build.load?.(() => this.markBusy(300));
  }

  /** Mở màn: tường dựng lên từ nét mặt bằng, camera hạ từ trên cao xuống góc nhìn tổng quan, các vật mọc dần từ sàn. */
  playIntro(short: boolean, onDone?: () => void) {
    if (this.introDone) return;
    this.introDone = true;
    const hub = this.targetRig();
    if (this.options.reduced) {
      this.setCamera(hub);
      this.intro.walls = 1;
      this.applyIntro();
      onDone?.();
      return;
    }
    this.setCamera({ pos: INTRO_RIG.pos, target: INTRO_RIG.target, fov: INTRO_RIG.fov });
    this.intro.walls = 0.001;
    for (const z of this.zones) z.build.group.scale.y = 0.001;
    this.applyIntro();
    const d = short ? 0.6 : 1;
    const tl = gsap.timeline({ onUpdate: () => this.markBusy(300), onComplete: () => onDone?.() });
    tl.to(this.intro, { walls: 1, duration: 1.5 * d, ease: "expo.out", onUpdate: () => this.applyIntro() }, 0);
    this.zones.forEach((z, i) => tl.to(z.build.group.scale, { y: 1, duration: 1.1 * d, ease: "back.out(1.4)" }, (0.8 + i * 0.09) * d));
    tl.add(() => this.flyTo(this.targetRig(), 2.3 * d), 0.15);
    this.markBusy(4000);
  }

  private applyIntro() {
    this.architecture.walls.scale.y = this.intro.walls;
  }

  get hasPlayedIntro() {
    return this.introDone;
  }

  // ---------- Camera ----------

  private targetRig(): Rig {
    const base = rigFor(this.zone, this.focus, this.options.manifest);
    const free = this.freeSize();
    const tgt = new Vector3(...base.target);
    let pb = pullback(free.w / free.h);
    if (base.span) {
      const dist = new Vector3(...base.pos).distanceTo(tgt);
      pb = Math.max(pb, fitPullback(base.span, dist, base.fov, free.w, this.height));
    }
    const pos = new Vector3(...base.pos).sub(tgt).multiplyScalar(pb).add(tgt);
    return { pos: [pos.x, pos.y, pos.z], target: base.target, fov: base.fov };
  }

  private freeSize() {
    const w = Math.max(200, this.width - this.insets.left - this.insets.right);
    const h = Math.max(200, this.height - this.insets.top - this.insets.bottom);
    return { w, h };
  }

  private setCamera(rig: Rig) {
    this.flight?.kill();
    this.curPos.set(...rig.pos);
    this.curTarget.set(...rig.target);
    this.curFov = rig.fov;
    this.markBusy(300);
  }

  /** Bay tới điểm nhìn mới theo đường cong có nâng cao giữa chặng để không xuyên tường */
  private flyTo(rig: Rig, duration: number) {
    this.flight?.kill();
    const fromPos = this.curPos.clone();
    const fromTarget = this.curTarget.clone();
    const fromFov = this.curFov;
    const toPos = new Vector3(...rig.pos);
    const toTarget = new Vector3(...rig.target);
    const dist = fromPos.distanceTo(toPos);
    const mid = fromPos.clone().lerp(toPos, 0.5);
    mid.y += MathUtils.clamp(dist * 0.18, 0, 5);
    const curve = new CatmullRomCurve3([fromPos, mid, toPos], false, "catmullrom", 0.5);
    const state = { t: 0 };
    this.flight = gsap.to(state, {
      t: 1,
      duration,
      ease: "power3.inOut",
      onUpdate: () => {
        curve.getPoint(state.t, this.curPos);
        this.curTarget.lerpVectors(fromTarget, toTarget, state.t);
        this.curFov = MathUtils.lerp(fromFov, rig.fov, state.t);
        this.markBusy(200);
      },
    });
    this.markBusy(duration * 1000 + 300);
  }

  /** Tính lại điểm nhìn + độ lệch tâm khung hình (chừa chỗ cho khung nội dung) */
  private retarget(instant: boolean, duration: number) {
    const rig = this.targetRig();
    if (instant || this.options.reduced || !this.introDone) {
      if (this.introDone || this.options.reduced) this.setCamera(rig);
    } else this.flyTo(rig, duration);
    // Tâm hình học của phần còn trống: dịch cảnh về giữa vùng đó
    const vx = (this.insets.right - this.insets.left) / 2;
    const vy = (this.insets.bottom - this.insets.top) / 2;
    this.viewTween?.kill();
    if (instant || this.options.reduced) {
      this.view.x = vx;
      this.view.y = vy;
    } else {
      this.viewTween = gsap.to(this.view, { x: vx, y: vy, duration: Math.min(1.2, duration), ease: "power3.inOut", onUpdate: () => this.markBusy(200) });
    }
  }

  // ---------- Khung hình ----------

  private configureViewport(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private resize() {
    if (!this.host) return;
    const rect = this.host.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    this.renderer.setSize(w, h, false);
    this.configureViewport(w, h);
    this.retarget(true, 0);
    this.markBusy(400);
  }

  private markBusy(ms: number) {
    this.busyUntil = Math.max(this.busyUntil, performance.now() + ms);
  }

  private readonly tick = (_time: number, deltaMs: number) => {
    if (this.disposed || this.paused || document.hidden || !this.host) return;
    const now = performance.now();
    const busy = now < this.busyUntil;
    if (!busy && now - this.lastRender < 50) return; // nhàn rỗi: ~20 khung/giây
    this.lastRender = now;
    const dt = Math.min(0.1, deltaMs / 1000);
    this.time += dt;

    // nhìn quanh (lò xo)
    const k = 1 - Math.exp(-dt * 9);
    this.looking.yaw += (this.looking.ty - this.looking.yaw) * k;
    this.looking.pitch += (this.looking.tp - this.looking.pitch) * k;
    this.tmp.copy(this.curPos).sub(this.curTarget);
    this.spherical.setFromVector3(this.tmp);
    this.spherical.theta += this.looking.yaw;
    this.spherical.phi = MathUtils.clamp(this.spherical.phi - this.looking.pitch, 0.12, 1.5);
    this.tmp.setFromSpherical(this.spherical);
    this.camera.position.copy(this.curTarget).add(this.tmp);
    this.camera.lookAt(this.curTarget);
    if (this.camera.fov !== this.curFov) {
      this.camera.fov = this.curFov;
    }
    if (Math.abs(this.view.x) > 0.5 || Math.abs(this.view.y) > 0.5) this.camera.setViewOffset(this.width, this.height, this.view.x, this.view.y, this.width, this.height);
    else this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();

    this.architecture.update(dt);
    for (const z of this.zones) z.build.update(this.time, dt);
    this.renderer.render(this.scene, this.camera);
    this.projectHotspots();
  };

  private projectHotspots() {
    const w = this.width;
    const h = this.height;
    for (const [id, el] of this.hotspotEls) {
      const anchor = this.anchors.get(id);
      if (!anchor) continue;
      this.tmp.copy(anchor).project(this.camera);
      const x = (this.tmp.x * 0.5 + 0.5) * w;
      const y = (-this.tmp.y * 0.5 + 0.5) * h;
      const off = this.tmp.z > 1 || x < -40 || x > w + 40 || y < -40 || y > h + 40;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      el.dataset.off = off ? "true" : "false";
    }
  }

  // ---------- Con trỏ ----------

  private ndc(event: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect();
    return new Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
  }

  private pick(event: PointerEvent): string | null {
    // setViewOffset đã nằm trong projectionMatrix nên raycaster dùng NDC thường
    this.raycaster.setFromCamera(this.ndc(event), this.camera);
    const hit = this.raycaster.intersectObjects(this.pickables, false)[0];
    return (hit?.object.userData.pick as string | undefined) ?? null;
  }

  private setHover(id: string | null) {
    if (id === this.hoverId) return;
    this.hoverId = id;
    this.architecture.setHover(id?.startsWith("zone:") ? (id.slice(5) as ZoneId) : null);
    for (const z of this.zones) z.build.setHover?.(id);
    this.canvas.dataset.cursor = id ? "link" : "drag";
    this.canvas.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }));
    this.options.onHover(id);
    this.markBusy(500);
  }

  private readonly onDown = (event: PointerEvent) => {
    this.drag = { x: event.clientX, y: event.clientY, moved: 0 };
    this.canvas.setPointerCapture(event.pointerId);
  };

  private readonly onMove = (event: PointerEvent) => {
    if (this.drag) {
      const dx = event.clientX - this.drag.x;
      const dy = event.clientY - this.drag.y;
      this.drag.moved += Math.abs(dx) + Math.abs(dy);
      this.drag.x = event.clientX;
      this.drag.y = event.clientY;
      if (this.drag.moved > 6) {
        this.looking.ty = MathUtils.clamp(this.looking.ty - dx * 0.0035, -0.45, 0.45);
        this.looking.tp = MathUtils.clamp(this.looking.tp + dy * 0.002, -0.14, 0.14);
        this.markBusy(300);
      }
      return;
    }
    if (event.pointerType === "mouse") this.setHover(this.pick(event));
  };

  private readonly onUp = (event: PointerEvent) => {
    const drag = this.drag;
    this.drag = null;
    if (this.canvas.hasPointerCapture(event.pointerId)) this.canvas.releasePointerCapture(event.pointerId);
    if (drag && drag.moved < 6) {
      const id = this.pick(event);
      if (id) this.options.onPick(id);
    }
  };

  private readonly onLeave = () => {
    if (!this.drag) this.setHover(null);
  };

  private readonly onDouble = () => {
    this.looking.ty = this.looking.tp = 0;
    this.markBusy(600);
  };

  private readonly onContextLost = (event: Event) => {
    event.preventDefault();
    this.options.onContextLost();
  };

  /** Dùng cho QA (?debug-space) */
  debugInfo() {
    return {
      zone: this.zone,
      focus: this.focus,
      flying: this.flight?.isActive() ?? false,
      calls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles,
      textures: this.renderer.info.memory.textures,
      geometries: this.renderer.info.memory.geometries,
      fov: this.curFov,
    };
  }

  /** Cho Hotspots biết điểm neo tồn tại */
  hasAnchor(id: string) {
    return this.anchors.has(id);
  }
}
