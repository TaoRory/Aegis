// Kiểm tra bản thiết kế /demo3 (website nhiều trang, EN + VI) trên bản build.
// Chạy: pnpm build && npx next start -p 3002 (cửa sổ khác) rồi node scripts/qa-demo3.mjs http://localhost:3002
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
  { lang: "en", home: "/demo3", cta: "Get a quote", h1: /one asset you own/i },
  { lang: "vi", home: "/demo3/vi", cta: "Nhận báo giá", h1: /tài sản của riêng bạn/i },
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
      ring: new Set([...document.querySelectorAll(".d2-ring .gallery-card a")].map((a) => a.getAttribute("href"))).size,
      nav: document.querySelectorAll(".d2-nav > ul > li").length,
      h1: document.querySelectorAll("h1").length,
    }));
    check(`${tag} 4 lớp · 5 mốc · 4 dịch vụ · 3 gói · 7 dự án · menu 6 trang`, counts.layers === 4 && counts.miles === 5 && counts.services === 4 && counts.teasers === 3 && counts.ring === 7 && counts.nav === 6 && counts.h1 === 1, JSON.stringify(counts));

    // Mọi chữ hiện sẵn (không ẩn chờ cuộn)
    const hidden = await page.evaluate(() => [...document.querySelectorAll("main :is(h1,h2,h3,p,li,td,th,summary)")].filter((el) => Number(getComputedStyle(el).opacity) < 1 && !el.closest(".sr-only, .d2-board")).length);
    check(`${tag} mọi chữ hiện sẵn`, hidden === 0, String(hidden));

    // Vòng xoay dự án: nút "sau" đổi dự án trên dock; mỗi thẻ dẫn tới trang dự án của /demo3
    const before = await page.locator(".d2-ring .gallery-name").textContent();
    await page.locator(".d2-ring .gallery-arrow").nth(1).click();
    await page.waitForTimeout(900);
    const after = await page.locator(".d2-ring .gallery-name").textContent();
    const ringHrefs = await page.$$eval(".d2-ring .gallery-card a", (els) => els.every((a) => a.getAttribute("href").includes("/work/")));
    check(`${tag} vòng xoay dự án: nút "sau" đổi dự án, thẻ dẫn tới trang dự án`, before !== after && ringHrefs, `${before} → ${after}`);

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
      await page.waitForTimeout(600); // menu đóng có chuyển động (0,32 giây) rồi mới gỡ khỏi DOM
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
  await page.goto(`${baseUrl}/demo3/plans`, { waitUntil: "networkidle" });
  const plans = await page.evaluate(() => ({ plans: document.querySelectorAll(".d2-plan").length, cases: document.querySelectorAll(".d2-case").length, rows: document.querySelectorAll(".d2-compare tbody tr").length, faq: document.querySelectorAll(".d2-faq details").length }));
  check("[plans] 3 gói · 3 tình huống · bảng so sánh 5 dòng · 6 câu hỏi", plans.plans === 3 && plans.cases === 3 && plans.rows === 5 && plans.faq === 6, JSON.stringify(plans));

  await page.goto(`${baseUrl}/demo3/process`, { waitUntil: "networkidle" });
  const proc = await page.evaluate(() => ({ steps: document.querySelectorAll(".d3-proc-card").length, own: document.querySelectorAll(".d2-manifest li").length }));
  check("[process] 5 bước · 5 món bàn giao", proc.steps === 5 && proc.own === 5, JSON.stringify(proc));

  await page.goto(`${baseUrl}/demo3/work`, { waitUntil: "networkidle" });
  const cases = await page.$$eval(".d2-wall a", (els) => [...new Set(els.map((a) => a.getAttribute("href")))]);
  check("[work] 7 dự án, mỗi dự án một trang riêng", cases.length === 7 && cases.every((href) => href.startsWith("/demo3/work/")), String(cases.length));
  for (const href of cases) {
    const r = await page.goto(baseUrl + href, { waitUntil: "load" });
    const live = await page.locator("main a[target='_blank']").first().getAttribute("href");
    const status = await context.request.get(live, { timeout: 30000 }).then((res) => res.status(), () => 0);
    check(`[work] ${href}: 200, website thật đang chạy`, r?.status() === 200 && status >= 200 && status < 400, `${live} → ${status}`);
  }

  // Blog: chưa có bài thì báo rõ; bài giữ chỗ và bài mẫu không lộ ra
  await page.goto(`${baseUrl}/demo3/blog`, { waitUntil: "networkidle" });
  const posts = await page.locator(".d2-posts a").count();
  const empty = await page.locator(".d2-empty").count();
  check("[blog] có bài thì liệt kê, chưa có thì báo rõ", (posts > 0) !== (empty > 0), `bài=${posts}, khung trống=${empty}`);
  // Với cacheComponents, địa chỉ lạ dựng lúc chạy giữ mã 200: phải là trang "không tìm thấy" có noindex, không lộ bài nháp / bài mẫu
  for (const path of ["/demo3/blog/_template", "/demo3/blog/khong-co-bai-nay", "/demo3/work/khong-co", "/demo3/services/khong-co"]) {
    await page.goto(baseUrl + path, { waitUntil: "networkidle" });
    const nf = await page.evaluate(() => ({ nf: !!document.querySelector("[data-d2-404]"), article: !!document.querySelector(".d2-article, .d2-feature, .d2-svc-head"), robots: document.querySelector('meta[name="robots"]')?.content ?? "" }));
    check(`[404] ${path}: trang "không tìm thấy", noindex, không lộ nội dung`, nf.nf && !nf.article && /noindex/.test(nf.robots), JSON.stringify(nf));
  }

  // Công tắc ngôn ngữ giữ nguyên trang đang xem
  await page.goto(`${baseUrl}/demo3/services/growth`, { waitUntil: "networkidle" });
  await page.locator(".d2-top .d2-lang a", { hasText: "VI" }).first().click();
  await page.waitForURL(/\/demo3\/vi\/services\/growth$/);
  check("[ngôn ngữ] đổi sang VI vẫn ở đúng trang", true);

  // Trang liên hệ: form thật
  for (const [path, lang] of [["/demo3/contact", "en"], ["/demo3/vi/contact", "vi"]]) {
    await page.goto(baseUrl + path, { waitUntil: "networkidle" });
    const form = await page.locator("main form, main [role='radiogroup'], main fieldset").count();
    check(`[liên hệ ${lang}] có form`, form > 0, `form=${form}`);
  }
  const missing = await context.request.get(`${baseUrl}/demo3/khong-ton-tai`);
  check("[404] trang không tồn tại trả 404", missing.status() === 404, String(missing.status()));
  await context.close();
}

