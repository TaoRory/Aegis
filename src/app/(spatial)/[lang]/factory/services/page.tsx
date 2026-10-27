import { ServicesView } from "@/components/space/views/services";

export { generateMetadata } from "@/components/space/views/services";

export default function Page({ params }: { params: Parameters<typeof ServicesView>[0]["params"] }) {
  return <ServicesView params={params} variant="neutral" />;
}
