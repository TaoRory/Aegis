// Tạo ảnh chia sẻ mạng xã hội (Open Graph) 1200×630 tại src/app/opengraph-image.png.
// Màu lấy từ src/styles/tokens.css, nội dung từ src/config/site.ts và src/content.
// Chạy lại sau khi đổi theme hoặc thông điệp: pnpm og:generate
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { siteConfig } = await import("../src/config/site.ts");
const { hero } = await import("../src/content/about.ts");
const { services } = await import("../src/content/services.ts");
const tokens = await readFile(path.join(root, "src/styles/tokens.css"), "utf8");

const palette = (name) => {
  const match = tokens.match(new RegExp(`--palette-${name}:\\s*([^;]+);`));
  if (!match) throw new Error(`Không tìm thấy --palette-${name} trong tokens.css`);
  return match[1].trim();
};

const colors = {
  bg: palette("ink"),
  fg: palette("paper"),
  muted: palette("graphite-light"),
  accent: palette("ultramarine-light"),
  line: palette("graphite"),
};

const escape = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const html = `<!doctype html>
<html lang="vi"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,500;12..96,75..100,600&family=Newsreader:ital,opsz,wght@1,6..72,400&family=JetBrains+Mono:wght@500&display=block&subset=vietnamese" rel="stylesheet">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; overflow: hidden; background: ${colors.bg}; color: ${colors.fg};
    font-family: "Bricolage Grotesque", sans-serif; position: relative; }
  .grid { position: absolute; inset: 0;
    background-image: linear-gradient(to right, color-mix(in oklab, ${colors.fg} 9%, transparent) 1px, transparent 1px),
      linear-gradient(to bottom, color-mix(in oklab, ${colors.fg} 9%, transparent) 1px, transparent 1px);
    background-size: 200px 100px; background-position: 64px 0; }
  .content { position: absolute; inset: 0; padding: 56px 64px; display: flex; flex-direction: column; justify-content: space-between; }
  .row { display: flex; justify-content: space-between; font-family: "JetBrains Mono", monospace; font-size: 15px;
    letter-spacing: .12em; text-transform: uppercase; color: ${colors.muted}; }
  .brand { font-size: 34px; font-weight: 600; letter-spacing: -0.045em; color: ${colors.fg}; text-transform: none; font-family: "Bricolage Grotesque"; }
  h1 { font-size: 104px; line-height: 0.98; font-weight: 600; letter-spacing: -0.05em; font-variation-settings: "wdth" 88, "opsz" 96; max-width: 1000px; }
  h1 span { font-family: "Newsreader", serif; font-style: italic; font-weight: 400; color: ${colors.accent}; letter-spacing: -0.02em; }
  .services b { color: ${colors.accent}; font-weight: 500; margin-right: 6px; }
</style></head>
<body>
  <div class="grid"></div>
  <div class="content">
    <div class="row"><span class="brand">${escape(siteConfig.name)}</span><span>${escape(hero.label)}</span></div>
    <h1>${hero.lines.map((line) => escape(line).replace(/\*(.+?)\*/g, "<span>$1</span>")).join(" ")}</h1>
    <div class="row services">
      ${services.map((s, i) => `<div><b>0${i + 1}</b>${escape(s.shortTitle)}</div>`).join("")}
    </div>
  </div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(root, "src/app/opengraph-image.png") });
await browser.close();
console.log("✓ src/app/opengraph-image.png");
