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
import type { Locale } from "@/config/space";
import { OTHER_OPTION, OTHER_SERVICE, type ChoiceQuestion } from "@/content/contact-flow";
import { wizardCopy, type WizardCopy } from "@/content/contact-copy";
import { getFlow, type Flow } from "@/content/contact-flow-i18n";
import previewData from "@/content/template-previews.json";
import { cn } from "@/lib/cn";
import { fill } from "@/lib/fill";
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

const previews = previewData as Record<string, { cover: { src: string; width: number; height: number } }>;

function stepsForFlow(flow: Flow, service: string): Step[] {
  if (!service) return [{ kind: "service" }];
  return [
    { kind: "service" },
    ...flow.questionsFor(service).map((question) => ({ kind: "question" as const, question })),
    { kind: "message" },
    { kind: "contact" },
    { kind: "review" },
  ];
}

function stepKey(step: Step) {
  return step.kind === "question" ? `q:${step.question.id}` : step.kind;
}

/** Mọi bước có thể có (cả 4 nhánh) theo thứ tự hiển thị khi không có JS */
function allStepsFor(flow: Flow): Step[] {
  return [
    { kind: "service" },
    ...Object.values(flow.branchQuestions).flatMap((list) => list.map((question) => ({ kind: "question" as const, question }))),
    ...flow.commonQuestions.map((question) => ({ kind: "question" as const, question })),
    { kind: "message" },
    { kind: "contact" },
    { kind: "review" },
  ];
}

/** Nhánh dịch vụ của một câu hỏi riêng (để ghi chú khi hiện form dài không có JS) */
function branchOf(flow: Flow, question: ChoiceQuestion) {
  const entry = Object.entries(flow.branchQuestions).find(([, list]) => list.includes(question));
  return entry?.[0];
}

/**
 * `sheetCode`: mã tờ in trên "phiếu" (trang liên hệ dùng "BV-04", chương cuối của trang cuộn dài). Factory truyền chuỗi
 * rỗng vì không dùng mã tờ bản vẽ.
 * `lang`: ngôn ngữ chữ giao diện và câu hỏi (dữ liệu gửi đi luôn theo id/giá trị, không phụ thuộc ngôn ngữ).
 * `presetService`: chọn sẵn một dịch vụ (trang dịch vụ nhúng form), bỏ qua câu 1; thiếu thì đọc ?dv= trên địa chỉ.
 */
