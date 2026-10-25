import "server-only";

import { serviceLabel, type ContactInput } from "@/lib/contact/schema";

/**
 * Điểm tích hợp gửi thông tin liên hệ.
 * Hiện dùng Resend (https://resend.com) qua REST API, không cần SDK.
 * Đổi nhà cung cấp: chỉ cần viết lại `deliverContact` và `isContactDeliveryConfigured`.
 *
 * Biến môi trường (xem .env.example):
 *   RESEND_API_KEY      – API key của Resend
 *   CONTACT_TO_EMAIL    – email nhận thông tin liên hệ
 *   CONTACT_FROM_EMAIL  – (tùy chọn) địa chỉ gửi đã xác minh trên Resend
 */

const DEFAULT_FROM = "Aegis Website <onboarding@resend.dev>";

export function isContactDeliveryConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function deliverContact(input: ContactInput): Promise<boolean> {
  const rows: [string, string][] = [
    ["Họ tên", input.name],
    ["Email", input.email],
    ["Công ty", input.company || "(không cung cấp)"],
    ["Dịch vụ quan tâm", serviceLabel(input.service)],
  ];

  const text = [...rows.map(([k, v]) => `${k}: ${v}`), "", "Nội dung:", input.message].join("\n");
  const html = `
    <h2 style="font-family:sans-serif">Yêu cầu tư vấn mới từ website</h2>
    <table style="font-family:sans-serif;border-collapse:collapse">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:4px 16px 4px 0;color:#555">${k}</td><td style="padding:4px 0"><strong>${escapeHtml(v)}</strong></td></tr>`,
        )
        .join("")}
    </table>
    <p style="font-family:sans-serif;color:#555;margin-top:16px">Nội dung:</p>
    <p style="font-family:sans-serif;white-space:pre-wrap">${escapeHtml(input.message)}</p>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM,
        to: [process.env.CONTACT_TO_EMAIL],
        reply_to: input.email,
        subject: `[Website Aegis] ${input.name} – ${serviceLabel(input.service)}`,
        text,
        html,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      console.error("[contact] Resend trả về lỗi", response.status, await response.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (error) {
    console.error("[contact] Không gửi được email", error);
    return false;
  }
}
