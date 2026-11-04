// Kiểm tra Studio Aegis (/demo) bằng trình duyệt thật: chế độ 3D, kim cương, màn hình nội dung khít màn hình 3D, tab,
// báo giá → form, Thợ Aegis đi lại, bản phẳng, điện thoại.
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

/** Vào phòng: intro logo của trang chính đang chạy thì bấm "Bỏ qua" (phóng xuyên lõi), rồi chờ phòng nhận lệnh */
async function enter(page) {
  const skip = page.locator(".site-intro-skip");
  if (await skip.isVisible().catch(() => false)) await skip.click();
  await page.waitForSelector(".showroom[data-entered]", { timeout: 120_000 });
  await page.waitForSelector(".site-intro", { state: "detached", timeout: 20_000 }).catch(() => {});
  await page.waitForFunction(() => document.querySelector(".showroom")?.dataset.mode !== "3d" || !!window.__aegisRoom || !location.search.includes("debug-room"), null, { timeout: 120_000 });
  await page.waitForTimeout(1200);
}
/** chờ camera tới nơi và lớp màn hình bật sáng */
const screenOn = (page, id) => page.waitForSelector(`.showroom-screen[data-section="${id}"][data-on]`, { timeout: 20_000 }).then(() => true).catch(() => false);

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
  await page.waitForTimeout(600);
  check("[desktop] vào trang là intro logo của trang chính (không còn nút 'Vào studio')", (await page.locator(".site-intro").isVisible()) && (await page.locator(".showroom-enter").count()) === 0);
  await enter(page);
  check("[desktop] vào chế độ 3D", (await page.locator(".showroom").getAttribute("data-mode")) === "3d");
  const shown = await page.evaluate(() => [...document.querySelectorAll(".showroom-hotspot")].filter((e) => e.dataset.hidden === "false").length);
  check("[desktop] 5 kim cương hiện ở toàn cảnh", shown === 5, String(shown));
  const calls = await page.evaluate(() => window.__aegisRoom?.drawCalls ?? -1);
  check("[desktop] lệnh vẽ ≤ 130 (kể cả bóng đổ)", calls > 0 && calls <= 130, String(calls));

  // Thợ Aegis: đủ số lượng và đang di chuyển / cử động
  const m0 = await page.evaluate(() => window.__aegisRoom.makerState);
  // (GPU giả lập trong kiểm thử chỉ vài khung hình/giây: đo trong 3 giây, ngưỡng nhỏ)
  await page.waitForTimeout(3000);
  const m1 = await page.evaluate(() => window.__aegisRoom.makerState);
  const moved = m1.positions.filter((p, i) => Math.hypot(p[0] - m0.positions[i][0], p[1] - m0.positions[i][1], p[2] - m0.positions[i][2]) > 0.003 || Math.abs(p[3] - m0.positions[i][3]) > 0.01).length;
  check("[desktop] có ≥ 8 Thợ Aegis và họ đang làm việc (di chuyển / cử động)", m1.count >= 8 && moved >= 4, `${m1.count} thợ, ${moved} đang động`);

  for (const id of SECTIONS) {
    // đang mở một khu thì kim cương ẩn: đóng về toàn cảnh trước
    if (await page.locator(".showroom-screen").count()) {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(1700);
    }
    await page.locator(`.showroom-hotspot[data-hotspot="${id}"]`).click();
    const on = await screenOn(page, id);
    const hash = await page.evaluate(() => location.hash);
    // lớp HTML phải nằm khít hình chiếu của màn hình 3D
    const fit = await page.evaluate((id) => {
      const r = document.querySelector(".showroom-screen").getBoundingClientRect();
      const s = window.__aegisRoom.screenRect(id);
      return Math.max(Math.abs(r.left - s.x), Math.abs(r.top - s.y), Math.abs(r.width - s.w), Math.abs(r.height - s.h));
    }, id);
    const area = await page.evaluate(() => {
      const r = document.querySelector(".showroom-screen").getBoundingClientRect();
      return (r.width * r.height) / (innerWidth * innerHeight);
    });
    check(`[desktop] bấm kim cương ${id} → màn hình ${id} bật, #${id}, khít màn hình 3D, phủ ≥ 45% khung nhìn`, on && hash === `#${id}` && fit <= 4 && area >= 0.45, `lệch ${fit.toFixed(1)}px, phủ ${(area * 100).toFixed(0)}%`);
  }
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1700);
  check("[desktop] Esc đóng màn hình, về toàn cảnh", (await page.locator(".showroom-screen").count()) === 0);

  await page.locator('.showroom-nav button:has-text("Website")').click();
  await screenOn(page, "web");
  const clear = await page.evaluate(() => {
    const a = document.querySelector(".showroom-menu-btn").getBoundingClientRect();
    const b = document.querySelector(".showroom-screen").getBoundingClientRect();
    const hit = document.elementFromPoint(a.left + a.width / 2, a.top + a.height / 2);
    return { overlap: !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom), top: !!hit?.closest(".showroom-menu-btn") };
  });
  check("[desktop] nút logo / menu không bị màn hình che", !clear.overlap && clear.top, JSON.stringify(clear));
  check("[desktop] màn hình Website mở ra là thấy ngay 2 gói", (await page.locator('.showroom-screen .sr-package:visible').count()) === 2);
  await page.locator('.showroom-screen [role="tab"]:has-text("So sánh")').click();
  await page.waitForTimeout(300);
  check("[desktop] chuyển tab 'So sánh' hiện bảng so sánh", await page.locator(".showroom-screen .sr-table").isVisible());
  await page.locator('.showroom-screen [role="tab"]:has-text("Hai gói")').click();
  await page.locator('.showroom-screen .sr-package[data-pkg="grow"] .sr-cta').click();
  const contactOn = await screenOn(page, "contact");
  const step = await page.locator(".showroom-screen [data-current] [data-step-title]").first().innerText().catch(() => "");
  check("[desktop] 'Nhận báo giá' gói Đồng hành → màn hình Liên hệ, form đã chọn sẵn Website", contactOn && !/dựng gì/i.test(step), step.replace(/\s+/g, " ").slice(0, 60));
  await page.goBack();
  check("[desktop] nút Back của trình duyệt quay về khu trước", await screenOn(page, "web"));
  check("[desktop] không lỗi console", errors.length === 0, errors.slice(0, 2).join(" | "));
  await ctx.close();
}

