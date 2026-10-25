import { DemoShell } from "@/templates/_kit/DemoShell";
import { demoMetadata } from "@/templates/_kit/metadata";
import { signalFonts } from "@/templates/signal/fonts";
import { Signal } from "@/templates/signal/Signal";

const SLUG = "signal";

export const metadata = demoMetadata(SLUG);

export default function SignalPage() {
  return (
    <DemoShell slug={SLUG} fonts={signalFonts}>
      <Signal />
    </DemoShell>
  );
}
