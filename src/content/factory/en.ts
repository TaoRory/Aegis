import { projects } from "@/content/projects";
import { services } from "@/content/services";
import { templates } from "@/content/templates";
import type { FactoryDict, FactoryUi } from "@/content/factory/types";
import type { Project, Service, ServiceId } from "@/content/types";

/**
 * Factory, English. A close translation of the confirmed Vietnamese content: no new claims, figures or clients.
 * Data that is not language-specific (slugs, URLs, names, flags) is taken from the Vietnamese sources so the
 * two languages cannot drift apart. *asterisks* = italic serif.
 */

const serviceText: Record<ServiceId, Omit<Service, "id">> = {
  ai: {
    title: "Enterprise AI solutions",
    shortTitle: "AI solutions",
    summary: "We define the right problem first, then build AI tools that run inside your real workflows, not ones that chase trends.",
    needs: [
      "You want to apply AI but aren't sure where to start",
      "You need to assess whether AI fits your current processes and data",
      "You need AI tools tailored to how your team actually works",
    ],
    scope: [
      "AI consulting around a specific problem, clarified before any build",
      "Developing and deploying AI products for your business",
      "Customising the solution to each client's requirements",
    ],
    value: "AI placed in the right part of the workflow, serving the team's everyday work.",
  },
  software: {
    title: "Business management software implementation",
    shortTitle: "Business software",
    summary:
      "We advise on the solution, then implement and tailor management software to your actual operations, and hand it over so the team can use it straight away.",
    needs: [
      "Data and work are scattered across many places and hard to track",
      "Off-the-shelf software doesn't match how you really operate",
      "Processes need standardising as the business grows",
    ],
    scope: [
      "Solution consulting and agreeing the implementation scope",
      "Implementing the software into your daily operations",
      "Customising it to your own operating processes",
    ],
    value: "A management system that fits how the business works, making operations clearer and more stable.",
  },
  web: {
    title: "Website and web app design & development",
    shortTitle: "Websites & web apps",
    summary: "From company and event websites to custom-built web systems.",
    needs: [
      "You need a professional website to present your business",
      "You need a dedicated site for an event, programme or campaign",
      "You need a web tool to collect information or manage your own content",
    ],
    scope: [
      "Company websites and event websites",
      "Custom web systems and web apps",
      "Databases, data collection and admin permissions, scoped per project",
    ],
    value: "A polished online presence that is easy to update and serves your business goals.",
  },
  marketing: {
    title: "Marketing for businesses",
    shortTitle: "Marketing",
    summary: "We plan and directly run marketing on online channels, bringing your business closer to its customers.",
    needs: [
      "You need to reach new customers online",
      "You need a consistent presence on social media",
      "You need one point of contact to run marketing against clear goals",
    ],
    scope: ["Online advertising", "Social media marketing", "Other marketing activities as needed, within an agreed scope"],
    value: "Purposeful marketing, tied to business goals and the agreed scope.",
  },
};

const projectText: Record<string, Pick<Project, "type" | "description" | "highlights">> = {
  vidi26: {
    type: "Admissions website",
    description:
      "Website for the VinUni Discovery 2026 programme of VinUniversity's admissions office. It has a database and admin permissions so the team can update blog content themselves.",
    highlights: ["Database", "Admin permissions", "Blog content management"],
  },
  "handle-vietnam": {
    type: "Company website",
    description: "Website for Handle, a healthcare support and medical travel service in Vietnam. It has a database for collecting basic information.",
    highlights: ["Database for information collection"],
  },
  "integritas-vu-legal": {
    type: "Company website",
    description: "Company website for Integritas Vu Legal, a law firm in Vietnam, presenting its practice areas, team and professional articles.",
  },
  "tedx-vinuniversity-2026": {
    type: "Event website",
    description: "Website for TEDxVinUniversity 2026 with the theme “The Limitless Decade”, introducing the speakers and the event schedule.",
  },
  rethink: { type: "Organisation website", description: "Website for ReThink, a student organisation at VinUniversity." },
  "tedx-vinuniversity-2025": { type: "Event website", description: "Website for TEDxVinUniversity 2025." },
  "rethink-halloween": {
    type: "Event website",
    description: "Website for the student council's Halloween event, organised with ReThink, a student organisation at VinUniversity.",
  },
};

