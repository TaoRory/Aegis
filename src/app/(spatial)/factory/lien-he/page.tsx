import type { Metadata } from "next";

import { ContactWizard } from "@/components/contact/ContactWizard";
import { Panel } from "@/components/space/Panel";
import { SPACE_BASE } from "@/config/space";
import { spaceCopy } from "@/content/space";
import { isContactDeliveryConfigured } from "@/lib/contact/delivery";

export const metadata: Metadata = { title: "Cửa ra: liên hệ" };

export default function SpaceContactPage() {
  return (
    <Panel zone="lien-he" title="Bản vẽ của bạn, *bắt đầu từ đây.*" closeHref={SPACE_BASE}>
      <p data-panel-in className="mt-5 max-w-[34rem] leading-relaxed text-muted">
        {spaceCopy.zones["lien-he"].lead}
      </p>
      <div data-panel-in className="mt-8">
        <ContactWizard isConfigured={isContactDeliveryConfigured()} scrollMode="element" />
      </div>
    </Panel>
  );
}
