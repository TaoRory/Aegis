import type { Metadata } from "next";

import { HubIntro } from "@/components/space/HubIntro";
import { titleFor, type LangParams } from "@/components/space/views/lib";

export async function generateMetadata({ params }: { params: LangParams }): Promise<Metadata> {
  return titleFor(params, (d) => d.ui.zones.hub.name);
}

export function HubView() {
  return <HubIntro />;
}
