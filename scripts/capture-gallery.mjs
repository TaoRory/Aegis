// Chụp bộ ảnh gallery cho trang chi tiết dự án từ website thật (đang chạy), theo kiểu trang dự án của các studio:
// hai khung màn hình máy tính ở đoạn giữa trang + hai khung điện thoại (đầu trang, giữa trang).
// Chạy: pnpm capture:gallery            (tất cả dự án)
//       pnpm capture:gallery vidi26     (một hoặc vài slug)
// Kết quả: public/portfolio/gallery/<slug>-<tên>.webp + src/content/project-gallery.json (kích thước để next/image không xô lệch).
// Ảnh chỉ là ảnh chụp màn hình website thật, không dựng / không chỉnh nội dung.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, devices } from "playwright";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "portfolio", "gallery");
const manifestPath = path.join(root, "src", "content", "project-gallery.json");
const { projects } = await import("../src/content/projects.ts");

const only = process.argv.slice(2);
const targets = only.length ? projects.filter((p) => only.includes(p.slug)) : projects;

await mkdir(outDir, { recursive: true });
const manifest = JSON.parse(await readFile(manifestPath, "utf8").catch(() => "{}"));
const browser = await chromium.launch();

/** Mở trang, cuộn hết một lượt để kích hoạt lazy-load / hiệu ứng khi cuộn, trả về chiều cao trang */
async function open(page, url) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 }).catch(() => page.waitForLoadState("load"));
  await page.waitForTimeout(2000);
  const height = await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 140));
    }
    window.scrollTo(0, 0);
    return document.documentElement.scrollHeight;
  });
  await page.waitForTimeout(1200);
  return height;
}

async function shotAt(page, y, file, width) {
  await page.evaluate((top) => window.scrollTo(0, top), y);
  await page.waitForTimeout(1300);
  const buf = await page.screenshot();
  const info = await sharp(buf).resize({ width }).webp({ quality: 78 }).toFile(path.join(outDir, file));
  return { src: `/portfolio/gallery/${file}`, width: info.width, height: info.height };
}

for (const project of targets) {
  const entry = {};
  try {
    // Máy tính: hai khung ở khoảng 1/3 và 2/3 trang (bỏ màn đầu vì đã có ảnh bìa)
    const desk = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: "vi-VN" });
    const h = await open(desk, project.url);
    const room = Math.max(0, h - 900);
    entry.desktop = [];
    for (const [i, frac] of [0.34, 0.68].entries()) {
      if (room < 400 && i > 0) break;
      entry.desktop.push(await shotAt(desk, Math.round(room * frac), `${project.slug}-desk-${i + 1}.webp`, 1600));
    }
    await desk.close();

    // Điện thoại: đầu trang và giữa trang
    const ctx = await browser.newContext({ ...devices["iPhone 13"], locale: "vi-VN" });
    const phone = await ctx.newPage();
    const ph = await open(phone, project.url);
    entry.mobile = [await shotAt(phone, 0, `${project.slug}-m-1.webp`, 780), await shotAt(phone, Math.round(Math.max(0, ph - 844) * 0.4), `${project.slug}-m-2.webp`, 780)];
    await ctx.close();

    manifest[project.slug] = entry;
    console.log(`✓ ${project.slug}: ${entry.desktop.length} máy tính, ${entry.mobile.length} điện thoại`);
  } catch (error) {
    console.log(`✗ ${project.slug}: ${String(error).slice(0, 160)}`);
  }
}

await browser.close();
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
