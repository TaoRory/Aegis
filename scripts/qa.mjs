// Kiểm tra nhanh giao diện và chức năng bằng trình duyệt thật (Playwright).
// Chạy: pnpm build && pnpm start   (cửa sổ khác)  rồi  pnpm qa [baseUrl]
// Kết quả và ảnh chụp lưu tại qa-output/
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.argv[2] ?? "http://localhost:3000";
const outDir = "qa-output";
const viewports = [
  { name: "mobile", width: 375, height: 812, isMobile: true, hasTouch: true },
  { name: "tablet", width: 768, height: 1024, isMobile: true, hasTouch: true },
  { name: "desktop", width: 1440, height: 900 },
];

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile,
    hasTouch: vp.hasTouch,
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (msg) => msg.type() === "error" && consoleErrors.push(msg.text()));
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // Cuộn hết trang để tải ảnh lazy và kích hoạt hiệu ứng
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
  });
  await page.waitForTimeout(500);

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    offenders: [...document.querySelectorAll("body *")]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.right > document.documentElement.clientWidth + 1;
      })
      .filter((el) => !el.closest("[aria-hidden='true'], .absolute"))
      .slice(0, 5)
      .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)}`),
  }));
  check(
    `[${vp.name}] không tràn ngang`,
    overflow.scrollWidth <= overflow.clientWidth,
    `${overflow.scrollWidth}/${overflow.clientWidth} ${overflow.offenders.join(", ")}`,
  );

  // Liên kết nội bộ (#...) phải trỏ tới phần tử tồn tại
  // Link nội bộ cùng trang: "#id" hoặc "/#id" khi đang ở trang chủ
  const brokenAnchors = await page.$$eval("a[href^='#'], a[href^='/#']", (links) =>
    links
      .map((a) => a.getAttribute("href"))
      .filter((href) => !document.getElementById(href.split("#")[1])),
  );
  check(`[${vp.name}] anchor nội bộ hợp lệ`, brokenAnchors.length === 0, brokenAnchors.join(", "));

  // Liên kết ngoài phải mở tab mới và có rel an toàn
  const external = await page.$$eval("a[href^='http']", (links) =>
    links.map((a) => ({ href: a.href, target: a.target, rel: a.rel })),
  );
  const unsafe = external.filter((l) => l.target !== "_blank" || !/noopener/.test(l.rel) || !/noreferrer/.test(l.rel));
  check(`[${vp.name}] ${external.length} liên kết ngoài an toàn`, unsafe.length === 0, unsafe.map((l) => l.href).join(", "));

  // Ảnh bị lỗi
  const brokenImages = await page.$$eval("img", (imgs) =>
    imgs.filter((img) => img.complete && img.naturalWidth === 0 && getComputedStyle(img).display !== "none").map((img) => img.src),
  );
  check(`[${vp.name}] ảnh tải được`, brokenImages.length === 0, brokenImages.join(", "));

  // Ảnh toàn trang chụp ở chế độ giảm chuyển động: hiệu ứng theo vị trí cuộn
  // không phản ánh đúng khi trình duyệt chụp toàn trang
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${outDir}/${vp.name}-full.png`, fullPage: true });
  await page.emulateMedia({ reducedMotion: "no-preference" });

  if (vp.name === "mobile") {
    const toggle = page.locator('button[aria-controls="menu-di-dong"]');
    await toggle.click();
    await page.waitForTimeout(500);
    const menuVisible = await page.locator("#menu-di-dong").isVisible();
    check("[mobile] menu mở được", menuVisible && (await toggle.getAttribute("aria-expanded")) === "true");
    await page.screenshot({ path: `${outDir}/mobile-menu.png` });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
    check("[mobile] Esc đóng menu", (await toggle.getAttribute("aria-expanded")) === "false");
    await toggle.click();
    await page.locator("#menu-di-dong").getByRole("link", { name: /Dự án/ }).click();
    await page.waitForTimeout(3000);
    const top = await page.evaluate(() => document.getElementById("du-an").getBoundingClientRect().top);
    check("[mobile] bấm mục menu cuộn tới section và đóng menu",
      Math.abs(top) < 120 && (await toggle.getAttribute("aria-expanded")) === "false", `top=${Math.round(top)}`);
  }

  if (vp.name === "desktop") {
    // Bộ lọc dự án
    const counts = {};
    for (const label of ["Doanh nghiệp", "Giáo dục & tổ chức", "Sự kiện", "Tất cả"]) {
      await page.getByRole("button", { name: new RegExp(`^${label}`) }).click();
      await page.waitForTimeout(600);
      counts[label] = await page.locator("#du-an li[data-project]").count();
    }
    check("[desktop] bộ lọc dự án", counts["Tất cả"] === 7 && counts["Doanh nghiệp"] === 2 && counts["Sự kiện"] === 3,
      JSON.stringify(counts));

    // Link trong hero tới chương Marketing (bên trong đoạn ghim) rồi "Trao đổi về dịch vụ này" chọn sẵn dịch vụ
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);
    await page.locator('#trang-chu a[href="#dich-vu-marketing"]').click();
    await page.waitForTimeout(3000);
    const chapterVisible = await page.locator("#dich-vu-marketing").getByRole("link", { name: /Trao đổi về dịch vụ này/ }).isVisible();
    check("[desktop] link tới chương Marketing hiển thị đúng chương", chapterVisible);
    await page.screenshot({ path: `${outDir}/desktop-service-chapter.png` });
    await page.locator("#dich-vu-marketing").getByRole("link", { name: /Trao đổi về dịch vụ này/ }).click();
    await page.waitForURL(/\/lien-he\?dv=marketing/, { timeout: 10_000 });
    await page.waitForSelector('.wizard-step[data-step-key="q:mkt_goal"][data-current]', { timeout: 10_000 });
    check("[desktop] chọn sẵn dịch vụ từ chương dịch vụ → form vào thẳng câu riêng của Marketing", true);
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);

    // Hover dự án: ảnh nổi theo con trỏ
    const row = page.locator("#du-an li[data-project]").nth(1);
    await row.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    const box = await row.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width * 0.3, box.y + box.height / 2, { steps: 8 });
      await page.mouse.move(box.x + box.width * 0.4, box.y + box.height / 2, { steps: 8 });
    }
    await page.waitForTimeout(1200);
    const floatVisible = await page.locator(".project-float.is-visible").count();
    check("[desktop] ảnh xem trước hiện khi rê chuột lên dự án", floatVisible === 1);
    await page.screenshot({ path: `${outDir}/desktop-project-hover.png` });

    // Điều hướng bằng bàn phím: phần tử focus đầu tiên là skip link
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.keyboard.press("Tab");
    const firstFocus = await page.evaluate(() => document.activeElement?.textContent?.trim());
    check("[desktop] Tab đầu tiên vào skip link", firstFocus === "Bỏ qua đến nội dung chính", firstFocus);
    await page.screenshot({ path: `${outDir}/desktop-hero.png` });
  }

  check(`[${vp.name}] không lỗi console`, consoleErrors.length === 0, consoleErrors.join(" | ").slice(0, 400));
  await context.close();
}

