import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { D2Article, d2Meta } from "@/components/demo2/D2Pages";
import { getD2 } from "@/content/demo2";
import { d2Post, d2Posts } from "@/lib/demo2-blog";

const t = getD2("en");
type Params = Promise<{ slug: string }>;

/** Chưa có bài nào thì trả một tham số giữ chỗ (trang đó là 404): cacheComponents yêu cầu ít nhất một tham số */
export function generateStaticParams() {
  const posts = d2Posts("en");
  return posts.length ? posts.map((post) => ({ slug: post.slug })) : [{ slug: "_" }];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = d2Post("en", slug);
  return post ? d2Meta(`${post.title} — Aegis`, post.excerpt) : {};
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  if (!d2Post("en", slug)) notFound();
  return <D2Article t={t} slug={slug} />;
}
