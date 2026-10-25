import { DemoShell } from "@/templates/_kit/DemoShell";
import { demoMetadata } from "@/templates/_kit/metadata";
import { playgroundFonts } from "@/templates/playground/fonts";
import { Playground } from "@/templates/playground/Playground";

const SLUG = "playground";

export const metadata = demoMetadata(SLUG);

export default function PlaygroundPage() {
  return (
    <DemoShell slug={SLUG} fonts={playgroundFonts}>
      <Playground />
    </DemoShell>
  );
}
