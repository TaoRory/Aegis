"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

import { SELECT_SERVICE_EVENT } from "@/components/services/SelectServiceLink";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import {
  contactLimits,
  normalizeContact,
  serviceOptions,
  validateContact,
  type ContactErrors,
  type ContactField,
  type ContactResponse,
} from "@/lib/contact/schema";

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "success" }
  | { state: "error"; message: string };

const errorMessages: Record<Exclude<ContactResponse, { ok: true }>["code"] | "NETWORK", string> = {
  VALIDATION: "Vui lòng kiểm tra lại các trường được đánh dấu.",
  NOT_CONFIGURED: "Kênh tiếp nhận thông tin chưa được kết nối nên chưa gửi được. Vui lòng quay lại sau.",
  RATE_LIMITED: "Bạn đã gửi nhiều lần trong thời gian ngắn. Vui lòng thử lại sau ít phút.",
  SPAM: "Không gửi được. Vui lòng tải lại trang và thử lại.",
  DELIVERY_FAILED: "Hệ thống chưa gửi được thông tin. Nội dung của bạn vẫn còn trong form, vui lòng thử lại sau.",
  BAD_REQUEST: "Yêu cầu không hợp lệ. Vui lòng tải lại trang và thử lại.",
  NETWORK: "Không kết nối được tới máy chủ. Vui lòng kiểm tra mạng và thử lại.",
};

const fieldOrder: ContactField[] = ["name", "email", "company", "service", "message"];

