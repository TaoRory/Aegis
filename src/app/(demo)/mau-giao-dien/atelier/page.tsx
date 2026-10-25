import { DemoShell } from "@/templates/_kit/DemoShell";
import { demoMetadata } from "@/templates/_kit/metadata";
import { Atelier } from "@/templates/atelier/Atelier";
import { atelierFonts } from "@/templates/atelier/fonts";

const SLUG = "atelier";

export const metadata = demoMetadata(SLUG);

export default function AtelierPage() {
  return (
    <DemoShell slug={SLUG} fonts={atelierFonts}>
      <Atelier />
    </DemoShell>
  );
}
