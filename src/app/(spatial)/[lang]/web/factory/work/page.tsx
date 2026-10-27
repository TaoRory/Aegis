import { WorkView } from "@/components/space/views/work";

export { generateMetadata } from "@/components/space/views/work";

export default function Page({ params }: { params: Parameters<typeof WorkView>[0]["params"] }) {
  return <WorkView params={params} variant="web" />;
}
