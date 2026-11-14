import { ArrowRight } from "@/components/demo1/icons";
import { d3Href, type D3Dict } from "@/content/demo3";
import { d3Date, d3Post, d3Posts, type Block, type Inline } from "@/lib/demo3-blog";

import { PageHead } from "./D3Bits";
import { FinalCta } from "./D3Final";
import { D3Link } from "./D3Link";
import { D3Shell } from "./D3Shell";

export function PostList({ t, posts }: { t: D3Dict; posts: ReturnType<typeof d3Posts> }) {
  return (
    <ul className="d2-posts">
      {posts.map((post) => (
        <li key={post.slug}>
          <D3Link href={d3Href(t.lang, `/blog/${post.slug}`)}>
            <span className="d2-small text-muted">
              {d3Date(t.lang, post.date)} · {post.minutes} {t.blog.minutes}
            </span>
            <span className="d2-post-title">{post.title}</span>
            <span className="text-muted">{post.excerpt}</span>
            <span className="d2-post-tags">
              {post.tags.map((tag) => (
                <span key={tag} className="d2-chip">
                  {tag}
                </span>
              ))}
            </span>
          </D3Link>
        </li>
      ))}
    </ul>
  );
}

export function D3Blog({ t }: { t: D3Dict }) {
  const posts = d3Posts(t.lang);
  return (
    <D3Shell t={t}>
      <PageHead title={t.blog.title} lead={t.blog.lead} />
      <section className="d2-wrap d2-section-tight pb-(--d2-section)" aria-label={t.blog.title}>
        {posts.length > 0 ? (
          <PostList t={t} posts={posts} />
        ) : (
          <div className="d2-empty">
            <div>
              <h2 className="d2-h2">{t.blog.empty}</h2>
              <p className="mt-4 max-w-[30rem] text-muted">{t.blog.emptyLine}</p>
              <div className="d2-hero-actions">
                <D3Link href={d3Href(t.lang, "/work")} className="d2-btn d2-btn-ink">
                  {t.final.work}
                  <ArrowRight />
                </D3Link>
                <D3Link href={d3Href(t.lang, "/plans")} className="d2-btn d2-btn-line">
                  {t.home.secondary}
                </D3Link>
              </div>
            </div>
            <div>
              <h3 className="d2-small font-semibold text-muted">{t.blog.topicsLabel}</h3>
              <ul className="d2-rows mt-2">
                {t.blog.topics.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>
    </D3Shell>
  );
}

const renderInline = (parts: Inline[]) =>
  parts.map((part, i) => {
    if (typeof part === "string") return part;
    if (part.kind !== "link") {
      const Tag = part.kind;
      return <Tag key={i}>{part.text}</Tag>;
    }
    const external = /^https?:\/\//.test(part.href);
    return (
      <a key={i} href={part.href} className="d2-link" {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {part.text}
      </a>
    );
  });

function renderBlock(block: Block, i: number) {
  switch (block.kind) {
    case "h2":
      return <h2 key={i}>{renderInline(block.inline)}</h2>;
    case "h3":
      return <h3 key={i}>{renderInline(block.inline)}</h3>;
    case "quote":
      return <blockquote key={i}>{renderInline(block.inline)}</blockquote>;
    case "code":
      return (
        <pre key={i} tabIndex={0}>
          <code>{block.text}</code>
        </pre>
      );
    case "ul":
    case "ol": {
      const List = block.kind;
      return (
        <List key={i}>
          {block.items.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </List>
      );
    }
    default:
      return <p key={i}>{renderInline(block.inline)}</p>;
  }
}

export function D3Article({ t, slug }: { t: D3Dict; slug: string }) {
  const post = d3Post(t.lang, slug);
  if (!post) return null;
  return (
    <D3Shell t={t}>
      <article className="d2-wrap d2-article">
        <p className="d2-small">
          <D3Link href={d3Href(t.lang, "/blog")} className="d2-link">
            {t.blog.back}
          </D3Link>
        </p>
        <h1 className="d2-h2 mt-5">{post.title}</h1>
        <p className="d2-small mt-4 text-muted">
          {d3Date(t.lang, post.date)} · {post.minutes} {t.blog.minutes}
        </p>
        <div className="d2-prose">{post.blocks.map(renderBlock)}</div>
      </article>
      <FinalCta t={t} />
    </D3Shell>
  );
}
