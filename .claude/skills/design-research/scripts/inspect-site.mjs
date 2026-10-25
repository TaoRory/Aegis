// Khảo sát một website tham khảo: chụp màn hình theo nhiều vị trí cuộn + "dấu vân tay" kỹ thuật.
// Chạy từ thư mục gốc dự án (cần playwright đã cài):
//   node .claude/skills/design-research/scripts/inspect-site.mjs <url> <outDir> [--mobile] [--click "Enter without audio"]
// Kết quả: <outDir>/shot-XX.jpg, <outDir>/report.json
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const args = process.argv.slice(2);
const [url, outDir = "design-research-out"] = args;
const flag = args.includes("--mobile") ? "--mobile" : undefined;
// Một số site có màn "Enter" (âm thanh/intro): truyền --click "<chữ trên nút>" để vượt qua
const clickText = args.includes("--click") ? args[args.indexOf("--click") + 1] : undefined;
if (!url) {
  console.error("Usage: inspect-site.mjs <url> <outDir> [--mobile]");
  process.exit(1);
}
const mobile = flag === "--mobile";
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ args: ["--disable-blink-features=AutomationControlled"] });
const context = await browser.newContext({
  viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
  isMobile: mobile,
  hasTouch: mobile,
  userAgent: mobile
    ? undefined
    : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
});
await context.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => undefined }));
const page = await context.newPage();
const scripts = new Set();
page.on("response", (r) => {
  const u = r.url();
  if (/\.(m?js)(\?|$)/.test(u)) scripts.add(u.split("?")[0]);
});

await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90_000 });
await page.waitForTimeout(6000); // preloader / intro
if (clickText) {
  // Click bằng chuột thật theo tọa độ: element.click() không kích hoạt được handler pointer của một số site,
  // còn locator.click() có thể treo ở bước "scroll into view" trên site cuộn ảo.
  const box = await page.evaluate((text) => {
    const el = [...document.querySelectorAll("button, a, [role=button]")].reverse().find((e) => e.textContent?.includes(text));
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }, clickText);
  if (box) {
    await page.mouse.move(box.x, box.y, { steps: 5 });
    await page.mouse.down();
    await page.mouse.up();
  } else {
    console.warn(`Không tìm thấy nút "${clickText}"`);
  }
  await page.waitForTimeout(5000);
}

const shots = [];
const total = await page.evaluate(() => document.documentElement.scrollHeight);
const vh = await page.evaluate(() => window.innerHeight);
// Trang dùng cuộn ảo (Lenis/Locomotive với body cố định): scrollHeight ≈ vh → cuộn theo bước cố định
const virtual = total <= vh * 1.5;
const steps = virtual ? 14 : Math.min(14, Math.max(4, Math.ceil(total / vh)));
const stepDelta = virtual ? vh * 0.9 : Math.max(0, total - vh) / (steps - 1);
await page.mouse.move(700, 450);
for (let i = 0; i < steps; i++) {
  if (i > 0) {
    // Cuộn bằng wheel (nhiều nhịp nhỏ) để kích hoạt smooth-scroll giống người dùng thật
    for (let k = 0; k < 6; k++) {
      await page.mouse.wheel(0, stepDelta / 6);
      await page.waitForTimeout(60);
    }
  }
  await page.waitForTimeout(1400);
  const file = path.join(outDir, `shot-${String(i).padStart(2, "0")}.jpg`);
  await page.screenshot({ path: file, type: "jpeg", quality: 70, timeout: 90_000 }).catch((e) => console.warn("bỏ qua shot", i, String(e).slice(0, 80)));
  shots.push(file);
}

const fingerprint = await page.evaluate(() => {
  const w = window;
  const fonts = new Set();
  document.querySelectorAll("body *").forEach((el, i) => {
    if (i > 4000) return;
    fonts.add(getComputedStyle(el).fontFamily.split(",")[0].replace(/["']/g, "").trim());
  });
  const colors = {};
  document.querySelectorAll("body, section, header, footer, main > *").forEach((el) => {
    const bg = getComputedStyle(el).backgroundColor;
    colors[bg] = (colors[bg] || 0) + 1;
  });
  const html = document.documentElement.outerHTML;
  const has = (re) => re.test(html);
  return {
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content ?? null,
    globals: {
      gsap: !!w.gsap,
      ScrollTrigger: !!w.ScrollTrigger,
      Lenis: !!w.Lenis || !!w.lenis || has(/lenis/i),
      THREE: !!w.THREE || has(/three(\.module)?(\.min)?\.js/i),
      barba: !!w.barba,
      locomotive: has(/locomotive-scroll|data-scroll-container/i),
      framer: has(/framer-motion|data-framer/i),
      webflow: !!w.Webflow,
      swiper: !!w.Swiper,
      spline: has(/spline/i),
    },
    canvasCount: document.querySelectorAll("canvas").length,
    webgl: [...document.querySelectorAll("canvas")].some((c) => {
      try {
        return !!(c.getContext("webgl2") || c.getContext("webgl"));
      } catch {
        return false;
      }
    }),
    videoCount: document.querySelectorAll("video").length,
    svgCount: document.querySelectorAll("svg").length,
    fonts: [...fonts].slice(0, 15),
    backgrounds: Object.entries(colors).sort((a, b) => b[1] - a[1]).slice(0, 8),
    headings: [...document.querySelectorAll("h1,h2,h3")].slice(0, 25).map((h) => h.textContent.trim().replace(/\s+/g, " ").slice(0, 120)),
    cursorCustom: getComputedStyle(document.body).cursor === "none" || has(/class="[^"]*cursor/i),
    scrollHeight: document.documentElement.scrollHeight,
  };
});

await writeFile(
  path.join(outDir, "report.json"),
  JSON.stringify({ url, mobile, fingerprint, scripts: [...scripts].slice(0, 60), shots }, null, 2),
);
await browser.close();
console.log(`✓ ${url} → ${outDir} (${shots.length} shots)`);
