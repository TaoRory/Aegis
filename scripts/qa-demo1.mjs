// Kiểm tra bản thiết kế tối giản /demo1 trên bản build.
// Chạy: pnpm build && pnpm start (cửa sổ khác) rồi node scripts/qa-demo1.mjs [baseUrl]
import { chromium, devices } from "playwright";

const baseUrl = process.argv[2] ?? "http://localhost:3000";
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const browser = await chromium.launch();
const viewports = [
  { name: "desktop", options: { viewport: { width: 1440, height: 900 } } },
  { name: "laptop", options: { viewport: { width: 1280, height: 720 } } },
  { name: "mobile", options: { ...devices["iPhone 13"] } },
];

for (const vp of viewports) {
  const context = await browser.newContext(vp.options);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  const response = await page.goto(`${baseUrl}/demo1`, { waitUntil: "networkidle" });
  check(`[${vp.name}] /demo1 trả 200`, response?.status() === 200, String(response?.status()));
  await page.waitForTimeout(800);

  // Nội dung hiện ngay, không chờ cuộn
  const hero = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    const r = h1?.getBoundingClientRect();
    return { text: h1?.textContent ?? "", opacity: h1 ? getComputedStyle(h1).opacity : "0", top: r?.top ?? 9999, bottom: r?.bottom ?? 9999 };
  });
  check(`[${vp.name}] tiêu đề nói rõ dịch vụ, hiện ngay trong màn đầu`, /website/i.test(hero.text) && /marketing/i.test(hero.text) && hero.opacity === "1" && hero.bottom < (vp.options.viewport?.height ?? 664));
  const ctaVisible = await page.evaluate(() => {
    const a = [...document.querySelectorAll("main a")].find((el) => /Trao đổi nhu cầu/.test(el.textContent ?? ""));
    const r = a?.getBoundingClientRect();
    return !!r && r.bottom <= window.innerHeight && r.top >= 0;
  });
  check(`[${vp.name}] nút "Trao đổi nhu cầu" nằm trong màn đầu`, ctaVisible);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(`[${vp.name}] không tràn ngang`, overflow <= 0, `${overflow}px`);

  const robots = await page.locator('meta[name="robots"]').getAttribute("content");
  check(`[${vp.name}] noindex`, /noindex/.test(robots ?? ""), robots ?? "-");

  const projectLinks = await page.locator('#du-an a[href^="/demo1/du-an/"]').count();
  check(`[${vp.name}] 7 dự án thật dẫn tới trang riêng`, projectLinks === 7, String(projectLinks));

  const brokenImages = await page.evaluate(async () => {
    const imgs = [...document.images];
    for (const img of imgs) img.loading = "eager";
    await Promise.all(imgs.map((img) => (img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; }))));
    return imgs.filter((img) => !img.naturalWidth).map((img) => img.currentSrc || img.src);
  });
  check(`[${vp.name}] ảnh tải được`, brokenImages.length === 0, brokenImages.join(", "));

  // Dịch vụ: mục đầu mở sẵn; link ở hàng dịch vụ mở đúng mục
  const firstOpen = await page.evaluate(() => document.querySelector("#dich-vu-ai")?.hasAttribute("open"));
  check(`[${vp.name}] mục dịch vụ đầu mở sẵn`, !!firstOpen);
  await page.locator('a[href="#dich-vu-marketing"]').first().click();
  await page.waitForTimeout(1200);
  const marketingOpen = await page.evaluate(() => document.querySelector("#dich-vu-marketing")?.hasAttribute("open"));
  check(`[${vp.name}] bấm "Marketing" ở màn đầu mở đúng mục`, !!marketingOpen);

  // Dấu Aegis bằng ký tự đã vẽ (canvas có điểm ảnh sáng)
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  const markDrawn = await page.evaluate(() => {
    const c = document.querySelector(".d1-mark canvas");
    if (!c) return false;
    const ctx = c.getContext("2d");
    const { data } = ctx.getImageData(0, 0, c.width, c.height);
    let bright = 0;
    for (let i = 0; i < data.length; i += 16) if (data[i + 1] > 120) bright++;
    return bright > 200;
  });
  check(`[${vp.name}] dấu Aegis dựng bằng ký tự đã vẽ`, markDrawn);

  if (vp.name === "mobile") {
    await page.locator("button[aria-controls='d1-menu']").tap();
    await page.waitForTimeout(300);
    const menuOpen = await page.locator("#d1-menu").isVisible();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    check("[mobile] menu mở được, Esc đóng", menuOpen && (await page.locator("#d1-menu").count()) === 0);
  }

  check(`[${vp.name}] không lỗi console`, errors.length === 0, errors.join(" | ").slice(0, 300));
  await context.close();
}

// Trang dự án + trang liên hệ
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  for (const slug of ["vidi26", "handle-vietnam", "integritas-vu-legal", "tedx-vinuniversity-2026", "rethink", "tedx-vinuniversity-2025", "rethink-halloween"]) {
    const res = await page.goto(`${baseUrl}/demo1/du-an/${slug}`, { waitUntil: "domcontentloaded" });
    const title = await page.locator("h1").textContent();
    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    check(`[dự án] /demo1/du-an/${slug}`, res?.status() === 200 && !!title && /noindex/.test(robots ?? ""), `${res?.status()} ${title}`);
  }
  // cacheComponents: trang dựng lúc chạy đã gửi vỏ trước khi notFound() nên giữ mã 200 ("soft 404"), Next thêm noindex
  await page.goto(`${baseUrl}/demo1/du-an/khong-co`, { waitUntil: "networkidle" });
  const notFoundTitle = (await page.locator("main h1").textContent()) ?? "";
  const notFoundRobots = await page.locator('meta[name="robots"]').evaluateAll((els) => els.map((el) => el.getAttribute("content")).join(" "));
  check("[dự án] slug không có → trang 404 của /demo1, noindex", /Không tìm thấy/.test(notFoundTitle) && /noindex/.test(notFoundRobots), notFoundTitle.slice(0, 40));

  await page.goto(`${baseUrl}/demo1/lien-he?dv=web`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const wizard = await page.locator("form.wizard-grid").count();
  const preset = await page.locator(".wizard-sheet-inner").textContent();
  check("[liên hệ] form từng bước, nhận sẵn ?dv=web", wizard === 1 && /Website/.test(preset ?? ""), (preset ?? "").replace(/\s+/g, " ").slice(0, 80));
  check("[dự án/liên hệ] không lỗi console", errors.length === 0, errors.join(" | ").slice(0, 300));
  await context.close();
}

await browser.close();
const passed = results.filter((r) => r.ok).length;
console.log(`\n${passed}/${results.length} kiểm tra đạt`);
process.exit(passed === results.length ? 0 : 1);