// Thư viện mẫu và từng trang mẫu demo: tràn ngang (mobile + desktop), nhãn demo, lỗi console
const galleryHtml = await (await fetch(`${baseUrl}/mau-giao-dien`)).text();
const templatePaths = [...new Set([...galleryHtml.matchAll(/href="(\/mau-giao-dien\/[a-z0-9-]+)"/g)].map((m) => m[1]))];
check("[mẫu] thư viện liệt kê các mẫu", templatePaths.length > 0, templatePaths.join(", "));
for (const vp of [viewports[0], viewports[2]]) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, hasTouch: vp.hasTouch });
  const page = await context.newPage();
  for (const route of ["/mau-giao-dien", "/lien-he", ...templatePaths]) {
    const errors = [];
    page.removeAllListeners("pageerror");
    page.removeAllListeners("console");
    page.on("pageerror", (err) => errors.push(String(err)));
    page.on("console", (msg) => msg.type() === "error" && errors.push(msg.text()));
    await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    const result = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      demoLabel: !location.pathname.match(/^\/mau-giao-dien\/./) || !!document.querySelector(".demo-bar"),
    }));
    check(`[${vp.name}] ${route} không tràn ngang`, result.overflow <= 0, `${result.overflow}px`);
    check(`[${vp.name}] ${route} có nhãn mẫu demo`, result.demoLabel);
    check(`[${vp.name}] ${route} không lỗi console`, errors.length === 0, errors.join(" | ").slice(0, 200));
  }
  await context.close();
}

// API liên hệ: kiểm tra phía server
const api = async (body, headers = {}) => {
  const res = await fetch(`${baseUrl}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
};
const valid = {
  service: "web",
  answers: { web_type: ["company"], timeline: ["asap"] },
  others: {},
  name: "Nguyễn Văn A",
  contact: "a@example.com",
  company: "",
  message: "",
  website: "",
  elapsedMs: 10_000,
};
let r = await api("{bad json");
check("[api] JSON lỗi → 400", r.status === 400, JSON.stringify(r));
r = await api({ ...valid, website: "spam.com" });
check("[api] honeypot → chặn", r.body?.code === "SPAM", JSON.stringify(r));
r = await api({ ...valid, elapsedMs: 100 });
check("[api] gửi quá nhanh → chặn", r.body?.code === "SPAM", JSON.stringify(r));
r = await api({ ...valid, service: "xyz" });
check("[api] dịch vụ lạ → 422", r.status === 422 && r.body?.errors?.service, JSON.stringify(r.body));
r = await api({ ...valid, contact: "khong-hop-le", answers: { web_type: ["hack"], timeline: ["asap"] } });
check(
  "[api] liên hệ sai + lựa chọn lạ → 422 kèm lỗi từng câu",
  r.status === 422 && r.body?.errors?.contact && r.body?.errors?.["q:web_type"],
  JSON.stringify(r.body),
);
r = await api({ ...valid, service: "other", answers: { timeline: ["asap"] } });
check("[api] nhánh 'chưa chắc' bắt buộc mô tả", r.status === 422 && r.body?.errors?.message, JSON.stringify(r.body));
r = await api({ ...valid, answers: { ...valid.answers, mkt_goal: ["leads"] } });
check("[api] câu trả lời của nhánh khác bị bỏ qua (không lỗi)", [200, 503, 502].includes(r.status), JSON.stringify(r));
r = await api(valid, { Origin: "https://evil.example" });
check("[api] khác origin → 403", r.status === 403, JSON.stringify(r));
r = await api(valid);
check("[api] hợp lệ → phản hồi trung thực theo cấu hình", [200, 503, 502].includes(r.status), JSON.stringify(r));

await browser.close();
await writeFile(`${outDir}/results.json`, JSON.stringify(results, null, 2));
const failed = results.filter((x) => !x.ok);
console.log(`\n${results.length - failed.length}/${results.length} kiểm tra đạt`);
process.exit(failed.length ? 1 : 0);
