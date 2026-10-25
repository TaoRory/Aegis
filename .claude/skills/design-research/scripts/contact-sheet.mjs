// Ghép các ảnh shot-XX.jpg của một lần khảo sát thành một "contact sheet" để xem nhanh.
//   node .claude/skills/design-research/scripts/contact-sheet.mjs <dir> [cols=3] [tileWidth=640]
import { readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const [dir, colsArg = "3", widthArg = "640"] = process.argv.slice(2);
const cols = Number(colsArg);
const tileW = Number(widthArg);
const files = (await readdir(dir)).filter((f) => /^shot-\d+\.jpg$/.test(f)).sort();
if (!files.length) throw new Error(`Không có shot-XX.jpg trong ${dir}`);

const first = await sharp(path.join(dir, files[0])).metadata();
const tileH = Math.round((first.height / first.width) * tileW);
const gap = 8;
const rows = Math.ceil(files.length / cols);
const tiles = await Promise.all(
  files.map((f) => sharp(path.join(dir, f)).resize(tileW, tileH, { fit: "cover", position: "top" }).toBuffer()),
);
await sharp({
  create: { width: cols * tileW + (cols - 1) * gap, height: rows * tileH + (rows - 1) * gap, channels: 3, background: "#777" },
})
  .composite(tiles.map((input, i) => ({ input, left: (i % cols) * (tileW + gap), top: Math.floor(i / cols) * (tileH + gap) })))
  .jpeg({ quality: 78 })
  .toFile(path.join(dir, "contact-sheet.jpg"));
console.log(`✓ ${path.join(dir, "contact-sheet.jpg")}`);
