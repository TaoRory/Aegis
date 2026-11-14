import type { Metadata } from "next";

/** Metadata chung của các trang /demo3: bản chờ duyệt nên không lập chỉ mục */
export const d3Meta = (title: string, description: string): Metadata => ({
  title: { absolute: title },
  description,
  robots: { index: false, follow: false },
});
