// Kiểm tra Xưởng Aegis (phiên bản 2, /factory) bằng trình duyệt thật (Playwright).
// Chạy: pnpm build && pnpm start   (cửa sổ khác)  rồi  pnpm qa:factory [baseUrl]
// Phần 1: quét mọi route /factory/... (desktop + mobile). Phần 2: tương tác 3D. Phần 3: dự phòng (không WebGL, giảm chuyển động).
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

// ---------- Phần 1: quét route ----------
async function crawl() {
  const seen = new Set();
  const queue = ["/factory"];
  while (queue.length) {
    const route = queue.shift();
    if (seen.has(route)) continue;
    seen.add(route);
    const res = await fetch(baseUrl + route);
    if (!res.ok) continue;
    const html = await res.text();
    for (const m of html.matchAll(/href="(\/factory[a-z0-9\/-]*)(?:[?#][^"]*)?"/g)) {
      const next = m[1].replace(/\/$/, "") || "/factory";
      if (!seen.has(next)) queue.push(next);
    }
  }
  return [...seen].sort();
}

const routes = await crawl();
check("[factory] quét được các route", routes.length === 19, `${routes.length} route`);
const expected = ["/factory", "/factory/trung-bay", "/factory/thi-nghiem", "/factory/mau-giao-dien", "/factory/dich-vu", "/factory/ve-aegis", "/factory/nhat-ky", "/factory/lien-he"];
for (const r of expected) check(`[factory] có route ${r}`, routes.includes(r));
check("[factory] có 7 trang sản phẩm", routes.filter((r) => r.startsWith("/factory/trung-bay/")).length === 7);
check("[factory] có 4 trang thí nghiệm", routes.filter((r) => r.startsWith("/factory/thi-nghiem/")).length === 4);

const browser = await chromium.launch({ args: GL_ARGS });

for (const vp of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844, isMobile: true, hasTouch: true },
]) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, hasTouch: vp.hasTouch });
  const page = await context.newPage();
  let errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  for (const route of routes) {
    errors = [];
    const response = await page.goto(baseUrl + route, { waitUntil: "networkidle", timeout: 90000 }).catch(() => null);
    await page.waitForTimeout(vp.name === "desktop" ? 1800 : 1200);
    const info = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      h1: document.querySelectorAll("h1").length,
      robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? "",
      badLinks: [...document.querySelectorAll('a[target="_blank"]')].filter((a) => !/noopener/.test(a.rel)).length,
      brokenImages: [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.currentSrc).length,
    }));
    const tag = `[${vp.name}] ${route}`;
    check(`${tag} trả 200`, response?.status() === 200, String(response?.status()));
    check(`${tag} có đúng 1 h1`, info.h1 === 1, `${info.h1} h1`);
    check(`${tag} noindex`, /noindex/.test(info.robots), info.robots);
    check(`${tag} không tràn ngang`, info.overflow <= 0, `${info.overflow}px`);
    check(`${tag} link ngoài có rel=noopener`, info.badLinks === 0);
    check(`${tag} không ảnh vỡ`, info.brokenImages === 0, `${info.brokenImages} ảnh`);
    check(`${tag} không lỗi console`, errors.length === 0, errors.slice(0, 1).join(" | ").slice(0, 160));
  }
  await context.close();
}

