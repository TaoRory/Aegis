import { deliverContact, isContactDeliveryConfigured } from "@/lib/contact/delivery";
import { normalizeContact, validateContact, type ContactResponse } from "@/lib/contact/schema";
import { rateLimit } from "@/lib/rate-limit";

const MAX_BODY_BYTES = 16_000;
/** Người thật cần ít nhất vài giây để điền form */
const MIN_FILL_MS = 3_000;
const MAX_FILL_MS = 24 * 60 * 60 * 1000;

function reply(body: ContactResponse, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/** Chỉ nhận yêu cầu từ chính website (khi trình duyệt gửi kèm Origin) */
function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? new URL(request.url).host;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return reply({ ok: false, code: "BAD_REQUEST" }, 403);
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return reply({ ok: false, code: "BAD_REQUEST" }, 415);
  }

  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return reply({ ok: false, code: "BAD_REQUEST" }, 413);
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return reply({ ok: false, code: "BAD_REQUEST" }, 413);
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    body = parsed as Record<string, unknown>;
  } catch {
    return reply({ ok: false, code: "BAD_REQUEST" }, 400);
  }

  // Chống spam: trường ẩn phải rỗng, thời gian điền form phải hợp lý
  // Thời gian điền do trình duyệt tự đo bằng đồng hồ đơn điệu (không phụ thuộc đồng hồ máy khách bị lệch)
  const elapsed = Number(body.elapsedMs);
  if (body.website || !Number.isFinite(elapsed) || elapsed < MIN_FILL_MS || elapsed > MAX_FILL_MS) {
    return reply({ ok: false, code: "SPAM" }, 400);
  }

  if (!rateLimit(`contact:${clientIp(request)}`, 5, 10 * 60 * 1000)) {
    return reply({ ok: false, code: "RATE_LIMITED" }, 429);
  }

  const input = normalizeContact(body);
  const errors = validateContact(input);
  if (Object.keys(errors).length > 0) {
    return reply({ ok: false, code: "VALIDATION", errors }, 422);
  }

  if (!isContactDeliveryConfigured()) {
    return reply({ ok: false, code: "NOT_CONFIGURED" }, 503);
  }

  const delivered = await deliverContact(input);
  if (!delivered) {
    return reply({ ok: false, code: "DELIVERY_FAILED" }, 502);
  }

  return reply({ ok: true }, 200);
}
