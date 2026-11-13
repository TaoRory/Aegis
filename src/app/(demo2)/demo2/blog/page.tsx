import { D2Blog, d2Meta } from "@/components/demo2/D2Pages";
import { getD2 } from "@/content/demo2";

const t = getD2("en");

export const metadata = d2Meta(`${t.blog.title} — Aegis`, t.blog.lead);

export default function Page() {
  return <D2Blog t={t} />;
}
