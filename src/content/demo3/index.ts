import { d2PlanLayers, d2Projects, d2ServiceLayer, d2Stages, getD2, type D2Dict, type D2Lang } from "@/content/demo2";

import about from "./about";
import hero from "./hero";
import home from "./home";
import plans from "./plans";
import process from "./process";
import services from "./services";
import shell from "./shell";
import work from "./work";

/**
 * Nội dung bản thiết kế /demo3: bản nâng cấp chuyển động của /demo2 (cùng định vị, cùng nội dung, cùng blog).
 * - Chữ dùng chung lấy nguyên từ src/content/demo2.ts (getD2) để hai bản không lệch nhau.
 * - Chữ chỉ /demo3 mới có nằm trong các file cùng thư mục, mỗi khu vực một file, gộp vào `t.x.<khu vực>`.
 * - Đường dẫn: /demo3 (tiếng Anh) và /demo3/vi (tiếng Việt).
 */
export type { D2LayerId as D3LayerId, D2Lang as D3Lang, D2Plan as D3Plan, D2PlanId as D3PlanId, D2Service as D3Service, D2ServiceId as D3ServiceId } from "@/content/demo2";

export const D3_BASE = "/demo3";
export const d3Home = (lang: D2Lang) => (lang === "en" ? D3_BASE : `${D3_BASE}/vi`);
/** Đường dẫn trong /demo3 theo ngôn ngữ; `path` bắt đầu bằng "/" hoặc rỗng (trang chủ) */
export const d3Href = (lang: D2Lang, path = "") => `${d3Home(lang)}${path}`;
export const d3Contact = (lang: D2Lang) => d3Href(lang, "/contact");

export const d3PlanLayers = d2PlanLayers;
export const d3ServiceLayer = d2ServiceLayer;
export const d3Stages = d2Stages;
export const d3Projects = d2Projects;

const extra = (lang: D2Lang) => ({
  shell: shell[lang],
  hero: hero[lang],
  home: home[lang],
  services: services[lang],
  plans: plans[lang],
  work: work[lang],
  process: process[lang],
  about: about[lang],
});

export type D3Extra = ReturnType<typeof extra>;
export type D3Dict = D2Dict & { x: D3Extra };

const dicts: Record<D2Lang, D3Dict> = { en: { ...getD2("en"), x: extra("en") }, vi: { ...getD2("vi"), x: extra("vi") } };
export const getD3 = (lang: D2Lang) => dicts[lang];
