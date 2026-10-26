import Link from "next/link";

import { ZoneIcon } from "@/components/space/ZoneIcon";
import type { Service } from "@/content/types";

/**
 * Bốn dịch vụ xếp lưới đều nhau (ngang hàng, không số thứ tự): biểu tượng, tên, một câu tóm tắt.
 * `exclude` bỏ dịch vụ đang xem (mục "Các dịch vụ khác").
 */
export function ServiceGrid({ services, href, exclude, compact = false }: { services: Service[]; href: (id: string) => string; exclude?: string; compact?: boolean }) {
  return (
    <ul className="space-service-grid" data-compact={compact}>
      {services
        .filter((s) => s.id !== exclude)
        .map((service) => (
          <li key={service.id} data-panel-in>
            <Link href={href(service.id)} className="space-service-card" data-cursor="view">
              <ZoneIcon zone={service.id} className="space-service-card-icon" />
              <span className="space-service-card-name">{service.title}</span>
              {!compact && <span className="text-[0.95rem] leading-relaxed text-muted">{service.summary}</span>}
            </Link>
          </li>
        ))}
    </ul>
  );
}
