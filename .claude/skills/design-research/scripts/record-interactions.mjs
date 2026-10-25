// Quay video tương tác thật trên một website để nghiên cứu CHUYỂN ĐỘNG (không chỉ bố cục).
// Kịch bản: chờ intro → quét chuột → hover từng phần tử → cuộn chậm → cuộn nhanh rồi dừng → kéo thả.
// Mỗi pha được ghi mốc thời gian; sau đó tách video thành khung hình, dựng contact sheet theo pha
// và đo "năng lượng chuyển động" (độ khác biệt giữa các khung) để ước lượng thời lượng hiệu ứng.
//
//   node .claude/skills/design-research/scripts/record-interactions.mjs <url> <outDir> [--click "Enter"] [--fps 10] [--mobile] [--reprocess]
//   --quick: rút gọn kịch bản cho site WebGL nặng
//   --reprocess: chỉ tách khung/đo lại từ video.webm + session.json đã có (không quay lại)
//
// Kết quả trong <outDir>: video.webm, frames/*.jpg, phase-<tên>.jpg, motion.json, timeline.json
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { mkdir, readdir, readFile, rename, rm, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";

const args = process.argv.slice(2);
const [url, outDir = "interaction-out"] = args;
if (!url) {
  console.error('Usage: record-interactions.mjs <url> <outDir> [--click "Enter"] [--fps 10] [--mobile]');
  process.exit(1);
}
const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const clickText = opt("--click");
const fps = Number(opt("--fps") ?? 10);
const mobile = args.includes("--mobile");
// --quick: ít điểm quét/hover hơn — dùng cho site WebGL nặng (headless vẽ bằng CPU nên mỗi bước rất chậm)
const quick = args.includes("--quick");
const VIEW = mobile ? { width: 390, height: 844 } : { width: 1280, height: 800 };

await mkdir(path.join(outDir, "frames"), { recursive: true });

/** ffmpeg đi kèm Playwright (đọc được WebM/VP8 do Playwright quay) */
function findFfmpeg() {
  const roots = [
    process.env.PLAYWRIGHT_BROWSERS_PATH,
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "ms-playwright"),
    path.join(os.homedir(), ".cache", "ms-playwright"),
    path.join(os.homedir(), "Library", "Caches", "ms-playwright"),
  ].filter(Boolean);
  for (const root of roots) {
    if (!existsSync(root)) continue;
    const dirs = readdirSync(root).filter((d) => d.startsWith("ffmpeg-")).sort().reverse();
    for (const d of dirs) {
      for (const exe of ["ffmpeg-win64.exe", "ffmpeg-linux", "ffmpeg-mac", "ffmpeg"]) {
        const p = path.join(root, d, exe);
        if (existsSync(p)) return p;
      }
    }
  }
  return "ffmpeg";
}

const videoPath = path.join(outDir, "video.webm");
const sessionPath = path.join(outDir, "session.json");
const reprocess = args.includes("--reprocess") && existsSync(videoPath) && existsSync(sessionPath);
let timeline = [];
let hoverLog = [];

