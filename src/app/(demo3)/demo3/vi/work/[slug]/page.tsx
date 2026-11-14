import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { D3Case, d3Meta } from "@/components/demo3";
import { d3Projects, getD3 } from "@/content/demo3";

const t = getD3("vi");
const projects = d3Projects("vi");
// Trang dựng sẵn từ generateStaticParams: cho phép route đọc params trực tiếp (không cần khung Suspense).
export const instant = false;

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  return project ? d3Meta(`${project.name} — Aegis`, project.description) : {};
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  if (!projects.some((item) => item.slug === slug)) notFound();
  return <D3Case t={t} slug={slug} />;
}
