"use client";

import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import Image from "next/image";

import { Button } from "@/components/ui/Button";
import {
  branchQuestions,
  commonQuestions,
  contactStep,
  messageStep,
  OTHER_OPTION,
  OTHER_SERVICE,
  questionsFor,
  reviewStep,
  serviceQuestion,
  serviceShortLabel,
  type ChoiceQuestion,
} from "@/content/contact-flow";
import previewData from "@/content/template-previews.json";
import { cn } from "@/lib/cn";
import {
  answerLabels,
  contactLimits,
  validateContact,
  validateContactInfo,
  validateMessage,
  validateQuestion,
  validateService,
  type ContactErrorKey,
  type ContactErrors,
  type ContactInput,
  type ContactResponse,
} from "@/lib/contact/schema";
import { gsap, MQ, scrollToTarget } from "@/lib/motion";

/**
 * Form liên hệ "Bản vẽ của bạn": mỗi màn một câu hỏi, câu 1 chọn dịch vụ, các câu sau rẽ nhánh theo dịch vụ.
 * Nội dung câu hỏi: src/content/contact-flow.ts. Validation dùng chung với API: src/lib/contact/schema.ts.
 *
 * Không có JS: mọi câu hỏi (của cả 4 nhánh) hiện thành một form dài, đọc được đầy đủ.
 * Có JS (cờ html[data-js] đặt trước khi vẽ trang): chỉ hiện bước hiện tại, không nháy layout.
 * Bàn phím: Enter sang câu sau, phím số chọn nhanh lựa chọn. Bản nháp lưu trong sessionStorage.
 */

type Step =
  | { kind: "service" }
  | { kind: "question"; question: ChoiceQuestion }
  | { kind: "message" }
  | { kind: "contact" }
  | { kind: "review" };

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "success" }
  | { state: "error"; message: string };

type Draft = ContactInput;

const STORAGE_KEY = "aegis-contact-draft";
/** Đồng hồ đơn điệu (không đổi theo giờ hệ thống) để đo thời gian điền form */
const clock = () => performance.now();
const AUTO_ADVANCE_MS = 380;

const emptyDraft: Draft = { service: "", answers: {}, others: {}, message: "", name: "", contact: "", company: "" };

const errorMessages: Record<Exclude<ContactResponse, { ok: true }>["code"] | "NETWORK", string> = {
  VALIDATION: "Một vài câu trả lời cần kiểm tra lại.",
  NOT_CONFIGURED: "Kênh tiếp nhận thông tin chưa được kết nối nên chưa gửi được. Vui lòng quay lại sau.",
  RATE_LIMITED: "Bạn đã gửi nhiều lần trong thời gian ngắn. Vui lòng thử lại sau ít phút.",
  SPAM: "Không gửi được. Vui lòng tải lại trang và thử lại.",
  DELIVERY_FAILED: "Hệ thống chưa gửi được thông tin. Câu trả lời của bạn vẫn còn nguyên, vui lòng thử lại sau.",
  BAD_REQUEST: "Yêu cầu không hợp lệ. Vui lòng tải lại trang và thử lại.",
  NETWORK: "Không kết nối được tới máy chủ. Vui lòng kiểm tra mạng và thử lại.",
};

const previews = previewData as Record<string, { cover: { src: string; width: number; height: number } }>;

function stepsFor(service: string): Step[] {
  if (!service) return [{ kind: "service" }];
  return [
    { kind: "service" },
    ...questionsFor(service).map((question) => ({ kind: "question" as const, question })),
    { kind: "message" },
    { kind: "contact" },
    { kind: "review" },
  ];
}

function stepKey(step: Step) {
  return step.kind === "question" ? `q:${step.question.id}` : step.kind;
}

/** Mọi bước có thể có (cả 4 nhánh) theo thứ tự hiển thị khi không có JS */
const allSteps: Step[] = [
  { kind: "service" },
  ...Object.values(branchQuestions).flatMap((list) => list.map((question) => ({ kind: "question" as const, question }))),
  ...commonQuestions.map((question) => ({ kind: "question" as const, question })),
  { kind: "message" },
  { kind: "contact" },
  { kind: "review" },
];

