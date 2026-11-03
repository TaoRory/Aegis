// Kiểm tra Studio Aegis (/demo) bằng trình duyệt thật: chế độ 3D, kim cương, khung nội dung, báo giá → form, bản phẳng, điện thoại.
// Chạy: pnpm build && pnpm start (cửa sổ khác) rồi node scripts/qa-showroom.mjs [baseUrl]
import { chromium } from "playwright";

const baseUrl = process.argv[2] ?? "http://localhost:3000";
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};
const SECTIONS = ["web", "projects", "marketing", "about", "contact"];
const gpu = ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"];
const browser = await chromium.launch({ args: gpu });

async function enter(page) {
  await page.waitForFunction(() => document.querySelector(".showroom-enter") && !document.querySelector(".showroom-enter").disabled, null, { timeout: 90_000 });
  await page.locator(".showroom-enter").click();
  await page.waitForTimeout(1200);
}

// ---- HTML server: noindex, 1 h1, nội dung 2 gói có sẵn (không cần JS) ----
{
  const res = await fetch(`${baseUrl}/demo`);
  const html = await res.text();
  check("/demo trả 200", res.status === 200, String(res.status));
  check("/demo có noindex", /<meta name="robots" content="noindex/.test(html));
  check("/demo có đúng 1 h1 trong HTML", (html.match(/<h1[\s>]/g) ?? []).length === 1);
  check("HTML server có đủ nội dung 2 gói và marketing", /Gói Sở hữu/.test(html) && /Gói Đồng hành/.test(html) && /Digital Marketing/.test(html));
  check("không có giá tiền trong trang", !/(\d[\d.,]*\s?(đ|vnđ|vnd|triệu|tr)\b)|₫/i.test(html.replace(/<script[\s\S]*?<\/script>/g, "")));
  const sitemap = await (await fetch(`${baseUrl}/sitemap.xml`)).text();
  check("/demo không có trong sitemap", !/\/demo</.test(sitemap));
}

// ---- Desktop 3D ----
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(`${baseUrl}/demo?debug-room`, { waitUntil: "domcontentloaded" });
  check("[desktop] màn khởi động hiện trước khi vào", await page.locator(".showroom-boot").isVisible());
  await enter(page);
  check("[desktop] vào chế độ 3D", (await page.locator(".showroom").getAttribute("data-mode")) === "3d");
  const shown = await page.evaluate(() => [...document.querySelectorAll(".showroom-hotspot")].filter((e) => e.dataset.hidden === "false").length);
  check("[desktop] 5 kim cương hiện ở toàn cảnh", shown === 5, String(shown));
  const calls = await page.evaluate(() => window.__aegisRoom?.drawCalls ?? -1);
  check("[desktop] lệnh vẽ ≤ 80", calls > 0 && calls <= 80, String(calls));

  for (const id of SECTIONS) {
    // đang mở một khu thì các kim cương khác ẩn: đóng về toàn cảnh trước
    if (await page.locator(".showroom-panel").count()) {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(1400);
    }
    await page.locator(`.showroom-hotspot[data-hotspot="${id}"]`).click();
    await page.waitForTimeout(1500);
    const sec = await page.locator(".showroom-panel").getAttribute("data-section").catch(() => null);
    check(`[desktop] bấm kim cương ${id} → mở đúng khung, #${id}`, sec === id && (await page.evaluate(() => location.hash)) === `#${id}`, `${sec}`);
  }
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1300);
  check("[desktop] Esc đóng khung", (await page.locator(".showroom-panel").count()) === 0);

  await page.locator('.showroom-nav button:has-text("Website")').click();
  await page.waitForTimeout(1400);
  await page.locator('.sr-package[data-pkg="grow"] .sr-cta').click();
  await page.waitForTimeout(1500);
  const contactOpen = (await page.locator(".showroom-panel").getAttribute("data-section")) === "contact";
  const step = await page.locator("[data-current] [data-step-title]").first().innerText().catch(() => "");
  check("[desktop] 'Nhận báo giá' gói Đồng hành → khung Liên hệ, form đã chọn sẵn Website", contactOpen && !/dựng gì/i.test(step), step.replace(/\s+/g, " ").slice(0, 60));
  await page.goBack();
  await page.waitForTimeout(1300);
  check("[desktop] nút Back của trình duyệt quay về khu trước", (await page.locator(".showroom-panel").getAttribute("data-section").catch(() => null)) === "web");
  check("[desktop] không lỗi console", errors.length === 0, errors.slice(0, 2).join(" | "));
  await ctx.close();
}

// ---- Vào thẳng bằng #hash ----
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${baseUrl}/demo#marketing`, { waitUntil: "domcontentloaded" });
  await enter(page);
  await page.waitForTimeout(800);
  check("[desktop] /demo#marketing mở thẳng khu Marketing", (await page.locator(".showroom-panel").getAttribute("data-section").catch(() => null)) === "marketing");
  await ctx.close();
}

// ---- Điện thoại ----
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 780 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(`${baseUrl}/demo`, { waitUntil: "domcontentloaded" });
  await enter(page);
  await page.locator('.showroom-nav button:has-text("Dự án")').click();
  await page.waitForTimeout(1500);
  const box = await page.locator(".showroom-panel").boundingBox();
  check("[mobile] khung nội dung là bottom sheet (nằm nửa dưới, không tràn ngang)", !!box && box.y > 200 && box.x >= 0 && box.x + box.width <= 390, box ? `${Math.round(box.y)} ${Math.round(box.width)}` : "-");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  check("[mobile] không cuộn ngang", !overflow);
  await ctx.close();
}

// ---- Bản phẳng (không WebGL) ----
{
  const flat = await chromium.launch({ args: ["--disable-webgl", "--disable-webgl2", "--disable-3d-apis"] });
  const ctx = await flat.newContext({ viewport: { width: 1280, height: 860 } });
  const page = await ctx.newPage();
  await page.goto(`${baseUrl}/demo`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const mode = await page.locator(".showroom").getAttribute("data-mode");
  check("[flat] không có WebGL → bản phẳng", mode === "flat", String(mode));
  check("[flat] có thông báo đang ở bản phẳng", await page.locator(".sr-flat-notice").isVisible().catch(() => false));
  check("[flat] đủ 5 khu và 2 gói hiển thị", (await page.locator(".sr-flat-section").count()) === 5 && (await page.locator(".sr-package").count()) === 2);
  await page.locator('.sr-package[data-pkg="own"] .sr-cta').click();
  await page.waitForTimeout(1500);
  const msg = await page.locator("textarea#message").inputValue().catch(() => "");
  const title = await page.locator("#khu-contact [data-current] [data-step-title]").first().innerText().catch(() => "");
  check("[flat] 'Nhận báo giá' gói Sở hữu → form đã chọn Website", !/dựng gì/i.test(title) || /Sở hữu/.test(msg), title.replace(/\s+/g, " ").slice(0, 60));
  await ctx.close();
  await flat.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} kiểm tra đạt`);
process.exit(failed.length ? 1 : 0);
