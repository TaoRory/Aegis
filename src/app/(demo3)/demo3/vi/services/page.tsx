import { D3Services, d3Meta } from "@/components/demo3";
import { getD3 } from "@/content/demo3";

const t = getD3("vi");

export const metadata = d3Meta(`${t.services.title} — Aegis`, t.services.lead);

export default function Page() {
  return <D3Services t={t} />;
}
