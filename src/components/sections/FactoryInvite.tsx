import { SplitReveal } from "@/components/motion/SplitReveal";
import { Roll } from "@/components/ui/Button";
import { Lines } from "@/components/ui/Rich";
import { factoryHref, type Locale } from "@/config/space";
import { getSiteDict } from "@/content/site";

/**
 * Lời mời tham quan Factory (bản web, /web/factory), chỉ có ở trang Web & web app.
 * Dùng liên kết thường (tải lại trang): Factory là một vỏ riêng, cần script đầu trang đặt cờ khóa cuộn và màn mở đầu từ khung hình đầu.
 */
export function FactoryInvite({ lang }: { lang: Locale }) {
  const copy = getSiteDict(lang).webPage.factory;
  return (
    <section
      id="tham-quan"
      data-chapter={copy.chapter}
      data-surface="dark"
      aria-labelledby="tham-quan-title"
      className="ink relative z-10 overflow-hidden section-y"
    >
      <div aria-hidden className="blueprint-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="container-page relative">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="label text-accent">{copy.label}</p>
            <SplitReveal as="h2" id="tham-quan-title" className="mt-6 text-h2 font-semibold">
              <Lines lines={copy.lines} />
            </SplitReveal>
          </div>
          <div className="lg:col-span-5">
            <p className="text-lead text-muted">{copy.body}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <a href={factoryHref(lang, "", "web")} className="btn btn-box h-12 bg-accent px-5 text-on-accent hover:bg-accent-strong">
                <Roll>{copy.cta}</Roll>
                <span aria-hidden className="btn-arrow">
                  →
                </span>
              </a>
              <a href="#cach-lam-viec" className="btn-link text-fg">
                <Roll>{copy.later}</Roll>
                <span aria-hidden className="btn-arrow">
                  ↓
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
