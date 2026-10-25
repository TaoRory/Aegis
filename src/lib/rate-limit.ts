import "server-only";

/**
 * Giới hạn tần suất đơn giản, lưu trong bộ nhớ của từng instance server.
 * Đủ để chặn gửi dồn dập từ một IP; trên môi trường serverless nhiều instance,
 * giới hạn này chỉ mang tính "best effort". Khi cần chặt chẽ hơn, thay bằng
 * kho dùng chung (ví dụ Upstash Redis) mà không phải đổi chỗ gọi.
 */
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false;
  }

  recent.push(now);
  buckets.set(key, recent);

  // Dọn bớt khóa cũ để Map không phình mãi
  if (buckets.size > 5000) {
    for (const [k, times] of buckets) {
      if (times.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }
  return true;
}
