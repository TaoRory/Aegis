import { ContactView } from "@/components/space/views/contact";

export { generateMetadata } from "@/components/space/views/contact";

export default function Page({ params }: { params: Parameters<typeof ContactView>[0]["params"] }) {
  return <ContactView params={params} variant="web" />;
}