// ---------- Phần 2: tương tác 3D (desktop) ----------
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`${baseUrl}/factory?debug-space`, { waitUntil: "domcontentloaded" });

  const boot = await page.evaluate(() => document.documentElement.dataset.spaceBoot ?? "");
  check("[3d] vào /factory lần đầu có màn khởi động", boot === "playing", boot);
  await page.waitForFunction(() => document.documentElement.dataset.spaceLive === "on", null, { timeout: 60000 }).then(
    () => check("[3d] cảnh 3D lên sóng", true),
    () => check("[3d] cảnh 3D lên sóng", false, "quá 60 giây"),
  );
  await page.waitForTimeout(4000);
  const zone = () => page.evaluate(() => window.__aegisSpace?.info?.().zone ?? "?");
  const canvas = await page.locator(".space-canvas").count();
  check("[3d] có canvas WebGL", canvas === 1, `${canvas}`);
  const stats = await page.evaluate(() => window.__aegisSpace?.info?.() ?? null);
  if (stats) {
    check("[3d] draw call ≤ 120", stats.calls <= 120, `${stats.calls} lệnh vẽ`);
    check("[3d] tam giác ≤ 150k", stats.triangles <= 150000, `${stats.triangles}`);
  } else check("[3d] đọc được thống kê (?debug-space)", false);
  check("[3d] khu mặc định là hub", (await zone()) === "hub", await zone());
  check("[3d] hotspot hiện ở tổng mặt bằng", (await page.locator(".space-hotspot").count()) === 7, `${await page.locator(".space-hotspot").count()}`);
  await page.screenshot({ path: `${outDir}/3d-hub.jpg`, type: "jpeg", quality: 70 });

  // Bấm thanh điều hướng
  await page.getByRole("link", { name: /02\s*Thí nghiệm/i }).first().click();
  await page.waitForURL("**/factory/thi-nghiem", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2500);
  check("[3d] bấm thanh điều hướng đổi URL", page.url().endsWith("/factory/thi-nghiem"), page.url());
  check("[3d] camera chuyển sang khu thí nghiệm", (await zone()) === "thi-nghiem", await zone());
  await page.screenshot({ path: `${outDir}/3d-lab.jpg`, type: "jpeg", quality: 70 });

  // Esc về mặt bằng
  await page.keyboard.press("Escape");
  await page.waitForURL(/\/factory\/?$/, { timeout: 15000 }).catch(() => {});
  check("[3d] Esc đóng khung, về tổng mặt bằng", /\/factory\/?$/.test(page.url()), page.url());

  // Back / Forward
  await page.goBack();
  await page.waitForTimeout(1500);
  check("[3d] nút Back về khu trước", page.url().endsWith("/factory/thi-nghiem"), page.url());
  await page.goForward();
  await page.waitForTimeout(1200);

  // Phím tắt (khi focus không nằm trong nội dung)
  await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
  await page.keyboard.press("4");
  await page.waitForURL("**/factory/dich-vu", { timeout: 15000 }).catch(() => {});
  check("[3d] phím số mở khu tương ứng", page.url().endsWith("/factory/dich-vu"), page.url());

  // Mở sản phẩm bằng hotspot
  await page.goto(`${baseUrl}/factory/trung-bay?debug-space`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.documentElement.dataset.spaceLive === "on", null, { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(3500);
  const hotspot = page.locator('.space-hotspot[data-hotspot="project:vidi26"]');
  check("[3d] hotspot dự án VIDI26 có mặt", (await hotspot.count()) === 1);
  await hotspot.first().locator(".space-diamond").click({ timeout: 10000 });
  await page.waitForURL("**/factory/trung-bay/vidi26", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2500);
  check("[3d] bấm hotspot mở hồ sơ sản phẩm", page.url().endsWith("/trung-bay/vidi26"), page.url());
  check("[3d] camera bay tới màn hình VIDI26", (await page.evaluate(() => window.__aegisSpace?.info?.().focus)) === "vidi26");
  await page.screenshot({ path: `${outDir}/3d-product.jpg`, type: "jpeg", quality: 70 });

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
}

// ---------- Phần 3: dự phòng ----------
try {
  const plain = await chromium.launch({ args: ["--disable-3d-apis"] });
  const context = await plain.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/factory`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  check("[fallback] không WebGL: tự dùng bản phẳng", (await page.locator(".space-canvas").count()) === 0);
  check("[fallback] có thông báo bản phẳng", (await page.locator(".space-notice").count()) === 1);
  check("[fallback] mặt bằng phẳng hiển thị", await page.locator(".space-map").isVisible());
  const rooms = await page.locator(".space-room").count();
  check("[fallback] mặt bằng có 7 phòng là liên kết thật", rooms === 7, `${rooms}`);
  await page.locator(".space-room").first().click();
  await page.waitForTimeout(1200);
  check("[fallback] bấm phòng trên mặt bằng mở khu", /\/factory\/trung-bay/.test(page.url()), page.url());
  await context.close();
  await plain.close();

  const rm = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const rmPage = await rm.newPage();
  await rmPage.goto(`${baseUrl}/factory`, { waitUntil: "domcontentloaded" });
  const bootRm = await rmPage.evaluate(() => document.documentElement.dataset.spaceBoot ?? "");
  check("[reduced-motion] không có màn khởi động", bootRm === "");
  await rm.close();

  const nojs = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  const njPage = await nojs.newPage();
  await njPage.goto(`${baseUrl}/factory/trung-bay`, { waitUntil: "load" });
  check("[no-js] nội dung khu vẫn có trong HTML", (await njPage.locator("h1").count()) === 1 && (await njPage.locator(".space-card").count()) === 7);
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
