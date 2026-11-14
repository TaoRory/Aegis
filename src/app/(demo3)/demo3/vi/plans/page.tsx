import { D3Plans, d3Meta } from "@/components/demo3";
import { getD3 } from "@/content/demo3";

const t = getD3("vi");

export const metadata = d3Meta(`${t.plans.title} — Aegis`, t.plans.lead);

export default function Page() {
  return <D3Plans t={t} />;
}
