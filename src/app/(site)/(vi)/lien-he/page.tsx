import type { Metadata } from "next";

import { ContactPageView } from "@/components/pages/ContactPageView";
import { contactMetadata } from "@/components/pages/metadata";

export const metadata: Metadata = contactMetadata("vi");

export default function ViContactPage() {
  return <ContactPageView lang="vi" />;
}
