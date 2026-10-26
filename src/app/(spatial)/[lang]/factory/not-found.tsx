"use client";

import Link from "next/link";

import { useFactory } from "@/components/space/factory-context";
import { Panel } from "@/components/space/Panel";

export default function FactoryNotFound() {
  const { ui, href } = useFactory();
  return (
    <Panel zone="hub" eyebrow="404" title={ui.notFound.lines.join(" ")} closeHref={href()}>
      <p data-panel-in className="mt-6 text-muted">
        {ui.notFound.body}
      </p>
      <Link data-panel-in href={href()} className="space-cta label mt-8">
        {ui.notFound.back} →
      </Link>
    </Panel>
  );
}
