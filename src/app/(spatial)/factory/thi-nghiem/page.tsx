import type { Metadata } from "next";
import Link from "next/link";

import { Panel } from "@/components/space/Panel";
import { SPACE_BASE } from "@/config/space";
import { spaceCopy } from "@/content/space";
import { labItems } from "@/content/lab";

export const metadata: Metadata = { title: "Phòng thí nghiệm" };

export default function LabPage() {
  return (
    <Panel zone="thi-nghiem" title="Phòng *thí nghiệm.*" closeHref={SPACE_BASE}>
      <p data-panel-in className="mt-5 max-w-[34rem] leading-relaxed text-muted">
        {spaceCopy.zones["thi-nghiem"].lead}
      </p>
      <ol className="space-cards">
        {labItems.map((item) => (
          <li key={item.id} data-panel-in>
            <Link href={`${SPACE_BASE}/thi-nghiem/${item.id}`} className="space-card" data-cursor="view" data-cursor-label="Chơi">
              <span className="label text-accent">
                {spaceCopy.lab.label} /{item.index}
              </span>
              <span className="space-card-name">{item.name}</span>
              <span className="text-[0.95rem] leading-relaxed text-muted">{item.tagline}</span>
            </Link>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
