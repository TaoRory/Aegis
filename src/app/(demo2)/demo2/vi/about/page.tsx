import { D2About, d2Meta } from "@/components/demo2/D2Pages";
import { getD2 } from "@/content/demo2";

const t = getD2("vi");

export const metadata = d2Meta(`${t.about.title} — Aegis`, t.about.statement);

export default function Page() {
  return <D2About t={t} />;
}
