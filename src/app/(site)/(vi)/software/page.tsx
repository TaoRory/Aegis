import type { Metadata } from "next";

import { serviceMetadata } from "@/components/pages/metadata";
import { ServicePage } from "@/components/pages/ServicePage";

export const metadata: Metadata = serviceMetadata("vi", "software");

export default function ViSoftwarePage() {
  return <ServicePage lang="vi" id="software" />;
}
