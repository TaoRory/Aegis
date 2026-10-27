import type { Service, ServiceId } from "@/content/types";

/** Dịch vụ bằng tiếng Anh, dùng chung cho trang chính, Factory và form liên hệ (không thêm tuyên bố nào ngoài nội dung tiếng Việt đã xác nhận) */
export const serviceTextEn: Record<ServiceId, Omit<Service, "id">> = {
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
