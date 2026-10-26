import type { Metadata } from "next";

import { Panel } from "@/components/space/Panel";
import { SPACE_BASE } from "@/config/space";
import { spaceCopy } from "@/content/space";
import { publishedJournal } from "@/content/journal";

export const metadata: Metadata = { title: "Bàn ghi chép: nhật ký" };

export default function JournalPage() {
  const copy = spaceCopy.zones["nhat-ky"];
  return (
    <Panel zone="nhat-ky" title="Bàn *ghi chép.*" closeHref={SPACE_BASE}>
      <p data-panel-in className="mt-5 max-w-[34rem] leading-relaxed text-muted">
        {copy.lead}
      </p>
      {publishedJournal.length === 0 ? (
        <p data-panel-in className="mt-8 border-t border-line pt-6 text-muted">
          {copy.empty}
        </p>
      ) : (
        <ol className="space-sheets">
          {publishedJournal.map((entry) => (
            <li key={entry.slug} data-panel-in className="space-sheet">
              <p className="label text-accent">GHI CHÉP /{entry.index}</p>
              <h2 className="mt-2 text-[1.5rem] leading-tight font-semibold">{entry.title}</h2>
              {entry.body.map((paragraph) => (
                <p key={paragraph} className="mt-3 leading-relaxed text-muted">
                  {paragraph}
                </p>
              ))}
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
