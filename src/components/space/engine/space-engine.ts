import {
  CatmullRomCurve3,
  DirectionalLight,
  Fog,
  HalfFloatType,
  HemisphereLight,
  MathUtils,
  NoToneMapping,
  PerspectiveCamera,
  PMREMGenerator,
  PointLight,
  Raycaster,
  Scene,
  Spherical,
  Vector2,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
  type Mesh,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

import type { ZoneId } from "@/config/space";
import { buildArchitecture, type Architecture } from "@/components/space/engine/builders/architecture";
import { buildAtmosphere, type Atmosphere } from "@/components/space/engine/builders/atmosphere";
import { buildCore } from "@/components/space/engine/builders/core";
import { buildDrafting } from "@/components/space/engine/builders/drafting";
import { buildLab } from "@/components/space/engine/builders/lab";
import { buildDoor, buildJournal } from "@/components/space/engine/builders/props";
import { buildShelf } from "@/components/space/engine/builders/shelf";
import { buildShowroom } from "@/components/space/engine/builders/showroom";
import { fitPullback, INTRO_RIG, pullback, rigFor, type Rig } from "@/components/space/engine/camera-rig";
import type { Vec3 } from "@/components/space/engine/layout";
import { readPalette } from "@/components/space/engine/palette";
import type { BuildContext, SceneManifest, ZoneBuild } from "@/components/space/engine/types";
import { gsap } from "@/lib/motion";

export interface EngineOptions {
  manifest: SceneManifest;
  mobile: boolean;
  reduced: boolean;
  onProgress: (p: number) => void;
  onHover: (id: string | null) => void;
  /** Người dùng bắt đầu kéo để nhìn quanh (lần đầu) */
  onDrag?: () => void;
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
  private readonly atmosphere: Atmosphere;
  /** Hậu kỳ phát sáng (bloom): chỉ trên máy tính, tắt trên điện thoại */
  private composer: EffectComposer | null = null;
  private bloom: UnrealBloomPass | null = null;
  private sceneCalls = 0;
  private sceneTriangles = 0;
  private parallax = { x: 0, y: 0, tx: 0, ty: 0 };
  /** Lắc/trượt nhàn rỗi của điểm nhìn hiện tại (điện thoại) và mức độ đang áp dụng (0 khi người dùng vừa chạm) */
  private driftRig: { drift: number; pan: Vec3 | null } = { drift: 0, pan: null };
  private driftAmt = 0;
  private lastTouch = 0;
  private dragNotified = false;
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
  private readonly focusPoint = new Vector3();
  private readonly panVec = new Vector3();
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
    this.scene.environmentIntensity = 0.18;

    const hemi = new HemisphereLight(palette.accentPale, palette.ink, 0.32);
    const key = new DirectionalLight(palette.paper, 0.6);
    key.position.set(-6, 12, 10);
    const fill = new PointLight(palette.accent, 40, 26, 1.6);
    fill.position.set(0, 7, 0);
    this.lights.push(hemi, key, fill);
    this.scene.add(hemi, key, fill);

    this.architecture = buildArchitecture(ctx);
    this.scene.add(this.architecture.group);
    this.collect(this.architecture.anchors, this.architecture.pickables);
    this.atmosphere = buildAtmosphere(ctx);
    this.scene.add(this.atmosphere.group);

    if (!options.mobile) this.setupBloom(renderer);
  }

  /** Bloom nửa độ phân giải trên nền HDR; đếm lệnh vẽ của riêng cảnh (không tính các lượt hậu kỳ) cho QA */
  private setupBloom(renderer: WebGLRenderer) {
    if (!renderer.extensions.has("EXT_color_buffer_float") && !renderer.extensions.has("EXT_color_buffer_half_float")) return;
    const size = renderer.getSize(new Vector2());
    const target = new WebGLRenderTarget(size.x, size.y, { type: HalfFloatType, samples: 4 });
    const composer = new EffectComposer(renderer, target);
    const renderPass = new RenderPass(this.scene, this.camera);
    const bloom = new UnrealBloomPass(new Vector2(size.x, size.y), 0.4, 0.55, 0.6);
    composer.addPass(renderPass);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    renderer.info.autoReset = false;
    const original = renderPass.render.bind(renderPass);
    renderPass.render = (...args: Parameters<RenderPass["render"]>) => {
      renderer.info.reset();
      original(...args);
      this.sceneCalls = renderer.info.render.calls;
      this.sceneTriangles = renderer.info.render.triangles;
    };
    this.composer = composer;
    this.bloom = bloom;
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
    // Không tone mapping: ảnh dự án giữ đúng màu; độ tương phản do chính cảnh quyết định. Bản desktop qua OutputPass.
    renderer.toneMapping = NoToneMapping;

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
    this.atmosphere.dispose();
    this.composer?.dispose();
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
    this.atmosphere.setZone(zone);
    if (!instant && !this.options.reduced) this.architecture.ripple(zone);
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
    this.atmosphere.city.scale.y = 0.001;
    for (const z of this.zones) z.build.group.scale.y = 0.001;
    this.applyIntro();
    const d = short ? 0.6 : 1;
    const tl = gsap.timeline({ onUpdate: () => this.markBusy(300), onComplete: () => onDone?.() });
    tl.to(this.intro, { walls: 1, duration: 1.5 * d, ease: "expo.out", onUpdate: () => this.applyIntro() }, 0);
    this.zones.forEach((z, i) => tl.to(z.build.group.scale, { y: 1, duration: 1.1 * d, ease: "back.out(1.4)" }, (0.8 + i * 0.09) * d));
    tl.to(this.atmosphere.city.scale, { y: 1, duration: 2.2 * d, ease: "power3.out" }, 0.9 * d);
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
    const base = rigFor(this.zone, this.focus, this.options.manifest, this.options.mobile);
    this.driftRig = { drift: base.drift ?? 0, pan: base.pan ?? null };
    const free = this.freeSize();
    const tgt = new Vector3(...base.target);
    let pb = pullback(free.w / free.h);
    const dist = new Vector3(...base.pos).distanceTo(tgt);
    if (base.span) pb = Math.max(pb, fitPullback(base.span, dist, base.fov, free.w, this.height));
    if (base.spanV) pb = Math.max(pb, fitPullback(base.spanV, dist, base.fov, free.h, this.height));
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
    this.composer?.setSize(w, h);
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
    const drifting = this.driftAmt > 0.01 || (this.options.mobile && !this.options.reduced && (this.driftRig.drift > 0 || this.driftRig.pan !== null));
    // nhàn rỗi: ~20 (di động) / ~30 (máy tính) khung/giây; đang tự trôi: ~30 khung/giây
    if (!busy && now - this.lastRender < (drifting ? 33 : this.options.mobile ? 50 : 33)) return;
    this.lastRender = now;
    const dt = Math.min(0.1, deltaMs / 1000);
    if (!this.options.reduced) this.time += dt; // giảm chuyển động: đóng băng mọi hiệu ứng nền

    // nhìn quanh (lò xo)
    const k = 1 - Math.exp(-dt * 9);
    this.looking.yaw += (this.looking.ty - this.looking.yaw) * k;
    this.looking.pitch += (this.looking.tp - this.looking.pitch) * k;
    const pk = 1 - Math.exp(-dt * 3.5);
    this.parallax.x += (this.parallax.tx - this.parallax.x) * pk;
    this.parallax.y += (this.parallax.ty - this.parallax.y) * pk;
    const sway = this.options.reduced ? 0 : Math.sin(this.time * 0.17) * 0.012;
    // Tự trôi (điện thoại): chỉ khi người dùng đã yên ≥ 2,5 giây; chạm vào là dừng ngay và êm dần quay lại
    const wantDrift = this.options.mobile && !this.options.reduced && this.introDone && !this.flight?.isActive() && now - this.lastTouch > 2500 ? 1 : 0;
    this.driftAmt += (wantDrift - this.driftAmt) * (1 - Math.exp(-dt * (wantDrift ? 0.8 : 5)));
    const wave = Math.sin(this.time * 0.21) * this.driftAmt;
    const driftYaw = this.driftRig.drift * wave;
    this.tmp.copy(this.curPos).sub(this.curTarget);
    this.spherical.setFromVector3(this.tmp);
    this.spherical.theta += this.looking.yaw + this.parallax.x + sway + driftYaw;
    this.spherical.phi = MathUtils.clamp(this.spherical.phi - this.looking.pitch - this.parallax.y, 0.12, 1.5);
    this.tmp.setFromSpherical(this.spherical);
    const pan = this.driftRig.pan;
    this.focusPoint.copy(this.curTarget);
    if (pan) this.focusPoint.addScaledVector(this.panVec.set(pan[0], pan[1], pan[2]), wave);
    this.camera.position.copy(this.focusPoint).add(this.tmp);
    this.camera.lookAt(this.focusPoint);
    if (this.camera.fov !== this.curFov) {
      this.camera.fov = this.curFov;
    }
    if (Math.abs(this.view.x) > 0.5 || Math.abs(this.view.y) > 0.5) this.camera.setViewOffset(this.width, this.height, this.view.x, this.view.y, this.width, this.height);
    else this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();

    this.architecture.update(dt);
    this.atmosphere.update(this.time);
    for (const z of this.zones) z.build.update(this.time, dt);
    if (this.composer) this.composer.render(dt);
    else this.renderer.render(this.scene, this.camera);
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
    const hoverZone = id?.startsWith("zone:") ? (id.slice(5) as ZoneId) : null;
    this.architecture.setHover(hoverZone);
    this.atmosphere.setHover(hoverZone);
    for (const z of this.zones) z.build.setHover?.(id);
    this.canvas.dataset.cursor = id ? "link" : "drag";
    this.canvas.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }));
    this.options.onHover(id);
    this.markBusy(500);
  }

  private readonly onDown = (event: PointerEvent) => {
    this.lastTouch = performance.now();
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
        // Điện thoại: quay quanh rất rộng (như đi vòng quanh căn phòng); máy tính: chỉ liếc nhẹ
        const yawMax = this.options.mobile ? (this.zone === "hub" ? 1.15 : 0.75) : 0.45;
        const pitchMax = this.options.mobile ? 0.3 : 0.14;
        this.looking.ty = MathUtils.clamp(this.looking.ty - dx * (this.options.mobile ? 0.0042 : 0.0035), -yawMax, yawMax);
        this.looking.tp = MathUtils.clamp(this.looking.tp + dy * (this.options.mobile ? 0.0024 : 0.002), -pitchMax, pitchMax);
        this.lastTouch = performance.now();
        if (!this.dragNotified) {
          this.dragNotified = true;
          this.options.onDrag?.();
        }
        this.markBusy(300);
      }
      return;
    }
    if (event.pointerType === "mouse") {
      this.setHover(this.pick(event));
      if (!this.options.reduced) {
        const n = this.ndc(event);
        this.parallax.tx = n.x * 0.045;
        this.parallax.ty = n.y * 0.02;
        this.markBusy(400);
      }
    }
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
    this.parallax.tx = this.parallax.ty = 0;
    this.markBusy(600);
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
      calls: this.composer ? this.sceneCalls : this.renderer.info.render.calls,
      triangles: this.composer ? this.sceneTriangles : this.renderer.info.render.triangles,
      bloom: Boolean(this.bloom),
      textures: this.renderer.info.memory.textures,
      geometries: this.renderer.info.memory.geometries,
      fov: this.curFov,
      yaw: Math.round(this.looking.ty * 1000) / 1000,
      pitch: Math.round(this.looking.tp * 1000) / 1000,
    };
  }

  /** Cho Hotspots biết điểm neo tồn tại */
  hasAnchor(id: string) {
    return this.anchors.has(id);
  }
}
