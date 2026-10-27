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
  Ray,
  Raycaster,
  Scene,
  TOUCH,
  Vector2,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
  type Mesh,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

import type { ZoneId } from "@/config/space";
import { buildArchitecture, type Architecture } from "@/components/space/engine/builders/architecture";
import { buildAtmosphere, type Atmosphere } from "@/components/space/engine/builders/atmosphere";
import { buildArms } from "@/components/space/engine/builders/arms";
import { buildBays } from "@/components/space/engine/builders/bay";
import { buildCarousel } from "@/components/space/engine/builders/carousel";
import { buildCore } from "@/components/space/engine/builders/core";
import { buildHall } from "@/components/space/engine/builders/hall";
import { buildLaunchpad } from "@/components/space/engine/builders/launchpad";
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
  /** Người dùng bắt đầu tương tác với camera (xoay / zoom / dịch) lần đầu */
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
  /** Camera tự do: kéo xoay, cuộn / chụm zoom, chuột phải / hai ngón dịch. Các chuyến bay theo route ghi đè lên khi đang bay. */
  private readonly controls: OrbitControls;
  private lastTouch = 0;
  private dragNotified = false;
  private readonly zones: { key: string; zone: ZoneId; build: ZoneBuild }[] = [];
  private readonly pickables: Mesh[] = [];
  private readonly anchors = new Map<string, Vector3>();
  private readonly hotspotEls = new Map<string, HTMLElement>();
  private readonly raycaster = new Raycaster();
  /** Tia từ camera qua con trỏ chuột (null khi chuột ở ngoài cảnh hoặc là cảm ứng): để các nhân vật trong cảnh biết người xem đang trỏ tới đâu */
  private pointerRay: Ray | null = null;
  private readonly pmrem: PMREMGenerator;
  private readonly lights: (DirectionalLight | HemisphereLight | PointLight)[] = [];
  private readonly intro = { walls: 1, canvas: 1 };

  private host: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private zone: ZoneId = "hub";
  private focus: string | null = null;
  private insets: Insets = { left: 0, right: 0, top: 0, bottom: 0 };
  private paused = false;
  private disposed = false;
  private busyUntil = 0;
  private lastRender = 0;
  private time = 0;
  private hoverId: string | null = null;
  private introDone = false;
  private drag: { moved: number; sx: number; sy: number; x: number; y: number } | null = null;
  private view = { x: 0, y: 0 };
  private width = 1;
  private height = 1;

  private readonly curPos = new Vector3();
  private readonly curTarget = new Vector3();
  private curFov = 32;
  private flight: gsap.core.Tween | null = null;
  /** Chuyến bay vừa kết thúc ngay trong nhịp vừa rồi: khung hình kế tiếp phải ghi nốt điểm đến lên camera */
  private flightFinal = false;
  private viewTween: gsap.core.Tween | null = null;
  private readonly tmp = new Vector3();
  private readonly delta = new Vector3();
  /** Mở màn bằng cuộn (intro AEGIS): camera và các khối do tiến độ p điều khiển, người dùng chưa được cầm lái */
  private scrubbing = false;
  private readonly scrubPos = new Vector3();
  private readonly scrubTarget = new Vector3();
  private scrubFov = 40;
  private readonly options: EngineOptions;

  private constructor(options: EngineOptions, ctx: BuildContext, canvas: HTMLCanvasElement, renderer: WebGLRenderer) {
    this.options = options;
    this.canvas = canvas;
    this.renderer = renderer;
    this.camera = new PerspectiveCamera(32, 1, 0.1, 140);
    this.pmrem = new PMREMGenerator(renderer);

    const controls = new OrbitControls(this.camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.085;
    controls.rotateSpeed = 0.65;
    controls.zoomSpeed = 0.9;
    controls.panSpeed = 0.8;
    controls.zoomToCursor = true;
    controls.screenSpacePanning = true;
    controls.minPolarAngle = 0.12;
    controls.maxPolarAngle = 1.36; // không chui xuống sàn
    controls.touches = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN };
    controls.addEventListener("start", () => {
      this.flight?.kill(); // người dùng cầm lái: hủy chuyến bay đang chạy
      this.lastTouch = performance.now();
      if (!this.dragNotified) {
        this.dragNotified = true;
        this.options.onDrag?.();
      }
      this.markBusy(400);
    });
    controls.addEventListener("change", () => this.markBusy(250));
    this.controls = controls;
    this.setLimits("hub", null);

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
    const bloom = new UnrealBloomPass(new Vector2(size.x, size.y), 0.4, 0.55, 0.7);
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

    // Mỗi phần cảnh gắn với khu sáng lên khi khu đó được mở ("hub" = không thuộc khu nào, luôn ở trạng thái nền)
    const showcase = options.manifest.showcase;
    const builds: [string, ZoneId, ZoneBuild][] = [
      ...(showcase ? ([["hall", "work", buildHall(ctx)], ["carousel", "studio", buildCarousel(ctx)]] as [string, ZoneId, ZoneBuild][]) : []),
      ["core", "about", buildCore(ctx)],
      ["launchpad", "contact", buildLaunchpad(ctx)],
      ...buildBays(ctx).map(({ zone, build }): [string, ZoneId, ZoneBuild] => [`bay-${zone}`, zone, build]),
      ["arms", "hub", buildArms(ctx)],
    ];
    for (const [key, zone, build] of builds) {
      engine.scene.add(build.group);
      engine.zones.push({ key, zone, build });
      engine.collect(build.anchors, build.pickables);
    }
    options.onProgress(0.35);

    // Texture khởi động: chỉ phòng trưng bày (ảnh dự án, bản web). Kệ mẫu nạp lười.
    const hall = builds.find(([key]) => key === "hall")?.[2];
    let loaded = 0;
    const total = Math.max(1, hall?.loadCount ?? 1);
    await hall?.load?.(() => {
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
    this.controls.dispose();
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
    const from = this.zone;
    const hop = from === zone && this.focus !== null && focus !== null && this.focus !== focus;
    this.zone = zone;
    this.focus = focus;
    this.setLimits(zone, focus);
    this.architecture.setZone(zone);
    this.atmosphere.setZone(zone);
    if (!instant && !this.options.reduced && from !== zone) {
      this.architecture.ripple(zone);
      this.atmosphere.transfer(from, zone);
    }
    for (const z of this.zones) {
      z.build.setState(z.zone === zone, z.zone === zone ? focus : null);
      z.build.setZone?.(zone);
    }
    // Kệ mẫu: nạp ảnh khi lần đầu tới gần
    if (zone === "studio") void this.loadShelf();
    this.retarget(instant, hop ? 0.95 : 1.5);
  }

  private shelfLoading = false;
  /** Nạp texture kệ mẫu (gọi khi vào khu hoặc lúc rảnh sau khi sẵn sàng) */
  async loadShelf() {
    if (this.shelfLoading) return;
    this.shelfLoading = true;
    await this.zones.find((z) => z.key === "carousel")?.build.load?.(() => this.markBusy(300));
  }

  /** Mở màn: tường dựng lên từ nét mặt bằng, camera hạ từ trên cao xuống góc nhìn tổng quan, các vật mọc dần từ sàn. */
  playIntro(short: boolean, onDone?: () => void) {
    if (this.introDone) return;
    this.introDone = true;
    const finish = onDone;
    onDone = () => {
      for (const z of this.zones) z.build.onIntroDone?.();
      finish?.();
    };
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

  /**
   * Intro AEGIS: bắt đầu chế độ "cuộn để vào". Camera đứng xa và thấp nhìn vào lõi đang phát sáng; mọi khu khác còn nằm dưới sàn
   * và sẽ dựng lên theo tiến độ do SpaceIntro truyền vào (setIntroProgress).
   */
  beginIntroScrub() {
    if (this.introDone || this.scrubbing) return;
    this.scrubbing = true;
    this.controls.enabled = false;
    for (const z of this.zones) z.build.group.scale.y = z.zone === "about" ? 1 : 0.001;
    this.atmosphere.city.scale.y = 0.001;
    this.intro.walls = 0.001;
    this.applyIntro();
    this.setIntroProgress(0);
  }

  /** p: 0 (chỉ thấy lõi từ xa) → 1 (đã về góc nhìn tổng quan, mọi thứ đã dựng xong) */
  setIntroProgress(p: number) {
    if (!this.scrubbing) return;
    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
    const smooth = (a: number, b: number, v: number) => {
      const t = clamp01((v - a) / (b - a));
      return t * t * (3 - 2 * t);
    };
    // Camera: từ xa và thấp (nhìn vào lõi) lùi lên cao dần về góc nhìn tổng quan
    const end = this.targetRig();
    const u = smooth(0, 1, p);
    const curve = new CatmullRomCurve3([new Vector3(0, 3.4, 27), new Vector3(0, 11, 40), new Vector3(0, 19, 50), new Vector3(...end.pos)], false, "catmullrom", 0.5);
    curve.getPoint(u, this.scrubPos);
    this.scrubTarget.set(0, 2.6, 0).lerp(new Vector3(...end.target), u);
    this.scrubFov = MathUtils.lerp(36, end.fov, u);
    // Các khối mọc dần từ sàn, so le nhau
    const appear = (start: number, span: number) => {
      const t = clamp01((p - start) / span);
      const c1 = 1.5;
      const c3 = c1 + 1;
      return Math.max(0.001, 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)); // easeOutBack
    };
    const starts: Record<string, number> = { hall: 0.16, carousel: 0.3, launchpad: 0.34, arms: 0.44 };
    let bay = 0;
    for (const z of this.zones) {
      if (z.zone === "about") continue;
      const start = z.key.startsWith("bay-") ? 0.18 + 0.05 * bay++ : (starts[z.key] ?? 0.3);
      z.build.group.scale.y = appear(start, 0.34);
    }
    this.intro.walls = Math.max(0.001, smooth(0.04, 0.42, p));
    this.applyIntro();
    this.atmosphere.city.scale.y = Math.max(0.001, smooth(0.2, 0.9, p));
    this.markBusy(300);
  }

  /** Kết thúc intro: mọi thứ về trạng thái cuối, camera đứng ở góc nhìn tổng quan và người dùng được cầm lái */
  finishIntroScrub() {
    if (!this.scrubbing) return;
    this.scrubbing = false;
    this.introDone = true;
    this.controls.enabled = true;
    for (const z of this.zones) z.build.group.scale.y = 1;
    this.atmosphere.city.scale.y = 1;
    this.intro.walls = 1;
    this.applyIntro();
    this.setCamera(this.targetRig());
    this.lastTouch = performance.now();
    for (const z of this.zones) z.build.onIntroDone?.();
  }

  get hasPlayedIntro() {
    return this.introDone;
  }

  // ---------- Camera ----------

  private targetRig(): Rig {
    const base = rigFor(this.zone, this.focus, this.options.manifest, this.options.mobile);
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

  /** Giới hạn zoom theo khu: tổng quan xa được, trong khu hoặc khi xem một mục thì gần hơn */
  private setLimits(zone: ZoneId, focus: string | null) {
    if (zone === "hub") {
      this.controls.minDistance = 8;
      this.controls.maxDistance = 90;
    } else if (focus) {
      this.controls.minDistance = 1.6;
      this.controls.maxDistance = 14;
    } else {
      this.controls.minDistance = 2.4;
      this.controls.maxDistance = 34;
    }
  }

  /** Đặt camera ngay (không bay) */
  private setCamera(rig: Rig) {
    this.flight?.kill();
    this.curPos.set(...rig.pos);
    this.curTarget.set(...rig.target);
    this.curFov = rig.fov;
    this.camera.position.copy(this.curPos);
    this.controls.target.copy(this.curTarget);
    this.camera.fov = rig.fov;
    this.controls.update();
    this.markBusy(300);
  }

  /** Bay tới điểm nhìn mới (từ vị trí camera hiện tại, kể cả khi người dùng đã xoay / zoom) theo đường cong có nâng cao giữa chặng */
  private flyTo(rig: Rig, duration: number) {
    this.flight?.kill();
    this.flightFinal = false;
    // Xả hết quán tính xoay còn dư của OrbitControls (giảm chấn), nếu không nó tiếp tục xoay camera sau khi chuyến bay kết thúc
    this.controls.enableDamping = false;
    this.controls.update();
    this.controls.enableDamping = true;
    const fromPos = this.camera.position.clone();
    const fromTarget = this.controls.target.clone();
    const fromFov = this.camera.fov;
    const toPos = new Vector3(...rig.pos);
    const toTarget = new Vector3(...rig.target);
    const dist = fromPos.distanceTo(toPos);
    const mid = fromPos.clone().lerp(toPos, 0.5);
    mid.y += MathUtils.clamp(dist * 0.18, 0, 5);
    const curve = new CatmullRomCurve3([fromPos, mid, toPos], false, "catmullrom", 0.5);
    const state = { t: 0 };
    this.curPos.copy(fromPos);
    this.curTarget.copy(fromTarget);
    this.curFov = fromFov;
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
      onComplete: () => {
        this.flightFinal = true;
      },
    });
    this.markBusy(duration * 1000 + 300);
  }

  /** Về góc nhìn mặc định của khu đang xem (nút ⟲, phím R, nhấp đúp) */
  resetView() {
    this.lastTouch = performance.now(); // đang chủ động chỉnh camera: chưa tự xoay
    this.flyTo(this.targetRig(), 0.9);
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
    // nhàn rỗi: ~20 (di động) / ~30 (máy tính) khung/giây
    if (!busy && now - this.lastRender < (this.options.mobile ? 50 : 33)) return;
    this.lastRender = now;
    const dt = Math.min(0.1, deltaMs / 1000);
    if (!this.options.reduced) this.time += dt; // giảm chuyển động: đóng băng mọi hiệu ứng nền

    // Đang bay theo route: ghi vị trí lên camera. Hết bay thì OrbitControls giữ nguyên và người dùng cầm lái.
    if (this.flight?.isActive() || this.flightFinal) {
      this.flightFinal = false;
      this.camera.position.copy(this.curPos);
      this.controls.target.copy(this.curTarget);
      this.camera.fov = this.curFov;
    } else if (this.scrubbing) {
      this.camera.position.copy(this.scrubPos);
      this.controls.target.copy(this.scrubTarget);
      this.camera.fov = this.scrubFov;
    }
    if (this.controls.update(dt)) this.markBusy(100);
    // Tâm nhìn không rời khỏi xưởng (kéo cả camera theo để không bị giật)
    const t = this.controls.target;
    this.delta.set(MathUtils.clamp(t.x, -20, 20), MathUtils.clamp(t.y, 0, 7), MathUtils.clamp(t.z, -20, 20)).sub(t);
    if (this.delta.lengthSq() > 1e-8) {
      t.add(this.delta);
      this.camera.position.add(this.delta);
    }
    if (Math.abs(this.view.x) > 0.5 || Math.abs(this.view.y) > 0.5) this.camera.setViewOffset(this.width, this.height, this.view.x, this.view.y, this.width, this.height);
    else this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();

    // Sương mù lùi theo khoảng cách camera: ở điện thoại camera đứng xa hơn 70 m nên sương cố định làm cả cảnh chìm vào nền
    const fog = this.scene.fog as Fog;
    const away = this.camera.position.distanceTo(this.controls.target);
    fog.near = Math.max(30, away * 0.95);
    fog.far = Math.max(70, away * 2.2);

    this.architecture.update(dt);
    this.atmosphere.update(this.time);
    for (const z of this.zones) {
      z.build.setPointer?.(this.pointerRay, this.camera.position);
      z.build.update(this.time, dt);
    }
    if (this.composer) this.composer.render(dt);
    else this.renderer.render(this.scene, this.camera);
    this.projectHotspots();
  };

  private projectHotspots() {
    const w = this.width;
    const h = this.height;
    // Tâm vùng còn trống (đã trừ khung nội dung): điểm chạm gần tâm nhất được đánh dấu data-near (điện thoại chỉ hiện nhãn của nó)
    const cx = (this.insets.left + (w - this.insets.right)) / 2;
    const cy = (this.insets.top + (h - this.insets.bottom)) / 2;
    let nearEl: HTMLElement | null = null;
    let nearD = Infinity;
    for (const [id, el] of this.hotspotEls) {
      const anchor = this.anchors.get(id);
      if (!anchor) continue;
      this.tmp.copy(anchor).project(this.camera);
      const x = (this.tmp.x * 0.5 + 0.5) * w;
      const y = (-this.tmp.y * 0.5 + 0.5) * h;
      const off = this.tmp.z > 1 || x < -40 || x > w + 40 || y < -40 || y > h + 40;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      el.dataset.off = off ? "true" : "false";
      if (!off) {
        const d = (x - cx) ** 2 + (y - cy) ** 2;
        if (d < nearD) {
          nearD = d;
          nearEl = el;
        }
      }
    }
    if (nearEl !== this.nearEl) {
      if (this.nearEl) delete this.nearEl.dataset.near;
      if (nearEl) nearEl.dataset.near = "true";
      this.nearEl = nearEl;
    }
  }

  private nearEl: HTMLElement | null = null;

  // ---------- Con trỏ ----------

  private ndc(event: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect();
    return new Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
  }

  private pick(event: PointerEvent): string | null {
    // setViewOffset đã nằm trong projectionMatrix nên raycaster dùng NDC thường
    this.raycaster.setFromCamera(this.ndc(event), this.camera);
    this.pointerRay = event.pointerType === "mouse" ? this.raycaster.ray.clone() : null;
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

  // Xoay / zoom / dịch do OrbitControls lo; ở đây chỉ phân biệt "bấm" (chọn vật) với "kéo" và theo dõi rê chuột để hiện nhãn
  private readonly onDown = (event: PointerEvent) => {
    this.lastTouch = performance.now();
    this.drag = { moved: 0, sx: event.clientX, sy: event.clientY, x: event.clientX, y: event.clientY };
  };

  private readonly onMove = (event: PointerEvent) => {
    if (this.drag) {
      this.drag.moved += Math.abs(event.clientX - this.drag.x) + Math.abs(event.clientY - this.drag.y);
      this.drag.x = event.clientX;
      this.drag.y = event.clientY;
      return;
    }
    if (event.pointerType === "mouse") this.setHover(this.pick(event));
  };

  private readonly onUp = (event: PointerEvent) => {
    const drag = this.drag;
    this.drag = null;
    if (drag && drag.moved < 6) {
      const id = this.pick(event);
      if (id) this.options.onPick(id);
    }
  };

  private readonly onLeave = () => {
    this.pointerRay = null;
    this.markBusy(600);
    if (!this.drag) this.setHover(null);
  };

  private readonly onDouble = () => {
    this.resetView();
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
      distance: Math.round(this.camera.position.distanceTo(this.controls.target) * 100) / 100,
      azimuth: Math.round(this.controls.getAzimuthalAngle() * 1000) / 1000,
      polar: Math.round(this.controls.getPolarAngle() * 1000) / 1000,
    };
  }

  /** Cảm ứng bắt đầu trên một điểm chạm rồi kéo đi: giao cử chỉ cho OrbitControls (nó chiếm con trỏ về canvas) */
  forwardDrag(event: PointerEvent) {
    this.canvas.dispatchEvent(
      new PointerEvent("pointerdown", {
        pointerId: event.pointerId,
        pointerType: event.pointerType,
        isPrimary: event.isPrimary,
        clientX: event.clientX,
        clientY: event.clientY,
        button: 0,
        buttons: 1,
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  /** Bản Factory đã dựng engine này (web có sảnh dự án và băng chuyền mẫu): đổi bản thì phải dựng lại */
  get showcase() {
    return this.options.manifest.showcase;
  }

  /** Cho Hotspots biết điểm neo tồn tại */
  hasAnchor(id: string) {
    return this.anchors.has(id);
  }
}
