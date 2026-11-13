import { D2Services, d2Meta } from "@/components/demo2/D2Pages";
import { getD2 } from "@/content/demo2";

const t = getD2("vi");

export const metadata = d2Meta(`${t.services.title} — Aegis`, t.services.lead);

export default function Page() {
  return <D2Services t={t} />;
}
