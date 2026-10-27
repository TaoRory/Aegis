// Kiểm tra Factory "Aegis Forge" (phiên bản 3, /factory và /en/factory) bằng trình duyệt thật (Playwright).
// Chạy: pnpm build && pnpm start   (cửa sổ khác)  rồi  pnpm qa:factory [baseUrl]
// Phần 0: định tuyến (chuyển hướng slug cũ, /vi nội bộ). Phần 1: quét mọi route vi + en (desktop + mobile).
// Phần 2: intro AEGIS + tương tác 3D desktop (camera tự do, nhãn hover, nav, phím, hotspot, đổi ngôn ngữ). Phần 2b: điện thoại. Phần 2c: ba demo minh họa.
// Phần 3: dự phòng (không WebGL, giảm chuyển động, không JS).
// WebGL trong chế độ headless chạy bằng SwiftShader (chậm), nên các bước chờ cảnh 3D để dư thời gian.
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const outDir = "qa-output/factory";
const GL_ARGS = ["--enable-gpu", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"];

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

await mkdir(outDir, { recursive: true });

/** Chờ intro AEGIS sẵn sàng rồi bấm "Bỏ qua" (vào /factory lần đầu của một phiên); không có intro thì thôi. */
async function skipIntro(page) {
  const boot = await page.evaluate(() => document.documentElement.dataset.spaceBoot ?? "");
  if (boot !== "playing") return false;
  await page.waitForFunction(() => document.querySelector(".space-intro")?.dataset.ready === "true", null, { timeout: 90000 });
  // Bấm bằng DOM (không chờ kiểm tra "ổn định" của Playwright: cảnh SwiftShader chạy chậm nên lớp phủ luôn đang vẽ lại)
  await page.evaluate(() => document.querySelector(".space-intro-skip")?.click());
  await page.waitForFunction(() => !document.documentElement.dataset.spaceBoot, null, { timeout: 40000 });
  return true;
}
const camera = (page) => page.evaluate(() => window.__aegisSpace?.info?.() ?? null);
const introScale = (page) =>
  page.evaluate(() => Number(document.querySelector(".space-intro svg > g")?.getAttribute("transform")?.match(/scale\(([\d.]+)\)/)?.[1] ?? 1));

const SERVICES = ["ai", "software", "web", "marketing"];
const DEMOS = ["ai", "software", "marketing"];
const PROJECTS = ["vidi26", "handle-vietnam", "integritas-vu-legal", "tedx-vinuniversity-2026", "rethink", "tedx-vinuniversity-2025", "rethink-halloween"];
const subRoutes = [
  "",
  "/about",
  "/services",
  ...SERVICES.map((s) => `/services/${s}`),
  ...DEMOS.map((s) => `/services/${s}/demo`),
  "/work",
  ...PROJECTS.map((p) => `/work/${p}`),
  "/studio",
  "/contact",
];
const routesFor = (lang) => subRoutes.map((s) => (lang === "en" ? "/en" : "") + "/factory" + s);
const expected = [...routesFor("vi"), ...routesFor("en")];

// ---------- Phần 0: định tuyến ----------
const head = async (path) => {
  const res = await fetch(baseUrl + path, { redirect: "manual" });
  return { status: res.status, location: res.headers.get("location") ?? "" };
};
const redirects = [
  ["/factory/trung-bay", "/factory/work"],
  ["/factory/trung-bay/vidi26", "/factory/work/vidi26"],
  ["/factory/thi-nghiem", "/factory/studio"],
  ["/factory/thi-nghiem/nen-mong", "/factory/studio"],
  ["/factory/studio/lab/nen-mong", "/factory/studio"],
  ["/en/factory/studio/lab/suong-mu", "/en/factory/studio"],
  ["/factory/mau-giao-dien", "/factory/studio"],
  ["/factory/nhat-ky", "/factory/studio"],
  ["/factory/dich-vu", "/factory/services"],
  ["/factory/ve-aegis", "/factory/about"],
  ["/factory/lien-he", "/factory/contact"],
  ["/en/factory/trung-bay/vidi26", "/en/factory/work/vidi26"],
  ["/vi/factory/work", "/factory/work"],
];
for (const [from, to] of redirects) {
  const r = await head(from);
  check(`[route] ${from} → 308 ${to}`, r.status === 308 && r.location.endsWith(to), `${r.status} ${r.location}`);
}
check("[route] /factory/khong-co trả 404", (await head("/factory/khong-co")).status === 404);
for (const r of expected) {
  const res = await head(r);
  check(`[route] ${r} trả 200`, res.status === 200, String(res.status));
}

// Quét liên kết nội bộ: mọi liên kết /factory… phải nằm trong danh sách route hợp lệ
async function crawl(start) {
  const seen = new Set();
  const queue = [start];
  const unknown = new Set();
  while (queue.length) {
    const route = queue.shift();
    if (seen.has(route)) continue;
    seen.add(route);
    const res = await fetch(baseUrl + route);
    if (!res.ok) continue;
    const html = await res.text();
    for (const m of html.matchAll(/href="(\/(?:en\/)?factory[a-z0-9\/-]*)(?:[?#][^"]*)?"/g)) {
      const next = m[1].replace(/\/$/, "") || "/factory";
      if (!expected.includes(next)) unknown.add(next);
      else if (!seen.has(next)) queue.push(next);
    }
  }
  return { seen: [...seen], unknown: [...unknown] };
}
for (const [label, start] of [["vi", "/factory"], ["en", "/en/factory"]]) {
  const { seen, unknown } = await crawl(start);
  check(`[crawl ${label}] mọi liên kết nội bộ đều trỏ tới route hợp lệ`, unknown.length === 0, unknown.slice(0, 3).join(", "));
  check(`[crawl ${label}] đi tới được ≥ 20 route từ trang tổng quan`, seen.length >= 20, `${seen.length} route`);
}