export function ContactForm({ isConfigured }: { isConfigured: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const startedAt = useRef(0);
  const [service, setService] = useState("");
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [messageLength, setMessageLength] = useState(0);
  const [highlightService, setHighlightService] = useState(false);

  useEffect(() => {
    startedAt.current = Date.now();
    const onSelect = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      if (!serviceOptions.some((o) => o.value === id)) return;
      setService(id);
      setErrors((current) => ({ ...current, service: undefined }));
      setHighlightService(true);
      window.setTimeout(() => setHighlightService(false), 1600);
    };
    window.addEventListener(SELECT_SERVICE_EVENT, onSelect);
    return () => window.removeEventListener(SELECT_SERVICE_EVENT, onSelect);
  }, []);

  const focusFirstError = (found: ContactErrors) => {
    const first = fieldOrder.find((field) => found[field]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status.state === "submitting") return;

    const formData = new FormData(event.currentTarget);
    const input = normalizeContact(Object.fromEntries(formData));
    const found = validateContact(input);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setStatus({ state: "error", message: errorMessages.VALIDATION });
      focusFirstError(found);
      return;
    }

    setStatus({ state: "submitting" });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, website: formData.get("website") ?? "", startedAt: startedAt.current }),
      });
      const result = (await response.json().catch(() => null)) as ContactResponse | null;

      if (result?.ok) {
        setStatus({ state: "success" });
        return;
      }
      const code = result && !result.ok ? result.code : "DELIVERY_FAILED";
      if (code === "VALIDATION" && result && !result.ok && result.errors) {
        setErrors(result.errors);
        focusFirstError(result.errors);
      }
      setStatus({ state: "error", message: errorMessages[code] });
    } catch {
      setStatus({ state: "error", message: errorMessages.NETWORK });
    }
  };

  // Xóa lỗi của trường ngay khi người dùng sửa trường đó
  const clearFieldError = (event: FormEvent<HTMLFormElement>) => {
    const field = (event.target as HTMLInputElement).name as ContactField;
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const reset = () => {
    formRef.current?.reset();
    setService("");
    setErrors({});
    setMessageLength(0);
    startedAt.current = Date.now();
    setStatus({ state: "idle" });
  };

  if (status.state === "success") {
    return (
      <div role="status" className="flex min-h-[26rem] flex-col items-start justify-center border-t border-line pt-10">
        <p className="label text-success">Đã gửi — BV-05</p>
        <h3 className="mt-6 text-h3 font-semibold">
          Aegis đã nhận được <em>thông tin của bạn.</em>
        </h3>
        <p className="mt-4 max-w-md leading-relaxed text-muted">
          Cảm ơn bạn đã chia sẻ nhu cầu. Chúng tôi sẽ liên hệ lại qua email bạn đã cung cấp.
        </p>
        <Button variant="outline" className="mt-8" onClick={reset}>
          Gửi nhu cầu khác
        </Button>
      </div>
    );
  }

  const submitting = status.state === "submitting";

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={onSubmit}
      onInput={clearFieldError}
      onChange={clearFieldError}
      aria-describedby={!isConfigured ? "form-chua-ket-noi" : undefined}
    >
      {!isConfigured && (
        <div id="form-chua-ket-noi" className="mb-10 border-l-2 border-warning py-1 pl-4 text-sm leading-relaxed">
          <p className="label text-warning">Trạng thái: chờ kết nối</p>
          <p className="mt-2 text-muted">
            Form liên hệ đang chờ kết nối kênh tiếp nhận nên thông tin hiện chưa thể gửi đi. Form sẽ hoạt động ngay khi kênh
            nhận email được cấu hình.
          </p>
        </div>
      )}

      <fieldset disabled={!isConfigured || submitting} className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
        <legend className="sr-only">Thông tin liên hệ và nhu cầu</legend>

        <Field id="name" index="01" label="Họ tên" required error={errors.name}>
          <input id="name" name="name" type="text" autoComplete="name" maxLength={contactLimits.name.max} required {...fieldA11y("name", errors)} className={inputClass(errors.name)} />
        </Field>

        <Field id="email" index="02" label="Email" required error={errors.email}>
          <input id="email" name="email" type="email" inputMode="email" autoComplete="email" maxLength={contactLimits.email.max} required {...fieldA11y("email", errors)} className={inputClass(errors.email)} />
        </Field>

        <Field id="company" index="03" label="Công ty" hint="Không bắt buộc" error={errors.company} className="sm:col-span-2">
          <input id="company" name="company" type="text" autoComplete="organization" maxLength={contactLimits.company.max} {...fieldA11y("company", errors)} className={inputClass(errors.company)} />
        </Field>

        <fieldset
          role="radiogroup"
          className={cn("sm:col-span-2", highlightService && "service-highlight")}
          aria-invalid={errors.service ? true : undefined}
          aria-describedby={errors.service ? "service-error" : undefined}
        >
          <legend className="label mb-4 flex w-full items-baseline gap-3 text-muted">
            <span className="text-accent">04</span> Dịch vụ quan tâm
            <span aria-hidden className="text-danger">
              *
            </span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {serviceOptions.map((option) => (
              <label key={option.value} className="chip">
                <input
                  type="radio"
                  name="service"
                  value={option.value}
                  checked={service === option.value}
                  onChange={() => setService(option.value)}
                  className="peer sr-only"
                />
                <span className="chip-face">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.service && <FieldError id="service-error">{errors.service}</FieldError>}
        </fieldset>

        <Field id="message" index="05" label="Nội dung nhu cầu" required error={errors.message} className="sm:col-span-2" hint={`${messageLength}/${contactLimits.message.max}`}>
          <textarea
            id="message"
            name="message"
            rows={4}
            required
            maxLength={contactLimits.message.max}
            placeholder="Ví dụ: Doanh nghiệp cần một website giới thiệu mới, có form thu thập thông tin khách hàng…"
            onChange={(event) => setMessageLength(event.target.value.length)}
            {...fieldA11y("message", errors)}
            className={cn(inputClass(errors.message), "min-h-32 resize-y py-3")}
          />
        </Field>

        {/* Bẫy spam: người dùng thật không nhìn thấy trường này */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="flex flex-col gap-5 border-t border-line pt-7 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="label text-muted">
            Trường có dấu <span className="text-danger">*</span> là bắt buộc
          </p>
          <Button type="submit" arrow={isConfigured && !submitting ? "→" : false} className="w-full sm:w-auto">
            {!isConfigured ? "Chưa thể gửi" : submitting ? "Đang gửi…" : "Gửi nhu cầu"}
          </Button>
        </div>
      </fieldset>

      <div aria-live="polite" className="empty:hidden">
        {status.state === "error" && (
          <p role="alert" className="mt-6 border-l-2 border-danger py-1 pl-4 text-sm leading-relaxed text-danger">
            {status.message}
          </p>
        )}
      </div>
    </form>
  );
}

function fieldA11y(field: ContactField, errors: ContactErrors) {
  return {
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
  };
}

function inputClass(error?: string) {
  return cn(
    "field-input block w-full border-0 border-b bg-transparent px-0 py-2.5 text-[1.15rem] text-fg transition-[border-color] duration-300",
    "placeholder:text-subtle focus:outline-none disabled:cursor-not-allowed disabled:opacity-60",
    error ? "border-danger" : "border-line-strong hover:border-fg focus:border-accent",
  );
}

function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-2 text-sm text-danger">
      {children}
    </p>
  );
}

function Field({
  id,
  index,
  label,
  required,
  hint,
  error,
  className,
  children,
}: {
  id: ContactField;
  index: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="label flex items-baseline gap-3 text-muted">
          <span className="text-accent">{index}</span>
          {label}
          {required && (
            <span aria-hidden className="text-danger">
              *
            </span>
          )}
        </label>
        {hint && <span className="label text-subtle">{hint}</span>}
      </div>
      {children}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  );
}