const templateText: Record<string, { industry: string; signature: string }> = {
  atelier: { industry: "Fashion", signature: "A draggable lookbook; the whole strip bends with the speed of your drag." },
  signal: { industry: "Technology / AI", signature: "A shader wave field that responds to cursor and scroll." },
  serene: { industry: "Care services", signature: "A mist that follows the cursor over the hero image." },
  hearth: { industry: "F&B", signature: "Menu: dish photos follow the cursor." },
  broadcast: { industry: "Media", signature: "Schedule: project names scramble, images follow the cursor." },
  playground: { industry: "English centre", signature: "Drag-and-drop stickers with inertia on the hero." },
  voyage: { industry: "Study abroad consulting", signature: "A flight path that draws itself as you scroll, with a plane following it." },
  campus: { industry: "Education", signature: "A day at school: horizontal scroll that runs like a clock." },
};

const localizedServices: Service[] = services.map((s) => ({ id: s.id, ...serviceText[s.id] }));

const ui: FactoryUi = {
  lang: "en",
  name: "Aegis Factory",
  homeLink: "← Aegis main site",
  language: { label: "Language", vi: "VI", en: "EN", switchTo: "Chuyển sang tiếng Việt" },
  zones: {
    hub: { name: "Overview", short: "Overview", tag: "PLAN" },
    about: { name: "About Aegis", short: "About", tag: "CORE" },
    ai: { name: "AI Solutions", short: "AI", tag: "SERVICE" },
    software: { name: "Business Software", short: "Software", tag: "SERVICE" },
    web: { name: "Web & Apps", short: "Web", tag: "SERVICE" },
    marketing: { name: "Marketing", short: "Marketing", tag: "SERVICE" },
    work: { name: "Work", short: "Work", tag: "PROOF" },
    studio: { name: "Template studio", short: "Templates", tag: "STUDIO" },
    contact: { name: "Contact", short: "Contact", tag: "GATE" },
  },
  hub: {
    label: "Overview",
    lines: ["Aegis Factory,", "*where everything is built.*"],
    lead: "Aegis sits at the core, with four equal service pavilions around it, connected to our delivered work, the interface template studio and the contact gate. Pick a space to begin.",
    legend: "Spaces in the factory",
    servicesLabel: "Four services",
  },
  hud: {
    close: "Close",
    nav: "Factory navigation",
    servicesNav: "Services",
    flat: "Flat view",
    threeD: "3D view",
    flatNotice: "This device doesn't support the 3D space, so the factory is showing the flat view.",
    shortcuts: "Shortcuts",
    shortcutRows: [
      ["1 – 8", "Open a space from the navigation bar"],
      ["M", "Back to the overview"],
      ["← →", "Previous / next project or prototype (or swipe the scene)"],
      ["Esc", "Close the content panel"],
      ["B", "Switch 3D view / flat view"],
      ["R", "Reset to the default view"],
      ["Drag · Scroll · Right-drag", "Rotate · zoom · pan the camera in the 3D scene"],
    ],
    details: "Details",
    toHub: "Overview",
    menu: "Menu",
    menuClose: "Close menu",
    dragHint: "Drag to rotate · scroll to zoom",
    dragHintTouch: "Drag to rotate · pinch to zoom",
    resetView: "Reset view",
    stepOf: "Item",
    stepPrev: "Previous",
    stepNext: "Next",
    switchItem: "Switch item",
    resize: "Resize the content panel",
    hotspots: "Points in the scene",
    planLabel: "Aegis Factory floor plan",
    bootLabel: "Starting Aegis Factory",
    contextLost: "The browser lost its graphics context, so the factory switched to the flat view.",
    noWebgl: "The 3D scene couldn't be built on this device, so the factory is showing the flat view.",
  },
  intro: { hint: "Scroll to enter the factory", hintTouch: "Swipe up to enter the factory", skip: "Skip", loading: "Building the factory…", replay: "Replay the intro" },
  notFound: { lines: ["This space", "*hasn't been built yet.*"], back: "Back to the overview", body: "This address isn't on the factory plan." },
  product: {
    label: "PROJECT",
    shot: "Website home page screenshot (captured when the factory was built)",
    fullShot: "Scroll inside the frame to see the full page",
  },
  serviceTitles: Object.fromEntries(localizedServices.map((s) => [s.id, s.title])) as FactoryUi["serviceTitles"],
  demoBadge: "Illustrative demo · fictional brand and data",
  hotspotLabels: { demo: "Illustrative demo", proof: "Delivered work", start: "Talk to us" },
};

