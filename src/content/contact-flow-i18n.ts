import type { Locale } from "@/config/space";
import {
  branchQuestions as viBranches,
  commonQuestions as viCommon,
  contactStep as viContactStep,
  messageStep as viMessageStep,
  OTHER_SERVICE,
  reviewStep as viReviewStep,
  serviceQuestion as viServiceQuestion,
  type ChoiceQuestion,
  type FlowServiceId,
} from "@/content/contact-flow";
import { serviceTextEn } from "@/content/services-en";
import { templateTextEn } from "@/content/templates-en";
import type { ServiceId } from "@/content/types";

/**
 * Kịch bản form liên hệ theo ngôn ngữ. Cấu trúc, id và giá trị lựa chọn luôn lấy từ bản tiếng Việt (contact-flow.ts), nơi API cũng đọc để kiểm tra;
 * bản tiếng Anh chỉ thay chữ hiển thị (tiêu đề, gợi ý, nhãn, ghi chú) theo id câu hỏi và giá trị lựa chọn.
 * Chỉ có các lựa chọn đã được chủ dự án xác nhận (xem contact-flow.ts).
 */

interface QuestionText {
  title: string;
  hint?: string;
  options?: Record<string, string>;
}

const questionsEn: Record<string, QuestionText> = {
  ai_tasks: {
    title: "What do you want AI to do?",
    hint: "Choose one or more.",
    options: {
      chatbot: "Answer customers (chatbot)",
      internal: "An internal assistant that looks up documents",
      automation: "Automate processes and paperwork",
      reports: "Summarise data and build reports",
    },
  },
  ai_data: {
    title: "Where does your data live today?",
    options: { sheets: "Excel / Google Sheets", software: "Software you already use", files: "Scattered files and paperwork", none: "No data yet" },
  },
  ai_stage: {
    title: "Where are you in the process?",
    options: { clear: "I know what I want AI to do", tried: "I've tried a few AI tools", scratch: "Starting from scratch" },
  },
  sw_areas: {
    title: "What areas need managing?",
    hint: "Choose one or more.",
    options: { sales: "Sales / customers", inventory: "Inventory", hr: "HR", finance: "Finance", projects: "Projects / tasks" },
  },
  sw_current: {
    title: "What do you use to manage it today?",
    options: { sheets: "Excel / Google Sheets", software: "Another piece of software", paper: "Paperwork", none: "Nothing yet" },
  },
  sw_users: {
    title: "How many people will use it?",
    options: { "1-10": "1–10 people", "11-50": "11–50 people", "51-200": "51–200 people", "200+": "More than 200 people" },
  },
  web_type: {
    title: "Which type do you need?",
    options: { company: "Company website", event: "Event website / landing page", app: "Web app / custom system", shop: "Online store" },
  },
  web_features: {
    title: "Which features do you need?",
    hint: "Choose one or more. Not sure? Skip.",
    options: { form: "Information-collection form", cms: "Manage content yourself", accounts: "Accounts & permissions", i18n: "Multiple languages", payment: "Online payment" },
  },
  web_style: {
    title: "Which style do you like?",
    hint: "The styles in Aegis's template library (the brands in the templates are fictional). Can't choose? Skip.",
  },
  mkt_goal: {
    title: "What is the main goal?",
    options: { leads: "More potential customers", sales: "Increase sales", brand: "Increase brand awareness", event: "Promote an event" },
  },
  mkt_channels: {
    title: "Which channels do you want to use?",
    hint: "Choose one or more.",
    options: { facebook: "Facebook ads", google: "Google ads", tiktok: "TikTok", social: "Manage a fanpage / social media content", seo: "SEO" },
  },
  mkt_team: {
    title: "Do you already have someone doing marketing?",
    options: { team: "A dedicated team", one: "One person doing it on the side", none: "Not yet" },
  },
  timeline: {
    title: "When do you want to start?",
    options: { asap: "As soon as possible", "1-3m": "Within 1–3 months", exploring: "Just exploring" },
  },
};

