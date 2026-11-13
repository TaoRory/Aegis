import { D2ContactPage, d2Meta } from "@/components/demo2/D2Pages";
import { getD2 } from "@/content/demo2";

const t = getD2("en");

export const metadata = d2Meta(`${t.contact.title} — Aegis`, t.contact.lead);

export default function Page() {
  return <D2ContactPage t={t} />;
}
