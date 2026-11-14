import { D3Work, d3Meta } from "@/components/demo3";
import { getD3 } from "@/content/demo3";

const t = getD3("vi");

export const metadata = d3Meta(`${t.work.title} — Aegis`, t.work.lead);

export default function Page() {
  return <D3Work t={t} />;
}
