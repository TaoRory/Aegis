import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { D3Service, d3Meta } from "@/components/demo3";
import { getD3 } from "@/content/demo3";

const t = getD3("vi");
// Trang dựng sẵn từ generateStaticParams: cho phép route đọc params trực tiếp (không cần khung Suspense).
export const instant = false;

type Params = Promise<{ id: string }>;

export function generateStaticParams() {
  return t.services.items.map((service) => ({ id: service.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const service = t.services.items.find((item) => item.id === id);
  return service ? d3Meta(`${service.name} — Aegis`, service.lead, t.lang, `/services/${id}`) : {};
}

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;
  const service = t.services.items.find((item) => item.id === id);
  if (!service) notFound();
  return <D3Service t={t} id={service.id} />;
}