const messageStepEn = {
  title: "Tell us a bit more about the problem?",
  titleOther: "Briefly describe your problem",
  hint: "Optional. You can paste your current website link or a page you like.",
  hintOther: "What the business does, where you're stuck, what you want to achieve.",
  placeholder: "For example: We have 30 sales staff, track orders in Excel and often miss some…",
};

const contactStepEn = {
  title: "How should Aegis get back to you?",
  hint: "Aegis only uses this information to discuss your needs.",
};

const reviewStepEn = {
  title: "Review your request sheet",
  hint: "Quick check before sending. Press “Edit” to go back to any question.",
};

export interface ServiceOption {
  value: FlowServiceId;
  label: string;
  title: string;
  note: string;
}

export interface Flow {
  serviceQuestion: { title: string; hint: string; options: ServiceOption[] };
  branchQuestions: Record<FlowServiceId, ChoiceQuestion[]>;
  commonQuestions: ChoiceQuestion[];
  messageStep: typeof viMessageStep;
  contactStep: typeof viContactStep;
  reviewStep: typeof viReviewStep;
  questionsFor(service: string): ChoiceQuestion[];
  serviceShortLabel(value: string): string;
}

function translate(question: ChoiceQuestion): ChoiceQuestion {
  const text = questionsEn[question.id];
  if (!text) return question;
  return {
    ...question,
    title: text.title,
    hint: text.hint ?? question.hint,
    options: question.options.map((option) => ({
      ...option,
      label: text.options?.[option.value] ?? option.label,
      // ghi chú dưới nhãn của style mẫu là ngành của mẫu
      note: question.kind === "style" ? (templateTextEn[option.value]?.industry ?? option.note) : option.note,
    })),
  };
}

function buildEn(): Flow {
  const branches = Object.fromEntries(Object.entries(viBranches).map(([id, list]) => [id, list.map(translate)])) as Record<FlowServiceId, ChoiceQuestion[]>;
  const common = viCommon.map(translate);
  const serviceQuestion = {
    title: "What should Aegis build for you?",
    hint: "Choose one main category. The next questions change with your choice.",
    options: viServiceQuestion.options.map((option): ServiceOption => {
      if (option.value === OTHER_SERVICE) {
        return {
          value: option.value,
          label: "Several categories / not sure",
          title: "Several categories / not sure, I need Aegis to advise",
          note: "Tell us your problem briefly; Aegis advises on a fitting solution, then delivers it.",
        };
      }
      const text = serviceTextEn[option.value as ServiceId];
      return { value: option.value, label: text.shortTitle, title: text.title, note: text.summary };
    }),
  };
  return build(serviceQuestion, branches, common, messageStepEn, contactStepEn, reviewStepEn);
}

function build(
  serviceQuestion: Flow["serviceQuestion"],
  branchQuestions: Flow["branchQuestions"],
  commonQuestions: ChoiceQuestion[],
  messageStep: Flow["messageStep"],
  contactStep: Flow["contactStep"],
  reviewStep: Flow["reviewStep"],
): Flow {
  return {
    serviceQuestion,
    branchQuestions,
    commonQuestions,
    messageStep,
    contactStep,
    reviewStep,
    questionsFor(service) {
      // hasOwn: "constructor", "__proto__"… không được coi là một nhánh
      const branch = Object.hasOwn(branchQuestions, service) ? branchQuestions[service as FlowServiceId] : [];
      return [...branch, ...commonQuestions];
    },
    serviceShortLabel(value) {
      return serviceQuestion.options.find((o) => o.value === value)?.label ?? value;
    },
  };
}

const flows: Partial<Record<Locale, Flow>> = {};

/** Kịch bản form theo ngôn ngữ (tiếng Việt là bản gốc của contact-flow.ts) */
export function getFlow(lang: Locale): Flow {
  const cached = flows[lang];
  if (cached) return cached;
  const flow =
    lang === "en"
      ? buildEn()
      : build(
          { ...viServiceQuestion, options: viServiceQuestion.options.map((o) => ({ ...o, title: o.title ?? o.label, note: o.note ?? "" })) } as Flow["serviceQuestion"],
          viBranches,
          viCommon,
          viMessageStep,
          viContactStep,
          viReviewStep,
        );
  flows[lang] = flow;
  return flow;
}