const browser = await chromium.launch({ args: GL_ARGS });

// ---------- Phần 1: từng route, desktop + mobile ----------
for (const vp of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844, isMobile: true, hasTouch: true },
]) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, hasTouch: vp.hasTouch });
  const page = await context.newPage();
  let errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  for (const route of expected) {
    errors = [];
    const response = await page.goto(baseUrl + route, { waitUntil: "networkidle", timeout: 90000 }).catch(() => null);
    await page.waitForTimeout(vp.name === "desktop" ? 1500 : 1000);
    const info = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      h1: document.querySelectorAll("h1").length,
      robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? "",
      badLinks: [...document.querySelectorAll('a[target="_blank"]')].filter((a) => !/noopener/.test(a.rel)).length,
      brokenImages: [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.currentSrc).length,
      lang: document.documentElement.lang,
      bv: /\bBV-\d/.test(document.body.innerText),
    }));
    const tag = `[${vp.name}] ${route}`;
    check(`${tag} trả 200`, response?.status() === 200, String(response?.status()));
    check(`${tag} có đúng 1 h1`, info.h1 === 1, `${info.h1} h1`);
    check(`${tag} noindex`, /noindex/.test(info.robots), info.robots);
    check(`${tag} không tràn ngang`, info.overflow <= 0, `${info.overflow}px`);
    check(`${tag} link ngoài có rel=noopener`, info.badLinks === 0);
    check(`${tag} không ảnh vỡ`, info.brokenImages === 0, `${info.brokenImages} ảnh`);
    check(`${tag} html lang đúng ngôn ngữ`, info.lang === (route.startsWith("/en/") ? "en" : "vi"), info.lang);
    check(`${tag} không còn mã "BV-xx"`, !info.bv);
    check(`${tag} không lỗi console`, errors.length === 0, errors.slice(0, 1).join(" | ").slice(0, 160));
  }
  await context.close();
}