// ---- Vào thẳng bằng #hash ----
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${baseUrl}/demo#marketing`, { waitUntil: "domcontentloaded" });
  await enter(page);
  check("[desktop] /demo#marketing mở thẳng màn hình Marketing", await screenOn(page, "marketing"));
  await ctx.close();
}

// ---- Giảm chuyển động: thợ đứng yên ----
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(`${baseUrl}/demo?debug-room`, { waitUntil: "domcontentloaded" });
  await enter(page);
  const a = await page.evaluate(() => window.__aegisRoom.makerState.positions);
  await page.waitForTimeout(1200);
  const b = await page.evaluate(() => window.__aegisRoom.makerState.positions);
  check("[reduced] bật giảm chuyển động → Thợ Aegis đứng yên", JSON.stringify(a) === JSON.stringify(b));
  await page.locator('.showroom-nav button:has-text("Dự án")').click();
  check("[reduced] vẫn mở được màn hình (chuyển cảnh tức thì)", await screenOn(page, "projects"));
  await ctx.close();
}

// ---- Điện thoại ----
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 780 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(`${baseUrl}/demo`, { waitUntil: "domcontentloaded" });
  await enter(page);
  await page.locator('.showroom-nav button:has-text("Dự án")').click();
  await screenOn(page, "projects");
  await page.waitForTimeout(900);
  const box = await page.locator(".showroom-screen").boundingBox();
  check("[mobile] màn hình giãn ra phủ khung nhìn (chừa thanh điều hướng)", !!box && box.x >= 0 && box.x + box.width <= 390 && box.width >= 360 && box.height >= 540, box ? `${Math.round(box.width)}×${Math.round(box.height)}` : "-");
  const logoClear = await page.evaluate(() => {
    const a = document.querySelector(".showroom-menu-btn").getBoundingClientRect();
    const hit = document.elementFromPoint(a.left + a.width / 2, a.top + a.height / 2);
    const close = document.querySelector(".showroom-close").getBoundingClientRect();
    return !!hit?.closest(".showroom-menu-btn") && (close.top >= a.bottom || close.right <= a.left);
  });
  check("[mobile] nút logo và nút đóng màn hình không đè nhau", logoClear);
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
  await enter(page);
  const mode = await page.locator(".showroom").getAttribute("data-mode");
  check("[flat] không có WebGL → bản phẳng", mode === "flat", String(mode));
  check("[flat] có thông báo đang ở bản phẳng", await page.locator(".sr-flat-notice").isVisible().catch(() => false));
  check("[flat] đủ 5 khu, 2 gói và bảng so sánh hiện nối tiếp (không ẩn trong tab)", (await page.locator(".sr-flat-section").count()) === 5 && (await page.locator(".sr-package:visible").count()) === 2 && (await page.locator(".sr-table").isVisible()));
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