/** Nhánh dịch vụ của một câu hỏi riêng (để ghi chú khi hiện form dài không có JS) */
function branchOf(question: ChoiceQuestion) {
  const entry = Object.entries(branchQuestions).find(([, list]) => list.includes(question));
  return entry?.[0];
}

export function ContactWizard({ isConfigured }: { isConfigured: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const startedAt = useRef(0);
  const pointerPick = useRef(false);
  const advanceTimer = useRef<number>(undefined);
  const navigated = useRef(false);
  /** Trang được giữ lại khi đi chỗ khác rồi quay về (Activity): chỉ khôi phục bản nháp một lần, không ghi đè state đang có */
  const didRestore = useRef(false);

  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [index, setIndex] = useState(0);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [restored, setRestored] = useState(false);

  const steps = useMemo(() => stepsFor(draft.service), [draft.service]);
  const current = steps[Math.min(index, steps.length - 1)];
  const currentKey = stepKey(current);

  // Khôi phục bản nháp, rồi áp dịch vụ chọn sẵn từ ?dv= (link "Trao đổi về dịch vụ này", thẻ dịch vụ ở trang chủ)
  useEffect(() => {
    if (didRestore.current) return;
    didRestore.current = true;
    startedAt.current = clock();
    const restore = () => {
      let next: { draft: Draft; index: number } = { draft: emptyDraft, index: 0 };
      try {
        const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null") as typeof next | null;
        if (saved?.draft) next = { draft: { ...emptyDraft, ...saved.draft }, index: Number(saved.index) || 0 };
      } catch {}
      const preset = new URLSearchParams(window.location.search).get("dv");
      if (preset && !validateService(preset) && preset !== next.draft.service) {
        next = { draft: { ...next.draft, service: preset }, index: 1 };
      }
      if (next.draft.service && validateService(next.draft.service)) next = { draft: emptyDraft, index: 0 };
      setDraft(next.draft);
      setIndex(Math.min(next.index, stepsFor(next.draft.service).length - 1));
      setRestored(true);
    };
    restore();
  }, []);

  useEffect(() => {
    if (!restored || status.state === "success") return;
    // Không lưu họ tên / liên hệ / công ty vào trình duyệt: chỉ giữ câu trả lời để tải lại trang không mất bài
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ draft: { ...draft, name: "", contact: "", company: "" }, index }));
    } catch {}
  }, [draft, index, restored, status.state]);

  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  // Chuyển bước: câu mới trượt lên; focus vào tiêu đề câu hỏi để trình đọc màn hình đọc câu mới
  useEffect(() => {
    if (!navigated.current) return;
    const root = rootRef.current;
    const step = root?.querySelector<HTMLElement>(`[data-step-key="${currentKey}"]`);
    if (!step) return;
    step.querySelector<HTMLElement>("[data-step-title]")?.focus({ preventScroll: true });
    // Câu mới ngắn hơn câu cũ: đưa đầu form về tầm mắt (chừa chỗ cho header)
    const top = root!.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.4) scrollToTarget(window.scrollY + top - 112, { immediate: true });
    if (window.matchMedia(MQ.anyMotion).matches) {
      gsap.fromTo(
        step.querySelectorAll("[data-anim]"),
        { y: 28, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.7, ease: "expo.out", stagger: 0.045, clearProps: "transform,opacity,visibility" },
      );
    }
  }, [currentKey]);

  /** service: truyền vào khi vừa đổi dịch vụ (state chưa kịp cập nhật trong lần gọi hẹn giờ) */
  const go = (target: number, service: string = draft.service) => {
    window.clearTimeout(advanceTimer.current);
    navigated.current = true;
    setStatus((s) => (s.state === "error" ? { state: "idle" } : s));
    setIndex(Math.max(0, Math.min(target, stepsFor(service).length - 1)));
  };

  const stepError = (step: Step, data: Draft): ContactErrors => {
    switch (step.kind) {
      case "service": {
        const error = validateService(data.service);
        return error ? { service: error } : {};
      }
      case "question": {
        const error = validateQuestion(step.question, data);
        return error ? { [`q:${step.question.id}`]: error } : {};
      }
      case "message": {
        const error = validateMessage(data);
        return error ? { message: error } : {};
      }
      case "contact":
        return validateContactInfo(data);
      default:
        return {};
    }
  };

  const next = (data: Draft = draft, from: number = index) => {
    const step = stepsFor(data.service)[from];
    const found = stepError(step, data);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusFirstError(found);
      return;
    }
    go(from + 1, data.service);
  };

  const focusFirstError = (found: ContactErrors) => {
    const key = Object.keys(found)[0];
    if (!key) return;
    const field = rootRef.current?.querySelector<HTMLElement>(`[data-error-for="${key}"]`);
    field?.focus();
  };

  const update = (patch: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    const keys = Object.keys(patch) as (keyof Draft)[];
    setErrors((current) => {
      const copy = { ...current };
      keys.forEach((k) => delete copy[k as ContactErrorKey]);
      return copy;
    });
  };

  const pickService = (value: string, auto: boolean) => {
    const data = { ...draft, service: value };
    update({ service: value });
    if (auto) advanceTimer.current = window.setTimeout(() => next(data, 0), AUTO_ADVANCE_MS);
  };

  const pick = (question: ChoiceQuestion, value: string, auto: boolean) => {
    const before = draft.answers[question.id] ?? [];
    const list =
      question.kind === "multi"
        ? before.includes(value)
          ? before.filter((v) => v !== value)
          : [...before, value]
        : [value];
    const data = { ...draft, answers: { ...draft.answers, [question.id]: list } };
    setDraft(data);
    setErrors((current) => {
      const copy = { ...current };
      delete copy[`q:${question.id}`];
      return copy;
    });
    // Câu chọn một: tự sang câu sau khi bấm chuột (bàn phím dùng Enter để không nhảy câu khi đang duyệt bằng phím mũi tên)
    if (auto && question.kind !== "multi" && value !== OTHER_OPTION) {
      const from = steps.findIndex((s) => stepKey(s) === `q:${question.id}`);
      advanceTimer.current = window.setTimeout(() => next(data, from), AUTO_ADVANCE_MS);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Enter dùng để chốt chữ đang gõ dở bằng bộ gõ tiếng Việt (Telex/VNI…) thì không được coi là "sang câu sau"
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    const target = event.target as HTMLElement;
    const typing = target.matches("textarea, input[type='text'], input[type='email'], input[type='tel']");
    if (event.key === "Enter" && !typing && !target.matches("button, a")) {
      event.preventDefault();
      if (current.kind !== "review") next();
      return;
    }
    if (event.key === "Enter" && target.matches("input[type='text'], input[type='email'], input[type='tel']")) {
      event.preventDefault();
      next();
      return;
    }
    if (typing || event.metaKey || event.ctrlKey || event.altKey) return;
    const n = Number(event.key);
    if (!Number.isInteger(n) || n < 1) return;
    if (current.kind === "service") {
      const option = serviceQuestion.options[n - 1];
      if (option) pickService(option.value, true);
    } else if (current.kind === "question") {
      const values = [...current.question.options.map((o) => o.value), ...(current.question.allowOther ? [OTHER_OPTION] : [])];
      const value = values[n - 1];
      if (value) pick(current.question, value, true);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (current.kind !== "review" || status.state === "submitting" || !isConfigured) return;

    const found = validateContact(draft);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      jumpToError(found);
      return;
    }

    setStatus({ state: "submitting" });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, website: honeypotRef.current?.value ?? "", elapsedMs: Math.round(clock() - startedAt.current) }),
      });
      const result = (await response.json().catch(() => null)) as ContactResponse | null;
      if (result?.ok) {
        setStatus({ state: "success" });
        try {
          sessionStorage.removeItem(STORAGE_KEY);
        } catch {}
        return;
      }
      const code = result && !result.ok ? result.code : "DELIVERY_FAILED";
      if (code === "VALIDATION" && result && !result.ok && result.errors) {
        setErrors(result.errors);
        jumpToError(result.errors);
      }
      setStatus({ state: "error", message: errorMessages[code] });
    } catch {
      setStatus({ state: "error", message: errorMessages.NETWORK });
    }
  };

  const jumpToError = (found: ContactErrors) => {
    const target = steps.findIndex((step) => Object.keys(stepError(step, draft)).some((k) => k in found));
    if (target >= 0) go(target);
  };

  const reset = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
    setDraft(emptyDraft);
    setErrors({});
    startedAt.current = clock();
    navigated.current = true;
    setIndex(0);
    setStatus({ state: "idle" });
  };

  if (status.state === "success") {
    return (
      <div role="status" className="wizard-done">
        <div aria-hidden className="wizard-stamp label">
          Đã nhận
          <span>BV-06</span>
        </div>
        <h2 className="mt-10 text-h2 font-semibold">
          Aegis đã nhận <em>phiếu của bạn.</em>
        </h2>
        <p className="mt-6 max-w-lg text-lead text-muted">
          Cảm ơn bạn. Aegis sẽ liên hệ lại qua {draft.contact.includes("@") ? "email" : "số điện thoại"} bạn để lại để trao đổi
          chi tiết.
        </p>
        <Button variant="outline" className="mt-10" onClick={reset}>
          Gửi yêu cầu khác
        </Button>
      </div>
    );
  }

  const position = steps.indexOf(current);
  const total = draft.service ? steps.length : null;
  const submitting = status.state === "submitting";

  return (
    <div ref={rootRef} className="wizard scroll-mt-28" onKeyDown={onKeyDown}>
      <form noValidate onSubmit={submit} className="wizard-grid">
        <div className="wizard-main">
          {/* Tiến độ (chỉ khi có JS) */}
          <div className="wizard-progress label" aria-hidden={!restored}>
            <span>
              Bước <span className="text-fg">{String(position + 1).padStart(2, "0")}</span> /{" "}
              {total ? String(total).padStart(2, "0") : "··"}
            </span>
            <span className="wizard-progress-bar">
              <span style={{ transform: `scaleX(${total ? (position + 1) / total : 0.08})` }} />
            </span>
          </div>
          <p className="sr-only" aria-live="polite">
            {restored ? `Bước ${position + 1}${total ? ` trên ${total}` : ""}` : ""}
          </p>

          <noscript>
            <p className="mb-10 border-l-2 border-warning pl-4 text-sm leading-relaxed text-muted">
              Trình duyệt đang tắt JavaScript: bạn vẫn xem được toàn bộ câu hỏi bên dưới, nhưng cần bật JavaScript để gửi.
            </p>
          </noscript>

          {allSteps.map((step) => {
            const key = stepKey(step);
            const isCurrent = key === currentKey;
            // Bước không thuộc nhánh đang chọn vẫn render (cho bản không JS) nhưng bị ẩn khi có JS
            return (
              <section
                key={key}
                data-step-key={key}
                data-current={isCurrent ? "" : undefined}
                aria-hidden={restored && !isCurrent ? true : undefined}
                className={cn("wizard-step", step.kind === "review" && "wizard-step-review")}
              >
                {renderStep(step)}
              </section>
            );
          })}

          {/* Bẫy spam: người dùng thật không nhìn thấy trường này */}
          <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor="website">Website</label>
            <input ref={honeypotRef} id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>
        </div>

        <BriefSheet draft={draft} />
      </form>
    </div>
  );

  function renderStep(step: Step): ReactNode {
    const number = step.kind === "service" ? 1 : steps.findIndex((s) => stepKey(s) === stepKey(step)) + 1;
    const label = number > 0 ? `Câu ${String(number).padStart(2, "0")}` : "Câu hỏi";

    switch (step.kind) {
      case "service":
        return (
          <StepFrame id="service" label={label} title={serviceQuestion.title} hint={serviceQuestion.hint} error={errors.service}>
            <div role="radiogroup" aria-labelledby="step-service-title" className="wizard-services" data-anim>
              {serviceQuestion.options.map((option, i) => (
                <label key={option.value} className="wizard-service" onPointerDown={() => (pointerPick.current = true)}>
                  <input
                    type="radio"
                    name="service"
                    value={option.value}
                    checked={draft.service === option.value}
                    data-error-for={i === 0 ? "service" : undefined}
                    onChange={() => {
                      pickService(option.value, pointerPick.current);
                      pointerPick.current = false;
                    }}
                    className="peer sr-only"
                  />
                  <span className="wizard-service-face">
                    <span className="label text-accent">{String(i + 1).padStart(2, "0")}</span>
                    <span className="wizard-service-title">{option.label}</span>
                    <span className="wizard-service-note">{option.note}</span>
                    <span aria-hidden className="wizard-service-arrow">
                      →
                    </span>
                  </span>
                </label>
              ))}
            </div>
            <Nav onNext={() => next()} hideBack />
          </StepFrame>
        );

      case "question": {
        const { question } = step;
        const errorKey = `q:${question.id}` as const;
        const picked = draft.answers[question.id] ?? [];
        const branch = branchOf(question);
        const options = [
          ...question.options,
          ...(question.allowOther ? [{ value: OTHER_OPTION, label: "Khác", note: undefined }] : []),
        ];
        return (
          <StepFrame
            id={question.id}
            label={label}
            branch={branch ? serviceShortLabel(branch) : undefined}
            title={question.title}
            hint={question.hint}
            error={errors[errorKey]}
          >
            <div
              role={question.kind === "multi" ? "group" : "radiogroup"}
              aria-labelledby={`step-${question.id}-title`}
              className={cn("wizard-options", question.kind === "style" && "wizard-options-style")}
              data-anim
            >
              {options.map((option, i) => {
                const checked = picked.includes(option.value);
                const preview = question.kind === "style" ? previews[option.value]?.cover : undefined;
                return (
                  <label
                    key={option.value}
                    className={cn("wizard-option", question.kind === "style" && "wizard-option-style")}
                    onPointerDown={() => (pointerPick.current = true)}
                  >
                    <input
                      type={question.kind === "multi" ? "checkbox" : "radio"}
                      name={`q-${question.id}`}
                      value={option.value}
                      checked={checked}
                      data-error-for={i === 0 ? errorKey : undefined}
                      onChange={() => {
                        pick(question, option.value, pointerPick.current);
                        pointerPick.current = false;
                      }}
                      className="peer sr-only"
                    />
                    <span className="wizard-option-face">
                      {preview && (
                        <Image
                          src={preview.src}
                          width={preview.width}
                          height={preview.height}
                          alt=""
                          sizes="(min-width: 1024px) 14rem, 45vw"
                          className="wizard-option-thumb"
                        />
                      )}
                      <span className="wizard-option-key label" aria-hidden>
                        {i + 1}
                      </span>
                      <span className="wizard-option-label">
                        {option.label}
                        {option.note && <span className="wizard-option-note">{option.note}</span>}
                      </span>
                      <span aria-hidden className="wizard-option-check">
                        {question.kind === "multi" ? "✓" : "●"}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            {question.allowOther && picked.includes(OTHER_OPTION) && (
              <div className="mt-6 max-w-xl" data-anim>
                <label htmlFor={`other-${question.id}`} className="label text-muted">
                  Ghi rõ lựa chọn “Khác”
                </label>
                <input
                  id={`other-${question.id}`}
                  type="text"
                  maxLength={contactLimits.other.max}
                  value={draft.others[question.id] ?? ""}
                  onChange={(event) => {
                    setDraft((d) => ({ ...d, others: { ...d.others, [question.id]: event.target.value } }));
                    setErrors((c) => ({ ...c, [errorKey]: undefined }));
                  }}
                  className={inputClass(false)}
                  autoFocus
                />
              </div>
            )}
            <Nav
              onBack={() => go(index - 1)}
              onNext={() => next()}
              nextLabel={question.optional && picked.length === 0 ? "Bỏ qua" : "Tiếp"}
            />
          </StepFrame>
        );
      }

      case "message": {
        const other = draft.service === OTHER_SERVICE;
        return (
          <StepFrame
            id="message"
            label={label}
            title={other ? messageStep.titleOther : messageStep.title}
            hint={other ? messageStep.hintOther : messageStep.hint}
            error={errors.message}
          >
            <div data-anim>
              <label htmlFor="message" className="sr-only">
                Mô tả thêm
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                maxLength={contactLimits.message.max}
                placeholder={messageStep.placeholder}
                value={draft.message}
                onChange={(event) => update({ message: event.target.value })}
                data-error-for="message"
                aria-invalid={errors.message ? true : undefined}
                className={cn(inputClass(!!errors.message), "min-h-40 resize-y py-3")}
              />
              <p className="label mt-2 text-right text-subtle">
                {draft.message.length}/{contactLimits.message.max}
              </p>
            </div>
            <Nav
              onBack={() => go(index - 1)}
              onNext={() => next()}
              nextLabel={!other && !draft.message.trim() ? "Bỏ qua" : "Tiếp"}
            />
          </StepFrame>
        );
      }

      case "contact":
        return (
          <StepFrame id="contact" label={label} title={contactStep.title} hint={contactStep.hint}>
            <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2" data-anim>
              <TextField
                id="name"
                label="Họ tên"
                required
                autoComplete="name"
                maxLength={contactLimits.name.max}
                value={draft.name}
                error={errors.name}
                onChange={(value) => update({ name: value })}
              />
              <TextField
                id="contact"
                label="Email hoặc SĐT / Zalo"
                required
                autoComplete="email"
                inputMode="email"
                maxLength={contactLimits.contact.max}
                value={draft.contact}
                error={errors.contact}
                onChange={(value) => update({ contact: value })}
              />
              <TextField
                id="company"
                label="Công ty"
                hint="Không bắt buộc"
                autoComplete="organization"
                maxLength={contactLimits.company.max}
                value={draft.company}
                error={errors.company}
                onChange={(value) => update({ company: value })}
                className="sm:col-span-2"
              />
            </div>
            <Nav onBack={() => go(index - 1)} onNext={() => next()} nextLabel="Xem lại phiếu" />
          </StepFrame>
        );

      case "review":
        return (
          <StepFrame id="review" label="Phiếu BV-06" title={reviewStep.title} hint={reviewStep.hint}>
            <dl className="wizard-review" data-anim>
              {draft.service && (
                <ReviewRow term="Hạng mục" onEdit={() => go(0)}>
                  {serviceShortLabel(draft.service)}
                </ReviewRow>
              )}
              {draft.service &&
                questionsFor(draft.service).map((question) => {
                  const labels = answerLabels(question, draft);
                  return (
                    <ReviewRow
                      key={question.id}
                      term={question.title}
                      onEdit={() => go(steps.findIndex((s) => stepKey(s) === `q:${question.id}`))}
                    >
                      {labels.length > 0 ? labels.join(" · ") : <span className="text-subtle">Bỏ qua</span>}
                    </ReviewRow>
                  );
                })}
              <ReviewRow term="Mô tả thêm" onEdit={() => go(steps.findIndex((s) => s.kind === "message"))}>
                {draft.message.trim() ? (
                  <span className="whitespace-pre-line">{draft.message.trim()}</span>
                ) : (
                  <span className="text-subtle">Không có</span>
                )}
              </ReviewRow>
              <ReviewRow term="Liên hệ" onEdit={() => go(steps.findIndex((s) => s.kind === "contact"))}>
                {[draft.name, draft.contact, draft.company].map((v) => v.trim()).filter(Boolean).join(" · ")}
              </ReviewRow>
            </dl>

            {!isConfigured && (
              <div className="mt-8 border-l-2 border-warning py-1 pl-4 text-sm leading-relaxed" data-anim>
                <p className="label text-warning">Trạng thái: chờ kết nối</p>
                <p className="mt-2 text-muted">
                  Kênh tiếp nhận của form đang chờ kết nối nên phiếu hiện chưa thể gửi đi. Form sẽ hoạt động ngay khi kênh
                  nhận được cấu hình.
                </p>
              </div>
            )}

            <div aria-live="polite" className="empty:hidden">
              {status.state === "error" && (
                <p role="alert" className="mt-6 border-l-2 border-danger py-1 pl-4 text-sm leading-relaxed text-danger">
                  {status.message}
                </p>
              )}
            </div>

            <div className="wizard-nav" data-anim>
              <button type="button" className="wizard-back label" onClick={() => go(index - 1)}>
                ← Quay lại
              </button>
              <Button type="submit" disabled={!isConfigured || submitting} arrow={isConfigured && !submitting ? "→" : false}>
                {!isConfigured ? "Chưa thể gửi" : submitting ? "Đang gửi…" : "Gửi phiếu"}
              </Button>
            </div>
          </StepFrame>
        );
    }
  }
}

function StepFrame({
  id,
  label,
  branch,
  title,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  branch?: string;
  title: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div role="group" aria-labelledby={`step-${id}-title`} aria-describedby={error ? `step-${id}-error` : undefined}>
      <p className="label text-muted" data-anim>
        <span className="text-accent">{label}</span>
        {branch && <span className="wizard-branch"> · Nếu chọn {branch}</span>}
      </p>
      <h2 id={`step-${id}-title`} data-step-title tabIndex={-1} className="wizard-title" data-anim>
        {title}
      </h2>
      {hint && (
        <p className="mt-4 max-w-xl leading-relaxed text-muted" data-anim>
          {hint}
        </p>
      )}
      <div className="mt-10">{children}</div>
      {error && (
        <p id={`step-${id}-error`} role="alert" className="mt-5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function Nav({
  onBack,
  onNext,
  nextLabel = "Tiếp",
  hideBack,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  hideBack?: boolean;
}) {
  return (
    <div className="wizard-nav" data-anim>
      {hideBack ? <span /> : (
        <button type="button" className="wizard-back label" onClick={onBack}>
          ← Quay lại
        </button>
      )}
      <div className="flex items-center gap-5">
        <span aria-hidden className="wizard-kbd label">
          Enter ↵
        </span>
        <Button onClick={onNext}>{nextLabel}</Button>
      </div>
    </div>
  );
}

function ReviewRow({ term, onEdit, children }: { term: string; onEdit: () => void; children: ReactNode }) {
  return (
    <div className="wizard-review-row">
      <dt className="label text-muted">{term}</dt>
      <dd>{children}</dd>
      <dd>
        <button type="button" className="wizard-edit label" onClick={onEdit}>
          Sửa<span className="sr-only"> {term}</span>
        </button>
      </dd>
    </div>
  );
}

function TextField({
  id,
  label,
  required,
  hint,
  error,
  value,
  onChange,
  className,
  ...props
}: {
  id: "name" | "contact" | "company";
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  autoComplete?: string;
  inputMode?: "email" | "text";
  maxLength?: number;
}) {
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="label flex items-baseline gap-2 text-muted">
          {label}
          {required && (
            <span aria-hidden className="text-danger">
              *
            </span>
          )}
        </label>
        {hint && <span className="label text-subtle">{hint}</span>}
      </div>
      <input
        id={id}
        name={id}
        type="text"
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        data-error-for={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={inputClass(!!error)}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/** Phiếu bản vẽ thu nhỏ bên cạnh: mỗi câu trả lời được "đóng" vào phiếu ngay khi chọn (desktop) */
function BriefSheet({ draft }: { draft: Draft }) {
  const rows = draft.service
    ? questionsFor(draft.service)
        .map((question) => ({ id: question.id, title: question.title, value: answerLabels(question, draft).join(" · ") }))
        .filter((row) => row.value)
    : [];
  return (
    <aside aria-hidden className="wizard-sheet">
      <div className="wizard-sheet-inner">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <span className="label text-muted">Phiếu yêu cầu</span>
          <span className="label text-accent">BV-06</span>
        </div>
        <dl className="mt-4 space-y-4">
          <div>
            <dt className="label text-subtle">Hạng mục</dt>
            <dd className="mt-1">{draft.service ? serviceShortLabel(draft.service) : "—"}</dd>
          </div>
          {rows.map((row) => (
            <Fragment key={row.id}>
              <div className="wizard-sheet-row">
                <dt className="label text-subtle">{row.title}</dt>
                <dd className="mt-1">{row.value}</dd>
              </div>
            </Fragment>
          ))}
        </dl>
        <div aria-hidden className="wizard-sheet-mark label">
          + Aegis · tỉ lệ 1:1
        </div>
      </div>
    </aside>
  );
}

function inputClass(error: boolean) {
  return cn(
    "field-input block w-full border-0 border-b bg-transparent px-0 py-2.5 text-[1.25rem] text-fg transition-[border-color] duration-300",
    "placeholder:text-subtle focus:outline-none",
    error ? "border-danger" : "border-line-strong hover:border-fg focus:border-accent",
  );
}
