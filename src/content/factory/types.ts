import type { Locale, ZoneId } from "@/config/space";
import type { JournalEntry } from "@/content/journal";
import type { LabId, LabItem } from "@/content/lab";
import type { ProcessStep, Project, ProjectCategory, Service, ServiceId, Value } from "@/content/types";

/**
 * Chữ giao diện của Factory dùng ở phía client (HUD, mặt bằng, khung nội dung, cảnh 3D). Nhỏ gọn: layout truyền
 * xuống một lần qua FactoryProvider. Nội dung dài (dịch vụ, dự án, thí nghiệm…) nằm ở FactoryDict, chỉ dùng ở server.
 */
export interface FactoryUi {
  lang: Locale;
  name: string;
  homeLink: string;
  language: { label: string; vi: string; en: string; switchTo: string };
  zones: Record<ZoneId, { name: string; short: string; tag: string }>;
  hub: { label: string; lines: string[]; lead: string; legend: string; servicesLabel: string };
  hud: {
    close: string;
    nav: string;
    servicesNav: string;
    flat: string;
    threeD: string;
    flatNotice: string;
    shortcuts: string;
    shortcutRows: [string, string][];
    details: string;
    toHub: string;
    menu: string;
    menuClose: string;
    dragHint: string;
    stepOf: string;
    stepPrev: string;
    stepNext: string;
    switchItem: string;
    resize: string;
    hotspots: string;
    planLabel: string;
    bootLabel: string;
    contextLost: string;
    noWebgl: string;
  };
  boot: { skip: string; lines: string[] };
  notFound: { lines: string[]; back: string; body: string };
  product: { label: string; shot: string; fullShot: string };
  lab: {
    label: string;
    notice: string;
    how: string;
    tech: string;
    usedIn: string;
    fullscreen: string;
    exitFullscreen: string;
    loading: string;
    missing: string;
  };
  labNames: Record<LabId, string>;
  /** Tên đầy đủ của 4 dịch vụ, dùng cho bảng tên trong cảnh 3D */
  serviceTitles: Record<ServiceId, string>;
  demoBadge: string;
  /** Nhãn điểm chạm trong khu dịch vụ */
  hotspotLabels: { demo: string; proof: string; start: string };
}

export interface FactoryDict {
  ui: FactoryUi;
  meta: { description: string };
  services: Service[];
  servicesPage: {
    title: string;
    lead: string;
    needs: string;
    scope: string;
    value: string;
    proof: string;
    noProof: string;
    demo: string;
    demoLead: string;
    demoCta: string;
    start: string;
    others: string;
    studioLink: string;
    open: string;
  };
  projects: Project[];
  categories: Record<ProjectCategory, string>;
  work: {
    title: string;
    lead: string;
    open: string;
    specType: string;
    specGroup: string;
    specAddress: string;
    specFeatures: string;
    specService: string;
    view: string;
  };
  about: {
    title: string;
    statement: string;
    body: string;
    promise: { label: string; text: string };
    valuesLabel: string;
    values: Value[];
    processLabel: string;
    processLead: string;
    process: ProcessStep[];
    servicesLabel: string;
  };
  lab: LabItem[];
  studio: {
    title: string;
    lead: string;
    labTitle: string;
    labLead: string;
    labCta: string;
    shelfTitle: string;
    shelfLead: string;
    shelfCta: string;
    journalTitle: string;
    journalLead: string;
    journalEmpty: string;
    templateNotice: string;
    paletteLabel: string;
  };
  templates: { slug: string; name: string; industry: string; signature: string }[];
  journal: JournalEntry[];
  contact: { title: string; lead: string };
}
