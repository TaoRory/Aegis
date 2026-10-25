import { SplitReveal } from "@/components/motion/SplitReveal";
import { ButtonLink } from "@/components/ui/Button";
import { SmartLink } from "@/components/ui/SmartLink";
import type { DemoTemplate } from "@/content/templates";
import credits from "@/content/image-credits.json";
import { templateNotice } from "@/content/templates";

type Credit = { creator: string; license: string; license_url?: string; source: string; title?: string };

/**
 * Màn kết của mỗi mẫu (theo anatomy case study): nói rõ đây là mẫu demo,
 * mời trao đổi với Aegis, và dẫn sang mẫu kế tiếp. Dùng token của Aegis.
 */
export function DemoClosing({ template, next }: { template: DemoTemplate; next: DemoTemplate }) {
  const imageCredits = Object.values((credits as Record<string, Record<string, Credit>>)[template.slug] ?? {});
  return (
    <section id="demo-ket" data-surface="dark" aria-labelledby="demo-ket-title" className="ink relative z-10 section-y">
      <div className="container-page">
        <div className="grid gap-10 border-b border-line pb-16 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="label text-muted">
              Style {template.name} · Mẫu demo {template.brand}
            </p>
            <SplitReveal as="h2" id="demo-ket-title" className="mt-6 text-h2 font-semibold">
              <span className="block">Đang có ý tưởng</span>
              <span className="block">
                <em>tương tự?</em>
              </span>
            </SplitReveal>
          </div>
          <div className="flex flex-col justify-end gap-6 lg:col-span-4">
            <p className="leading-relaxed text-muted">
              {templateNotice} Aegis có thể thiết kế và xây dựng website theo nhu cầu riêng của doanh nghiệp bạn.
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/lien-he">Trao đổi với Aegis</ButtonLink>
              <ButtonLink href="/mau-giao-dien" variant="outline" arrow="↗" navType="aegis-back">
                Thư viện mẫu
              </ButtonLink>
            </div>
          </div>
        </div>

        <SmartLink href={`/mau-giao-dien/${next.slug}`} className="group mt-12 grid gap-6 lg:grid-cols-12 lg:items-end">
          <span className="label text-muted lg:col-span-3">[ Mẫu kế tiếp ]</span>
          <span className="text-mega font-semibold transition-colors group-hover:text-accent lg:col-span-7">
            {next.name}
          </span>
          <span className="label text-muted lg:col-span-2 lg:justify-self-end">
            {next.industry} <span aria-hidden>→</span>
          </span>
        </SmartLink>

        {imageCredits.length > 0 && (
          <details className="mt-16 border-t border-line pt-6 text-muted">
            <summary className="label cursor-pointer hover:text-fg">Nguồn ảnh ({imageCredits.length}): giấy phép mở, cho phép dùng thương mại</summary>
            <ul className="mt-4 grid gap-x-8 gap-y-2 text-xs leading-relaxed sm:grid-cols-2 lg:grid-cols-3">
              {imageCredits.map((c) => (
                <li key={c.source}>
                  <a href={c.source} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:text-fg hover:underline">
                    {c.title || "Ảnh"}
                  </a>{" "}
                  · {c.creator} ·{" "}
                  {c.license_url ? (
                    <a href={c.license_url} target="_blank" rel="noopener noreferrer" className="hover:text-fg">
                      {c.license}
                    </a>
                  ) : (
                    c.license
                  )}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </section>
  );
}
