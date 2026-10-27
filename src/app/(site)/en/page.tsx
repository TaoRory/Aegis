import type { Metadata } from "next";

import { HomePage } from "@/components/pages/HomePage";
import { homeMetadata } from "@/components/pages/metadata";

export const metadata: Metadata = homeMetadata("en");

export default function EnHomePage() {
  return <HomePage lang="en" />;
}
