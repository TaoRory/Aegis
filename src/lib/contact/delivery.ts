import "server-only";

import { commonQuestions, questionsFor, serviceShortLabel, serviceTitle } from "@/content/contact-flow";
import { answerLabels, isEmail, type ContactInput } from "@/lib/contact/schema";

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

function table(rows: [string, string][]) {
  return `<table style="font-family:sans-serif;border-collapse:collapse">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 16px 4px 0;color:#555;vertical-align:top">${escapeHtml(k)}</td><td style="padding:4px 0"><strong>${escapeHtml(v)}</strong></td></tr>`,
    )
    .join("")}</table>`;
}

export async function deliverContact(input: ContactInput): Promise<boolean> {
  const people: [string, string][] = [
    ["Họ tên", input.name],
    ["Liên hệ", input.contact],
    ["Công ty", input.company || "(không cung cấp)"],
  ];
  const brief: [string, string][] = [
    ["Hạng mục", serviceTitle(input.service)],
    ...questionsFor(input.service).map((question): [string, string] => [
      question.title,
      answerLabels(question, input).join(" · ") || "(bỏ qua)",
    ]),
  ];
  const timeline = commonQuestions.find((q) => q.id === "timeline");
  const when = timeline ? answerLabels(timeline, input)[0] : undefined;

  const text = [
    ...people.map(([k, v]) => `${k}: ${v}`),
    "",
    ...brief.map(([k, v]) => `${k}: ${v}`),
    "",
    "Mô tả thêm:",
    input.message || "(không có)",
  ].join("\n");

  const html = `
    <h2 style="font-family:sans-serif">Phiếu yêu cầu mới từ website</h2>
    ${table(people)}
    <h3 style="font-family:sans-serif;margin-top:20px">Nhu cầu</h3>
    ${table(brief)}
    <p style="font-family:sans-serif;color:#555;margin-top:16px">Mô tả thêm:</p>
    <p style="font-family:sans-serif;white-space:pre-wrap">${escapeHtml(input.message || "(không có)")}</p>`;

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
        // Chỉ đặt reply_to khi khách để lại email (không phải số điện thoại)
        ...(isEmail(input.contact) && { reply_to: input.contact }),
        subject: ["[Website Aegis]", serviceShortLabel(input.service), "–", input.name, when && `– ${when}`]
          .filter(Boolean)
          .join(" "),
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
