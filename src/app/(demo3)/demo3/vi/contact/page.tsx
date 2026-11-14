import { D3ContactPage, d3Meta } from "@/components/demo3";
import { getD3 } from "@/content/demo3";

const t = getD3("vi");

export const metadata = d3Meta(`${t.contact.title} — Aegis`, t.contact.lead);

export default function Page() {
  return <D3ContactPage t={t} />;
}
