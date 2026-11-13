import type { Metadata } from "next";

import { D2Home } from "@/components/demo2/D2Page";
import { getD2 } from "@/content/demo2";

const t = getD2("en");

export const metadata: Metadata = {
  title: { absolute: t.meta.title },
  description: t.meta.description,
  robots: { index: false, follow: false },
};

export default function Demo2Home() {
  return <D2Home t={t} />;
}
