// Kiểm tra bản thiết kế /demo2 (website nhiều trang, EN + VI) trên bản build.
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
  { name: "laptop", options: { viewport: { width: 1280, height: 720 } } },
  { name: "tablet", options: { viewport: { width: 768, height: 1024 } } },
  { name: "mobile", options: { ...devices["iPhone 13"] } },
];
const langs = [
  { lang: "en", home: "/demo2", cta: "Get a quote", h1: /one asset you own/i },
  { lang: "vi", home: "/demo2/vi", cta: "Nhận báo giá", h1: /tài sản của riêng bạn/i },
];
const subpages = ["/services", "/services/web", "/services/growth", "/services/social", "/services/ai", "/plans", "/work", "/work/vidi26", "/process", "/about", "/blog", "/contact"];

/* 1. Trang chủ ở 4 khổ màn hình × 2 ngôn ngữ */
for (const vp of viewports) {
  for (const pg of langs) {
    const tag = `[${vp.name} ${pg.lang}]`;
    const context = await browser.newContext(vp.options);
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    const response = await page.goto(baseUrl + pg.home, { waitUntil: "networkidle" });
    check(`${tag} trang chủ trả 200`, response?.status() === 200, String(response?.status()));

    // Màn đầu: câu chào hàng nói đủ website + marketing + AI, nút lời mời hiện ngay
    const hero = await page.evaluate((cta) => {
      const h1 = document.querySelector("h1");
      const a = [...document.querySelectorAll("#top a")].find((el) => el.textContent.includes(cta));
      const r = a?.getBoundingClientRect();
      return { text: h1?.textContent ?? "", opacity: h1 ? getComputedStyle(h1).opacity : "0", cta: !!r && r.top >= 0 && r.bottom <= window.innerHeight, lang: h1?.closest("[lang]")?.getAttribute("lang") };
    }, pg.cta);
    check(`${tag} màn đầu: "Website, marketing, AI" + nút "${pg.cta}" hiện ngay`, pg.h1.test(hero.text) && /marketing/i.test(hero.text) && /AI/.test(hero.text) && hero.opacity === "1" && hero.cta && hero.lang === pg.lang, hero.text.slice(0, 60));

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(`${tag} không tràn ngang`, overflow <= 0, `${overflow}px`);

    // Tài sản bốn lớp: bấm gói thì các lớp đổi trạng thái (Own chỉ bật Website; Grow bật Website + Search + Social; AI luôn là "theo tư vấn")
    const lit = async () => page.$$eval(".d2-board .d2-layer", (els) => els.filter((el) => el.dataset.on === "true").map((el) => el.dataset.layer).join(","));
    await page.locator(".d2-seg button", { hasText: /^Own$/ }).click();
    const own = await lit();
    await page.locator(".d2-seg button", { hasText: /^Grow$/ }).click();
    const grow = await lit();
    const custom = await page.locator('.d2-board .d2-layer[data-custom="true"]').count();
    check(`${tag} tài sản bốn lớp đổi theo gói`, own === "site" && grow === "site,search,social" && custom === 1, `own=${own} grow=${grow}`);

    // Trang chủ dẫn sang các trang con (không còn là một landing page cuộn dọc)
    const counts = await page.evaluate(() => ({
      layers: document.querySelectorAll(".d2-board .d2-layer").length,
      miles: document.querySelectorAll(".d2-miles li").length,
      services: document.querySelectorAll(".d2-svc-index a").length,
      teasers: document.querySelectorAll(".d2-teaser").length,
      carousel: document.querySelectorAll(".d2-carousel-track a").length,
      nav: document.querySelectorAll(".d2-nav > ul > li").length,
      h1: document.querySelectorAll("h1").length,
    }));
    check(`${tag} 4 lớp · 5 mốc · 4 dịch vụ · 3 gói · 7 dự án · menu 6 trang`, counts.layers === 4 && counts.miles === 5 && counts.services === 4 && counts.teasers === 3 && counts.carousel === 7 && counts.nav === 6 && counts.h1 === 1, JSON.stringify(counts));

    // Mọi chữ hiện sẵn (không ẩn chờ cuộn)
    const hidden = await page.evaluate(() => [...document.querySelectorAll("main :is(h1,h2,h3,p,li,td,th,summary)")].filter((el) => Number(getComputedStyle(el).opacity) < 1 && !el.closest(".sr-only, .d2-board")).length);
    check(`${tag} mọi chữ hiện sẵn`, hidden === 0, String(hidden));

    if (vp.name === "desktop" || vp.name === "laptop") {
      // Biểu đồ ghim: cả khối nằm gọn trong một màn; cuộn thì mốc đang tới đổi
      const pin = await page.evaluate(() => {
        const story = document.querySelector(".d2-story");
        const inner = story.querySelector(".d2-story-grid");
        return { live: story.dataset.live, fits: inner.offsetHeight <= window.innerHeight - 60, h: inner.offsetHeight };
      });
      check(`${tag} biểu đồ ghim vừa một màn`, pin.live === "true" && pin.fits, `cao ${pin.h}px`);
      await page.mouse.move(600, 400);
      for (let i = 0; i < 60; i++) {
        const done = await page.evaluate(() => { const r = document.querySelector(".d2-story").getBoundingClientRect(); return r.bottom < window.innerHeight + 200; });
        if (done) break;
        await page.mouse.wheel(0, 300);
        await page.waitForTimeout(50);
      }
      await page.waitForTimeout(700);
      const last = await page.locator(".d2-miles li").nth(4).getAttribute("data-active");
      check(`${tag} cuộn hết đoạn ghim: mốc cuối được tô`, last === "true");
      // Menu thả xuống của Dịch vụ mở bằng rê chuột
      await page.mouse.wheel(0, -40000);
      await page.waitForTimeout(600);
      await page.hover(".d2-has-sub > a");
      check(`${tag} menu Dịch vụ thả xuống 4 mục`, (await page.locator(".d2-sub a").count()) === 4 && (await page.locator(".d2-sub").isVisible()));
    }

    if (vp.name === "mobile") {
      const small = await page.evaluate(() => [...document.querySelectorAll(".d2-top a, .d2-top button, .d2-btn, .d2-seg button")].filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height < 40; }).length);
      check(`${tag} nút đủ lớn để chạm (≥ 40px)`, small === 0, String(small));
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.locator(".d2-menu-toggle").tap();
      const links = await page.locator("#d2-menu a.d2-menu-link").count();
      await page.keyboard.press("Escape");
      check(`${tag} menu mở được (6 trang), Esc đóng`, links === 6 && (await page.locator("#d2-menu").count()) === 0, String(links));
    }

    check(`${tag} không lỗi console`, errors.length === 0, errors.join(" | ").slice(0, 300));
    await context.close();
  }
}

