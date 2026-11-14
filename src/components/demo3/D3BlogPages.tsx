import { d3Href, type D3Dict } from "@/content/demo3";
import { d3Date, d3Post, d3Posts, type Block, type Inline } from "@/lib/demo3-blog";

import { PageHead } from "./D3Bits";
import { FinalCta } from "./D3Final";
import { D3Btn } from "./D3Btn";
import { D3Link } from "./D3Link";
import { D3Shell } from "./D3Shell";
import { Rise } from "./fx/Rise";

/**
 * Danh sách bài viết (dùng ở trang Blog và trang chủ). Mỗi hàng là một link:
 * rê chuột thì tiêu đề dịch sang, mũi tên chạy vào và một vạch mực vẽ dọc mép dưới (work.css), thay cho gạch chân mặc định.
 */
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

/**
 * Trang Blog. Chưa có bài thì nói thật là chưa có (không dựng bài giả):
 * một con trỏ soạn thảo nhấp nháy vài nhịp sau câu "đang được viết" rồi đứng yên, các chủ đề sẽ viết trồi lên lần lượt.
 */
export function D3Blog({ t }: { t: D3Dict }) {
  const posts = d3Posts(t.lang);
  // Tách từ cuối để con trỏ luôn dính vào chữ, không rớt một mình xuống dòng
  const words = t.blog.empty.split(" ");
  const lastWord = words.pop();
  return (
    <D3Shell t={t}>
      <PageHead title={t.blog.title} lead={t.blog.lead} />
      <section className="d2-wrap d2-section-tight pb-(--d2-section)" aria-label={t.blog.title}>
        {posts.length > 0 ? (
          <PostList t={t} posts={posts} />
        ) : (
          <div className="d2-empty">
            <div>
              <h2 className="d2-h2">
                {words.join(" ")}{" "}
                <span className="whitespace-nowrap">
                  {lastWord}
                  <span className="d3-caret" aria-hidden />
                </span>
              </h2>
              <p className="mt-4 max-w-[30rem] text-muted">{t.blog.emptyLine}</p>
              <div className="d2-hero-actions">
                <D3Btn href={d3Href(t.lang, "/work")} tone="ink">
                  {t.final.work}
                </D3Btn>
                <D3Btn href={d3Href(t.lang, "/plans")} tone="line">
                  {t.home.secondary}
                </D3Btn>
              </div>
            </div>
            <div>
              <h3 className="d2-small font-semibold text-muted">{t.blog.topicsLabel}</h3>
              <ul className="d2-rows mt-2">
                {t.blog.topics.map((topic, i) => (
                  <Rise as="li" key={topic} index={i}>
                    {topic}
                  </Rise>
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
