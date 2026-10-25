import { DemoShell } from "@/templates/_kit/DemoShell";
import { demoMetadata } from "@/templates/_kit/metadata";
import { voyageFonts } from "@/templates/voyage/fonts";
import { Voyage } from "@/templates/voyage/Voyage";

const SLUG = "voyage";

export const metadata = demoMetadata(SLUG);

export default function VoyagePage() {
  return (
    <DemoShell slug={SLUG} fonts={voyageFonts}>
      <Voyage />
    </DemoShell>
  );
}
