import type { Locale } from "@/config/space";
import type { SettingsCopy } from "@/content/settings-copy";
import type { ProcessStep, Project, ProjectCategory, Service, ServiceId, Value } from "@/content/types";

/**
 * Nội dung và chữ giao diện của trang chính (aegisgrp.co) theo ngôn ngữ. Quy ước: phần đặt giữa *dấu sao* hiển thị bằng serif nghiêng;
 * mỗi phần tử của mảng `lines` là một dòng ngắt chủ đích. Không dùng hàm trong từ điển (phải truyền được từ server sang client):
 * chỗ cần số thì dùng mẫu chuỗi có {n}, {total}.
 */

export interface SiteLink {
  label: string;
  href: string;
}

export interface SiteDict {
  lang: Locale;
  meta: {
    title: string;
    description: string;
    ogLocale: string;
  };
  chrome: {
    skip: string;
    homeAria: string;
    navMain: string;
    navMobile: string;
    navFooter: string;
    menuOpenAria: string;
    menuCloseAria: string;
    menuOpen: string;
    menuClose: string;
    ctaShort: string;
    tagline: string;
    language: { label: string; vi: string; en: string; switchTo: string };
    theme: { toLight: string; toDark: string };
  };
  /** Mục menu (đã gắn đường dẫn theo ngôn ngữ) */
  nav: SiteLink[];
  cta: SiteLink;
  hero: {
    label: string;
    scale: string;
    lines: string[];
    description: string;
    secondaryCta: SiteLink;
    scrollHint: string;
    chapter: string;
  };
  about: {
    label: string;
    statement: string;
    body: string;
    promise: { label: string; text: string };
    valuesLabel: string;
    principles: string;
    chapter: string;
  };
  values: Value[];
  servicesSection: { label: string; lines: string[]; lead: string; chapter: string };
  /** Các "bản vẽ" dịch vụ ghim trên trang chủ */
  chapters: { sheet: string; more: string; less: string; needs: string; scope: string; explore: string };
  process: { label: string; lines: string[]; lead: string; steps: ProcessStep[]; unit: string; stable: string; chapter: string };
  contact: {
    chapter: string;
    label: string;
    lines: string[];
    lead: string;
    pickerLabel: string;
    start: string;
    sheet: string;
    channels: { email: string; phone: string; address: string };
    pageLabel: string;
    pageLines: string[];
    pageLead: string;
    pageTitle: string;
    pageDescription: string;
  };
  footer: {
    label: string;
    statement: string;
    navTitle: string;
    servicesTitle: string;
    copyright: string;
    top: string;
    chapter: string;
  };
  settings: SettingsCopy;
  /** Màn mở đầu chữ AEGIS (SiteIntro) */
  intro: { label: string; hint: string; hintTouch: string; skip: string };
  services: Service[];
  /** Trang dịch vụ (/web, /ai, /software, /marketing) */
  servicePage: {
    back: string;
    eyebrow: string;
    needs: string;
    scope: string;
    value: string;
    processTitle: string;
    contactLabel: string;
    contactLines: string[];
    contactLead: string;
    others: string;
    metaSuffix: string;
  };
  /** Phần riêng của trang Web & web app: dự án, mẫu giao diện, lời mời tham quan Factory */
  webPage: {
    projects: { label: string; lines: string[]; lead: string; chapter: string };
    templates: {
      label: string;
      lines: string[];
      lead: string;
      notice: string;
      count: string;
      drag: string;
      cta: string;
      chapter: string;
    };
    factory: {
      label: string;
      lines: string[];
      body: string;
      cta: string;
      later: string;
      chapter: string;
    };
  };
  projects: Project[];
  projectCategories: { id: ProjectCategory | "all"; label: string }[];
  projectIndex: {
    filter: string;
    /** {n} dự án đang hiển thị trên {total} */
    showing: string;
    swipe: string;
    cursor: string;
    /** {name}: tên dự án */
    open: string;
    shotAlt: string;
  };
  /** Thư viện mẫu giao diện (/mau-giao-dien, /en/templates) */
  templatesPage: {
    title: string;
    description: string;
    label: string;
    lines: string[];
    lead: string;
    notice: string;
    transparencyLabel: string;
    /** {link} được thay bằng liên kết tới trang Web & web app */
    transparencyBody: string;
    transparencyLink: string;
    showroom: string;
    dossiers: string;
    dossiersLabel: string;
    closing: string;
    closingCta: string;
    profile: {
      style: string;
      signature: string;
      emotion: string;
      font: string;
      palette: string;
      tryIt: string;
      fits: string;
      brand: string;
      fictional: string;
      open: string;
      openAria: string;
      paletteAria: string;
      stageAlt: string;
    };
  };
  gallery: {
    region: string;
    stage: string;
    list: string;
    cursorOpen: string;
    cursorDrag: string;
    cardSr: string;
    hint: string;
    style: string;
    note: string;
    prev: string;
    next: string;
    open: string;
    filters: string;
    all: string;
    tick: string;
    rule: string;
    notice: string;
  };
  /** Nhóm lọc và mô tả của các style mẫu theo ngôn ngữ (tên, thương hiệu, bảng màu… không phụ thuộc ngôn ngữ) */
  templates: Record<string, TemplateText>;
  templateGroups: string[];
  /** Trang 404 của trang chính */
  notFound: { label: string; lines: string[]; body: string; home: string; contact: string };
}

export interface TemplateText {
  industry: string;
  group: string;
  emotion: string;
  idea: string;
  signature: string;
  interactions: string[];
  fits: string[];
}

export type { ServiceId };
