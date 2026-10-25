import { DemoShell } from "@/templates/_kit/DemoShell";
import { demoMetadata } from "@/templates/_kit/metadata";
import { sereneFonts } from "@/templates/serene/fonts";
import { Serene } from "@/templates/serene/Serene";

const SLUG = "serene";

export const metadata = demoMetadata(SLUG);

export default function SerenePage() {
  return (
    <DemoShell slug={SLUG} fonts={sereneFonts}>
      <Serene />
    </DemoShell>
  );
}
