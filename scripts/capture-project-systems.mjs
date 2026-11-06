// Chụp ảnh điện thoại và đo "hệ thống thiết kế" (kiểu chữ, bảng màu) từ website thật của từng dự án, cho trang dự án /demo1.
// Chạy: node --experimental-strip-types --no-warnings scripts/capture-project-systems.mjs [slug...]
// Kết quả: public/portfolio/<slug>-mobile.webp, public/portfolio/<slug>-type.webp và src/content/project-systems.json
// Dữ liệu đo từ trang đang chạy → soát tay trước khi dùng (font hệ thống / font dự phòng cần bỏ).
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, devices } from "playwright";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "portfolio");
const manifestPath = path.join(root, "src", "content", "project-systems.json");
const { projects } = await import("../src/content/projects.ts");

const only = process.argv.slice(2);
const targets = only.length ? projects.filter((p) => only.includes(p.slug)) : projects;
const manifest = JSON.parse(await readFile(manifestPath, "utf8").catch(() => "{}"));

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();

async function settle(page, url) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 }).catch(() => page.waitForLoadState("load"));
  await page.evaluate(async () => {
    for (let y = 0; y < Math.min(document.body.scrollHeight, 6000); y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);
}

for (const project of targets) {
  const entry = { fonts: [], colors: [] };
  try {
    // 1. Ảnh điện thoại (màn đầu)
    const mobile = await browser.newContext({ ...devices["iPhone 13"], locale: "vi-VN" });
    const mp = await mobile.newPage();
    await settle(mp, project.url);
    const shot = await mp.screenshot();
    const mobileInfo = await sharp(shot).resize({ width: 600 }).webp({ quality: 78 }).toFile(path.join(outDir, `${project.slug}-mobile.webp`));
    entry.mobile = { src: `/portfolio/${project.slug}-mobile.webp`, width: mobileInfo.width, height: mobileInfo.height };
    await mobile.close();

    // 2. Kiểu chữ + bảng màu trên máy tính
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: "vi-VN" });
    await settle(page, project.url);
    const measured = await page.evaluate(() => {
      const first = (family) => family.split(",")[0].replace(/["']/g, "").trim();
      const visible = (el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && Number(cs.opacity) > 0.05;
      };
      // Tiêu đề: chữ cỡ lớn nhất trong 2 màn đầu; nội dung: font phổ biến nhất của đoạn văn
      const texts = [...document.querySelectorAll("h1, h2, h3, p, li, a, span, div")].filter(
        (el) => visible(el) && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 2),
      );
      let heading = null;
      for (const el of texts) {
        const r = el.getBoundingClientRect();
        if (r.top > window.innerHeight * 2) continue;
        const size = parseFloat(getComputedStyle(el).fontSize);
        if (!heading || size > heading.size) heading = { el, size };
      }
      const bodyCount = new Map();
      for (const el of document.querySelectorAll("p, li")) {
        if (!visible(el)) continue;
        const f = first(getComputedStyle(el).fontFamily);
        bodyCount.set(f, (bodyCount.get(f) || 0) + (el.textContent || "").length);
      }
      const body = [...bodyCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? first(getComputedStyle(document.body).fontFamily);
      if (heading) heading.el.setAttribute("data-capture-heading", "");
      const hs = heading ? getComputedStyle(heading.el) : null;

      // Màu: nền theo diện tích, chữ theo độ dài văn bản (2 màn đầu + toàn trang)
      const weights = new Map();
      const add = (color, w, kind) => {
        const m = color.match(/rgba?\(([^)]+)\)/);
        if (!m) return;
        const [r, g, b, a = "1"] = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
        if (a < 0.6) return;
        const key = [r, g, b].map((v) => Math.round(v / 6) * 6).join(",");
        const cur = weights.get(key) || { r, g, b, bg: 0, text: 0 };
        cur[kind] += w;
        weights.set(key, cur);
      };
      for (const el of document.querySelectorAll("body, body *")) {
        if (!visible(el)) continue;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        add(cs.backgroundColor, Math.min(r.width * r.height, 1440 * 900), "bg");
        const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join("");
        if (own.length) add(cs.color, own.length * parseFloat(cs.fontSize), "text");
      }
      return {
        heading: hs ? { family: first(hs.fontFamily), weight: hs.fontWeight, text: heading.el.textContent.trim().slice(0, 80) } : null,
        body,
        colors: [...weights.values()],
      };
    });

    if (measured.heading) entry.fonts.push({ role: "Tiêu đề", family: measured.heading.family, weight: measured.heading.weight });
    if (measured.body && measured.body !== measured.heading?.family) entry.fonts.push({ role: "Nội dung", family: measured.body });
    else if (measured.body) entry.fonts[0].role = "Tiêu đề và nội dung";

    // Gộp màu gần nhau, lấy 2 nền + 2 chữ + 1 nhấn (màu đậm nhất trong phần còn lại)
    const hex = ({ r, g, b }) => "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
    const sat = ({ r, g, b }) => (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
    const dist = (a, b) => Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);
    const pick = [];
    const push = (c, role) => {
      if (!c || pick.some((p) => dist(p, c) < 40)) return false;
      pick.push({ ...c, role });
      return true;
    };
    const bgs = measured.colors.filter((c) => c.bg > 0).sort((a, b) => b.bg - a.bg);
    const texts = measured.colors.filter((c) => c.text > 0).sort((a, b) => b.text - a.text);
    let n = 0;
    for (const c of bgs) if (n < 2 && push(c, "Nền")) n++;
    n = 0;
    for (const c of texts) if (n < 2 && push(c, "Chữ")) n++;
    const accent = measured.colors.filter((c) => sat(c) > 0.28 && (c.bg > 4000 || c.text > 200)).sort((a, b) => sat(b) * Math.log(b.bg + b.text + 1) - sat(a) * Math.log(a.bg + a.text + 1))[0];
    push(accent, "Nhấn");
    entry.colors = pick.map((c) => ({ hex: hex(c), role: c.role }));

    // 3. Mẫu chữ: chụp đúng khối tiêu đề lớn nhất
    const headingEl = page.locator("[data-capture-heading]").first();
    if (await headingEl.count()) {
      const buf = await headingEl.screenshot({ timeout: 5000 }).catch(() => null);
      if (buf) {
        const info = await sharp(buf).resize({ width: 900, height: 360, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(outDir, `${project.slug}-type.webp`));
        entry.specimen = { src: `/portfolio/${project.slug}-type.webp`, width: info.width, height: info.height, text: measured.heading?.text };
      }
    }
    await page.close();
    manifest[project.slug] = entry;
    console.log(`✓ ${project.slug}`, JSON.stringify(entry.fonts), entry.colors.map((c) => `${c.role}:${c.hex}`).join(" "));
  } catch (error) {
    console.error(`✗ ${project.slug}: ${error}`);
  }
}

await browser.close();
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`→ ${path.relative(root, manifestPath)}`);
