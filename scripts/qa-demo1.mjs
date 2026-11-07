// Kiểm tra bản thiết kế /demo1 trên bản build.
// Chạy: pnpm build && pnpm start (cửa sổ khác) rồi node scripts/qa-demo1.mjs [baseUrl]
import { chromium, devices } from "playwright";

const baseUrl = process.argv[2] ?? "http://localhost:3000";
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const browser = await chromium.launch();
const scrollToId = (page, id, offset = 0) =>
  page.evaluate(
    ({ id, offset }) => {
      const el = document.getElementById(id);
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + offset);
    },
    { id, offset },
  );

const viewports = [
  { name: "desktop", options: { viewport: { width: 1440, height: 900 } } },
  { name: "laptop", options: { viewport: { width: 1280, height: 720 } } },
  { name: "tablet", options: { viewport: { width: 768, height: 1024 } } },
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
  const height = vp.options.viewport?.height ?? 664;

  // Màn đầu: chữ và nút hiện ngay, không chờ cuộn
  const hero = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    const r = h1?.getBoundingClientRect();
    const lead = document.querySelector("#mo-dau .d1-lead")?.textContent ?? "";
    return { text: h1?.textContent ?? "", lead, opacity: h1 ? getComputedStyle(h1).opacity : "0", bottom: r?.bottom ?? 9999 };
  });
  check(`[${vp.name}] màn đầu: tiêu đề hiện ngay, câu dẫn nói rõ 4 mảng`, hero.opacity === "1" && hero.bottom < height && /website/i.test(hero.lead) && /marketing/i.test(hero.lead));
  const ctaVisible = await page.evaluate(() => {
    const a = [...document.querySelectorAll("#mo-dau a")].find((el) => /Trao đổi nhu cầu/.test(el.textContent ?? ""));
    const r = a?.getBoundingClientRect();
    return !!r && r.bottom <= window.innerHeight && r.top >= 0;
  });
  check(`[${vp.name}] nút "Trao đổi nhu cầu" nằm trong màn đầu`, ctaVisible);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(`[${vp.name}] không tràn ngang`, overflow <= 0, `${overflow}px`);

  const robots = await page.locator('meta[name="robots"]').getAttribute("content");
  check(`[${vp.name}] noindex`, /noindex/.test(robots ?? ""), robots ?? "-");

  const projectHrefs = await page.$$eval('#du-an a[href^="/demo1/du-an/"]', (els) => new Set(els.map((el) => el.getAttribute("href"))).size);
  check(`[${vp.name}] 7 dự án thật dẫn tới trang riêng`, projectHrefs === 7, String(projectHrefs));

  const brokenImages = await page.evaluate(async () => {
    const imgs = [...document.images];
    for (const img of imgs) img.loading = "eager";
    await Promise.all(imgs.map((img) => (img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; }))));
    return imgs.filter((img) => !img.naturalWidth).map((img) => img.currentSrc || img.src);
  });
  check(`[${vp.name}] ảnh tải được`, brokenImages.length === 0, brokenImages.join(", "));

  // Logo ký tự đã vẽ
  await page.waitForTimeout(1500);
  const markDrawn = await page.evaluate(() => {
    const c = document.querySelector("#mo-dau .d1-mark canvas");
    if (!c) return false;
    const { data } = c.getContext("2d").getImageData(0, 0, c.width, c.height);
    let bright = 0;
    for (let i = 0; i < data.length; i += 16) if (data[i + 1] > 120) bright++;
    return bright > 200;
  });
  check(`[${vp.name}] logo Aegis dựng bằng ký tự đã vẽ`, markDrawn);

  // Mỗi lúc chỉ một canvas ký tự chạy
  const running = [];
  for (const id of ["mo-dau", "cach-lam-viec", "dich-vu", "du-an", "lien-he"]) {
    await scrollToId(page, id, 40);
    await page.waitForTimeout(900);
    running.push(Number(await page.evaluate(() => document.documentElement.dataset.d1Ascii ?? "0")));
  }
  check(`[${vp.name}] mỗi lúc tối đa một canvas ký tự chạy`, running.every((n) => n <= 1), running.join(","));

  // Sổ cái: 4 bước, số lớn đổi theo cuộn
  const steps = await page.locator("#cach-lam-viec [data-step]").count();
  // Cuộn như người dùng (lăn chuột / vuốt): trên máy tính Lenis giữ vị trí cuộn riêng nên scrollTo bằng script không đáng tin
  await scrollToId(page, "mo-dau", 0);
  await page.waitForTimeout(300);
  for (let i = 0; i < 80; i++) {
    const top = await page.evaluate(() => document.querySelector("#cach-lam-viec [data-step='3']").getBoundingClientRect().top / window.innerHeight);
    if (top < 0.5) break;
    if (vp.name === "mobile") await page.evaluate(() => window.scrollBy(0, 120));
    else await page.mouse.wheel(0, 120);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(900);
  const counter = await page.locator("#cach-lam-viec .d1-counter-num").textContent();
  check(`[${vp.name}] sổ cái 4 bước, số lớn chạy theo cuộn`, steps === 4 && counter?.trim() !== "01", `bước=${steps}, số=${counter?.trim()}`);

  // Dịch vụ: 4 mục, tóm tắt luôn hiện
  const summaries = await page.$$eval("#dich-vu [data-svc] .d1-svc2-body > p.text-muted", (els) => els.filter((el) => getComputedStyle(el).opacity === "1" && el.getBoundingClientRect().height > 0).length);
  check(`[${vp.name}] 4 mảng dịch vụ, tóm tắt luôn hiện`, summaries === 4, String(summaries));

  // Dự án: nút sau đổi thẻ trước
  await scrollToId(page, "du-an", 0);
  await page.waitForTimeout(500);
  const before = await page.locator(".d1-stack-card[data-offset='0']").getAttribute("href");
  await page.locator(`.d1-stack-controls button[aria-label="Dự án sau"]`).click();
  await page.waitForTimeout(700);
  const after = await page.locator(".d1-stack-card[data-offset='0']").getAttribute("href");
  check(`[${vp.name}] chồng thẻ: "Dự án sau" đổi thẻ trước`, !!before && !!after && before !== after, `${before} → ${after}`);

  // Lời khách / đội ngũ: chưa có dữ liệu thật thì không hiện
  const empty = (await page.locator("#khach-hang").count()) === 0 && !(await page.locator("#ve-aegis").textContent())?.includes("Đội ngũ");
  check(`[${vp.name}] chưa có lời khách / ảnh đội ngũ thì ẩn hai khối đó`, empty);

  if (vp.name === "desktop") {
    // Menu nằm trong thanh header (đã cuộn thì thanh có nền, không đè lên chữ); bản vẽ dịch vụ in bằng 0/1 đã vẽ; bản đồ trang
    const navOk = (await page.locator(".d1-nav").isVisible()) && (await page.locator(".d1-nav a").count()) === 5;
    const barBg = await page.locator(".d1-top").evaluate((el) => getComputedStyle(el).backgroundColor);
    check("[desktop] menu nằm trong thanh header, đã cuộn thì thanh có nền", navOk && barBg !== "rgba(0, 0, 0, 0)", barBg);
    await scrollToId(page, "dich-vu", 0);
    await page.waitForTimeout(1800);
    const blueprint = await page.evaluate(() => {
      const c = document.querySelector("#dich-vu .d1-mark canvas");
      if (!c) return 0;
      const { data } = c.getContext("2d").getImageData(0, 0, c.width, c.height);
      let bright = 0;
      for (let i = 0; i < data.length; i += 16) if (data[i + 1] > 120) bright++;
      return bright;
    });
    check("[desktop] bản vẽ dịch vụ (0/1) đã vẽ", blueprint > 200, String(blueprint));
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(800);
    const mapHidden = await page.locator(".d1-map").evaluate((el) => getComputedStyle(el).visibility === "hidden");
    await page.mouse.move(700, 450);
    for (let i = 0; i < 12; i++) {
      await page.mouse.wheel(0, 150);
      await page.waitForTimeout(60);
    }
    await page.waitForTimeout(900);
    await page.locator('.d1-map-block[title="Dự án"]').click();
    await page.waitForTimeout(1600);
    const top = await page.evaluate(() => Math.round(document.getElementById("du-an").getBoundingClientRect().top));
    check("[desktop] bản đồ trang: ẩn ở màn đầu, bấm khối nhảy đúng mục", mapHidden && Math.abs(top) < 140, `top=${top}`);
  }

  if (vp.name === "mobile") {
    await page.evaluate(() => window.scrollTo(0, 0));
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

// Không JS và giảm chuyển động: chữ vẫn hiện đủ
for (const [name, options] of [
  ["không JS", { viewport: { width: 1440, height: 900 }, javaScriptEnabled: false }],
  ["giảm chuyển động", { viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }],
]) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  await page.goto(`${baseUrl}/demo1`, { waitUntil: "load" });
  await page.waitForTimeout(600);
  const visible = await page.evaluate(() => {
    const ok = (sel) => [...document.querySelectorAll(sel)].every((el) => getComputedStyle(el).opacity === "1" && getComputedStyle(el).visibility !== "hidden");
    return ok("h1") && ok("#cach-lam-viec .d1-sheet-row") && ok("#dich-vu .d1-svc-title") && ok("#du-an h2") && document.querySelectorAll("#cach-lam-viec .d1-sheet-row").length >= 14;
  });
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.8));
  await page.waitForTimeout(500);
  const noPortal = await page.evaluate(() => !document.getElementById("mo-dau")?.dataset.d1Tone);
  check(`[${name}] chữ màn đầu, sổ cái, dịch vụ hiện đủ; không có cánh cửa tối`, visible && noPortal);
  await context.close();
}

