import type { Metadata } from "next";

import { templatesMetadata } from "@/components/pages/metadata";
import { TemplatesPageView } from "@/components/pages/TemplatesPageView";

export const metadata: Metadata = templatesMetadata("vi");

export default function ViTemplatesPage() {
  return <TemplatesPageView lang="vi" />;
}
