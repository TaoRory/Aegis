import type { Metadata } from "next";

import { templatesMetadata } from "@/components/pages/metadata";
import { TemplatesPageView } from "@/components/pages/TemplatesPageView";

export const metadata: Metadata = templatesMetadata("en");

export default function EnTemplatesPage() {
  return <TemplatesPageView lang="en" />;
}
