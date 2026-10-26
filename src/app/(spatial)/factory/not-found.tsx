import Link from "next/link";

import { Panel } from "@/components/space/Panel";
import { SPACE_BASE } from "@/config/space";
import { spaceCopy } from "@/content/space";

export default function SpaceNotFound() {
  return (
    <Panel zone="hub" eyebrow="404" title={spaceCopy.notFound.lines.join(" ")} closeHref={SPACE_BASE}>
      <p data-panel-in className="mt-6 text-muted">
        Địa chỉ này không có trong mặt bằng của xưởng.
      </p>
      <Link data-panel-in href={SPACE_BASE} className="space-cta label mt-8">
        {spaceCopy.notFound.back} →
      </Link>
    </Panel>
  );
}
