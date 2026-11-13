import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { D2Case, d2Meta } from "@/components/demo2/D2Pages";
import { d2Projects, getD2 } from "@/content/demo2";

const t = getD2("vi");
const projects = d2Projects("vi");
type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  return project ? d2Meta(`${project.name} — Aegis`, project.description) : {};
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  if (!projects.some((item) => item.slug === slug)) notFound();
  return <D2Case t={t} slug={slug} />;
}
