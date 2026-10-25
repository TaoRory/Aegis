import credits from "@/content/image-credits.json";

export type TemplateImage = { src: string; width: number; height: number };

const all = credits as Record<string, Record<string, TemplateImage>>;

/**
 * Ảnh giấy phép mở của mẫu (lấy bằng .claude/skills/template-gallery/scripts/images.mjs pick).
 * Trả về src + kích thước thật để dùng với next/image. Thiếu ảnh → lỗi build rõ ràng thay vì ảnh vỡ.
 */
export function tplImage(slug: string, name: string): TemplateImage {
  const img = all[slug]?.[name];
  if (!img) throw new Error(`Thiếu ảnh mẫu "${slug}/${name}": chạy images.mjs pick trước`);
  return { src: img.src, width: img.width, height: img.height };
}
