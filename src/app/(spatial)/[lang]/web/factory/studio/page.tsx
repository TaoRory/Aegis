import { StudioView } from "@/components/space/views/studio";

export { generateMetadata } from "@/components/space/views/studio";

export default function Page({ params }: { params: Parameters<typeof StudioView>[0]["params"] }) {
  return <StudioView params={params} variant="web" />;
}