// 7 website dự án còn chạy
{
  const { projects } = await import("../src/content/projects.ts");
  const statuses = await Promise.all(
    projects.map(async (p) => {
      try {
        const res = await fetch(p.url, { redirect: "follow", signal: AbortSignal.timeout(20000) });
        return `${p.slug}:${res.status}`;
      } catch {
        return `${p.slug}:ERR`;
      }
    }),
  );
  check("[dự án] 7 website đang chạy (HTTP < 400)", statuses.every((s) => /:(2|3)\d\d$/.test(s)), statuses.join(" "));
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
    const phone = await page.locator(".d1-phone img").count();
    const swatches = await page.locator(".d1-swatches li").count();
    check(`[dự án] /demo1/du-an/${slug}: khung laptop + điện thoại, hệ thống thiết kế`, res?.status() === 200 && !!title && /noindex/.test(robots ?? "") && phone === 1 && swatches >= 2, `${res?.status()} ${title} · màu=${swatches}`);
  }
  // cacheComponents: trang dựng lúc chạy đã gửi vỏ trước khi notFound() nên giữ mã 200 ("soft 404"), Next thêm noindex
  const errorsBefore = errors.length;
  const missing = await page.goto(`${baseUrl}/demo1/du-an/khong-co`, { waitUntil: "networkidle" });
  // Lỗi console "404" của chính trang cố tình không tồn tại là đúng, bỏ khỏi danh sách lỗi
  errors.splice(errorsBefore);
  const notFoundTitle = (await page.locator("main h1").textContent()) ?? "";
  const notFoundRobots = await page.locator('meta[name="robots"]').evaluateAll((els) => els.map((el) => el.getAttribute("content")).join(" "));
  check("[dự án] slug không có → trang 404 của /demo1, noindex", /Không tìm thấy/.test(notFoundTitle) && /noindex/.test(notFoundRobots), `${missing?.status()} ${notFoundTitle.slice(0, 40)}`);

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
