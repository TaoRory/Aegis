import type { ReactNode } from "react";
import Link from "next/link";

/**
 * Liên kết tới form liên hệ (/lien-he) với dịch vụ đã chọn sẵn: form bỏ qua câu 1, vào thẳng các câu riêng.
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
    <Link href={`/lien-he?dv=${serviceId}`} className={className}>
      {children}
    </Link>
  );
}
