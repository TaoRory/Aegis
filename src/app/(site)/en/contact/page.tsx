import type { Metadata } from "next";

import { ContactPageView } from "@/components/pages/ContactPageView";
import { contactMetadata } from "@/components/pages/metadata";

export const metadata: Metadata = contactMetadata("en");

export default function EnContactPage() {
  return <ContactPageView lang="en" />;
}
