import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { D3Article, d3Meta } from "@/components/demo3";
import { getD3 } from "@/content/demo3";
import { d3Post, d3Posts } from "@/lib/demo3-blog";

const t = getD3("en");
type Params = Promise<{ slug: string }>;

/** Chưa có bài nào thì trả một tham số giữ chỗ (trang đó là 404): cacheComponents yêu cầu ít nhất một tham số */
export function generateStaticParams() {
  const posts = d3Posts("en");
  return posts.length ? posts.map((post) => ({ slug: post.slug })) : [{ slug: "_" }];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = d3Post("en", slug);
  return post ? d3Meta(`${post.title} — Aegis`, post.excerpt) : {};
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  if (!d3Post("en", slug)) notFound();
  return <D3Article t={t} slug={slug} />;
}