// ---------- Phần 2: tương tác 3D (desktop) ----------
{
let context;
try {
  context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`${baseUrl}/factory?debug-space`, { waitUntil: "domcontentloaded" });

  const boot = await page.evaluate(() => document.documentElement.dataset.spaceBoot ?? "");
  check("[intro] vào /factory lần đầu có intro AEGIS", boot === "playing", boot);
  await page.waitForFunction(() => document.documentElement.dataset.spaceLive === "on", null, { timeout: 60000 }).then(
    () => check("[3d] cảnh 3D lên sóng", true),
    () => check("[3d] cảnh 3D lên sóng", false, "quá 60 giây"),
  );
  await page.waitForFunction(() => document.querySelector(".space-intro")?.dataset.ready === "true", null, { timeout: 90000 }).catch(() => {});
  check("[intro] có chữ AEGIS lớn và nút Bỏ qua", (await page.locator(".space-intro-svg text").count()) >= 1 && (await page.locator(".space-intro-skip").count()) === 1);
  check("[intro] HUD chưa hiện trong lúc intro", await page.evaluate(() => getComputedStyle(document.querySelector(".space-nav")).visibility === "hidden"));
  await page.screenshot({ path: `${outDir}/intro-0.jpg`, type: "jpeg", quality: 70 });
  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 700);
  await page.waitForFunction(() => Number(document.querySelector(".space-intro svg > g")?.getAttribute("transform")?.match(/scale\(([\d.]+)\)/)?.[1] ?? 1) > 1.5, null, { timeout: 15000 }).catch(() => {});
  check("[intro] cuộn chuột phóng to chữ AEGIS", (await introScale(page)) > 1.5, `scale ${await introScale(page)}`);
  await page.screenshot({ path: `${outDir}/intro-1.jpg`, type: "jpeg", quality: 70 });
  await page.mouse.wheel(0, 6000);
  await page.waitForFunction(() => !document.documentElement.dataset.spaceBoot, null, { timeout: 40000 }).catch(() => {});
  check("[intro] cuộn hết thì intro kết thúc và gỡ khỏi trang", (await page.locator(".space-intro").count()) === 0 && !(await page.evaluate(() => document.documentElement.dataset.spaceBoot)));
  await page.waitForTimeout(4000);
  check("[intro] chỉ một lần mỗi phiên (đã ghi cờ sessionStorage)", (await page.evaluate(() => sessionStorage.getItem("aegis-factory-boot"))) === "1");
  const zone = () => page.evaluate(() => window.__aegisSpace?.info?.().zone ?? "?");
  const canvas = await page.locator(".space-canvas").count();
  check("[3d] có canvas WebGL", canvas === 1, `${canvas}`);
  const stats = await page.evaluate(() => window.__aegisSpace?.info?.() ?? null);
  if (stats) {
    check("[3d] draw call ≤ 120", stats.calls <= 120, `${stats.calls} lệnh vẽ`);
    check("[3d] tam giác ≤ 150k", stats.triangles <= 150000, `${stats.triangles}`);
  } else check("[3d] đọc được thống kê (?debug-space)", false);
  check("[3d] khu mặc định là hub", (await zone()) === "hub", await zone());
  const hubBox = await page.evaluate(() => {
    const r = document.querySelector(".space-hub")?.getBoundingClientRect();
    return r ? { w: r.width, h: r.height } : null;
  });
  check("[3d] không còn thẻ thông tin ở tổng quan (chỉ h1 ẩn cho trình đọc)", Boolean(hubBox) && hubBox.w <= 2 && hubBox.h <= 2 && (await page.locator("h1").count()) === 1, JSON.stringify(hubBox));
  await page.waitForSelector(".space-hotspot", { timeout: 20000 }).catch(() => {});
  check("[3d] hotspot hiện ở tổng quan (8 khu)", (await page.locator(".space-hotspot").count()) === 8, `${await page.locator(".space-hotspot").count()}`);
  const labelOpacity = () => page.evaluate(() => Number(getComputedStyle(document.querySelector(".space-hotspot .space-hotspot-label")).opacity));
  check("[3d] nhãn kim cương ẩn khi chưa rê chuột", (await labelOpacity()) < 0.05, `${await labelOpacity()}`);
  await page.locator(".space-hotspot .space-diamond").first().hover({ force: true }).catch(() => {});
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector(".space-hotspot .space-hotspot-label")).opacity) > 0.8, null, { timeout: 6000 }).catch(() => {});
  check("[3d] rê chuột vào kim cương thì hiện nhãn", (await labelOpacity()) > 0.8, `${await labelOpacity()}`);
  await page.mouse.move(720, 120);

  // Camera tự do: cuộn chuột đổi khoảng cách, kéo đổi góc, nút ⟲ về góc mặc định
  const d0 = (await camera(page)).distance;
  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, -900);
  await page.waitForFunction((d) => window.__aegisSpace.info().distance < d - 3, d0, { timeout: 10000 }).catch(() => {});
  const d1 = (await camera(page)).distance;
  check("[camera] cuộn chuột zoom vào được", d1 < d0 - 3, `${d0} → ${d1}`);
  await page.mouse.wheel(0, 2400);
  await page.waitForFunction((d) => window.__aegisSpace.info().distance > d + 3, d1, { timeout: 10000 }).catch(() => {});
  const d2 = (await camera(page)).distance;
  check("[camera] cuộn ngược zoom ra được", d2 > d1 + 3, `${d1} → ${d2}`);
  const az0 = (await camera(page)).azimuth;
  await page.mouse.move(560, 300);
  await page.mouse.down();
  for (let i = 1; i <= 14; i++) {
    await page.mouse.move(560 + i * 22, 300);
    await page.waitForTimeout(16);
  }
  await page.mouse.up();
  await page.waitForTimeout(800);
  const az1 = (await camera(page)).azimuth;
  check("[camera] kéo chuột xoay quanh xưởng", Math.abs(az1 - az0) > 0.3, `${az0} → ${az1}`);
  await page.locator(".space-reset").click();
  await page.waitForFunction(() => Math.abs(window.__aegisSpace.info().azimuth) < 0.15 && !window.__aegisSpace.info().flying, null, { timeout: 15000 }).catch(() => {});
  check("[camera] nút ⟲ đưa camera về góc mặc định", Math.abs((await camera(page)).azimuth) < 0.15, `${(await camera(page)).azimuth}`);
  const navText = await page.locator(".space-nav:visible").innerText();
  check("[3d] thanh điều hướng không đánh số thứ tự", !/\d/.test(navText), navText.replace(/\s+/g, " "));
  check("[3d] bốn dịch vụ cùng một hàng, cùng cỡ", await page.evaluate(() => {
    const rects = [...document.querySelectorAll(".space-nav-service a")].map((a) => a.getBoundingClientRect());
    return rects.length === 4 && new Set(rects.map((r) => Math.round(r.top))).size === 1 && rects.every((r) => r.height === rects[0].height);
  }));
  await page.screenshot({ path: `${outDir}/3d-hub.jpg`, type: "jpeg", quality: 70 });

  // Bấm thanh điều hướng: dịch vụ
  await page.locator(".space-nav").getByRole("link", { name: "Marketing", exact: true }).click();
  await page.waitForURL("**/factory/services/marketing", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2500);
  check("[3d] bấm một dịch vụ trên thanh nav đổi URL", page.url().endsWith("/factory/services/marketing"), page.url());
  check("[3d] camera chuyển sang khu Marketing", (await zone()) === "marketing", await zone());
  check("[3d] khu dịch vụ có 2 điểm chạm (Demo + Trao đổi)", (await page.locator(".space-hotspot").count()) === 2, `${await page.locator(".space-hotspot").count()}`);
  await page.screenshot({ path: `${outDir}/3d-service.jpg`, type: "jpeg", quality: 70 });

  // Bấm điểm chạm "Demo" trong khu
  await page.locator('.space-hotspot[data-hotspot="demo:marketing"] .space-diamond').click({ timeout: 10000 });
  await page.waitForURL("**/services/marketing/demo", { timeout: 15000 }).catch(() => {});
  check("[3d] điểm chạm Demo mở demo của khu", page.url().endsWith("/services/marketing/demo"), page.url());

  // Esc về khu cha rồi về tổng quan
  await page.waitForTimeout(1800); // chờ khung demo gắn xong (Esc xử lý ở khung đang hiển thị)
  await page.keyboard.press("Escape");
  await page.waitForURL("**/factory/services/marketing", { timeout: 15000 }).catch(() => {});
  check("[3d] Esc đóng demo, về khu dịch vụ", page.url().endsWith("/factory/services/marketing"), page.url());
  await page.waitForTimeout(1500);
  await page.keyboard.press("Escape");
  await page.waitForURL(/\/factory\/?$/, { timeout: 15000 }).catch(() => {});
  check("[3d] Esc đóng khu, về tổng quan", /\/factory\/?$/.test(page.url()), page.url());

  // Back / Forward
  await page.goBack();
  await page.waitForTimeout(1500);
  check("[3d] nút Back về khu trước", page.url().endsWith("/factory/services/marketing"), page.url());
  await page.goForward();
  await page.waitForTimeout(1200);

  // Phím tắt: 1 = dịch vụ đầu thanh nav (không phải "bước 1"), 5 = Dự án
  await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
  await page.keyboard.press("1");
  await page.waitForURL("**/factory/services/ai", { timeout: 15000 }).catch(() => {});
  check("[3d] phím số mở khu tương ứng", page.url().endsWith("/factory/services/ai"), page.url());

  // Mở sản phẩm bằng hotspot
  await page.goto(`${baseUrl}/factory/work?debug-space`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.documentElement.dataset.spaceLive === "on", null, { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(3500);
  const hotspot = page.locator('.space-hotspot[data-hotspot="project:vidi26"]');
  check("[3d] hotspot dự án VIDI26 có mặt", (await hotspot.count()) === 1);
  await hotspot.first().locator(".space-diamond").click({ timeout: 10000 });
  await page.waitForURL("**/factory/work/vidi26", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2500);
  check("[3d] bấm hotspot mở hồ sơ dự án", page.url().endsWith("/work/vidi26"), page.url());
  check("[3d] camera bay tới màn hình VIDI26", (await page.evaluate(() => window.__aegisSpace?.info?.().focus)) === "vidi26");
  check("[3d] hồ sơ dự án nối ngược về khu dịch vụ Web", (await page.locator('.space-panel a[href="/factory/services/web"]').count()) >= 1);
  await page.screenshot({ path: `${outDir}/3d-product.jpg`, type: "jpeg", quality: 70 });

  // Chuyển giữa các dự án: phím ← → và bộ chuyển nổi cạnh bảng (vuốt ngang nhường cho xoay camera)
  await page.keyboard.press("ArrowRight");
  await page.waitForURL("**/work/handle-vietnam", { timeout: 15000 }).catch(() => {});
  check("[3d] phím → sang dự án kế tiếp", page.url().endsWith("/work/handle-vietnam"), page.url());
  await page.waitForFunction(() => [...document.querySelectorAll(".space-stepper-count")].some((el) => el.getClientRects().length && el.textContent?.includes("02 / 07")), null, { timeout: 10000 }).catch(() => {});
  await page.keyboard.press("ArrowLeft");
  await page.waitForURL("**/work/vidi26", { timeout: 15000 }).catch(() => {});
  check("[3d] phím ← về dự án trước", page.url().endsWith("/work/vidi26"), page.url());
  await page.waitForFunction(() => [...document.querySelectorAll(".space-stepper-count")].some((el) => el.getClientRects().length && el.textContent?.includes("01 / 07")), null, { timeout: 10000 }).catch(() => {});
  await page.keyboard.press("ArrowRight");
  await page.waitForURL("**/work/handle-vietnam", { timeout: 15000 }).catch(() => {});
  await page.waitForFunction(() => document.querySelector(".space-stepper-count")?.textContent?.includes("02 / 07"), null, { timeout: 8000 }).catch(() => {});
  check("[3d] bộ chuyển 02 / 07 nổi cạnh bảng", (await page.locator(".space-stepper-count:visible").first().innerText().catch(() => "")).includes("02 / 07"));
  await page.getByRole("link", { name: /Mục trước/ }).first().click();
  await page.waitForURL("**/work/vidi26", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1500);

  // Đổi ngôn ngữ, giữ nguyên khu
  await page.locator(".space-top .space-lang").getByRole("link", { name: "Switch to English" }).click();
  await page.waitForURL("**/en/factory/work/vidi26", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(3500);
  await page.waitForFunction(() => document.documentElement.dataset.spaceLive === "on", null, { timeout: 60000 }).catch(() => {});
  check("[lang] chuyển EN giữ nguyên khu", page.url().endsWith("/en/factory/work/vidi26"), page.url());
  check("[lang] html lang = en sau khi chuyển", (await page.evaluate(() => document.documentElement.lang)) === "en");
  check("[lang] nav hiển thị tiếng Anh", /work/i.test(await page.locator(".space-nav:visible").innerText()));
  check("[lang] cảnh 3D vẫn chạy sau khi đổi ngôn ngữ", (await page.locator(".space-canvas").count()) === 1);
  check("[lang] sau khi đổi ngôn ngữ chỉ còn một khung Factory", (await page.locator(".space-root").count()) === 1);
  await page.waitForSelector(".space-hotspot", { timeout: 20000 }).catch(() => {});
  check("[lang] điểm chạm hiện bằng tiếng Anh", (await page.locator(".space-hotspot").count()) === 7);
  await page.screenshot({ path: `${outDir}/3d-en.jpg`, type: "jpeg", quality: 70 });
  await page.locator(".space-top .space-lang").getByRole("link", { name: "Chuyển sang tiếng Việt" }).click();
  await page.waitForURL("**/factory/work/vidi26", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2500);
  check("[lang] chuyển lại VI về đúng URL không tiền tố", !page.url().includes("/en/") && page.url().endsWith("/factory/work/vidi26"), page.url());

  // Chuyển bản phẳng và nhớ lựa chọn
  await page.getByRole("button", { name: /Bản phẳng/i }).click();
  await page.waitForTimeout(800);
  check("[flat] đổi sang bản phẳng bằng nút", (await page.locator(".space-canvas").count()) === 0);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const live = await page.evaluate(() => document.documentElement.dataset.spaceLive ?? "");
  check("[flat] lựa chọn bản phẳng được nhớ sau khi tải lại", live === "" && (await page.locator(".space-canvas").count()) === 0);
  await page.screenshot({ path: `${outDir}/flat.jpg`, type: "jpeg", quality: 70 });
  check("[3d] không lỗi console trong cả phiên tương tác", errors.length === 0, errors.slice(0, 1).join(" | ").slice(0, 200));
  await context.close();
} catch (e) {
  check("[3d] phần tương tác chạy hết", false, String(e).slice(0, 200));
} finally {
  await context?.close().catch(() => {});
}
}

// ---------- Phần 2b: điện thoại (3D) ----------
{
let context;
try {
  context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`${baseUrl}/factory?debug-space`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.documentElement.dataset.spaceLive === "on", null, { timeout: 90000 }).then(
    () => check("[mobile] cảnh 3D lên sóng", true),
    () => check("[mobile] cảnh 3D lên sóng", false, "quá 90 giây"),
  );
  check("[mobile] có intro AEGIS", await page.evaluate(() => document.documentElement.dataset.spaceBoot === "playing"));
  await page.waitForFunction(() => document.querySelector(".space-intro")?.dataset.ready === "true", null, { timeout: 90000 }).catch(() => {});
  const introCdp = await context.newCDPSession(page);
  await introCdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 195, y: 600 }] });
  for (let i = 1; i <= 8; i++) await introCdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 195, y: 600 - i * 20 }] });
  await introCdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await page.waitForFunction(() => Number(document.querySelector(".space-intro svg > g")?.getAttribute("transform")?.match(/scale\(([\d.]+)\)/)?.[1] ?? 1) > 1.2, null, { timeout: 15000 }).catch(() => {});
  check("[mobile] vuốt lên phóng to chữ AEGIS", (await introScale(page)) > 1.2, `scale ${await introScale(page)}`);
  await skipIntro(page);
  await page.waitForTimeout(4000);
  const stats = await page.evaluate(() => window.__aegisSpace?.info?.() ?? null);
  if (stats) {
    check("[mobile] không dùng bloom", stats.bloom === false);
    check("[mobile] draw call ≤ 80", stats.calls <= 80, `${stats.calls} lệnh vẽ`);
    check("[mobile] tam giác ≤ 60k", stats.triangles <= 60000, `${stats.triangles}`);
  } else check("[mobile] đọc được thống kê (?debug-space)", false);
  // Vùng chạm của điểm tương tác ≥ 44px
  const target = await page.evaluate(() => {
    const el = document.querySelector(".space-hotspot");
    if (!el) return null;
    const after = getComputedStyle(el, "::after");
    return { w: parseFloat(after.width), h: parseFloat(after.height) };
  });
  check("[mobile] vùng chạm hotspot ≥ 44px", Boolean(target) && target.w >= 44 && target.h >= 44, JSON.stringify(target));

  // Giao diện điện thoại: thanh trên gọn, nav 5 mục, "Dịch vụ" mở bảng 2 × 2 với bốn ô bằng nhau
  check("[mobile] có nút menu gọn ở thanh trên", (await page.getByRole("button", { name: "Menu" }).count()) === 1);
  check("[mobile] thanh nav có 5 biểu tượng (Dịch vụ + 4 khu)", (await page.locator(".space-nav .space-nav-icon:visible").count()) === 5);
  await page.locator(".space-nav-services-toggle button").tap();
  await page.waitForTimeout(400);
  const tiles = await page.evaluate(() => [...document.querySelectorAll(".space-services-sheet .space-service-tile")].map((a) => a.getBoundingClientRect()));
  check("[mobile] bảng Dịch vụ có 4 ô cùng cỡ", tiles.length === 4 && tiles.every((r) => Math.round(r.width) === Math.round(tiles[0].width) && Math.round(r.height) === Math.round(tiles[0].height)), `${tiles.length} ô`);
  await page.screenshot({ path: `${outDir}/mobile-services-sheet.jpg`, type: "jpeg", quality: 70 });
  await page.locator(".space-services-sheet .space-service-tile").nth(1).tap();
  await page.waitForURL("**/factory/services/software", { timeout: 15000 }).catch(() => {});
  check("[mobile] chạm một ô dịch vụ mở khu đó", page.url().endsWith("/factory/services/software"), page.url());
  await page.waitForTimeout(3000);
  check("[mobile] chạm một khu thì nội dung hiện ngay (sheet mở ở nấc vừa)", (await page.locator(".space-panel").getAttribute("data-snap")) === "mid");
  const sheetBox = await page.locator(".space-panel").boundingBox();
  check("[mobile] sheet đủ cao để đọc (≥ 35% màn hình) và còn thấy cảnh phía trên", Boolean(sheetBox) && sheetBox.height >= 844 * 0.35 && sheetBox.y >= 844 * 0.2, JSON.stringify(sheetBox));
  await page.screenshot({ path: `${outDir}/mobile-3d-service.jpg`, type: "jpeg", quality: 70 });
  // Bấm tay nắm: mở hết cỡ, bấm lại: về nấc vừa
  await page.locator(".space-handle").tap();
  await page.waitForTimeout(400);
  check("[mobile] chạm tay nắm mở hết cỡ", (await page.locator(".space-panel").getAttribute("data-snap")) === "full");
  await page.locator(".space-handle").tap();
  await page.waitForTimeout(300);

  // Bộ chuyển mục ‹ 01/07 › trên trang dự án (khu dịch vụ không có bộ đếm vì không có thứ tự)
  await page.goto(`${baseUrl}/factory/work/vidi26?debug-space`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.documentElement.dataset.spaceLive === "on", null, { timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(3500);
  check("[mobile] có bộ chuyển mục 01 / 07 ở Dự án", (await page.locator(".space-stepper-count").innerText().catch(() => "")).includes("01 / 07"));
  await page.getByRole("link", { name: /Mục sau/ }).tap();
  await page.waitForURL("**/factory/work/handle-vietnam", { timeout: 15000 }).catch(() => {});
  check("[mobile] chạm › chuyển sang dự án kế tiếp", page.url().endsWith("/work/handle-vietnam"), page.url());
  await page.waitForTimeout(3000);
  await page.goto(`${baseUrl}/factory/services/ai`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  check("[mobile] khu dịch vụ không có bộ đếm thứ tự", (await page.locator(".space-stepper-count").count()) === 0);

  // Kéo một ngón xoay camera quanh xưởng
  await page.goto(`${baseUrl}/factory?debug-space`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.documentElement.dataset.spaceLive === "on", null, { timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(4000);
  const cdp = await context.newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 340, y: 300 }] });
  for (let i = 1; i <= 16; i++) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 340 - i * 20, y: 300 }] });
    await page.waitForTimeout(16);
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await page.waitForFunction(() => Math.abs(window.__aegisSpace.info().azimuth) > 0.4, null, { timeout: 8000 }).catch(() => {});
  const look = await page.evaluate(() => window.__aegisSpace?.info?.() ?? null);
  check("[mobile] vuốt một ngón xoay camera quanh xưởng (>0,4 rad)", Boolean(look) && Math.abs(look.azimuth) > 0.4, `azimuth ${look?.azimuth}`);
  check("[mobile] gợi ý kéo biến mất sau lần kéo đầu", (await page.locator(".space-drag-hint").count()) === 0);
  // Menu điện thoại có đổi ngôn ngữ
  await page.getByRole("button", { name: "Menu" }).tap();
  await page.waitForTimeout(300);
  check("[mobile] menu có nút đổi ngôn ngữ", (await page.locator(".space-menu .space-lang-link").count()) === 2);
  check("[mobile] không lỗi console", errors.length === 0, errors.slice(0, 2).join(" | "));
  await context.close();
} catch (e) {
  check("[mobile] phần 3D chạy hết", false, String(e).slice(0, 200));
} finally {
  await context?.close().catch(() => {});
}
}

