// Tìm và lấy ảnh GIẤY PHÉP MỞ cho phép dùng thương mại (CC0 / Public Domain / CC BY / CC BY-SA; không NC/ND).
// Nguồn mặc định: Wikimedia Commons API (không cần key), lọc trong danh mục "Quality images" (ảnh đã được cộng đồng
// duyệt chất lượng kỹ thuật) — thêm --any để bỏ lọc này. Tùy chọn --provider openverse (từ 2026-10 Openverse trả 401
// /Cloudflare challenge cho truy cập tự động; không cố vượt). Unsplash/Pexels chặn truy cập tự động (cần API key).
// Nguồn: wikimedia (ảnh gốc độ phân giải cao, chất lượng không đều), stocksnap (CC0 đẹp nhưng chỉ có bản 960px
// → hợp cho thẻ/lưới, hero thì xử lý duotone/grain), flickr (thường chỉ 1024px → bị lọc).
//
// Bước 1 — tìm ứng viên, dựng contact sheet có đánh số để chọn bằng mắt:
//   node .claude/skills/template-gallery/scripts/images.mjs search "<từ khóa tiếng Anh>" <tmpDir> [--wide|--tall|--square] [--n 16] [--source wikimedia,stocksnap] [--min 960]
//   (--min: chiều rộng tối thiểu, mặc định 1400; hạ xuống 960 để nhận ảnh StockSnap cho thẻ/lưới)
// Bước 2 — lấy các ảnh đã chọn vào dự án, tối ưu WebP và ghi công tác giả:
//   node .claude/skills/template-gallery/scripts/images.mjs pick <tmpDir> <slug> <tên1>=<số> [<tên2>=<số> ...]
//   → public/templates/<slug>/<tên>.webp + src/content/image-credits.json
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const [mode, ...rest] = process.argv.slice(2);
const API = "https://api.openverse.org/v1/images/";
const COMMONS = "https://commons.wikimedia.org/w/api.php";
const LICENSES = "cc0,pdm,by"; // không lấy BY-SA/NC/ND
const UA = { "User-Agent": "AegisTemplateResearch/1.0 (design research)" };

// Wikimedia giới hạn tần suất (429 "You are making too many requests") → chờ tăng dần rồi thử lại
async function fetchRetry(url, attempts = 8) {
  for (let i = 1; ; i++) {
    const res = await fetch(url, { headers: UA, redirect: "follow", signal: AbortSignal.timeout(60000) }).catch((e) => ({ ok: false, status: String(e) }));
    if (res.ok) return res;
    if (i >= attempts) throw new Error(`${res.status} ${url}`);
    await new Promise((r) => setTimeout(r, 8000 * i));
  }
}

async function download(url) {
  return Buffer.from(await (await fetchRetry(url)).arrayBuffer());
}

