import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter, SRGBColorSpace, Texture, type WebGLRenderer } from "three";

/**
 * Tải ảnh làm texture với kích thước được giới hạn (tiết kiệm bộ nhớ GPU): giải mã + thu nhỏ bằng createImageBitmap,
 * lật sẵn theo chiều dọc để dùng với PlaneGeometry (flipY = false trên ImageBitmap).
 * Lỗi mạng/giải mã trả về null: vật thể giữ vật liệu tạm (không làm hỏng cả cảnh).
 */
export async function loadImageTexture(url: string, maxWidth: number, renderer: WebGLRenderer): Promise<Texture | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    const probe = await createImageBitmap(blob);
    const width = Math.min(maxWidth, probe.width);
    const height = Math.round((probe.height * width) / probe.width);
    probe.close();
    const bitmap = await createImageBitmap(blob, { resizeWidth: width, resizeHeight: height, resizeQuality: "high", imageOrientation: "flipY" });
    const texture = new Texture(bitmap);
    texture.colorSpace = SRGBColorSpace;
    texture.flipY = false;
    texture.generateMipmaps = true;
    texture.minFilter = LinearMipmapLinearFilter;
    texture.magFilter = LinearFilter;
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    texture.needsUpdate = true;
    return texture;
  } catch {
    return null;
  }
}

const grey = (v: number) => {
  const c = Math.round(Math.max(0, Math.min(1, v)) * 255);
  return `rgb(${c},${c},${c})`;
};

/** Gradient dọc (1 × 64) dùng làm alphaMap cho phản chiếu sàn / quầng sáng: đậm ở một đầu, trong suốt ở đầu kia */
export function gradientTexture(stops: [number, number][], horizontal = false): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = horizontal ? 64 : 4;
  canvas.height = horizontal ? 4 : 64;
  const ctx = canvas.getContext("2d")!;
  const g = horizontal ? ctx.createLinearGradient(0, 0, canvas.width, 0) : ctx.createLinearGradient(0, 0, 0, canvas.height);
  // alphaMap của three đọc kênh XANH LÁ (không đọc alpha) nên gradient phải là thang xám đục
  for (const [offset, alpha] of stops) g.addColorStop(offset, grey(alpha));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return new CanvasTexture(canvas);
}

/** Quầng sáng tròn mờ dần ra rìa (dùng cho halo sau màn hình, nón sáng đèn…) */
export function radialTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, grey(1));
  g.addColorStop(0.5, grey(0.35));
  g.addColorStop(1, grey(0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new CanvasTexture(canvas);
}