// ---------- Phần 2c: ba demo minh họa (bản phẳng cho nhẹ, không cần WebGL) ----------
{
let context;
try {
  context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => {
    try {
      localStorage.setItem("aegis-space-mode", "flat");
      sessionStorage.setItem("aegis-factory-boot", "1");
    } catch {}
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  for (const lang of ["vi", "en"]) {
    const base = `${baseUrl}${lang === "en" ? "/en" : ""}/factory/services`;
    for (const id of DEMOS) {
      await page.goto(`${base}/${id}/demo`, { waitUntil: "networkidle" });
      await page.waitForTimeout(800);
      const badge = await page.locator(".space-demo-badge").innerText().catch(() => "");
      check(`[demo ${lang}/${id}] có nhãn "demo minh họa, dữ liệu giả định"`, /(giả định|fictional)/i.test(badge), badge);
    }
  }

  // AI: bấm câu hỏi → có câu trả lời + đoạn tài liệu được tô sáng
  await page.goto(`${baseUrl}/factory/services/ai/demo`, { waitUntil: "networkidle" });
  await page.locator(".space-chip-btn").first().click();
  await page.waitForSelector(".space-bubble[data-from='assistant']", { timeout: 8000 }).catch(() => {});
  await page.waitForFunction(() => document.querySelectorAll(".space-bubble[data-from='assistant']").length >= 1 && !document.body.innerText.includes("Đang tra tài liệu"), null, { timeout: 8000 }).catch(() => {});
  check("[demo ai] bấm câu hỏi hiện câu trả lời", (await page.locator(".space-bubble[data-from='assistant']").count()) >= 1);
  check("[demo ai] đoạn tài liệu được dùng được tô sáng", (await page.locator('.space-demo-passage[data-cited="true"]').count()) === 1);
  check("[demo ai] ghi rõ kịch bản soạn sẵn, không gọi AI", /không gọi mô hình AI/i.test(await page.locator(".space-demo").innerText()));

  // Software: chuyển đơn, duyệt phiếu, lọc tồn kho
  await page.goto(`${baseUrl}/factory/services/software/demo`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Chuyển sang bước sau: DH-1042/ }).click();
  const doing = page.locator('section[aria-label="Đang xử lý"]');
  check("[demo software] chuyển đơn sang bước sau", (await doing.innerText()).includes("DH-1042"));
  await page.getByRole("button", { name: "Duyệt" }).first().click();
  check("[demo software] duyệt phiếu hiện trạng thái", (await page.getByText("Đã duyệt").count()) >= 1);
  await page.getByRole("button", { name: "Sắp hết" }).click();
  check("[demo software] lọc tồn kho sắp hết còn 2 mặt hàng", (await page.locator(".space-stock").count()) === 2, `${await page.locator(".space-stock").count()}`);

  // Marketing: chọn ý tưởng, đặt vào ô, xem trước
  await page.goto(`${baseUrl}/factory/services/marketing/demo`, { waitUntil: "networkidle" });
  await page.locator(".space-chip-btn").first().click();
  await page.getByRole("button", { name: /Đặt vào T2, Facebook/ }).click();
  check("[demo marketing] đặt bài vào lịch hiện bản xem trước", (await page.locator(".space-post").innerText().catch(() => "")).includes("Bộ sưu tập mùa thu"));
  check("[demo marketing] không có số liệu hiệu quả (reach, CTR…)", !/(reach|CTR|lượt tiếp cận|lượt xem|%)/i.test(await page.locator(".space-demo").innerText()));
  await page.screenshot({ path: `${outDir}/demo-marketing.jpg`, type: "jpeg", quality: 70 });
  check("[demo] không lỗi console", errors.length === 0, errors.slice(0, 1).join(" | ").slice(0, 200));
  await context.close();
} catch (e) {
  check("[demo] phần demo chạy hết", false, String(e).slice(0, 200));
} finally {
  await context?.close().catch(() => {});
}
}

