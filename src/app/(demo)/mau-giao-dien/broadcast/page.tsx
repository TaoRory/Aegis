import { DemoShell } from "@/templates/_kit/DemoShell";
import { demoMetadata } from "@/templates/_kit/metadata";
import { Broadcast } from "@/templates/broadcast/Broadcast";
import { broadcastFonts } from "@/templates/broadcast/fonts";

const SLUG = "broadcast";

export const metadata = demoMetadata(SLUG);

export default function BroadcastPage() {
  return (
    <DemoShell slug={SLUG} fonts={broadcastFonts}>
      <Broadcast />
    </DemoShell>
  );
}
