import type { Metadata } from "next";

import { HubIntro } from "@/components/space/HubIntro";

export const metadata: Metadata = { title: "Tổng mặt bằng" };

export default function SpaceHubPage() {
  return <HubIntro />;
}
