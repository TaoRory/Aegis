import { D3Blog, d3Meta } from "@/components/demo3";
import { getD3 } from "@/content/demo3";

const t = getD3("vi");

export const metadata = d3Meta(`${t.blog.title} — Aegis`, t.blog.lead);

export default function Page() {
  return <D3Blog t={t} />;
}
