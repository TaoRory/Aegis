import type { Metadata } from "next";

import { serviceMetadata } from "@/components/pages/metadata";
import { ServicePage } from "@/components/pages/ServicePage";

export const metadata: Metadata = serviceMetadata("vi", "marketing");

export default function ViMarketingPage() {
  return <ServicePage lang="vi" id="marketing" />;
}
