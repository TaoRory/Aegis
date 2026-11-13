import { D2Process, d2Meta } from "@/components/demo2/D2Pages";
import { getD2 } from "@/content/demo2";

const t = getD2("vi");

export const metadata = d2Meta(`${t.process.title} — Aegis`, t.process.lead);

export default function Page() {
  return <D2Process t={t} />;
}
