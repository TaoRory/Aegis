import { ProjectView } from "@/components/space/views/project";

export { generateMetadata, generateStaticParams } from "@/components/space/views/project";

export default function Page({ params }: { params: Parameters<typeof ProjectView>[0]["params"] }) {
  return <ProjectView params={params} variant="web" />;
}
