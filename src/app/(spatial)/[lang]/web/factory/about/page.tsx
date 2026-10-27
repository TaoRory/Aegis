import { AboutView } from "@/components/space/views/about";

export { generateMetadata } from "@/components/space/views/about";

export default function Page({ params }: { params: Parameters<typeof AboutView>[0]["params"] }) {
  return <AboutView params={params} variant="web" />;
}
