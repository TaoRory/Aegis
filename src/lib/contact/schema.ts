import { services } from "@/content/services";

/**
 * Validation dùng chung cho form liên hệ (trình duyệt) và API (server).
 * Server luôn kiểm tra lại, không tin dữ liệu từ trình duyệt.
 */

export const OTHER_SERVICE = "other";

/** label: hiển thị trong form; title: dùng trong email gửi về */
export const serviceOptions = [
  ...services.map((s) => ({ value: s.id as string, label: s.shortTitle, title: s.title })),
  { value: OTHER_SERVICE, label: "Chưa xác định, cần tư vấn", title: "Chưa xác định, cần tư vấn thêm" },
];

export const contactLimits = {
  name: { min: 2, max: 100 },
  email: { max: 254 },
  company: { max: 150 },
  message: { min: 20, max: 3000 },
} as const;

export interface ContactInput {
  name: string;
  email: string;
  company: string;
  service: string;
  message: string;
}

export type ContactField = keyof ContactInput;
export type ContactErrors = Partial<Record<ContactField, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeContact(raw: Record<string, unknown>): ContactInput {
  return {
    name: text(raw.name).replace(/\s+/g, " "),
    email: text(raw.email).toLowerCase(),
    company: text(raw.company).replace(/\s+/g, " "),
    service: text(raw.service),
    message: text(raw.message),
  };
}

export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};
  const { name, email, company, message } = contactLimits;

  if (input.name.length < name.min) errors.name = "Vui lòng nhập họ tên.";
  else if (input.name.length > name.max) errors.name = `Họ tên tối đa ${name.max} ký tự.`;

  if (!input.email) errors.email = "Vui lòng nhập email.";
  else if (input.email.length > email.max || !EMAIL_PATTERN.test(input.email))
    errors.email = "Email chưa đúng định dạng.";

  if (input.company.length > company.max) errors.company = `Tên công ty tối đa ${company.max} ký tự.`;

  if (!serviceOptions.some((o) => o.value === input.service))
    errors.service = "Vui lòng chọn dịch vụ quan tâm.";

  if (input.message.length < message.min)
    errors.message = `Vui lòng mô tả nhu cầu (tối thiểu ${message.min} ký tự).`;
  else if (input.message.length > message.max)
    errors.message = `Nội dung tối đa ${message.max} ký tự.`;

  return errors;
}

export function serviceLabel(value: string) {
  return serviceOptions.find((o) => o.value === value)?.title ?? value;
}

/** Mã phản hồi của API, form dùng để hiển thị thông báo phù hợp */
export type ContactResponse =
  | { ok: true }
  | {
      ok: false;
      code: "VALIDATION" | "NOT_CONFIGURED" | "RATE_LIMITED" | "SPAM" | "DELIVERY_FAILED" | "BAD_REQUEST";
      errors?: ContactErrors;
    };
