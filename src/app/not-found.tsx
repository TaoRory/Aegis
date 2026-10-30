import type { Metadata } from "next";

import { NotFoundView } from "@/components/pages/NotFoundView";

/** 404 chung của website (địa chỉ không khớp route nào). Factory có not-found riêng trong (spatial). */
export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <NotFoundView />;
}
