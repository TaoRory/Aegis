import { D3Process, d3Meta } from "@/components/demo3";
import { getD3 } from "@/content/demo3";

const t = getD3("en");

export const metadata = d3Meta(`${t.process.title} — Aegis`, t.process.lead, t.lang, "/process");

export default function Page() {
  return <D3Process t={t} />;
}
