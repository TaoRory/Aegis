// Kiểm tra bản thiết kế /demo2 trên bản build.
// Chạy: pnpm build && npx next start -p 3002 (cửa sổ khác) rồi node scripts/qa-demo2.mjs http://localhost:3002
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
  { name: "tablet", options: { viewport: { width: 768, height: 1024 } } },
  { name: "mobile", options: { ...devices["iPhone 13"] } },
];
const pages = [
  { path: "/demo2", lang: "en", cta: "Get a quote", h1: /digital assets you own/i },
  { path: "/demo2/vi", lang: "vi", cta: "Nhận báo giá", h1: /tài sản số/i },
];

for (const vp of viewports) {
  for (const pg of pages) {
    const tag = `[${vp.name} ${pg.lang}]`;
    const context = await browser.newContext(vp.options);
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    const response = await page.goto(baseUrl + pg.path, { waitUntil: "networkidle" });
    check(`${tag} trả 200`, response?.status() === 200, String(response?.status()));

    // Màn đầu: câu chào hàng + nút lời mời hiện ngay, không chờ cuộn
    const hero = await page.evaluate((cta) => {
      const h1 = document.querySelector("h1");
      const a = [...document.querySelectorAll("#top a")].find((el) => el.textContent.includes(cta));
      const r = a?.getBoundingClientRect();
      return { text: h1?.textContent ?? "", opacity: h1 ? getComputedStyle(h1).opacity : "0", cta: !!r && r.top >= 0 && r.bottom <= window.innerHeight, lang: h1?.closest("[lang]")?.getAttribute("lang") };
    }, pg.cta);
    check(`${tag} màn đầu: câu chào hàng và nút "${pg.cta}" hiện ngay`, pg.h1.test(hero.text) && hero.opacity === "1" && hero.cta && hero.lang === pg.lang, hero.text.slice(0, 50));

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(`${tag} không tràn ngang`, overflow <= 0, `${overflow}px`);

    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    check(`${tag} noindex`, /noindex/.test(robots ?? ""), robots ?? "");

    // Nội dung: 3 gói, 5 món bàn giao, 5 bước, 7 dự án thật, bảng so sánh, câu hỏi
    const counts = await page.evaluate(() => ({
      plans: document.querySelectorAll(".d2-plan").length,
      own: document.querySelectorAll(".d2-manifest li").length,
      steps: document.querySelectorAll(".d2-step").length,
      wall: new Set([...document.querySelectorAll(".d2-wall a")].map((a) => a.href)).size,
      work: document.querySelectorAll("#work a[href^='http']").length,
      rows: document.querySelectorAll(".d2-compare tbody tr").length,
      faq: document.querySelectorAll(".d2-faq details").length,
      h1: document.querySelectorAll("h1").length,
    }));
    check(`${tag} 3 gói · 5 món bàn giao · 5 bước · 7 dự án · bảng so sánh · câu hỏi`, counts.plans === 3 && counts.own === 5 && counts.steps === 5 && counts.wall === 7 && counts.work >= 7 && counts.rows === 5 && counts.faq === 6 && counts.h1 === 1, JSON.stringify(counts));

    // Không bịa: không có ký hiệu tiền, không có "%" hay số liệu thành tích trong chữ của trang
    const text = await page.evaluate(() => document.querySelector("main").innerText);
    check(`${tag} không có giá tiền hay số liệu phần trăm`, !/[$₫€]|\bVND\b|\d\s?%/.test(text));

    // Mọi chữ hiện sẵn: không phần tử chữ nào bị ẩn chờ cuộn
    const hidden = await page.evaluate(() => [...document.querySelectorAll("main :is(h1,h2,h3,p,li,td,th,summary)")].filter((el) => Number(getComputedStyle(el).opacity) < 1 && !el.closest(".sr-only")).length);
    check(`${tag} mọi chữ hiện sẵn (không ẩn chờ cuộn)`, hidden === 0, String(hidden));

    const broken = await page.evaluate(async () => {
      const imgs = [...document.images];
      for (const img of imgs) img.loading = "eager";
      await Promise.all(imgs.map((img) => (img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; }))));
      return imgs.filter((img) => !img.naturalWidth).length;
    });
    check(`${tag} ảnh tải được`, broken === 0, String(broken));

    // Vùng bấm đủ lớn trên điện thoại
    if (vp.name === "mobile") {
      const small = await page.evaluate(() => [...document.querySelectorAll(".d2-top a, .d2-top button, .d2-btn")].filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height < 40; }).length);
      check(`${tag} nút đủ lớn để chạm (≥ 40px)`, small === 0, String(small));
      await page.locator(".d2-menu-toggle").tap();
      const menu = await page.locator("#d2-menu").isVisible();
      await page.keyboard.press("Escape");
      check(`${tag} menu mở được, Esc đóng`, menu && (await page.locator("#d2-menu").count()) === 0);
    }

    if (vp.name === "desktop") {
      // Công tắc ngôn ngữ dẫn sang bản còn lại
      const other = pg.lang === "en" ? "VI" : "EN";
      await page.locator(".d2-top .d2-lang a", { hasText: other }).first().click();
      await page.waitForURL(pg.lang === "en" ? /\/demo2\/vi$/ : /\/demo2$/);
      check(`${tag} công tắc ngôn ngữ chuyển sang ${other}`, true);
    }

    check(`${tag} không lỗi console`, errors.length === 0, errors.join(" | ").slice(0, 300));
    await context.close();
  }
}

// Không JS và giảm chuyển động: nội dung vẫn đủ
for (const [name, options] of [
  ["không JS", { viewport: { width: 1440, height: 900 }, javaScriptEnabled: false }],
  ["giảm chuyển động", { viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }],
]) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  await page.goto(`${baseUrl}/demo2`, { waitUntil: "load" });
  await page.waitForTimeout(500);
  const ok = await page.evaluate(() => document.querySelectorAll(".d2-plan").length === 3 && document.querySelectorAll(".d2-manifest li").length === 5 && [...document.querySelectorAll("main :is(h1,h2,h3)")].every((el) => getComputedStyle(el).opacity === "1"));
  const pause = await page.locator(".d2-manifest-head button").count();
  check(`[${name}] nội dung hiện đủ, danh sách bàn giao đứng yên`, ok && pause === 0, `nút dừng=${pause}`);
  await context.close();
}

// 7 website dự án còn sống
{
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${baseUrl}/demo2`, { waitUntil: "load" });
  const urls = await page.$$eval(".d2-wall a", (els) => [...new Set(els.map((a) => a.href))]);
  for (const url of urls) {
    const status = await context.request.get(url, { timeout: 30000 }).then((r) => r.status(), () => 0);
    check(`[dự án] ${url} đang chạy`, status >= 200 && status < 400, String(status));
  }
  // Trang liên hệ: form thật của trang chính, bản tiếng Anh
  for (const [path, lang] of [["/demo2/contact", "en"], ["/demo2/vi/contact", "vi"]]) {
    const r = await page.goto(baseUrl + path, { waitUntil: "networkidle" });
    const form = await page.locator("main form, main [role='radiogroup'], main fieldset").count();
    check(`[liên hệ ${lang}] ${path} trả 200 và có form`, r?.status() === 200 && form > 0, `form=${form}`);
  }
  await context.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} kiểm tra đạt`);
process.exit(failed.length ? 1 : 0);
