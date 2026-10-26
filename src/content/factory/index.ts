import type { Locale } from "@/config/space";
import { en } from "@/content/factory/en";
import type { FactoryDict } from "@/content/factory/types";
import { vi } from "@/content/factory/vi";

export type { FactoryDict, FactoryUi } from "@/content/factory/types";

const dictionaries: Record<Locale, FactoryDict> = { vi, en };

/** Nội dung Factory theo ngôn ngữ (gọi ở Server Component; phần `ui` được layout truyền xuống client) */
export function getFactoryDict(lang: Locale): FactoryDict {
  return dictionaries[lang];
}
