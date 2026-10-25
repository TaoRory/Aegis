import { DemoShell } from "@/templates/_kit/DemoShell";
import { demoMetadata } from "@/templates/_kit/metadata";
import { Campus } from "@/templates/campus/Campus";
import { campusFonts } from "@/templates/campus/fonts";

const SLUG = "campus";

export const metadata = demoMetadata(SLUG);

export default function CampusPage() {
  return (
    <DemoShell slug={SLUG} fonts={campusFonts}>
      <Campus />
    </DemoShell>
  );
}
