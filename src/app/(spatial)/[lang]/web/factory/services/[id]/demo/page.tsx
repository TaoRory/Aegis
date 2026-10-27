import { DemoView } from "@/components/space/views/demo";

export { generateMetadata, generateStaticParams } from "@/components/space/views/demo";

export default function Page({ params }: { params: Parameters<typeof DemoView>[0]["params"] }) {
  return <DemoView params={params} variant="web" />;
}
