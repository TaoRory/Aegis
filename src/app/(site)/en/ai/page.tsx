import type { Metadata } from "next";

import { serviceMetadata } from "@/components/pages/metadata";
import { ServicePage } from "@/components/pages/ServicePage";

export const metadata: Metadata = serviceMetadata("en", "ai");

export default function EnAiPage() {
  return <ServicePage lang="en" id="ai" />;
}