if (mode === "search") {
  const [query, dir] = rest;
  const n = Number(rest.includes("--n") ? rest[rest.indexOf("--n") + 1] : 16);
  const aspect = rest.includes("--tall") ? "tall" : rest.includes("--square") ? "square" : rest.includes("--wide") ? "wide" : "";
  const minWidth = Number(rest.includes("--min") ? rest[rest.indexOf("--min") + 1] : 1400);
  // Ô xem trước theo tỉ lệ cần tìm, để chọn ảnh bằng mắt cho đúng bố cục
  const [TW, TH] = aspect === "tall" ? [300, 400] : aspect === "square" ? [360, 360] : [480, 320];
  await mkdir(dir, { recursive: true });
  let data = { results: [] };
  const provider = rest.includes("--provider") ? rest[rest.indexOf("--provider") + 1] : "commons";
  const getJson = async (url) => {
    // API đôi khi lỗi ngẫu nhiên → thử lại tối đa 4 lần
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(40000) });
        if (!res.ok) throw new Error(String(res.status));
        return await res.json();
      } catch (error) {
        console.warn(`API lỗi (${error}), thử lại lần ${attempt}…`);
        await new Promise((r) => setTimeout(r, 2500 * attempt));
      }
    }
    return {};
  };
  if (provider === "openverse") {
    // Lưu ý: kết hợp size=large + aspect_ratio làm API lỗi 500 → chỉ lọc tỉ lệ, kiểm tra độ phân giải thật sau khi tải
    const source = rest.includes("--source") ? rest[rest.indexOf("--source") + 1] : "wikimedia,rawpixel,flickr,stocksnap";
    const params = new URLSearchParams({ q: query, license: LICENSES, page_size: String(Math.min(50, n * 3)), mature: "false", source });
    if (aspect) params.set("aspect_ratio", aspect);
    data = await getJson(`${API}?${params}`);
  } else {
    // Ưu tiên ảnh "Quality images"; thiếu thì bổ sung từ toàn bộ Commons (trừ khi --quality-only)
    const variants = rest.includes("--any") ? [""] : rest.includes("--quality-only") ? [" incategory:Quality_images"] : [" incategory:Quality_images", ""];
    const json = { query: { pages: {} } };
    let offset = 0;
    for (const v of variants) {
      const params = new URLSearchParams({
        action: "query",
        format: "json",
        generator: "search",
        gsrnamespace: "6",
        gsrsearch: `${query} filetype:bitmap${v}`,
        gsrlimit: String(Math.min(50, n * 4)),
        prop: "imageinfo",
        iiprop: "url|size|extmetadata",
        iiurlwidth: "640",
        iiextmetadatafilter: "LicenseShortName|LicenseUrl|Artist|ObjectName",
      });
      const part = await getJson(`${COMMONS}?${params}`);
      for (const page of Object.values(part.query?.pages ?? {})) {
        if (Object.values(json.query.pages).some((x) => x.title === page.title)) continue;
        json.query.pages[page.pageid] = { ...page, index: page.index + offset };
      }
      offset += 1000;
      if (Object.keys(json.query.pages).length >= n * 2) break;
    }
    const strip = (html = "") => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    const pages = Object.values(json.query?.pages ?? {}).sort((a, b) => a.index - b.index);
    data.results = pages.flatMap((p) => {
      const ii = p.imageinfo?.[0];
      if (!ii) return [];
      const meta = ii.extmetadata ?? {};
      const lic = strip(meta.LicenseShortName?.value);
      // CC0, Public Domain, CC BY, CC BY-SA (không NC/ND). BY-SA: dùng nguyên ảnh + ghi công + link giấy phép;
      // đổi định dạng/kích thước không phải "chỉnh sửa", nhưng KHÔNG nướng filter màu vào file ảnh BY-SA.
      if (!/^(cc0|public domain|pd|cc[ -]by(-sa)?[ -]\d)/i.test(lic) || /\b(nc|nd)\b/i.test(lic)) return [];
      const ratio = ii.height / ii.width;
      if (aspect === "tall" && ratio < 1.15) return [];
      if (aspect === "wide" && ratio > 0.8) return [];
      if (aspect === "square" && (ratio < 0.8 || ratio > 1.25)) return [];
      return [{
        url: ii.thumburl, // bản 640px để dựng contact sheet; pick sẽ lấy bản 2000px
        width: ii.width,
        height: ii.height,
        title: strip(meta.ObjectName?.value) || p.title.replace(/^File:|\.\w+$/g, ""),
        creator: strip(meta.Artist?.value),
        license: lic,
        license_url: meta.LicenseUrl?.value,
        source: "commons",
        foreign_landing_url: ii.descriptionurl,
        commonsTitle: p.title,
      }];
    });
  }
  const results = (data.results ?? []).filter((r) => (r.width ?? 0) >= minWidth);
  const candidates = [];
  for (const [i, r] of results.entries()) {
    if (candidates.length >= n) break;
    try {
      const raw = await download(r.url);
      const { width = 0 } = await sharp(raw).metadata();
      if (!r.commonsTitle && width < minWidth) continue; // ảnh xem trước bị thu nhỏ (thường gặp ở rawpixel/flickr)
      const buf = await sharp(raw).rotate().resize(TW, TH, { fit: "cover" }).jpeg({ quality: 70 }).toBuffer();
      const label = Buffer.from(`<svg width="${TW}" height="30"><rect width="100%" height="100%" fill="black" opacity="0.7"/><text x="6" y="21" font-size="15" fill="white" font-family="monospace">#${i} ${String(r.license).toUpperCase().slice(0, 14)} ${r.width}x${r.height}</text></svg>`);
      candidates.push({ i, buf: await sharp(buf).composite([{ input: label, top: 0, left: 0 }]).toBuffer(), meta: r });
    } catch (error) {
      console.warn(`bỏ qua #${i}: ${String(error).slice(0, 80)}`);
    }
  }
  const cols = aspect === "tall" ? 6 : 4;
  const rows = Math.ceil(candidates.length / cols);
  await sharp({ create: { width: cols * (TW + 4), height: Math.max(1, rows) * (TH + 4), channels: 3, background: "#444" } })
    .composite(candidates.map((c, k) => ({ input: c.buf, left: (k % cols) * (TW + 4), top: Math.floor(k / cols) * (TH + 4) })))
    .jpeg({ quality: 75 })
    .toFile(path.join(dir, "candidates.jpg"));
  const meta = Object.fromEntries(
    candidates.map((c) => [
      c.i,
      {
        url: c.meta.url,
        title: c.meta.title,
        creator: c.meta.creator,
        license: c.meta.license,
        license_version: c.meta.license_version,
        license_url: c.meta.license_url,
        source: c.meta.source,
        landing: c.meta.foreign_landing_url,
        commonsTitle: c.meta.commonsTitle,
        query,
      },
    ]),
  );
  await writeFile(path.join(dir, "candidates.json"), JSON.stringify(meta, null, 2));
  console.log(`✓ ${candidates.length} ứng viên → ${path.join(dir, "candidates.jpg")}`);
} else if (mode === "pick") {
  const [dir, slug, ...pairs] = rest;
  const meta = JSON.parse(await readFile(path.join(dir, "candidates.json"), "utf8"));
  const outDir = path.join("public", "templates", slug);
  await mkdir(outDir, { recursive: true });
  const creditsPath = path.join("src", "content", "image-credits.json");
  const credits = JSON.parse(await readFile(creditsPath, "utf8").catch(() => "{}"));
  credits[slug] ??= {};
  for (const pair of pairs) {
    const [name, idx] = pair.split("=");
    const m = meta[idx];
    if (!m) throw new Error(`Không có ứng viên #${idx}`);
    let src = m.url;
    if (m.commonsTitle) {
      const q = new URLSearchParams({ action: "query", format: "json", titles: m.commonsTitle, prop: "imageinfo", iiprop: "url", iiurlwidth: "1920" }); // 1920: cỡ thumbnail chuẩn; cỡ lạ trả về file gốc (bị giới hạn tần suất gắt hơn)
      const j = await (await fetchRetry(`${COMMONS}?${q}`)).json();
      src = Object.values(j.query.pages)[0].imageinfo[0].thumburl;
    }
    const info = await sharp(await download(src)).rotate().resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true }).webp({ quality: 78 }).toFile(path.join(outDir, `${name}.webp`));
    credits[slug][name] = {
      src: `/templates/${slug}/${name}.webp`,
      width: info.width,
      height: info.height,
      creator: m.creator || "Không rõ tác giả",
      license: m.commonsTitle ? m.license : `${m.license.toUpperCase()} ${m.license_version ?? ""}`.trim(),
      license_url: m.license_url,
      source: m.landing || m.url,
      title: m.title,
    };
    console.log(`✓ ${slug}/${name}.webp (${info.width}×${info.height}, ${m.license})`);
    // Ghi ngay sau mỗi ảnh để lỗi giữa chừng không làm mất credit; nghỉ ngắn để tránh giới hạn tần suất
    await writeFile(creditsPath, JSON.stringify(credits, null, 2) + "\n");
    await new Promise((r) => setTimeout(r, 1200));
  }
} else {
  console.log('Dùng: images.mjs search "<query>" <tmpDir> [--wide|--tall|--square] [--n 16]  |  images.mjs pick <tmpDir> <slug> name=idx ...');
}