if (reprocess) {
  // Xử lý lại video đã quay (không quay lại)
  ({ timeline, hoverLog } = JSON.parse(await readFile(sessionPath, "utf8")));
  await rm(path.join(outDir, "frames"), { recursive: true, force: true });
  await mkdir(path.join(outDir, "frames"), { recursive: true });
} else {
  const browser = await chromium.launch({ args: ["--disable-blink-features=AutomationControlled", "--enable-webgl", "--ignore-gpu-blocklist"] });
  const context = await browser.newContext({
    viewport: VIEW,
    isMobile: mobile,
    hasTouch: mobile,
    recordVideo: { dir: outDir, size: VIEW },
  });
  await context.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => undefined }));
  const page = await context.newPage();
  const t0 = Date.now();

  const phase = async (name, fn) => {
    const start = (Date.now() - t0) / 1000;
    try {
      await fn();
    } catch (error) {
      console.warn(`pha ${name}: ${String(error).slice(0, 100)}`);
    }
    timeline.push({ name, start, end: (Date.now() - t0) / 1000 });
    console.log(`· ${name} ${start.toFixed(1)}s → ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  };
  const wait = (ms) => page.waitForTimeout(ms);
  let mouse = { x: VIEW.width / 2, y: VIEW.height / 2 };
  /** Di chuột mượt theo thời gian thực (không nhảy cóc), để hiệu ứng theo chuột phản ứng tự nhiên */
  async function glide(x, y, ms = 700) {
    const steps = Math.max(8, Math.round(ms / 16));
    const from = { ...mouse };
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      await page.mouse.move(from.x + (x - from.x) * e, from.y + (y - from.y) * e);
      await wait(16);
    }
    mouse = { x, y };
  }

  await phase("tai-trang", async () => {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90_000 });
    await wait(5000);
  });

  if (clickText) {
    await phase("vuot-intro", async () => {
      const box = await page.evaluate((text) => {
        const el = [...document.querySelectorAll("button, a, [role=button]")].reverse().find((e) => e.textContent?.includes(text));
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
      }, clickText);
      if (box) {
        await glide(box.x, box.y, 500);
        await page.mouse.down();
        await page.mouse.up();
      }
      await wait(4500);
    });
  }

  await phase("intro-hero", async () => wait(2500));

  await phase("quet-chuot", async () => {
    // Quỹ đạo hình số 8 qua toàn màn hình: lộ ra hiệu ứng theo chuột (cursor, parallax, WebGL)
    const points = quick ? 16 : 60;
    for (let i = 0; i <= points; i++) {
      const a = (i / points) * Math.PI * 2;
      await glide(VIEW.width / 2 + Math.sin(a) * VIEW.width * 0.38, VIEW.height / 2 + Math.sin(a * 2) * VIEW.height * 0.3, 60);
    }
    await wait(600);
  });

  /** Chọn các phần tử đáng hover trong khung nhìn: link/nút/thẻ/ảnh có kích thước đủ lớn */
  async function hoverTargets(max) {
    return page.evaluate((max) => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const seen = new Set();
      const els = [...document.querySelectorAll("a, button, img, video, [class*=card], [class*=project], [class*=item], [class*=work], li")];
      const out = [];
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (r.width < 60 || r.height < 24 || r.top < 40 || r.bottom > vh - 10 || r.left < 0 || r.right > vw) continue;
        const key = `${Math.round(r.x / 40)}-${Math.round(r.y / 40)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ x: r.x + r.width / 2, y: r.y + r.height / 2, area: r.width * r.height, tag: el.tagName.toLowerCase(), cls: String(el.className).slice(0, 50) });
      }
      return out.sort((a, b) => b.area - a.area).slice(0, max);
    }, max);
  }


  async function hoverPhase(name) {
    await phase(name, async () => {
      const targets = await hoverTargets(mobile ? 0 : quick ? 3 : 5);
      for (const t of targets) {
        const start = (Date.now() - t0) / 1000;
        await glide(t.x, t.y, 650);
        await glide(t.x + 40, t.y + 10, 500); // di nhẹ trong phần tử: lộ hiệu ứng theo vị trí chuột
        await wait(900);
        hoverLog.push({ ...t, start, end: (Date.now() - t0) / 1000 });
        await glide(t.x, Math.max(20, t.y - 200), 400); // rời ra để thấy hiệu ứng thoát
        await wait(400);
      }
    });
  }

  await hoverPhase("hover-dau-trang");

  await phase("cuon-cham", async () => {
    for (let i = 0; i < 24; i++) {
      await page.mouse.wheel(0, 90);
      await wait(110);
    }
    await wait(1200);
  });

  await hoverPhase("hover-giua-trang");

  await phase("cuon-nhanh-roi-dung", async () => {
    // Cuộn rất nhanh rồi dừng: lộ hiệu ứng phụ thuộc vận tốc (skew, stretch, blur) và quán tính
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, 420);
      await wait(30);
    }
    await wait(2200);
    for (let i = 0; i < 6; i++) {
      await page.mouse.wheel(0, -380);
      await wait(30);
    }
    await wait(2000);
  });

  await phase("keo-tha", async () => {
    // Tìm phần tử có thể kéo: slider/carousel, cursor grab, cuộn ngang; không có thì kéo giữa màn hình
    const target = await page.evaluate(() => {
      const vh = window.innerHeight;
      const cands = [...document.querySelectorAll("*")].filter((el) => {
        const r = el.getBoundingClientRect();
        if (r.width < 200 || r.height < 80 || r.bottom < 0 || r.top > vh) return false;
        const cs = getComputedStyle(el);
        const cls = String(el.className);
        return (
          cs.cursor === "grab" ||
          /slider|swiper|carousel|marquee|drag|track|gallery/i.test(cls) ||
          el.hasAttribute("draggable") ||
          ((cs.overflowX === "auto" || cs.overflowX === "scroll") && el.scrollWidth > el.clientWidth + 20)
        );
      });
      const el = cands[0];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width * 0.7, y: Math.min(vh - 40, Math.max(40, r.y + r.height / 2)), cls: String(el.className).slice(0, 60) };
    });
    const from = target ?? { x: VIEW.width * 0.7, y: VIEW.height * 0.5, cls: "(không thấy phần tử kéo được — kéo giữa màn hình)" };
    console.log("  kéo:", from.cls);
    await glide(from.x, from.y, 400);
    await page.mouse.down();
    await glide(from.x - VIEW.width * 0.45, from.y + 10, 700); // kéo nhanh để thử quán tính
    await page.mouse.up();
    await wait(1800);
    await page.mouse.down();
    await glide(mouse.x + VIEW.width * 0.3, mouse.y, 1100); // kéo chậm ngược lại
    await page.mouse.up();
    await wait(1500);
  });

  await phase("cuon-den-cuoi", async () => {
    for (let i = 0; i < 40; i++) {
      await page.mouse.wheel(0, 220);
      await wait(60);
    }
    await wait(2000);
  });

  await hoverPhase("hover-cuoi-trang");

  const video = page.video();
  await context.close();
  await browser.close();
  if (video) await rename(await video.path(), videoPath);
  await writeFile(sessionPath, JSON.stringify({ timeline, hoverLog }, null, 2));
}