export const en: FactoryDict = {
  ui,
  meta: { description: ui.hub.lead },
  services: localizedServices,
  servicesPage: {
    title: "Four services, *one foundation.*",
    lead: "Aegis supports businesses across both their operating foundation and how they reach customers. Start from one specific need and expand when you're ready.",
    needs: "Common needs",
    scope: "How Aegis helps",
    value: "The value",
    proof: "Delivered projects",
    noProof: "There are no published projects for this service yet. The illustrative demo below shows how Aegis approaches a typical problem.",
    demo: "Illustrative demo",
    demoLead: "A typical problem, built into a working demo so you can picture it. The brand and data in the demo are fictional.",
    demoCta: "Open the demo",
    start: "Talk to us about this service",
    others: "Other services",
    studioLink: "Interface template studio",
    open: "Visit the pavilion",
  },
  projects: projects.map((p) => ({ ...p, ...projectText[p.slug] })),
  categories: { business: "Business", education: "Education & organisations", event: "Events" },
  work: {
    title: "Delivered *work.*",
    lead: "Websites Aegis has delivered for businesses, educational organisations and events. Each project stands on its own display: read the details, view the page, then open the live site.",
    open: "Open website ↗",
    specType: "Type",
    specGroup: "Category",
    specAddress: "Address",
    specFeatures: "Confirmed features",
    specService: "Service",
    view: "View",
  },
  about: {
    title: "The Aegis *core.*",
    statement:
      "Aegis is the *technology and marketing delivery team* for businesses. We advise on the right solution, build it ourselves and hand over *the easiest product to use,* so owners can run it on their own.",
    body: "Every project starts from a real problem: how operations run today, what the team needs and which goals matter. Consulting is only the opening step: Aegis agrees the scope, then delivers it directly, rather than stopping at a proposal.",
    promise: { label: "What Aegis hands over", text: "The *easiest product to use* for business owners: no technical background needed to run it." },
    valuesLabel: "Three principles",
    values: [
      {
        title: "Reliable",
        description: "A partner businesses can trust with their systems and technology work. Scope, timeline and responsibilities are agreed clearly from the start.",
      },
      {
        title: "Solid",
        description: "Stable, maintainable and extensible foundations come first, so systems serve long-term operations rather than only immediate needs.",
      },
      {
        title: "Alongside you",
        description: "With the business from solution consulting, through delivery, until the product is handed over and running.",
      },
    ],
    processLabel: "How we work",
    processLead: "Every project moves through four stages, from consulting to handover, so the business always knows what is being done and why.",
    process: [
      { title: "Solution consulting", description: "We listen to the problem, goals and operating context, then propose a fitting solution." },
      { title: "Scope agreement", description: "We agree on the scope of work, the plan and the delivery timeline." },
      { title: "Delivery", description: "We build within the agreed scope and share progress throughout." },
      { title: "Handover", description: "We hand over the easiest product to use so the business can run it, with support within the agreed scope." },
    ],
    servicesLabel: "Four equal services",
  },
  studio: {
    title: "Interface *templates.*",
    lead: "Eight interface styles designed by Aegis, each a recipe for one industry: colours, fonts that support Vietnamese, layout and interactions.",
    shelfTitle: "Eight styles, eight industries",
    shelfLead: "Eight interface styles, each a design recipe for one industry, built as a working sample website.",
    shelfCta: "Open template",
    templateNotice:
      "These are demo interface templates designed by Aegis to show capability. Brands, content and figures in the templates are fictional, not real clients. The template sites themselves are in Vietnamese.",
    paletteLabel: "Style colour palette",
  },
  templates: templates.map((t) => ({ slug: t.slug, name: t.name, ...templateText[t.slug] })),
  contact: {
    title: "Your project *starts here.*",
    lead: "Answer a few short questions, mostly by tapping. Aegis reads your brief, advises on a solution and gets back to you to get started.",
  },
};
