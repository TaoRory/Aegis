import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import type { D2Lang } from "@/content/demo2";

/**
 * Blog của /demo2: đọc các file Markdown trong src/content/blog/<lang>/ lúc build (trang tĩnh).
 * Cú pháp hỗ trợ và cách đăng bài: src/content/blog/README.md. Không dùng thư viện ngoài; nội dung được dựng thành
 * phần tử React (không chèn HTML thô) nên an toàn với nội dung bất kỳ.
 */

export type Inline = string | { kind: "strong" | "em" | "code"; text: string } | { kind: "link"; text: string; href: string };
export type Block =
  | { kind: "h2" | "h3" | "p" | "quote"; inline: Inline[] }
  | { kind: "ul" | "ol"; items: Inline[][] }
  | { kind: "code"; text: string };

export interface D2Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  minutes: number;
  blocks: Block[];
}

const dir = (lang: D2Lang) => path.join(process.cwd(), "src", "content", "blog", lang);

function inline(text: string): Inline[] {
  const out: Inline[] = [];
  const pattern = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g;
  let last = 0;
  for (const m of text.matchAll(pattern)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push({ kind: "strong", text: m[1] });
    else if (m[2]) out.push({ kind: "em", text: m[2] });
    else if (m[3]) out.push({ kind: "code", text: m[3] });
    else out.push({ kind: "link", text: m[4], href: m[5] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function parseBody(source: string): Block[] {
  const blocks: Block[] = [];
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
    } else if (line.startsWith("```")) {
      const code: string[] = [];
      for (i++; i < lines.length && !lines[i].startsWith("```"); i++) code.push(lines[i]);
      i++;
      blocks.push({ kind: "code", text: code.join("\n") });
    } else if (line.startsWith("### ")) {
      blocks.push({ kind: "h3", inline: inline(line.slice(4).trim()) });
      i++;
    } else if (line.startsWith("## ")) {
      blocks.push({ kind: "h2", inline: inline(line.slice(3).trim()) });
      i++;
    } else if (/^(- |\d+\. )/.test(line)) {
      const ordered = /^\d+\. /.test(line);
      const items: Inline[][] = [];
      for (; i < lines.length && (ordered ? /^\d+\. /.test(lines[i]) : lines[i].startsWith("- ")); i++) items.push(inline(lines[i].replace(/^(- |\d+\. )/, "").trim()));
      blocks.push({ kind: ordered ? "ol" : "ul", items });
    } else {
      const quote = line.startsWith("> ");
      const text: string[] = [];
      for (; i < lines.length && lines[i].trim() && !/^(## |### |- |\d+\. |```)/.test(lines[i]) && lines[i].startsWith("> ") === quote; i++) text.push(lines[i].replace(/^> /, "").trim());
      blocks.push({ kind: quote ? "quote" : "p", inline: inline(text.join(" ")) });
    }
  }
  return blocks;
}

function parse(slug: string, raw: string): (D2Post & { published: boolean }) | null {
  const match = raw.replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return null;
  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const at = line.indexOf(":");
    if (at > 0) meta[line.slice(0, at).trim()] = line.slice(at + 1).trim();
  }
  if (!meta.title || !/^\d{4}-\d{2}-\d{2}$/.test(meta.date ?? "")) return null;
  const words = match[2].split(/\s+/).filter(Boolean).length;
  return {
    slug,
    title: meta.title,
    date: meta.date,
    excerpt: meta.excerpt ?? "",
    tags: (meta.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean),
    minutes: Math.max(1, Math.round(words / 220)),
    blocks: parseBody(match[2]),
    published: meta.published === "true",
  };
}

/** Các bài đã đăng, mới nhất trước. File bắt đầu bằng "_" (mẫu, nháp) luôn bị bỏ qua. */
export function d2Posts(lang: D2Lang): D2Post[] {
  let files: string[] = [];
  try {
    files = readdirSync(dir(lang));
  } catch {
    return [];
  }
  return files
    .filter((file) => file.endsWith(".md") && !file.startsWith("_") && /^[a-z0-9-]+\.md$/.test(file))
    .map((file) => parse(file.slice(0, -3), readFileSync(path.join(dir(lang), file), "utf8")))
    .filter((post): post is D2Post & { published: boolean } => !!post && post.published)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export const d2Post = (lang: D2Lang, slug: string) => d2Posts(lang).find((post) => post.slug === slug);

/** Ngày hiển thị theo ngôn ngữ (không phụ thuộc múi giờ máy build) */
export function d2Date(lang: D2Lang, iso: string) {
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "vi-VN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
}