export function ContactWizard({
  isConfigured,
  scrollMode = "window",
  sheetCode = "BV-04",
  lang = "vi",
  presetService,
}: {
  isConfigured: boolean;
  scrollMode?: "window" | "element";
  sheetCode?: string;
  lang?: Locale;
  presetService?: string;
}) {
  const flow = useMemo(() => getFlow(lang), [lang]);
  const t = wizardCopy[lang];
  const { serviceQuestion, messageStep, contactStep, reviewStep, questionsFor, serviceShortLabel } = flow;
  const allSteps = useMemo(() => allStepsFor(flow), [flow]);
  const stepsFor = (service: string) => stepsForFlow(flow, service);
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

  const steps = useMemo(() => stepsForFlow(flow, draft.service), [flow, draft.service]);
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
      const preset = presetService ?? new URLSearchParams(window.location.search).get("dv");
      if (preset && !validateService(preset) && preset !== next.draft.service) {
        next = { draft: { ...next.draft, service: preset }, index: 1 };
      }
      if (next.draft.service && validateService(next.draft.service)) next = { draft: emptyDraft, index: 0 };
      setDraft(next.draft);
      setIndex(Math.min(next.index, stepsForFlow(flow, next.draft.service).length - 1));
      setRestored(true);
    };
    restore();
    // chỉ chạy một lần khi mở trang (didRestore)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (top < 0 || top > window.innerHeight * 0.4) {
      // "element": form nằm trong vùng cuộn riêng của Panel (Xưởng Aegis), không cuộn cửa sổ
      const scroller = scrollMode === "element" ? root!.closest<HTMLElement>("[data-panel-scroll]") : null;
      if (scroller) scroller.scrollBy({ top: top - (scroller.getBoundingClientRect().top + 24) });
      else scrollToTarget(window.scrollY + top - 112, { immediate: true });
    }
    if (window.matchMedia(MQ.anyMotion).matches) {
      gsap.fromTo(
        step.querySelectorAll("[data-anim]"),
        { y: 28, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.7, ease: "expo.out", stagger: 0.045, clearProps: "transform,opacity,visibility" },
      );
    }
  }, [currentKey, scrollMode]);

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
        const error = validateService(data.service, lang);
        return error ? { service: error } : {};
      }
      case "question": {
        const error = validateQuestion(step.question, data, lang);
        return error ? { [`q:${step.question.id}`]: error } : {};
      }
      case "message": {
        const error = validateMessage(data, lang);
        return error ? { message: error } : {};
      }
      case "contact":
        return validateContactInfo(data, lang);
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

    const found = validateContact(draft, lang);
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
        body: JSON.stringify({ ...draft, lang, website: honeypotRef.current?.value ?? "", elapsedMs: Math.round(clock() - startedAt.current) }),
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
      setStatus({ state: "error", message: t.errors[code] });
    } catch {
      setStatus({ state: "error", message: t.errors.NETWORK });
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
          {t.received}
          {sheetCode && <span>{sheetCode}</span>}
        </div>
        <h2 className="mt-10 text-h2 font-semibold">
          {t.receivedLead}
          <em>{t.receivedEm}</em>
        </h2>
        <p className="mt-6 max-w-lg text-lead text-muted">{fill(t.thanks, { channel: draft.contact.includes("@") ? t.channelEmail : t.channelPhone })}</p>
        <Button variant="outline" className="mt-10" onClick={reset}>
          {t.another}
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
              {t.step} <span className="text-fg">{String(position + 1).padStart(2, "0")}</span> /{" "}
              {total ? String(total).padStart(2, "0") : "··"}
            </span>
            <span className="wizard-progress-bar">
              <span style={{ transform: `scaleX(${total ? (position + 1) / total : 0.08})` }} />
            </span>
          </div>
          <p className="sr-only" aria-live="polite">
            {restored ? (total ? fill(t.stepAriaTotal, { n: position + 1, total }) : fill(t.stepAria, { n: position + 1 })) : ""}
          </p>

          <noscript>
            <p className="mb-10 border-l-2 border-warning pl-4 text-sm leading-relaxed text-muted">
              {t.noJs}
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

        <BriefSheet draft={draft} sheetCode={sheetCode} flow={flow} t={t} lang={lang} />
      </form>
    </div>
  );

  function renderStep(step: Step): ReactNode {
    const number = step.kind === "service" ? 1 : steps.findIndex((s) => stepKey(s) === stepKey(step)) + 1;
    const label = number > 0 ? fill(t.questionNumber, { n: String(number).padStart(2, "0") }) : t.questionFallback;

    switch (step.kind) {
      case "service":
        return (
          <StepFrame id="service" label={label} title={serviceQuestion.title} hint={serviceQuestion.hint} error={errors.service} t={t}>
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
            <Nav onNext={() => next()} hideBack t={t} />
          </StepFrame>
        );

      case "question": {
        const { question } = step;
        const errorKey = `q:${question.id}` as const;
        const picked = draft.answers[question.id] ?? [];
        const branch = branchOf(flow, question);
        const options = [
          ...question.options,
          ...(question.allowOther ? [{ value: OTHER_OPTION, label: t.otherOption, note: undefined }] : []),
        ];
        return (
          <StepFrame
            id={question.id}
            label={label}
            branch={branch ? serviceShortLabel(branch) : undefined}
            title={question.title}
            hint={question.hint}
            error={errors[errorKey]}
            t={t}
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
                  {t.otherSpecify}
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
              nextLabel={question.optional && picked.length === 0 ? t.skip : t.next}
              t={t}
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
            t={t}
          >
            <div data-anim>
              <label htmlFor="message" className="sr-only">
                {t.moreLabel}
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
              nextLabel={!other && !draft.message.trim() ? t.skip : t.next}
              t={t}
            />
          </StepFrame>
        );
      }

      case "contact":
        return (
          <StepFrame id="contact" label={label} title={contactStep.title} hint={contactStep.hint} t={t}>
            <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2" data-anim>
              <TextField
                id="name"
                label={t.nameLabel}
                required
                autoComplete="name"
                maxLength={contactLimits.name.max}
                value={draft.name}
                error={errors.name}
                onChange={(value) => update({ name: value })}
              />
              <TextField
                id="contact"
                label={t.contactLabel}
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
                label={t.companyLabel}
                hint={t.optional}
                autoComplete="organization"
                maxLength={contactLimits.company.max}
                value={draft.company}
                error={errors.company}
                onChange={(value) => update({ company: value })}
                className="sm:col-span-2"
              />
            </div>
            <Nav onBack={() => go(index - 1)} onNext={() => next()} nextLabel={t.toReview} t={t} />
          </StepFrame>
        );

      case "review":
        return (
          <StepFrame id="review" label={sheetCode ? fill(t.sheetCoded, { code: sheetCode }) : t.sheetPlain} title={reviewStep.title} hint={reviewStep.hint} t={t}>
            <dl className="wizard-review" data-anim>
              {draft.service && (
                <ReviewRow term={t.reviewService} onEdit={() => go(0)} t={t}>
                  {serviceShortLabel(draft.service)}
                </ReviewRow>
              )}
              {draft.service &&
                questionsFor(draft.service).map((question) => {
                  const labels = answerLabels(question, draft, lang);
                  return (
                    <ReviewRow
                      key={question.id}
                      term={question.title}
                      onEdit={() => go(steps.findIndex((s) => stepKey(s) === `q:${question.id}`))}
                      t={t}
                    >
                      {labels.length > 0 ? labels.join(" · ") : <span className="text-subtle">{t.skip}</span>}
                    </ReviewRow>
                  );
                })}
              <ReviewRow term={t.reviewMore} onEdit={() => go(steps.findIndex((s) => s.kind === "message"))} t={t}>
                {draft.message.trim() ? (
                  <span className="whitespace-pre-line">{draft.message.trim()}</span>
                ) : (
                  <span className="text-subtle">{t.none}</span>
                )}
              </ReviewRow>
              <ReviewRow term={t.reviewContact} onEdit={() => go(steps.findIndex((s) => s.kind === "contact"))} t={t}>
                {[draft.name, draft.contact, draft.company].map((v) => v.trim()).filter(Boolean).join(" · ")}
              </ReviewRow>
            </dl>

            {!isConfigured && (
              <div className="mt-8 border-l-2 border-warning py-1 pl-4 text-sm leading-relaxed" data-anim>
                <p className="label text-warning">{t.pending}</p>
                <p className="mt-2 text-muted">{t.pendingBody}</p>
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
                {t.back}
              </button>
              <Button type="submit" disabled={!isConfigured || submitting} arrow={isConfigured && !submitting ? "→" : false}>
                {!isConfigured ? t.cannotSend : submitting ? t.sending : t.send}
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
  t,
}: {
  id: string;
  label: string;
  branch?: string;
  title: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  t: WizardCopy;
}) {
  return (
    <div role="group" aria-labelledby={`step-${id}-title`} aria-describedby={error ? `step-${id}-error` : undefined}>
      <p className="label text-muted" data-anim>
        <span className="text-accent">{label}</span>
        {branch && <span className="wizard-branch"> · {fill(t.branch, { name: branch })}</span>}
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
  nextLabel,
  hideBack,
  t,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  hideBack?: boolean;
  t: WizardCopy;
}) {
  return (
    <div className="wizard-nav" data-anim>
      {hideBack ? <span /> : (
        <button type="button" className="wizard-back label" onClick={onBack}>
          {t.back}
        </button>
      )}
      <div className="flex items-center gap-5">
        <span aria-hidden className="wizard-kbd label">
          Enter ↵
        </span>
        <Button onClick={onNext}>{nextLabel ?? t.next}</Button>
      </div>
    </div>
  );
}

function ReviewRow({ term, onEdit, children, t }: { term: string; onEdit: () => void; children: ReactNode; t: WizardCopy }) {
  return (
    <div className="wizard-review-row">
      <dt className="label text-muted">{term}</dt>
      <dd>{children}</dd>
      <dd>
        <button type="button" className="wizard-edit label" onClick={onEdit}>
          {t.edit}<span className="sr-only"> {term}</span>
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
function BriefSheet({ draft, sheetCode, flow, t, lang }: { draft: Draft; sheetCode: string; flow: Flow; t: WizardCopy; lang: Locale }) {
  const rows = draft.service
    ? flow
        .questionsFor(draft.service)
        .map((question) => ({ id: question.id, title: question.title, value: answerLabels(question, draft, lang).join(" · ") }))
        .filter((row) => row.value)
    : [];
  return (
    <aside aria-hidden className="wizard-sheet">
      <div className="wizard-sheet-inner">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <span className="label text-muted">{t.briefTitle}</span>
          {sheetCode && <span className="label text-accent">{sheetCode}</span>}
        </div>
        <dl className="mt-4 space-y-4">
          <div>
            <dt className="label text-subtle">{t.briefService}</dt>
            <dd className="mt-1">{draft.service ? flow.serviceShortLabel(draft.service) : "—"}</dd>
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
          {t.briefMark}
        </div>
      </div>
    </aside>
  );
}

function inputClass(error: boolean) {
  return cn(
    "field-input block w-full border-0 border-b bg-transparent px-0 py-2.5 text-[1.25rem] text-fg transition-[border-color] duration-300",
    "placeholder:text-subtle focus:outline-none",
    error ? "border-danger" : "border-muted hover:border-fg focus:border-accent",
  );
}