/* 3b. Tương phản chữ (WCAG AA) trên mọi trang + chuyển động "trồi lên" không giấu chữ */
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const fails = [];
  for (const path of ["/demo3", "/demo3/plans", "/demo3/services", "/demo3/services/ai", "/demo3/work/vidi26", "/demo3/work/rethink", "/demo3/process", "/demo3/about", "/demo3/blog", "/demo3/vi"]) {
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

  await page.goto(`${baseUrl}/demo3/plans`, { waitUntil: "networkidle" });
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

  await context.close();
}

/* 4. Không JS và giảm chuyển động */
for (const [name, options] of [
  ["không JS", { viewport: { width: 1440, height: 900 }, javaScriptEnabled: false }],
  ["giảm chuyển động", { viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }],
]) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  await page.goto(`${baseUrl}/demo3`, { waitUntil: "load" });
  await page.waitForTimeout(500);
  const state = await page.evaluate(() => ({
    headings: [...document.querySelectorAll("main :is(h1,h2,h3)")].every((el) => getComputedStyle(el).opacity === "1"),
    live: document.querySelector(".d2-story").dataset.live,
    miles: document.querySelectorAll('.d2-miles li[data-active="true"]').length,
    // Cảnh "dòng khách đổ về": bản tĩnh là cảnh đầy đủ, mọi phần tử theo mốc đều hiện
    scene: [...document.querySelectorAll(".d3-fx .d3-r")].filter((el) => Number(getComputedStyle(el).opacity) < 0.99).length,
    lit: document.querySelectorAll('.d2-board .d2-layer[data-on="true"]').length,
    // Nút Tạm dừng luôn có trong HTML (giữ chiều cao hàng nút), CSS chỉ cho hiện khi trang bật chuyển động
    pause: [...document.querySelectorAll(".d2-seg-pause")].filter((el) => el.getClientRects().length > 0).length,
  }));
  check(`[${name}] biểu đồ vẽ sẵn, 5 mốc hiện đủ, tài sản đứng ở gói Grow, không tự chạy`, state.headings && state.live !== "true" && state.miles === 5 && state.scene === 0 && state.lit === 3 && state.pause === 0, JSON.stringify(state));
  await context.close();
}

