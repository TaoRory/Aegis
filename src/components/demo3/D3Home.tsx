import type { D3Dict } from "@/content/demo3";

import { FinalCta } from "./D3Final";
import { D3Hero } from "./D3Hero";
import { D3HomeSections } from "./D3HomeSections";
import { D3Shell } from "./D3Shell";
import { D3Story } from "./D3Story";

/**
 * Trang chủ /demo3: màn đầu (D3Hero) → "website đứng yên, tài sản lớn lên" (D3Story, ghim khi cuộn)
 * → các phần giữa (D3HomeSections) → lời mời cuối (FinalCta).
 */
export function D3Home({ t }: { t: D3Dict }) {
  return (
    <D3Shell t={t}>
      <D3Hero t={t} />
      <D3Story t={t} />
      <D3HomeSections t={t} />
      <FinalCta t={t} />
    </D3Shell>
  );
}
