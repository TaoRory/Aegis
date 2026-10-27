import type { Locale } from "@/config/space";
import { OTHER_OPTION, OTHER_SERVICE, questionsFor, serviceQuestion, type ChoiceQuestion } from "@/content/contact-flow";
import { contactMessages } from "@/content/contact-copy";
import { fill } from "@/lib/fill";

/**
 * Validation dùng chung cho form liên hệ (trình duyệt) và API (server).
 * Server luôn kiểm tra lại, không tin dữ liệu từ trình duyệt.
 * Câu hỏi và lựa chọn hợp lệ lấy từ src/content/contact-flow.ts theo đúng nhánh dịch vụ.
 */

export const contactLimits = {
  name: { min: 2, max: 100 },
  contact: { max: 254 },
  company: { max: 150 },
  other: { max: 200 },
  message: { max: 3000 },
  /** Nhánh "chưa chắc": cần mô tả tối thiểu để Aegis có thông tin tư vấn */
  messageOther: { min: 10 },
} as const;

export interface ContactInput {
  service: string;
  /** Câu trả lời theo id câu hỏi, luôn là mảng giá trị (câu chọn một có tối đa 1 phần tử) */
  answers: Record<string, string[]>;
  /** Nội dung khách tự ghi khi chọn "Khác", theo id câu hỏi */
  others: Record<string, string>;
  message: string;
  name: string;
  /** Email hoặc số điện thoại / Zalo */
  contact: string;
  company: string;
}

/** Khóa lỗi: tên trường cố định hoặc "q:<id câu hỏi>" */
export type ContactErrorKey = "service" | "message" | "name" | "contact" | "company" | `q:${string}`;
export type ContactErrors = Partial<Record<ContactErrorKey, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Số điện thoại Việt Nam: 0xxxxxxxxx hoặc +84xxxxxxxxx (9–10 chữ số sau đầu số) */
const PHONE_PATTERN = /^(0|\+84)\d{9,10}$/;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function isEmail(value: string) {
  return EMAIL_PATTERN.test(value);
}

function normalizePhone(value: string) {
  return value.replace(/[\s.\-()]/g, "");
}

/** Chỉ giữ câu trả lời của các câu hỏi thuộc nhánh đã chọn; bỏ trùng, bỏ giá trị rỗng */
export function normalizeContact(raw: Record<string, unknown>): ContactInput {
  const service = text(raw.service);
  const rawAnswers = record(raw.answers);
  const rawOthers = record(raw.others);
  const answers: Record<string, string[]> = {};
  const others: Record<string, string> = {};

  for (const question of questionsFor(service)) {
    const value = rawAnswers[question.id];
    const list = (Array.isArray(value) ? value : [value]).map(text).filter(Boolean);
    if (list.length > 0) answers[question.id] = [...new Set(list)];
    const other = text(rawOthers[question.id]).replace(/\s+/g, " ");
    if (other && answers[question.id]?.includes(OTHER_OPTION)) others[question.id] = other;
  }

  return {
    service,
    answers,
    others,
    message: text(raw.message),
    name: text(raw.name).replace(/\s+/g, " "),
    contact: text(raw.contact),
    company: text(raw.company).replace(/\s+/g, " "),
  };
}

function allowedValues(question: ChoiceQuestion) {
  const values = question.options.map((o) => o.value);
  return question.allowOther ? [...values, OTHER_OPTION] : values;
}

/** Lỗi của một câu hỏi lựa chọn (dùng cho từng bước trong form và cho server) */
export function validateQuestion(question: ChoiceQuestion, input: Pick<ContactInput, "answers" | "others">, lang: Locale = "vi") {
  const m = contactMessages[lang];
  const picked = input.answers[question.id] ?? [];
  if (picked.length === 0) return question.optional ? undefined : m.chooseOne;
  const allowed = allowedValues(question);
  if (picked.some((value) => !allowed.includes(value))) return m.invalidChoice;
  if (question.kind !== "multi" && picked.length > 1) return m.onlyOne;
  if (picked.includes(OTHER_OPTION)) {
    const other = (input.others[question.id] ?? "").trim();
    if (!other) return m.specifyOther;
    if (other.length > contactLimits.other.max) return fill(m.maxChars, { n: contactLimits.other.max });
  }
  return undefined;
}

export function validateService(service: string, lang: Locale = "vi") {
  return serviceQuestion.options.some((o) => o.value === service) ? undefined : contactMessages[lang].chooseService;
}

export function validateMessage(input: Pick<ContactInput, "service" | "message">, lang: Locale = "vi") {
  const m = contactMessages[lang];
  const { message, messageOther } = contactLimits;
  const value = input.message.trim();
  if (input.service === OTHER_SERVICE && value.length < messageOther.min) return fill(m.describe, { n: messageOther.min });
  if (value.length > message.max) return fill(m.messageMax, { n: message.max });
  return undefined;
}

export function validateContactInfo(input: Pick<ContactInput, "name" | "contact" | "company">, lang: Locale = "vi") {
  const m = contactMessages[lang];
  const errors: ContactErrors = {};
  const { name, contact, company } = contactLimits;
  const nameValue = input.name.trim();
  const contactValue = input.contact.trim();

  if (nameValue.length < name.min) errors.name = m.nameRequired;
  else if (nameValue.length > name.max) errors.name = fill(m.nameMax, { n: name.max });

  if (!contactValue) errors.contact = m.contactRequired;
  else if (
    contactValue.length > contact.max ||
    !(isEmail(contactValue) || PHONE_PATTERN.test(normalizePhone(contactValue)))
  )
    errors.contact = m.contactFormat;

  if (input.company.trim().length > company.max) errors.company = fill(m.companyMax, { n: company.max });
  return errors;
}

export function validateContact(input: ContactInput, lang: Locale = "vi"): ContactErrors {
  const service = validateService(input.service, lang);
  if (service) return { service };

  const errors: ContactErrors = {};
  for (const question of questionsFor(input.service)) {
    const error = validateQuestion(question, input, lang);
    if (error) errors[`q:${question.id}`] = error;
  }
  const message = validateMessage(input, lang);
  if (message) errors.message = message;
  return { ...errors, ...validateContactInfo(input, lang) };
}

/** Nhãn hiển thị của câu trả lời (dùng cho bản xem lại và email) */
export function answerLabels(question: ChoiceQuestion, input: Pick<ContactInput, "answers" | "others">, lang: Locale = "vi") {
  return (input.answers[question.id] ?? []).map((value) =>
    value === OTHER_OPTION
      ? `${contactMessages[lang].otherPrefix}: ${input.others[question.id] ?? ""}`
      : (question.options.find((o) => o.value === value)?.label ?? value),
  );
}

/** Mã phản hồi của API, form dùng để hiển thị thông báo phù hợp */
export type ContactResponse =
  | { ok: true }
  | {
      ok: false;
      code: "VALIDATION" | "NOT_CONFIGURED" | "RATE_LIMITED" | "SPAM" | "DELIVERY_FAILED" | "BAD_REQUEST";
      errors?: ContactErrors;
    };
