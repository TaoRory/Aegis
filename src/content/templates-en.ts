import type { TemplateText } from "@/content/site/types";

/** Mô tả các style mẫu bằng tiếng Anh (tên, thương hiệu, font, bảng màu không đổi theo ngôn ngữ) */
export const templateNoticeEn =
  "These are demo interface templates designed by Aegis to show capability. Brands, content and figures in the templates are fictional, not real clients. The template sites themselves are in Vietnamese.";

export const templateTextEn: Record<string, TemplateText> = {
  atelier: {
    industry: "Fashion",
    group: "Retail",
    emotion: "Desire",
    idea: "The website is a fashion magazine issue: a giant masthead, a cover image, a lookbook like a film strip.",
    signature: "A draggable lookbook; the whole strip bends with the speed of your drag.",
    interactions: ["Drag the lookbook strip", "Filter the catalogue", "Sliding cart", "Hover to see behind the scenes"],
    fits: ["Jewellery", "Premium cosmetics", "Wedding photography studio", "Boutique furniture"],
  },
  signal: {
    industry: "Technology / AI",
    group: "Technology & media",
    emotion: "Precise",
    idea: "Signal out of noise: a chaotic wave field straightens as the viewer scrolls and moves the mouse.",
    signature: "A shader wave field that responds to cursor and scroll.",
    interactions: ["Hover to flatten the waves", "Run an automation flow", "A feature row that scrambles its text"],
    fits: ["Fintech", "Business management software", "Hardware startups", "Data security"],
  },
  serene: {
    industry: "Care services",
    group: "Services",
    emotion: "Reassuring",
    idea: "Morning mist covers the page and thins under the cursor; every movement is slow, like breathing.",
    signature: "A mist that follows the cursor over the hero image.",
    interactions: ["Hover to clear the mist", "A guided breathing exercise", "4-step booking"],
    fits: ["Dental clinic", "Medical clinic", "Yoga / meditation", "Pet care"],
  },
  hearth: {
    industry: "F&B",
    group: "Retail",
    emotion: "Craving",
    idea: "A kitchen at night, embers glowing; dishes appear as the viewer skims the menu.",
    signature: "Menu: dish photos follow the cursor.",
    interactions: ["Hover over the menu", "Switch dish categories", "Reserve a table"],
    fits: ["Café / bakery", "Bar", "Fine dining", "F&B chain"],
  },
  broadcast: {
    industry: "Media",
    group: "Technology & media",
    emotion: "Bold",
    idea: "The website as a channel going live: REC, timecode, the project list as a broadcast schedule.",
    signature: "Schedule: project names scramble, images follow the cursor.",
    interactions: ["Hover over the schedule", "Open the showreel", "Expand services"],
    fits: ["Advertising agency", "Production house", "Podcast", "Online press"],
  },
  playground: {
    industry: "English centre",
    group: "Education",
    emotion: "Playful",
    idea: "A language playground: draggable stickers, a placement test as a game, vocabulary as flip cards.",
    signature: "Drag-and-drop stickers with inertia on the hero.",
    interactions: ["Drag stickers", "5-question level check", "Flip vocabulary cards", "Sign up for a trial class"],
    fits: ["Skills / STEM centre", "Preschool", "Language-learning app", "Play area"],
  },
  voyage: {
    industry: "Study abroad consulting",
    group: "Services",
    emotion: "Aspiring",
    idea: "Each section is a leg of the flight, from the first ticket to the first day of school.",
    signature: "A flight path that draws itself as you scroll, with a plane following it.",
    interactions: ["Drag the destinations strip", "Tick the application checklist", "Book a consultation"],
    fits: ["Travel company", "Visa services", "International logistics", "International school"],
  },
  campus: {
    industry: "Education",
    group: "Education",
    emotion: "Calm",
    idea: "A carefully edited yearbook: numbered chapters, margin notes, large quiet photographs.",
    signature: "A day at school: horizontal scroll that runs like a clock.",
    interactions: ["Scroll through a school day", "Open a grade level", "See the events calendar", "Sign up for a visit"],
    fits: ["University / institute", "Training centre", "Library / museum", "Premium preschool"],
  },
};
