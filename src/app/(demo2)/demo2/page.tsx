import { D2Home, d2Meta } from "@/components/demo2/D2Pages";
import { getD2 } from "@/content/demo2";

const t = getD2("en");

export const metadata = d2Meta(t.meta.title, t.meta.description);

export default function Page() {
  return <D2Home t={t} />;
}