// ---------- Phần 3: dự phòng ----------
try {
  const plain = await chromium.launch({ args: ["--disable-3d-apis"] });
  const context = await plain.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/factory`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  check("[fallback] không WebGL: có intro AEGIS nhưng bỏ qua được", (await skipIntro(page)) === true);
  await page.waitForTimeout(800);
  check("[fallback] không WebGL: tự dùng bản phẳng", (await page.locator(".space-canvas").count()) === 0);
  check("[fallback] có thông báo bản phẳng", (await page.locator(".space-notice").count()) === 1);
  check("[fallback] mặt bằng phẳng hiển thị", await page.locator(".space-map").isVisible());
  const rooms = await page.locator(".space-room").count();
  check("[fallback] mặt bằng có 8 khu là liên kết thật", rooms === 8, `${rooms}`);
  await page.locator(".space-room").first().click();
  await page.waitForTimeout(1200);
  check("[fallback] bấm khu trên mặt bằng mở khu", /\/factory\/about/.test(page.url()), page.url());
  await context.close();
  await plain.close();

  const rm = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const rmPage = await rm.newPage();
  await rmPage.goto(`${baseUrl}/factory`, { waitUntil: "domcontentloaded" });
  const bootRm = await rmPage.evaluate(() => document.documentElement.dataset.spaceBoot ?? "");
  check("[reduced-motion] không có intro", bootRm === "");
  const deep = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const deepPage = await deep.newPage();
  await deepPage.goto(`${baseUrl}/factory/work`, { waitUntil: "domcontentloaded" });
  check("[intro] link sâu (/factory/work) vào thẳng, không intro", (await deepPage.evaluate(() => document.documentElement.dataset.spaceBoot ?? "")) === "");
  await deep.close();
  await rm.close();

  const nojs = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  const njPage = await nojs.newPage();
  await njPage.goto(`${baseUrl}/factory/work`, { waitUntil: "load" });
  check("[no-js] nội dung Dự án vẫn có trong HTML", (await njPage.locator("h1").count()) === 1 && (await njPage.locator(".space-card").count()) === 7);
  await njPage.goto(`${baseUrl}/en/factory/services/ai`, { waitUntil: "load" });
  check("[no-js] khu dịch vụ tiếng Anh vẫn có nội dung", (await njPage.locator("h1").innerText()).includes("Enterprise AI"));
  await nojs.close();
} catch (e) {
  check("[fallback] phần dự phòng chạy hết", false, String(e).slice(0, 200));
}

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} kiểm tra đạt`);
if (failed.length) {
  console.log("Chưa đạt:");
  for (const f of failed) console.log(` - ${f.name}${f.detail ? ` — ${f.detail}` : ""}`);
  process.exitCode = 1;
}
