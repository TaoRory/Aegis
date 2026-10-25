// Chụp ảnh preview cho portfolio từ website thật.
// Chạy: pnpm capture:previews            (tất cả dự án)
//       pnpm capture:previews vidi26     (một hoặc vài slug)
// Yêu cầu: pnpm exec playwright install chromium
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "portfolio");
const manifestPath = path.join(root, "src", "content", "project-previews.json");
const { projects } = await import("../src/content/projects.ts");

const VIEWPORT = { width: 1440, height: 900 };
const COVER_WIDTH = 1200;
const FULL_WIDTH = 900;
const FULL_MAX_HEIGHT = 3600;

const only = process.argv.slice(2);
const targets = only.length ? projects.filter((p) => only.includes(p.slug)) : projects;

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
const report = [];
const manifest = JSON.parse(await readFile(manifestPath, "utf8").catch(() => "{}"));

for (const project of targets) {
  const page = await browser.newPage({ viewport: VIEWPORT, locale: "vi-VN" });
  try {
    await page.goto(project.url, { waitUntil: "networkidle", timeout: 60_000 }).catch(() =>
      page.waitForLoadState("load"),
    );
    // Cuộn hết trang để kích hoạt lazy-load và hiệu ứng xuất hiện khi cuộn
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1500);

    const cover = await page.screenshot();
    const coverInfo = await sharp(cover)
      .resize({ width: COVER_WIDTH })
      .webp({ quality: 80 })
      .toFile(path.join(outDir, `${project.slug}.webp`));

    const full = await page.screenshot({ fullPage: true });
    const resized = sharp(full).resize({ width: FULL_WIDTH });
    const { info } = await resized.clone().toBuffer({ resolveWithObject: true });
    const fullInfo = await resized
      .extract({ left: 0, top: 0, width: info.width, height: Math.min(info.height, FULL_MAX_HEIGHT) })
      .webp({ quality: 72 })
      .toFile(path.join(outDir, `${project.slug}-full.webp`));

    manifest[project.slug] = {
      cover: { src: `/portfolio/${project.slug}.webp`, width: coverInfo.width, height: coverInfo.height },
      full: { src: `/portfolio/${project.slug}-full.webp`, width: fullInfo.width, height: fullInfo.height },
    };

    report.push({
      slug: project.slug,
      ok: true,
      title: await page.title(),
      description: await page
        .locator('meta[name="description"]')
        .getAttribute("content", { timeout: 1000 })
        .catch(() => null),
      headings: await page.$$eval("h1, h2, h3", (els) =>
        els.slice(0, 20).map((el) => el.textContent?.trim().replace(/\s+/g, " ")),
      ),
    });
    console.log(`✓ ${project.slug}`);
  } catch (error) {
    report.push({ slug: project.slug, ok: false, error: String(error) });
    console.error(`✗ ${project.slug}: ${error}`);
  } finally {
    await page.close();
  }
}

await browser.close();
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
if (process.env.CAPTURE_REPORT) {
  await writeFile(process.env.CAPTURE_REPORT, JSON.stringify(report, null, 2));
}
