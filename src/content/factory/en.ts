import { labItems } from "@/content/lab";
import { projects } from "@/content/projects";
import { services } from "@/content/services";
import { templates } from "@/content/templates";
import type { FactoryDict, FactoryUi } from "@/content/factory/types";
import type { JournalEntry } from "@/content/journal";
import type { LabId, LabItem } from "@/content/lab";
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

const labText: Record<LabId, Omit<LabItem, "id" | "index">> = {
  "nen-mong": {
    name: "Particle foundation",
    tagline: "Tens of thousands of points of light, reshaping on your command.",
    description:
      "This is the particle engine that draws the foundation on the Aegis home page, placed in its own frame for you to control: pick a shape, scatter the points, push them with the cursor.",
    howTo: ["Click a shape and the points fly into it", "Drag the scatter slider to loosen the points", "Move the cursor inside the frame to push the points"],
    techNotes: [
      "Hand-written WebGL2, no 3D library",
      "Each point keeps two positions (from and to); the morph runs on the GPU",
      "Noise motion and the cursor flow are computed in the shader",
    ],
    usedIn: ["Particle background on the Aegis home page"],
  },
  "suong-mu": {
    name: "Mist",
    tagline: "Draw a trail of smoke with your cursor.",
    description: "A soft mist follows the cursor and slowly fades. Move faster and the mist grows thicker and wider.",
    howTo: ["Move the cursor inside the frame to draw the mist", "Move faster for a thicker trail", "Stop and let the mist fade"],
    techNotes: [
      "WebGL2 with two low-resolution frames swapped back and forth (ping-pong)",
      "Each frame blurs, drifts and fades the previous one, then adds a stroke along the cursor path",
    ],
    usedIn: ["Closing contact screen on the Aegis home page", "SERENE template"],
  },
  "tach-mau": {
    name: "Chromatic type",
    tagline: "Type that tears into two colour edges when you swipe fast.",
    description: "Type a line, then sweep the cursor across it. The faster you go, the further the two colour channels split; stop and they snap back together.",
    howTo: ["Type into the field", "Sweep the cursor quickly over the text to split the colour channels", "On a phone, touch and drag your finger"],
    techNotes: ["Three stacked text layers; two coloured layers shift in opposite directions with cursor speed", "CSS and JavaScript only, no WebGL"],
    usedIn: [],
  },
  "dai-cong": {
    name: "Bend strip",
    tagline: "Drag a strip of cards and the whole strip curves into an arc.",
    description: "A horizontal strip you can drag with inertia. The faster you drag, the more the cards lift and rotate by their distance from the centre.",
    howTo: ["Drag the strip", "Drag fast and the whole strip bends into an arc", "Use the left/right arrow keys once the strip is focused"],
    techNotes: ["Inertia from a hand-written loop, no drag library", "Each card lifts and rotates by its distance from the centre and the drag velocity"],
    usedIn: ["ATELIER template", "VOYAGE template"],
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

const journal: JournalEntry[] = [
  {
    slug: "nen-mong-dung-tu-hat",
    index: "01",
    title: "A foundation built from particles",
    body: [
      "The foundation on the home page isn't an image or a video. It's about 18,000 points of light on desktop (10,000 on phones), each with a target position for every shape: foundation, neural network, modular grid, browser frame, spreading wave.",
      "As visitors scroll through the services section, the points move from one shape to the next, all computed on the GPU. You can play with this engine yourself in the Studio.",
    ],
    confirmed: true,
  },
  {
    slug: "tam-style-tam-nganh",
    index: "02",
    title: "Eight styles, eight industries",
    body: [
      "The template library has eight styles, each a distinct recipe for one industry: colours, fonts that support Vietnamese, layout and interactions.",
      "The templates use fictional brands to show capability. Images in the templates come from openly licensed sources and are credited at the end of each template.",
    ],
    confirmed: true,
  },
  {
    slug: "xuong-dung-bang-code",
    index: "03",
    title: "This factory is built in code",
    body: [
      "The 3D space you're viewing uses no pre-built models. Floors, platforms, pavilions and screens are all geometry generated in code (Three.js); project screenshots are applied to the screens as textures.",
      "If your device can't run 3D, the factory switches to a flat floor plan with the same links.",
    ],
    confirmed: true,
  },
];

const localizedServices: Service[] = services.map((s) => ({ id: s.id, ...serviceText[s.id] }));
const localizedLab: LabItem[] = labItems.map((l) => ({ id: l.id, index: l.index, ...labText[l.id] }));

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
    studio: { name: "Studio", short: "Studio", tag: "LAB" },
    contact: { name: "Contact", short: "Contact", tag: "GATE" },
  },
  hub: {
    label: "Overview",
    lines: ["Aegis Factory,", "*where everything is built.*"],
    lead: "Aegis sits at the core, with four equal service pavilions around it, connected to our delivered work, the experimental studio and the contact gate. Pick a space to begin.",
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
      ["Drag", "Look around the 3D scene"],
    ],
    details: "Details",
    toHub: "Overview",
    menu: "Menu",
    menuClose: "Close menu",
    dragHint: "Drag to look around",
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
  boot: {
    skip: "Skip ⏎",
    lines: ["AEGIS / FACTORY", "> reading the site plan", "> pouring the foundation", "> raising the service pavilions", "> connecting energy lines to the core", "> lighting up", "Ready. Drag to look around."],
  },
  notFound: { lines: ["This space", "*hasn't been built yet.*"], back: "Back to the overview", body: "This address isn't on the factory plan." },
  product: {
    label: "PROJECT",
    shot: "Website home page screenshot (captured when the factory was built)",
    fullShot: "Scroll inside the frame to see the full page",
  },
  lab: {
    label: "PROTOTYPE",
    notice: "Experimental prototype, running live in your browser.",
    how: "How to play",
    tech: "Technical notes",
    usedIn: "Used in",
    fullscreen: "Fullscreen",
    exitFullscreen: "Exit fullscreen",
    loading: "Assembling the prototype…",
    missing: "This prototype is still being installed.",
  },
  labNames: Object.fromEntries(localizedLab.map((l) => [l.id, l.name])) as FactoryUi["labNames"],
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
    studioLink: "Experiments and interface templates in the Studio",
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
  lab: localizedLab,
  studio: {
    title: "The *studio.*",
    lead: "Where Aegis experiments: working motion and graphics prototypes, a library of eight interface styles, and notes on how this factory was built.",
    labTitle: "Experiments",
    labLead: "Experiments Aegis builds to test how motion and graphics behave. Each one is a working prototype in your browser that you can play with right away.",
    labCta: "Play",
    shelfTitle: "Interface template shelf",
    shelfLead: "Eight interface styles, each a design recipe for one industry, built as a working sample website.",
    shelfCta: "Open template",
    journalTitle: "Notes",
    journalLead: "Short notes on how this factory itself was built.",
    journalEmpty: "No notes yet. They'll be added later.",
    templateNotice:
      "These are demo interface templates designed by Aegis to show capability. Brands, content and figures in the templates are fictional, not real clients. The template sites themselves are in Vietnamese.",
    paletteLabel: "Style colour palette",
  },
  templates: templates.map((t) => ({ slug: t.slug, name: t.name, ...templateText[t.slug] })),
  journal,
  contact: {
    title: "Your project *starts here.*",
    lead: "Answer a few short questions, mostly by tapping. Aegis reads your brief, advises on a solution and gets back to you to get started.",
  },
};
