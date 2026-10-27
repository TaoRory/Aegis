import type { Metadata } from "next";

import { serviceMetadata } from "@/components/pages/metadata";
import { ServicePage } from "@/components/pages/ServicePage";

export const metadata: Metadata = serviceMetadata("vi", "ai");

export default function ViAiPage() {
  return <ServicePage lang="vi" id="ai" />;
}
