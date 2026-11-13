import { D2Work, d2Meta } from "@/components/demo2/D2Pages";
import { getD2 } from "@/content/demo2";

const t = getD2("vi");

export const metadata = d2Meta(`${t.work.title} — Aegis`, t.work.lead);

export default function Page() {
  return <D2Work t={t} />;
}