// ---- Tách khung hình ----
const ffmpeg = findFfmpeg();
// Bản ffmpeg của Playwright chỉ có bộ mã hóa PNG → xuất PNG rồi chuyển sang JPEG bằng sharp
// Bản ffmpeg thu gọn không có bộ lọc fps → giảm tốc độ khung bằng tùy chọn đầu ra -r
execFileSync(ffmpeg, ["-y", "-loglevel", "error", "-i", videoPath, "-vf", "scale=640:-2", "-r", String(fps), path.join(outDir, "frames", "f%05d.png")]);
for (const f of (await readdir(path.join(outDir, "frames"))).filter((f) => f.endsWith(".png"))) {
  const src = path.join(outDir, "frames", f);
  await sharp(src).jpeg({ quality: 70 }).toFile(src.replace(/\.png$/, ".jpg"));
  await unlink(src);
}
const frames = (await readdir(path.join(outDir, "frames"))).filter((f) => f.endsWith(".jpg")).sort();
const timeOf = (i) => i / fps;

// ---- Năng lượng chuyển động giữa các khung (trung bình |Δ| trên ảnh xám 96px) ----
const motion = [];
let prev = null;
for (const f of frames) {
  const buf = await sharp(path.join(outDir, "frames", f)).resize(96).greyscale().raw().toBuffer();
  if (prev) {
    let sum = 0;
    for (let i = 0; i < buf.length; i++) sum += Math.abs(buf[i] - prev[i]);
    motion.push(+(sum / buf.length).toFixed(2));
  } else motion.push(0);
  prev = buf;
}

// Ước lượng "thời gian lắng" sau mỗi lần hover: chuyển động còn trên ngưỡng bao lâu
const settle = hoverLog.map((h) => {
  const startF = Math.round(h.start * fps);
  const endF = Math.min(motion.length - 1, Math.round(h.end * fps) + Math.round(fps * 1.5));
  let last = startF;
  for (let i = startF; i <= endF; i++) if (motion[i] > 1.2) last = i;
  return { target: `${h.tag}.${h.cls}`, activeSeconds: +((last - startF) / fps).toFixed(2), peak: Math.max(...motion.slice(startF, endF + 1)) };
});

await writeFile(path.join(outDir, "timeline.json"), JSON.stringify({ url, fps, view: VIEW, timeline, hover: settle }, null, 2));
await writeFile(path.join(outDir, "motion.json"), JSON.stringify(motion));

// ---- Contact sheet theo pha (có nhãn thời gian) ----
for (const p of timeline) {
  const ids = frames.map((_, i) => i).filter((i) => timeOf(i) >= p.start && timeOf(i) <= p.end);
  if (!ids.length) continue;
  const maxTiles = 24;
  const pick = ids.length <= maxTiles ? ids : Array.from({ length: maxTiles }, (_, k) => ids[Math.round((k * (ids.length - 1)) / (maxTiles - 1))]);
  const tileW = 320;
  const meta = await sharp(path.join(outDir, "frames", frames[pick[0]])).metadata();
  const tileH = Math.round((meta.height / meta.width) * tileW);
  const cols = 6;
  const rows = Math.ceil(pick.length / cols);
  const tiles = await Promise.all(
    pick.map(async (i) => {
      const label = Buffer.from(
        `<svg width="${tileW}" height="18"><rect width="100%" height="100%" fill="black" opacity="0.6"/><text x="4" y="13" font-size="12" fill="white" font-family="monospace">${timeOf(i).toFixed(1)}s  Δ${motion[i]}</text></svg>`,
      );
      return sharp(path.join(outDir, "frames", frames[i])).resize(tileW, tileH).composite([{ input: label, top: 0, left: 0 }]).toBuffer();
    }),
  );
  await sharp({ create: { width: cols * (tileW + 4), height: rows * (tileH + 4), channels: 3, background: "#555" } })
    .composite(tiles.map((input, k) => ({ input, left: (k % cols) * (tileW + 4), top: Math.floor(k / cols) * (tileH + 4) })))
    .jpeg({ quality: 72 })
    .toFile(path.join(outDir, `phase-${p.name}.jpg`));
}
console.log(`✓ ${url} → ${outDir} (${frames.length} khung, ${timeline.length} pha)`);