/* 2. Mọi trang con × 2 ngôn ngữ, desktop + mobile */
for (const vp of [viewports[0], viewports[3]]) {
  const context = await browser.newContext(vp.options);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  for (const pg of langs) {
    for (const sub of subpages) {
      const path = pg.home + sub;
      const response = await page.goto(baseUrl + path, { waitUntil: "networkidle" });
      const info = await page.evaluate(() => ({
        h1: document.querySelectorAll("h1").length,
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        robots: document.querySelector('meta[name="robots"]')?.content ?? "",
        lang: document.querySelector("h1")?.closest("[lang]")?.getAttribute("lang"),
        text: document.querySelector("main").innerText,
        current: document.querySelector('.d2-nav a[aria-current="page"]')?.textContent ?? "",
      }));
      const ok = response?.status() === 200 && info.h1 === 1 && info.overflow <= 0 && /noindex/.test(info.robots) && info.lang === pg.lang && !/[$₫€]|\bVND\b|\d\s?%/.test(info.text);
      check(`[${vp.name}] ${path}: 200 · 1 h1 · không tràn · noindex · đúng ngôn ngữ · không giá/số liệu`, ok, `status=${response?.status()} h1=${info.h1} overflow=${info.overflow}`);
      if (vp.name === "desktop" && sub !== "/contact") check(`[desktop] ${path}: menu đánh dấu trang đang xem`, info.current.length > 0, info.current);
    }
  }
  check(`[${vp.name}] các trang con không lỗi console`, errors.length === 0, errors.join(" | ").slice(0, 300));
  await context.close();
}

