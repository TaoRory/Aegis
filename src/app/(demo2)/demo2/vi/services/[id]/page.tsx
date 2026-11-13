import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { D2Service, d2Meta } from "@/components/demo2/D2Pages";
import { getD2 } from "@/content/demo2";

const t = getD2("vi");
type Params = Promise<{ id: string }>;

export function generateStaticParams() {
  return t.services.items.map((service) => ({ id: service.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const service = t.services.items.find((item) => item.id === id);
  return service ? d2Meta(`${service.name} — Aegis`, service.lead) : {};
}

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;
  const service = t.services.items.find((item) => item.id === id);
  if (!service) notFound();
  return <D2Service t={t} id={service.id} />;
}
