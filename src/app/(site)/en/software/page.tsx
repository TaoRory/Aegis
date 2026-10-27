import type { Metadata } from "next";

import { serviceMetadata } from "@/components/pages/metadata";
import { ServicePage } from "@/components/pages/ServicePage";

export const metadata: Metadata = serviceMetadata("en", "software");

export default function EnSoftwarePage() {
  return <ServicePage lang="en" id="software" />;
}