/* 3. Nội dung từng trang */
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/demo2/plans`, { waitUntil: "networkidle" });
  const plans = await page.evaluate(() => ({ plans: document.querySelectorAll(".d2-plan").length, cases: document.querySelectorAll(".d2-case").length, rows: document.querySelectorAll(".d2-compare tbody tr").length, faq: document.querySelectorAll(".d2-faq details").length }));
  check("[plans] 3 gói · 3 tình huống · bảng so sánh 5 dòng · 6 câu hỏi", plans.plans === 3 && plans.cases === 3 && plans.rows === 5 && plans.faq === 6, JSON.stringify(plans));

  await page.goto(`${baseUrl}/demo2/process`, { waitUntil: "networkidle" });
  const proc = await page.evaluate(() => ({ steps: document.querySelectorAll(".d2-step").length, own: document.querySelectorAll(".d2-manifest li").length }));
  check("[process] 5 bước · 5 món bàn giao", proc.steps === 5 && proc.own === 5, JSON.stringify(proc));

  await page.goto(`${baseUrl}/demo2/work`, { waitUntil: "networkidle" });
  const cases = await page.$$eval(".d2-wall a", (els) => [...new Set(els.map((a) => a.getAttribute("href")))]);
  check("[work] 7 dự án, mỗi dự án một trang riêng", cases.length === 7 && cases.every((href) => href.startsWith("/demo2/work/")), String(cases.length));
  for (const href of cases) {
    const r = await page.goto(baseUrl + href, { waitUntil: "load" });
    const live = await page.locator("main a[target='_blank']").first().getAttribute("href");
    const status = await context.request.get(live, { timeout: 30000 }).then((res) => res.status(), () => 0);
    check(`[work] ${href}: 200, website thật đang chạy`, r?.status() === 200 && status >= 200 && status < 400, `${live} → ${status}`);
  }

  // Blog: chưa có bài thì báo rõ; bài giữ chỗ và bài mẫu không lộ ra
  await page.goto(`${baseUrl}/demo2/blog`, { waitUntil: "networkidle" });
  const posts = await page.locator(".d2-posts a").count();
  const empty = await page.locator(".d2-empty").count();
  check("[blog] có bài thì liệt kê, chưa có thì báo rõ", (posts > 0) !== (empty > 0), `bài=${posts}, khung trống=${empty}`);
  // Với cacheComponents, địa chỉ lạ dựng lúc chạy giữ mã 200: phải là trang "không tìm thấy" có noindex, không lộ bài nháp / bài mẫu
  for (const path of ["/demo2/blog/_template", "/demo2/blog/khong-co-bai-nay", "/demo2/work/khong-co", "/demo2/services/khong-co"]) {
    await page.goto(baseUrl + path, { waitUntil: "networkidle" });
    const nf = await page.evaluate(() => ({ nf: !!document.querySelector("[data-d2-404]"), article: !!document.querySelector(".d2-article, .d2-feature, .d2-svc-head"), robots: document.querySelector('meta[name="robots"]')?.content ?? "" }));
    check(`[404] ${path}: trang "không tìm thấy", noindex, không lộ nội dung`, nf.nf && !nf.article && /noindex/.test(nf.robots), JSON.stringify(nf));
  }

  // Công tắc ngôn ngữ giữ nguyên trang đang xem
  await page.goto(`${baseUrl}/demo2/services/growth`, { waitUntil: "networkidle" });
  await page.locator(".d2-top .d2-lang a", { hasText: "VI" }).first().click();
  await page.waitForURL(/\/demo2\/vi\/services\/growth$/);
  check("[ngôn ngữ] đổi sang VI vẫn ở đúng trang", true);

  // Trang liên hệ: form thật
  for (const [path, lang] of [["/demo2/contact", "en"], ["/demo2/vi/contact", "vi"]]) {
    await page.goto(baseUrl + path, { waitUntil: "networkidle" });
    const form = await page.locator("main form, main [role='radiogroup'], main fieldset").count();
    check(`[liên hệ ${lang}] có form`, form > 0, `form=${form}`);
  }
  const missing = await context.request.get(`${baseUrl}/demo2/khong-ton-tai`);
  check("[404] trang không tồn tại trả 404", missing.status() === 404, String(missing.status()));
  await context.close();
}

/* 3b. Tương phản chữ (WCAG AA) trên mọi trang + chuyển động "trồi lên" không giấu chữ */
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const fails = [];
  for (const path of ["/demo2", "/demo2/plans", "/demo2/services", "/demo2/services/ai", "/demo2/work/vidi26", "/demo2/work/rethink", "/demo2/process", "/demo2/about", "/demo2/blog", "/demo2/vi"]) {
    await page.goto(baseUrl + path, { waitUntil: "networkidle" });
    const rows = await page.evaluate(() => {
      const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const [r, g, b, a = "1"] = m[1].split(/[\s,/]+/).filter(Boolean).map(Number); return { r, g, b, a }; };
      const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
      const over = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
      const bgOf = (el) => { const stack = []; for (let n = el; n; n = n.parentElement) { const c = parse(getComputedStyle(n).backgroundColor); if (c && c.a > 0) { stack.push(c); if (c.a === 1) break; } } let bg = { r: 245, g: 247, b: 246, a: 1 }; for (const c of stack.reverse()) bg = over(c, bg); return bg; };
      const out = [];
      for (const el of document.querySelectorAll(".d2 *")) {
        if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1)) continue;
        // Bỏ qua: chữ cho trình đọc màn hình, ảnh chụp, phần trang trí aria-hidden (mô hình minh hoạ, dải chữ chạy)
        if (el.closest(".sr-only, svg, .d2-shot, [aria-hidden='true']")) continue;
        const cs = getComputedStyle(el);
        if (!el.getBoundingClientRect().width || cs.visibility === "hidden") continue;
        const bg = bgOf(el);
        const fg0 = parse(cs.color);
        if (!fg0) continue;
        const fg = over(fg0, bg);
        const ratio = (Math.max(lum(fg), lum(bg)) + 0.05) / (Math.min(lum(fg), lum(bg)) + 0.05);
        const size = parseFloat(cs.fontSize);
        const large = size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 700);
        if (ratio < (large ? 3 : 4.5)) out.push(`${el.textContent.trim().slice(0, 24)} (${ratio.toFixed(2)})`);
      }
      return out;
    });
    if (rows.length) fails.push(`${path}: ${rows.slice(0, 3).join("; ")}`);
  }
  check("[tương phản] mọi chữ đạt WCAG AA trên 10 trang", fails.length === 0, fails.join(" | ").slice(0, 300));

  await page.goto(`${baseUrl}/demo2/plans`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const before = await page.evaluate(() => ({ waiting: document.querySelectorAll("[data-rise]:not([data-in])").length, hiddenText: [...document.querySelectorAll("[data-rise] :is(h2,h3,p,li,td,th)")].filter((el) => Number(getComputedStyle(el).opacity) < 1 || getComputedStyle(el).visibility === "hidden").length }));
  await page.mouse.move(600, 400);
  for (let i = 0; i < 80; i++) {
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(900);
  const after = await page.locator("[data-rise]:not([data-in])").count();
  check("[chuyển động] khối chờ vẫn hiện chữ; cuộn tới thì trồi vào chỗ", before.waiting > 0 && before.hiddenText === 0 && after === 0, `chờ ${before.waiting} → ${after}, chữ ẩn ${before.hiddenText}`);

  await page.goto(`${baseUrl}/demo2`, { waitUntil: "networkidle" });
  const marquee = await page.evaluate(() => { const row = document.querySelector(".d2-marquee-row"); return row ? getComputedStyle(row).animationName : ""; });
  check("[chuyển động] dải chữ chạy đang chạy", marquee === "d2-marquee", marquee);
  await context.close();
}

/* 4. Không JS và giảm chuyển động */
for (const [name, options] of [
  ["không JS", { viewport: { width: 1440, height: 900 }, javaScriptEnabled: false }],
  ["giảm chuyển động", { viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }],
]) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  await page.goto(`${baseUrl}/demo2`, { waitUntil: "load" });
  await page.waitForTimeout(500);
  const state = await page.evaluate(() => ({
    headings: [...document.querySelectorAll("main :is(h1,h2,h3)")].every((el) => getComputedStyle(el).opacity === "1"),
    live: document.querySelector(".d2-story").dataset.live,
    miles: document.querySelectorAll('.d2-miles li[data-active="true"]').length,
    dash: getComputedStyle(document.querySelector(".d2-chart-asset")).strokeDashoffset,
    lit: document.querySelectorAll('.d2-board .d2-layer[data-on="true"]').length,
    pause: document.querySelectorAll(".d2-seg-pause").length,
  }));
  check(`[${name}] biểu đồ vẽ sẵn, 5 mốc hiện đủ, tài sản đứng ở gói Grow, không tự chạy`, state.headings && state.live !== "true" && state.miles === 5 && parseFloat(state.dash) === 0 && state.lit === 3 && state.pause === 0, JSON.stringify(state));
  await context.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} kiểm tra đạt`);
process.exit(failed.length ? 1 : 0);
