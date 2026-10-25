import { DemoShell } from "@/templates/_kit/DemoShell";
import { demoMetadata } from "@/templates/_kit/metadata";
import { hearthFonts } from "@/templates/hearth/fonts";
import { Hearth } from "@/templates/hearth/Hearth";

const SLUG = "hearth";

export const metadata = demoMetadata(SLUG);

export default function HearthPage() {
  return (
    <DemoShell slug={SLUG} fonts={hearthFonts}>
      <Hearth />
    </DemoShell>
  );
}
