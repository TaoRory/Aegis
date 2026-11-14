import { ArrowRight } from "@/components/demo1/icons";
import { d3Href, d3PlanLayers, d3Projects, d3Stages, type D3Dict, type D3Plan } from "@/content/demo3";
import { d3Posts } from "@/lib/demo3-blog";
import { fill } from "@/lib/fill";

import { d3Host, d3Previews } from "./D3Bits";
import { PostList } from "./D3BlogPages";
import { D3Link } from "./D3Link";
import { D3Ring, type D3RingItem } from "./D3Ring";
import { Rise } from "./fx/Rise";
import { SplitReveal } from "./fx/SplitReveal";
import { ArrowSwap } from "./HomeArrowSwap";
import { HomeMarquee } from "./HomeMarquee";

/** Ba gói thu gọn (trang chủ): ba bề mặt, mỗi ô dẫn tới gói tương ứng ở trang Plans; `index` để ba ô trồi lên so le từ trái sang */
function PlanTeaser({ t, plan, index }: { t: D3Dict; plan: D3Plan; index: number }) {
  return (
    <Rise
      as={D3Link}
      kind="pop"
      index={index}
      href={d3Href(t.lang, `/plans#plan-${plan.id}`)}
      className="d2-teaser"
      data-plan={plan.id}
      data-d2-tone={plan.id === "amplify" ? "dark" : undefined}
    >
      <span className="d2-teaser-name">
        {plan.name}
        <ArrowRight />
      </span>
      <span className="d2-teaser-line">{plan.line}</span>
      <span className="d2-teaser-layers">
        {d3PlanLayers[plan.id].map((layer) => (
          <span key={layer} className="d2-chip">
            {plan.id === "amplify" && layer === "site" ? t.home.landing : t.home.layers[layer].name}
          </span>
        ))}
      </span>
    </Rise>
  );
}

/** 7 dự án thật cho vòng xoay: màu sân khấu đo từ chính website, chữ dock theo ngôn ngữ, mở sang trang dự án */
function ringItems(t: D3Dict): D3RingItem[] {
  return d3Projects(t.lang).map((project, index) => {
    const stage = d3Stages[project.slug];
    return {
      slug: project.slug,
      name: project.name,
      stage: stage.bg,
      stageInk: stage.ink === "light" ? "#f5f7f6" : "#071f1e",
      href: d3Href(t.lang, `/work/${project.slug}`),
      text: {
        kicker: `${t.work.project} /${String(index + 1).padStart(2, "0")} · ${project.type}`,
        sub: project.description,
        note: fill(t.work.live, { host: d3Host(project.url) }),
        sr: `— ${project.type}. ${project.description}`,
      },
    };
  });
}

/**
 * Các phần giữa trang chủ /demo3: dải chữ chạy, bốn lớp dịch vụ, ba gói thu gọn, vòng xoay dự án, blog (khi có bài).
 * Vòng xoay (GalleryRing, WebGL) là vật thể tương tác duy nhất ở đây: nó tự bỏ qua việc vẽ khi khuất màn hình hoặc tab ẩn,
 * và quanh nó không đặt thêm hiệu ứng nặng nào (nền WebGL của lời mời cuối tự đứng yên khi vòng xoay còn hiện, xem FinalStage).
 */
export function D3HomeSections({ t }: { t: D3Dict }) {
  const { home } = t;
  const projects = d3Projects(t.lang);
  const posts = d3Posts(t.lang).slice(0, 3);
  return (
    <>
      {/* Dải chữ chạy theo tốc độ cuộn: bốn lớp + ba gói (trang trí, nội dung đã có ở các phần khác) */}
      <HomeMarquee words={[...t.services.items.map((service) => service.name), ...t.plans.items.map((plan) => plan.name)]} labels={t.x.home.marquee} />

      {/* 3. Bốn lớp dịch vụ: tấm tối, danh mục chữ lớn, mỗi dòng dẫn tới trang riêng. Thứ tự vào: tấm trồi lên trước, rồi từng dòng so le */}
      <section aria-labelledby="d2-svc-title" className="d2-wrap d2-section-tight">
        <Rise kind="pop" className="d2-darkslab" data-d2-tone="dark">
          <div className="d2-split-head">
            <SplitReveal as="h2" id="d2-svc-title" className="d2-h2 d3-lines">
              {home.servicesTitle}
            </SplitReveal>
            <p className="d2-lead">{home.servicesLead}</p>
          </div>
          <ul className="d2-svc-index">
            {t.services.items.map((service, index) => (
              <Rise as="li" key={service.id} index={index}>
                <D3Link href={d3Href(t.lang, `/services/${service.id}`)}>
                  <span className="d2-svc-name">{service.name}</span>
                  <span className="d2-svc-line">{service.line}</span>
                  <span className="d2-chip">{service.plans}</span>
                  <ArrowSwap />
                </D3Link>
              </Rise>
            ))}
          </ul>
        </Rise>
      </section>

      {/* 4. Ba gói, thu gọn */}
      <section aria-labelledby="d2-plans-title" className="d2-wrap d2-section-tight">
        <SplitReveal as="h2" id="d2-plans-title" className="d2-h2 d3-lines">
          {home.plansTitle}
        </SplitReveal>
        <div className="d2-teasers">
          {t.plans.items.map((plan, index) => (
            <PlanTeaser key={plan.id} t={t} plan={plan} index={index} />
          ))}
        </div>
        <p className="mt-6">
          <D3Link href={d3Href(t.lang, "/plans")} className="d2-link font-semibold">
            {home.plansLink}
          </D3Link>
        </p>
      </section>

      {/* 5. Dự án: vòng xoay 3D (cùng khuôn với thư viện mẫu của trang chính) */}
      <section aria-labelledby="d2-work-title" className="d2-wrap d2-section">
        <div className="d2-split-head">
          <SplitReveal as="h2" id="d2-work-title" className="d2-h2 d3-lines">
            {home.workTitle}
          </SplitReveal>
          <p className="d2-lead">{t.work.lead}</p>
        </div>
        <div className="d2-ring-meta" aria-hidden>
          <span>
            {String(projects.length).padStart(2, "0")} {t.work.count}
          </span>
          <span>{t.work.drag} ↔</span>
        </div>
        <Rise kind="pop" className="d2-ring">
          <D3Ring items={ringItems(t)} previews={d3Previews} copy={t.ring} />
        </Rise>
        <p className="mt-6">
          <D3Link href={d3Href(t.lang, "/work")} className="d2-link font-semibold">
            {home.workLink}
          </D3Link>
        </p>
      </section>

      {/* 6. Blog: chỉ hiện khi đã có bài */}
      {posts.length > 0 && (
        <section aria-labelledby="d2-blog-title" className="d2-wrap d2-section-tight">
          <SplitReveal as="h2" id="d2-blog-title" className="d2-h2 d3-lines">
            {home.blogTitle}
          </SplitReveal>
          <PostList t={t} posts={posts} />
          <p className="mt-6">
            <D3Link href={d3Href(t.lang, "/blog")} className="d2-link font-semibold">
              {home.blogLink}
            </D3Link>
          </p>
        </section>
      )}
    </>
  );
}
