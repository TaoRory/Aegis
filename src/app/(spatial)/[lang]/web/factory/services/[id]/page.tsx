import { ServiceView } from "@/components/space/views/service";

export { generateMetadata, generateStaticParams } from "@/components/space/views/service";

export default function Page({ params }: { params: Parameters<typeof ServiceView>[0]["params"] }) {
  return <ServiceView params={params} variant="web" />;
}
