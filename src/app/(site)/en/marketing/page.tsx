import type { Metadata } from "next";

import { serviceMetadata } from "@/components/pages/metadata";
import { ServicePage } from "@/components/pages/ServicePage";

export const metadata: Metadata = serviceMetadata("en", "marketing");

export default function EnMarketingPage() {
  return <ServicePage lang="en" id="marketing" />;
}
