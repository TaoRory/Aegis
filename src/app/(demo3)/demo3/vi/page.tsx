import { D3Home, d3Meta } from "@/components/demo3";
import { getD3 } from "@/content/demo3";

const t = getD3("vi");

export const metadata = d3Meta(t.meta.title, t.meta.description);

export default function Page() {
  return <D3Home t={t} />;
}
