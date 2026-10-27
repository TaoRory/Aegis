import type { Metadata } from "next";

import { serviceMetadata } from "@/components/pages/metadata";
import { ServicePage } from "@/components/pages/ServicePage";

export const metadata: Metadata = serviceMetadata("vi", "web");

export default function ViWebPage() {
  return <ServicePage lang="vi" id="web" />;
}
