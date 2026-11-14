import { D3About, d3Meta } from "@/components/demo3";
import { getD3 } from "@/content/demo3";

const t = getD3("vi");

export const metadata = d3Meta(`${t.about.title} — Aegis`, t.about.statement);

export default function Page() {
  return <D3About t={t} />;
}
