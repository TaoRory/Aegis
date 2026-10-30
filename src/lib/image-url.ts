/**
 * URL ảnh đã tối ưu qua Next image optimizer (/_next/image), cho những chỗ không dùng được <Image>: texture WebGL, ảnh nạp bằng new Image().
 * width phải nằm trong deviceSizes/imageSizes của next.config (mặc định có 384, 640, 750, 828, 1080…) và quality trong images.qualities
 * (Next 16 mặc định chỉ 75), nếu không optimizer trả 400.
 * Ảnh ngoài (http) trả nguyên vì optimizer chỉ nhận domain đã khai báo.
 */
export function optimizedImageUrl(src: string, width: 384 | 640 | 750 | 828 | 1080, quality = 75): string {
  if (!src || /^https?:\/\//.test(src)) return src;
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}
