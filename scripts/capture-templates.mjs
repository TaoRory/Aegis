// Chụp ảnh xem trước cho thư viện mẫu giao diện từ chính các trang demo.
// Chạy (cần server đang chạy):  pnpm capture:templates [baseUrl] [slug ...]
//   ví dụ: pnpm capture:templates http://localhost:3000
// Kết quả: public/templates/<slug>.webp (màn đầu), <slug>-full.webp (toàn trang, bỏ phần kết của Aegis)
//          + src/content/template-previews.json
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "templates");
const manifestPath = path.join(root, "src", "content", "template-previews.json");
const { templates } = await import("../src/content/templates.ts");

const args = process.argv.slice(2);
const baseUrl = args.find((a) => a.startsWith("http")) ?? "http://localhost:3000";
const only = args.filter((a) => !a.startsWith("http"));
const targets = only.length ? templates.filter((t) => only.includes(t.slug)) : templates;

const VIEWPORT = { width: 1440, height: 900 };
const FULL_WIDTH = 900;
const FULL_MAX_HEIGHT = 4200;

await mkdir(outDir, { recursive: true });
const manifest = JSON.parse(await readFile(manifestPath, "utf8").catch(() => "{}"));
const browser = await chromium.launch();

for (const template of targets) {
  const page = await browser.newPage({ viewport: VIEWPORT });
  try {
    await page.goto(`${baseUrl}/mau-giao-dien/${template.slug}`, { waitUntil: "networkidle" });
    // Ẩn thanh demo và con trỏ phụ để ảnh chỉ còn giao diện mẫu
    await page.addStyleTag({ content: ".demo-bar,.cursor-layer{display:none!important}" });
    await page.waitForTimeout(2500);
    // Cuộn qua trang để kích hoạt hiệu ứng và ảnh lazy, rồi quay lại đầu
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 90));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1800);

    const cover = await page.screenshot({ timeout: 90_000 });
    const coverInfo = await sharp(cover).resize({ width: 1200 }).webp({ quality: 80 }).toFile(path.join(outDir, `${template.slug}.webp`));

    // Toàn trang, dừng trước phần kết "Đang có ý tưởng tương tự?" của Aegis
    const end = await page.evaluate(() => {
      const closing = document.getElementById("demo-ket");
      return closing ? closing.getBoundingClientRect().top + window.scrollY : document.documentElement.scrollHeight;
    });
    const full = await page.screenshot({ fullPage: true, clip: { x: 0, y: 0, width: VIEWPORT.width, height: Math.round(end) }, timeout: 120_000 });
    const resized = sharp(full).resize({ width: FULL_WIDTH });
    const { info } = await resized.clone().toBuffer({ resolveWithObject: true });
    const fullInfo = await resized
      .extract({ left: 0, top: 0, width: info.width, height: Math.min(info.height, FULL_MAX_HEIGHT) })
      .webp({ quality: 72 })
      .toFile(path.join(outDir, `${template.slug}-full.webp`));

    manifest[template.slug] = {
      cover: { src: `/templates/${template.slug}.webp`, width: coverInfo.width, height: coverInfo.height },
      full: { src: `/templates/${template.slug}-full.webp`, width: fullInfo.width, height: fullInfo.height },
    };
    console.log(`✓ ${template.slug}`);
  } catch (error) {
    console.error(`✗ ${template.slug}: ${error}`);
  } finally {
    await page.close();
  }
}

await browser.close();
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