/* 5. Header, nút, menu điện thoại và chuyển trang. Next giữ trang cũ ở trạng thái ẩn trong DOM nên mọi bộ chọn đều lấy phần tử ĐANG HIỆN. */
{
  const errors = [];
  const watch = (page) => {
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  };
  const still = (value) => value === "none" || value === "matrix(1, 0, 0, 1, 0, 0)";
  const pillState = (page) =>
    page.evaluate(() => {
      const shown = (list) => [...list].find((el) => el.getClientRects().length > 0) ?? null;
      const pill = shown(document.querySelectorAll(".d3-nav-pill"));
      const lit = shown(document.querySelectorAll('.d2-nav a[data-lit="true"]'));
      return { on: pill?.getAttribute("data-on") ?? null, left: pill ? getComputedStyle(pill).getPropertyValue("--pl") : null, lit: lit?.textContent ?? null };
    });

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  watch(page);
  await page.goto(`${baseUrl}/demo3/plans`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const rest = await pillState(page);
  check("[header] viên chỉ mục nằm dưới trang đang xem", rest.on === "true" && rest.lit === "Plans", JSON.stringify(rest));

  await page.hover('.d2-nav a[data-path="/work"]:visible');
  await page.waitForTimeout(700);
  const hovered = await pillState(page);
  check("[header] rê chuột: viên trượt sang mục đang rê", hovered.lit === "Work" && hovered.left !== rest.left, JSON.stringify(hovered));

  await page.hover('.d2-nav a[data-path="/services"]:visible');
  await page.waitForTimeout(800);
  const sub = await page.evaluate(() => {
    const el = [...document.querySelectorAll(".d2-nav .d2-sub")].find((node) => node.getClientRects().length > 0);
    return { pointer: getComputedStyle(el).pointerEvents, top: el.querySelector("a").getBoundingClientRect().top };
  });
  check("[header] danh sách Dịch vụ mở khi rê chuột", sub.pointer === "auto" && sub.top > 40, JSON.stringify(sub));

  await page.mouse.move(700, 620);
  await page.waitForTimeout(700);
  const back = await pillState(page);
  check("[header] rời chuột: viên về lại trang đang xem", back.lit === "Plans" && back.left === rest.left, JSON.stringify(back));

  await page.click('.d2-nav a[data-path="/work"]:visible');
  await page.waitForURL("**/demo3/work");
  await page.waitForTimeout(1400);
  const moved = await pillState(page);
  const head = await page.evaluate(() => {
    const el = [...document.querySelectorAll("h1")].find((node) => node.getClientRects().length > 0);
    return { text: el?.textContent, split: el?.getAttribute("data-split"), visible: el ? getComputedStyle(el).visibility : null };
  });
  check("[chuyển trang] bấm link: sang trang mới, viên theo sang, tiêu đề hiện", moved.lit === "Work" && head.split === "ready" && head.visible === "visible", JSON.stringify({ moved, head }));

  await page.click('a.d3-tile[href$="/work/vidi26"]:visible');
  await page.waitForURL("**/demo3/work/vidi26");
  await page.waitForTimeout(1500);
  check("[chuyển trang] ô dự án mở trang chi tiết", ((await page.locator("h1:visible").textContent()) ?? "").includes("VIDI26"));

  const button = page.locator(".d3-case-intro .d3-btn:visible");
  await button.hover();
  await page.waitForTimeout(700);
  const roll = await button.evaluate((el) => {
    const [a, b] = el.querySelectorAll(".kit-roll > span");
    const [x, y] = el.querySelectorAll(".d3-arrow-swap > svg");
    const transform = (node) => getComputedStyle(node).transform;
    return { first: transform(a), second: transform(b), arrowOut: transform(x), arrowIn: transform(y) };
  });
  check("[nút] rê chuột: chữ cuộn, mũi tên đi qua", still(roll.second) && still(roll.arrowIn) && !still(roll.first) && !still(roll.arrowOut), JSON.stringify(roll));

  await page.goBack();
  await page.waitForURL("**/demo3/work");
  await page.waitForTimeout(1200);
  const restored = await pillState(page);
  check("[chuyển trang] Back: trang cũ hiện lại, viên đứng đúng mục", (await page.locator("h1:visible").count()) === 1 && restored.on === "true" && restored.lit === "Work", JSON.stringify(restored));

  await page.click(".d2-logo:visible");
  await page.waitForURL(/\/demo3$/);
  await page.waitForTimeout(1200);
  const home = await pillState(page);
  check("[header] trang chủ: không có mục đang xem nên viên tắt", home.on !== "true", JSON.stringify(home));
  await context.close();

  // Điện thoại: menu phủ kín, khoá cuộn, Esc trả focus, bấm link thì đổi trang và mở khoá
  const phone = await browser.newContext({ ...devices["iPhone 13"] });
  const mobile = await phone.newPage();
  watch(mobile);
  const locked = () => mobile.evaluate(() => /hidden|clip/.test(getComputedStyle(document.documentElement).overflow));
  await mobile.goto(`${baseUrl}/demo3`, { waitUntil: "networkidle" });
  await mobile.waitForTimeout(2600);
  await mobile.locator(".d2-menu-toggle:visible").tap();
  await mobile.waitForTimeout(900);
  const menu = await mobile.evaluate(() => {
    const el = [...document.querySelectorAll("#d2-menu")].find((node) => node.getClientRects().length > 0);
    const rect = el.getBoundingClientRect();
    return { bottom: Math.round(rect.bottom), screen: window.innerHeight, overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth };
  });
  check("[menu điện thoại] phủ kín dưới header, khoá cuộn trang, không tràn ngang", menu.bottom >= menu.screen - 1 && menu.overflowX <= 0 && (await locked()), JSON.stringify(menu));
  await mobile.keyboard.press("Escape");
  await mobile.waitForTimeout(600);
  check("[menu điện thoại] Esc: đóng, trả focus về nút Menu, mở khoá cuộn", (await mobile.locator("#d2-menu:visible").count()) === 0 && (await mobile.evaluate(() => document.activeElement?.className)) === "d2-menu-toggle" && !(await locked()));
  await mobile.locator(".d2-menu-toggle:visible").tap();
  await mobile.waitForTimeout(700);
  await mobile.locator('#d2-menu a.d2-menu-link[href$="/process"]:visible').tap();
  await mobile.waitForURL("**/demo3/process");
  await mobile.waitForTimeout(1200);
  check("[menu điện thoại] bấm link: sang trang mới, menu đóng, mở khoá cuộn", (await mobile.locator("#d2-menu:visible").count()) === 0 && !(await locked()));
  await phone.close();

  // Đợt 5: chuyển trang thật sự chạy (đếm lời gọi startViewTransition), con trỏ có nhãn, tấm tối nở tràn màn hình
  {
    const desk = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await desk.addInitScript(() => {
      window.__vt = [];
      const start = document.startViewTransition?.bind(document);
      if (start)
        document.startViewTransition = (arg) => {
          const t = start(arg);
          t.ready.then(
            () => window.__vt.push(document.getAnimations().map((a) => a.animationName).join(",")),
            () => window.__vt.push("skipped"),
          );
          return t;
        };
    });
    const p = await desk.newPage();
    watch(p);
    await p.goto(`${baseUrl}/demo3`, { waitUntil: "networkidle" });
    await p.waitForTimeout(2500);
    const top = await p.evaluate(() => [...document.querySelectorAll(".d3-expand")].find((el) => el.getClientRects().length > 0).getBoundingClientRect().top + window.scrollY);
    await p.evaluate((y) => window.scrollTo(0, y - 60), top);
    await p.waitForTimeout(900);
    const e = await p.evaluate(() => {
      const el = [...document.querySelectorAll(".d3-expand")].find((node) => node.getClientRects().length > 0);
      const layer = getComputedStyle(el.querySelector(".d3-expand-slab"), "::before");
      const slab = el.querySelector(".d3-expand-slab").getBoundingClientRect();
      // bề rộng lớp giãn = bề rộng tấm × scaleX (ma trận "matrix(a, ...)")
      const scale = Number(layer.transform.match(/matrix\(([^,]+)/)?.[1] ?? 1);
      return { covered: Math.round(slab.width * scale), screen: document.documentElement.clientWidth };
    });
    check("[đợt 5] tấm tối nở tràn màn hình khi cuộn tới", e.covered >= e.screen - 2, JSON.stringify(e));

    const row = p.locator(".d3-expand .d2-svc-index a:visible").first();
    const box = await row.boundingBox();
    await p.mouse.move(box.x + 40, box.y + box.height / 2);
    await p.mouse.move(box.x + 80, box.y + box.height / 2, { steps: 4 });
    await p.waitForTimeout(700);
    const cur = await p.evaluate(() => {
      const el = [...document.querySelectorAll(".d3-cursor")].find((node) => node.getClientRects().length > 0);
      return { on: el?.dataset.on, text: el?.textContent, glow: !!document.querySelector('[data-glow="on"]'), hidden: getComputedStyle(document.querySelector(".d3-expand .d2-svc-index a")).cursor };
    });
    check("[đợt 5] con trỏ có nhãn + đèn soi trên tấm tối", cur.on === "true" && cur.text === "Open" && cur.glow && cur.hidden === "none", JSON.stringify(cur));

    await p.mouse.move(700, 120);
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(500);
    await p.click('.d2-nav a[data-path="/process"]:visible');
    await p.waitForURL("**/demo3/process");
    await p.waitForTimeout(1500);
    const vt = await p.evaluate(() => window.__vt);
    check("[đợt 5] bấm link: view transition chạy đủ hai nửa tấm màn", vt.length === 1 && /d3-page-out/.test(vt[0]) && /d3-page-in/.test(vt[0]), JSON.stringify(vt));
    await desk.close();
  }

  // Ban giám đốc ở trang Giới thiệu: 4 thẻ, ảnh đã có tải được, thẻ chưa có ảnh hiện ô chữ cái đầu, chưa có giới thiệu thì không hiện đoạn nào
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    watch(p);
    for (const path of ["/demo3/about", "/demo3/vi/about"]) {
      await p.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
      await p.locator(".d3-team").scrollIntoViewIfNeeded();
      await p.waitForTimeout(900);
      const team = await p.evaluate(() => ({
        cards: document.querySelectorAll(".d3-member").length,
        loaded: [...document.querySelectorAll(".d3-member img")].filter((img) => img.complete && img.naturalWidth > 0).length,
        empty: document.querySelectorAll('.d3-member-photo[data-empty="true"]').length,
        bios: document.querySelectorAll(".d3-member-bio").length,
        first: document.querySelector(".d3-member h3")?.textContent,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      }));
      check(`[ban giám đốc] ${path}: 4 thẻ, 2 ảnh tải được, 2 ô chờ ảnh, không có giới thiệu thừa, không tràn ngang`, team.cards === 4 && team.loaded === 2 && team.empty === 2 && team.bios === 0 && team.first === "Trương Ngô Gia Bảo" && team.overflow <= 0, JSON.stringify(team));
    }
    await ctx.close();
  }

  // Hai lối vào: đổi sang "Chỉ marketing" thì mốc và cảnh đổi theo (mạng lưới); cuộn hết cảnh thì mọi phần tử và vòng khán giả đều hiện
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    watch(p);
    await p.goto(`${baseUrl}/demo3`, { waitUntil: "networkidle" });
    await p.waitForTimeout(1500);
    const range = await p.evaluate(() => { const el = document.querySelector(".d2-story"); return { top: el.getBoundingClientRect().top + scrollY, len: el.offsetHeight - innerHeight }; });
    await p.evaluate((y) => scrollTo(0, y), range.top + range.len * 0.3);
    await p.waitForTimeout(500);
    await p.locator(".d3-path").nth(1).click();
    await p.evaluate((y) => scrollTo(0, y), range.top + range.len * 0.99);
    await p.waitForTimeout(1200);
    const tower = await p.evaluate(() => ({
      path: document.querySelector(".d3-story-scene")?.dataset.path,
      scene: document.querySelector(".d3-fx")?.dataset.scene,
      pressed: document.querySelectorAll('.d3-path[aria-pressed="true"]').length,
      first: document.querySelector(".d2-miles h3")?.textContent,
      hidden: [...document.querySelectorAll(".d3-fx .d3-r")].filter((el) => Number(getComputedStyle(el).opacity) < 0.99).length,
      audience: [...document.querySelectorAll(".d3-fx-audience g")].filter((el) => Number(getComputedStyle(el).opacity) > 0.99).length,
      moving: [...document.querySelectorAll(".d3-fx-particles circle")].filter((el) => Number(getComputedStyle(el).opacity) > 0.05).length,
    }));
    check("[tài sản lớn lên] đổi sang lối \"Chỉ marketing\": mốc + cảnh mạng lưới, cuộn hết thì đủ nút, đủ khán giả, hạt đang chạy", tower.path === "marketing" && tower.scene === "network" && tower.pressed === 1 && tower.first === "Strategy." && tower.hidden === 0 && tower.audience === 54 && tower.moving > 0, JSON.stringify(tower));
    await ctx.close();
  }

  check("[đợt 2] không lỗi console khi rê, bấm và đổi trang", errors.length === 0, errors.slice(0, 3).join(" | "));
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} kiểm tra đạt`);
process.exit(failed.length ? 1 : 0);
