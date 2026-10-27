import type { Metadata } from "next";

import { HomePage } from "@/components/pages/HomePage";
import { homeMetadata } from "@/components/pages/metadata";

export const metadata: Metadata = homeMetadata("vi");

export default function ViHomePage() {
  return <HomePage lang="vi" />;
}
