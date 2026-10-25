"use client";

import type { ReactNode } from "react";

export const SELECT_SERVICE_EVENT = "aegis:select-service";

/**
 * Liên kết tới form liên hệ và chọn sẵn dịch vụ.
 * Không có JavaScript thì vẫn là liên kết cuộn tới #lien-he bình thường.
 */
export function SelectServiceLink({
  serviceId,
  className,
  children,
}: {
  serviceId: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href="#lien-he"
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent(SELECT_SERVICE_EVENT, { detail: serviceId }))}
    >
      {children}
    </a>
  );
}
