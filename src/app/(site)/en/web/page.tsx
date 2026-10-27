import type { Metadata } from "next";

import { serviceMetadata } from "@/components/pages/metadata";
import { ServicePage } from "@/components/pages/ServicePage";

export const metadata: Metadata = serviceMetadata("en", "web");

export default function EnWebPage() {
  return <ServicePage lang="en" id="web" />;
}
